package stats

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"

	usecase "todo-back/internal/usecase/stats"
)

type UseCase interface {
	GetProductivity(ctx context.Context) (*usecase.Productivity, error)
}

type Handler struct {
	useCase UseCase
	log     *slog.Logger
}

func NewHandler(useCase UseCase, log *slog.Logger) *Handler {
	return &Handler{useCase: useCase, log: log}
}

func (h *Handler) Register(r chi.Router) {
	r.Get("/productivity", h.GetProductivity)
}

func (h *Handler) GetProductivity(w http.ResponseWriter, r *http.Request) {
	productivity, err := h.useCase.GetProductivity(r.Context())
	if err != nil {
		if h.log != nil {
			h.log.Error("productivity stats handler error", slog.String("error", err.Error()))
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Internal server error")
		return
	}

	writeJSON(w, http.StatusOK, mapProductivity(*productivity))
}

type productivityResponse struct {
	Summary productivitySummaryResponse `json:"summary"`
	Range   productivityRangeResponse   `json:"range"`
	Points  []productivityPointResponse `json:"points"`
}

type productivitySummaryResponse struct {
	InProgress int `json:"inProgress"`
	Completed  int `json:"completed"`
	Upcoming   int `json:"upcoming"`
}

type productivityRangeResponse struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type productivityPointResponse struct {
	Date      string `json:"date"`
	Label     string `json:"label"`
	Completed int    `json:"completed"`
}

func mapProductivity(productivity usecase.Productivity) productivityResponse {
	points := make([]productivityPointResponse, 0, len(productivity.Points))
	for _, point := range productivity.Points {
		points = append(points, productivityPointResponse{
			Date:      point.Date.Format("2006-01-02"),
			Label:     point.Label,
			Completed: point.Completed,
		})
	}

	return productivityResponse{
		Summary: productivitySummaryResponse{
			InProgress: productivity.Summary.InProgress,
			Completed:  productivity.Summary.Completed,
			Upcoming:   productivity.Summary.Upcoming,
		},
		Range: productivityRangeResponse{
			From: productivity.Range.From.Format("2006-01-02"),
			To:   productivity.Range.To.Format("2006-01-02"),
		},
		Points: points,
	}
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, map[string]string{"code": code, "message": message})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
