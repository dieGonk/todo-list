package task_test

import (
	"context"
	"errors"
	"testing"

	domain "todo-back/internal/domain/task"
	usecase "todo-back/internal/usecase/task"
)

func TestCreateValidation(t *testing.T) {
	tests := []struct {
		name  string
		input usecase.CreateInput
	}{
		{
			name: "empty title",
			input: usecase.CreateInput{
				Title:    "   ",
				Category: domain.CategoryWork,
				Priority: domain.PriorityMedium,
			},
		},
		{
			name: "invalid category",
			input: usecase.CreateInput{
				Title:    "Task",
				Category: domain.Category("bad"),
				Priority: domain.PriorityMedium,
			},
		},
		{
			name: "invalid priority",
			input: usecase.CreateInput{
				Title:    "Task",
				Category: domain.CategoryWork,
				Priority: domain.Priority("bad"),
			},
		},
	}

	service := usecase.NewService(fakeRepository{})
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.Create(context.Background(), tt.input)
			if !errors.Is(err, usecase.ErrInvalidInput) {
				t.Fatalf("expected ErrInvalidInput, got %v", err)
			}
		})
	}
}
