package task_test

import (
	"context"

	domain "todo-back/internal/domain/task"
	usecase "todo-back/internal/usecase/task"
)

type fakeRepository struct{}

func (fakeRepository) List(ctx context.Context, filter usecase.ListFilter) ([]domain.Task, error) {
	return nil, nil
}

func (fakeRepository) GetByID(ctx context.Context, id string) (*domain.Task, error) {
	return nil, usecase.ErrNotFound
}

func (fakeRepository) Create(ctx context.Context, input usecase.CreateInput) (*domain.Task, error) {
	return &domain.Task{Title: input.Title, Category: input.Category, Priority: input.Priority}, nil
}

func (fakeRepository) Update(ctx context.Context, id string, input usecase.UpdateInput) (*domain.Task, error) {
	return nil, nil
}

func (fakeRepository) Delete(ctx context.Context, id string) error {
	return nil
}

func (fakeRepository) AddSubtask(ctx context.Context, taskID string, input usecase.AddSubtaskInput) (*domain.Subtask, error) {
	return &domain.Subtask{TaskID: taskID, Title: input.Title}, nil
}

func (fakeRepository) ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error) {
	return &domain.Subtask{ID: subtaskID, TaskID: taskID, Done: true}, nil
}
