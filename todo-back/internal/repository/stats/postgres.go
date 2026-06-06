package stats

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	usecase "todo-back/internal/usecase/stats"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) GetProductivity(ctx context.Context, from time.Time, to time.Time) (*usecase.Productivity, error) {
	var summary usecase.ProductivitySummary
	if err := r.db.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE done = FALSE) AS in_progress,
			COUNT(*) FILTER (WHERE done = TRUE) AS completed,
			COUNT(*) FILTER (WHERE done = FALSE AND task_date > CURRENT_DATE) AS upcoming
		FROM tasks
	`).Scan(&summary.InProgress, &summary.Completed, &summary.Upcoming); err != nil {
		return nil, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT updated_at::date AS day, COUNT(*) AS completed
		FROM tasks
		WHERE done = TRUE
		  AND updated_at::date BETWEEN $1 AND $2
		GROUP BY updated_at::date
	`, from.Format("2006-01-02"), to.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	completedByDate := make(map[string]int)
	for rows.Next() {
		var day time.Time
		var completed int
		if err := rows.Scan(&day, &completed); err != nil {
			return nil, err
		}
		completedByDate[day.Format("2006-01-02")] = completed
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	points := make([]usecase.ProductivityPoint, 0, 7)
	for i := 0; i < 7; i++ {
		date := from.AddDate(0, 0, i)
		points = append(points, usecase.ProductivityPoint{
			Date:      date,
			Label:     weekdayLabel(date.Weekday()),
			Completed: completedByDate[date.Format("2006-01-02")],
		})
	}

	return &usecase.Productivity{
		Summary: summary,
		Range: usecase.ProductivityRange{
			From: from,
			To:   to,
		},
		Points: points,
	}, nil
}

func weekdayLabel(day time.Weekday) string {
	switch day {
	case time.Monday:
		return "Пн"
	case time.Tuesday:
		return "Вт"
	case time.Wednesday:
		return "Ср"
	case time.Thursday:
		return "Чт"
	case time.Friday:
		return "Пт"
	case time.Saturday:
		return "Сб"
	default:
		return "Вс"
	}
}
