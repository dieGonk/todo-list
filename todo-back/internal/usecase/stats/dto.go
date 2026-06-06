package stats

import "time"

type ProductivitySummary struct {
	InProgress int
	Completed  int
	Upcoming   int
}

type ProductivityRange struct {
	From time.Time
	To   time.Time
}

type ProductivityPoint struct {
	Date      time.Time
	Label     string
	Completed int
}

type Productivity struct {
	Summary ProductivitySummary
	Range   ProductivityRange
	Points  []ProductivityPoint
}
