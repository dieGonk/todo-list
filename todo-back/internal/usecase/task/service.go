package task

import (
	"context"
	"strings"
	"time"

	domain "todo-back/internal/domain/task"
)

type Service struct {
	repository Repository
	now        func() time.Time
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository, now: time.Now}
}

func (s *Service) List(ctx context.Context, filter ListFilter) ([]domain.Task, error) {
	return s.repository.List(ctx, filter)
}

func (s *Service) GetByID(ctx context.Context, id string) (*domain.Task, error) {
	return s.repository.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*domain.Task, error) {
	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" {
		return nil, ValidationError{Message: "Title is required"}
	}
	if !domain.IsValidCategory(input.Category) {
		return nil, ValidationError{Message: "Invalid category"}
	}
	if !domain.IsValidPriority(input.Priority) {
		return nil, ValidationError{Message: "Invalid priority"}
	}

	return s.repository.Create(ctx, input)
}

func (s *Service) Update(ctx context.Context, id string, input UpdateInput) (*domain.Task, error) {
	if input.Title != nil {
		trimmed := strings.TrimSpace(*input.Title)
		if trimmed == "" {
			return nil, ValidationError{Message: "Title is required"}
		}
		input.Title = &trimmed
	}
	if input.Category != nil && !domain.IsValidCategory(*input.Category) {
		return nil, ValidationError{Message: "Invalid category"}
	}
	if input.Priority != nil && !domain.IsValidPriority(*input.Priority) {
		return nil, ValidationError{Message: "Invalid priority"}
	}
	if input.Time != nil {
		if _, err := time.Parse("15:04", *input.Time); err != nil {
			return nil, ValidationError{Message: "Invalid time format"}
		}
	}

	return s.repository.Update(ctx, id, input)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repository.Delete(ctx, id)
}

func (s *Service) AddSubtask(ctx context.Context, taskID string, input AddSubtaskInput) (*domain.Subtask, error) {
	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" {
		return nil, ValidationError{Message: "Subtask title is required"}
	}

	return s.repository.AddSubtask(ctx, taskID, input)
}

func (s *Service) ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error) {
	return s.repository.ToggleSubtask(ctx, taskID, subtaskID)
}
