package task

import (
	"time"

	domain "todo-back/internal/domain/task"
)

type ListFilter struct {
	Filter   string
	Category string
	Query    string
	Sort     string
}

type CreateInput struct {
	Title    string
	Category domain.Category
	Priority domain.Priority
}

type UpdateInput struct {
	Title    *string
	Category *domain.Category
	Priority *domain.Priority
	Date     *time.Time
	Time     *string
	Notes    *string
	Done     *bool
	Starred  *bool
}

type AddSubtaskInput struct {
	Title string
}
