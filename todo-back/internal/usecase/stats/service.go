package stats

import (
	"context"
	"time"
)

type Service struct {
	repository Repository
	now        func() time.Time
}

func NewService(repository Repository) *Service {
	return &Service{repository: repository, now: time.Now}
}

func (s *Service) GetProductivity(ctx context.Context) (*Productivity, error) {
	now := s.now()
	to := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	from := to.AddDate(0, 0, -6)
	return s.repository.GetProductivity(ctx, from, to)
}
