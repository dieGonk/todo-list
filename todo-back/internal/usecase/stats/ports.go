package stats

import (
	"context"
	"time"
)

type Repository interface {
	GetProductivity(ctx context.Context, from time.Time, to time.Time) (*Productivity, error)
}
