package task

import "time"

type Category string

const (
	CategoryWork     Category = "work"
	CategoryPersonal Category = "personal"
	CategoryHealth   Category = "health"
	CategoryLearning Category = "learning"
	CategoryHome     Category = "home"
)

type Priority string

const (
	PriorityHigh   Priority = "high"
	PriorityMedium Priority = "med"
	PriorityLow    Priority = "low"
)

type Subtask struct {
	ID        string
	TaskID    string
	Title     string
	Done      bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Task struct {
	ID        string
	Title     string
	Category  Category
	Priority  Priority
	Date      time.Time
	Time      string
	Notes     string
	Done      bool
	Starred   bool
	Subtasks  []Subtask
	CreatedAt time.Time
	UpdatedAt time.Time
}

func IsValidCategory(value Category) bool {
	switch value {
	case CategoryWork, CategoryPersonal, CategoryHealth, CategoryLearning, CategoryHome:
		return true
	default:
		return false
	}
}

func IsValidPriority(value Priority) bool {
	switch value {
	case PriorityHigh, PriorityMedium, PriorityLow:
		return true
	default:
		return false
	}
}
