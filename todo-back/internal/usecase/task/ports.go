package task

import (
	"context"

	domain "todo-back/internal/domain/task"
)

type Repository interface {
	List(ctx context.Context, filter ListFilter) ([]domain.Task, error)
	GetByID(ctx context.Context, id string) (*domain.Task, error)
	Create(ctx context.Context, input CreateInput) (*domain.Task, error)
	Update(ctx context.Context, id string, input UpdateInput) (*domain.Task, error)
	Delete(ctx context.Context, id string) error
	AddSubtask(ctx context.Context, taskID string, input AddSubtaskInput) (*domain.Subtask, error)
	ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error)
}
