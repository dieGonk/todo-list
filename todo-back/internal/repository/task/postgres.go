package task

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	domain "todo-back/internal/domain/task"
	usecase "todo-back/internal/usecase/task"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) List(ctx context.Context, filter usecase.ListFilter) ([]domain.Task, error) {
	where := make([]string, 0)
	args := make([]any, 0)
	arg := func(value any) string {
		args = append(args, value)
		return fmt.Sprintf("$%d", len(args))
	}

	switch filter.Filter {
	case "today":
		where = append(where, "task_date = CURRENT_DATE")
	case "upcoming":
		where = append(where, "task_date > CURRENT_DATE", "done = FALSE")
	case "done":
		where = append(where, "done = TRUE")
	case "starred":
		where = append(where, "starred = TRUE")
	}
	if filter.Category != "" && filter.Category != "all" {
		where = append(where, "category = "+arg(filter.Category))
	}
	if strings.TrimSpace(filter.Query) != "" {
		where = append(where, "title ILIKE '%' || "+arg(strings.TrimSpace(filter.Query))+" || '%'")
	}

	query := taskSelectSQL()
	if len(where) > 0 {
		query += " WHERE " + strings.Join(where, " AND ")
	}
	if filter.Sort == "priority" {
		query += " ORDER BY done ASC, CASE priority WHEN 'high' THEN 0 WHEN 'med' THEN 1 ELSE 2 END ASC, task_date ASC, task_time ASC"
	} else {
		query += " ORDER BY done ASC, task_date ASC, task_time ASC"
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tasks := make([]domain.Task, 0)
	for rows.Next() {
		task, err := scanTask(rows)
		if err != nil {
			return nil, err
		}
		task.Subtasks, err = r.listSubtasks(ctx, task.ID)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tasks, nil
}

func (r *PostgresRepository) GetByID(ctx context.Context, id string) (*domain.Task, error) {
	row := r.db.QueryRow(ctx, taskSelectSQL()+" WHERE id = $1", id)
	task, err := scanTask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, usecase.ErrNotFound
		}
		return nil, err
	}

	task.Subtasks, err = r.listSubtasks(ctx, task.ID)
	if err != nil {
		return nil, err
	}

	return &task, nil
}

func (r *PostgresRepository) Create(ctx context.Context, input usecase.CreateInput) (*domain.Task, error) {
	now := time.Now()
	row := r.db.QueryRow(ctx, `
		INSERT INTO tasks (title, category, priority, task_date, task_time)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, title, category, priority, task_date, to_char(task_time, 'HH24:MI'), notes, done, starred, created_at, updated_at
	`, input.Title, input.Category, input.Priority, now.Format("2006-01-02"), now.Format("15:04"))

	task, err := scanTask(row)
	if err != nil {
		return nil, mapConstraintError(err)
	}
	task.Subtasks = []domain.Subtask{}
	return &task, nil
}

func (r *PostgresRepository) Update(ctx context.Context, id string, input usecase.UpdateInput) (*domain.Task, error) {
	sets := make([]string, 0)
	args := make([]any, 0)
	arg := func(value any) string {
		args = append(args, value)
		return fmt.Sprintf("$%d", len(args))
	}

	if input.Title != nil {
		sets = append(sets, "title = "+arg(*input.Title))
	}
	if input.Category != nil {
		sets = append(sets, "category = "+arg(*input.Category))
	}
	if input.Priority != nil {
		sets = append(sets, "priority = "+arg(*input.Priority))
	}
	if input.Date != nil {
		sets = append(sets, "task_date = "+arg(input.Date.Format("2006-01-02")))
	}
	if input.Time != nil {
		sets = append(sets, "task_time = "+arg(*input.Time))
	}
	if input.Notes != nil {
		sets = append(sets, "notes = "+arg(*input.Notes))
	}
	if input.Done != nil {
		sets = append(sets, "done = "+arg(*input.Done))
	}
	if input.Starred != nil {
		sets = append(sets, "starred = "+arg(*input.Starred))
	}

	if len(sets) == 0 {
		return r.GetByID(ctx, id)
	}

	idParam := arg(id)
	query := "UPDATE tasks SET " + strings.Join(sets, ", ") + " WHERE id = " + idParam
	commandTag, err := r.db.Exec(ctx, query, args...)
	if err != nil {
		return nil, mapConstraintError(err)
	}
	if commandTag.RowsAffected() == 0 {
		return nil, usecase.ErrNotFound
	}

	return r.GetByID(ctx, id)
}

func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	commandTag, err := r.db.Exec(ctx, "DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		return err
	}
	if commandTag.RowsAffected() == 0 {
		return usecase.ErrNotFound
	}
	return nil
}

func (r *PostgresRepository) AddSubtask(ctx context.Context, taskID string, input usecase.AddSubtaskInput) (*domain.Subtask, error) {
	var exists bool
	if err := r.db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = $1)", taskID).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		return nil, usecase.ErrNotFound
	}

	row := r.db.QueryRow(ctx, `
		INSERT INTO subtasks (task_id, title)
		VALUES ($1, $2)
		RETURNING id, task_id, title, done, created_at, updated_at
	`, taskID, input.Title)

	subtask, err := scanSubtask(row)
	if err != nil {
		return nil, mapConstraintError(err)
	}
	return &subtask, nil
}

func (r *PostgresRepository) ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error) {
	row := r.db.QueryRow(ctx, `
		UPDATE subtasks
		SET done = NOT done
		WHERE task_id = $1 AND id = $2
		RETURNING id, task_id, title, done, created_at, updated_at
	`, taskID, subtaskID)

	subtask, err := scanSubtask(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, usecase.ErrNotFound
		}
		return nil, err
	}
	return &subtask, nil
}

func (r *PostgresRepository) listSubtasks(ctx context.Context, taskID string) ([]domain.Subtask, error) {
	rows, err := r.db.Query(ctx, subtaskSelectSQL()+" WHERE task_id = $1 ORDER BY created_at ASC", taskID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	subtasks := make([]domain.Subtask, 0)
	for rows.Next() {
		subtask, err := scanSubtask(rows)
		if err != nil {
			return nil, err
		}
		subtasks = append(subtasks, subtask)
	}
	return subtasks, rows.Err()
}

func taskSelectSQL() string {
	return `SELECT id, title, category, priority, task_date, to_char(task_time, 'HH24:MI'), notes, done, starred, created_at, updated_at FROM tasks`
}

func subtaskSelectSQL() string {
	return `SELECT id, task_id, title, done, created_at, updated_at FROM subtasks`
}

type taskScanner interface {
	Scan(dest ...any) error
}

func scanTask(scanner taskScanner) (domain.Task, error) {
	var task domain.Task
	var category string
	var priority string
	if err := scanner.Scan(&task.ID, &task.Title, &category, &priority, &task.Date, &task.Time, &task.Notes, &task.Done, &task.Starred, &task.CreatedAt, &task.UpdatedAt); err != nil {
		return domain.Task{}, err
	}
	task.Category = domain.Category(category)
	task.Priority = domain.Priority(priority)
	return task, nil
}

func scanSubtask(scanner taskScanner) (domain.Subtask, error) {
	var subtask domain.Subtask
	if err := scanner.Scan(&subtask.ID, &subtask.TaskID, &subtask.Title, &subtask.Done, &subtask.CreatedAt, &subtask.UpdatedAt); err != nil {
		return domain.Subtask{}, err
	}
	return subtask, nil
}

func mapConstraintError(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23514" {
		return usecase.ErrInvalidInput
	}
	return err
}
