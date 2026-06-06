package task

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	domain "todo-back/internal/domain/task"
	usecase "todo-back/internal/usecase/task"
)

type UseCase interface {
	List(ctx context.Context, filter usecase.ListFilter) ([]domain.Task, error)
	GetByID(ctx context.Context, id string) (*domain.Task, error)
	Create(ctx context.Context, input usecase.CreateInput) (*domain.Task, error)
	Update(ctx context.Context, id string, input usecase.UpdateInput) (*domain.Task, error)
	Delete(ctx context.Context, id string) error
	AddSubtask(ctx context.Context, taskID string, input usecase.AddSubtaskInput) (*domain.Subtask, error)
	ToggleSubtask(ctx context.Context, taskID string, subtaskID string) (*domain.Subtask, error)
}

type Handler struct {
	useCase UseCase
	log     *slog.Logger
}

func NewHandler(useCase UseCase, log *slog.Logger) *Handler {
	return &Handler{useCase: useCase, log: log}
}

func (h *Handler) Register(r chi.Router) {
	r.Get("/", h.List)
	r.Post("/", h.Create)
	r.Get("/{taskID}", h.GetByID)
	r.Patch("/{taskID}", h.Update)
	r.Delete("/{taskID}", h.Delete)
	r.Post("/{taskID}/subtasks", h.AddSubtask)
	r.Patch("/{taskID}/subtasks/{subtaskID}/toggle", h.ToggleSubtask)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	tasks, err := h.useCase.List(r.Context(), usecase.ListFilter{
		Filter:   r.URL.Query().Get("filter"),
		Category: r.URL.Query().Get("category"),
		Query:    r.URL.Query().Get("query"),
		Sort:     r.URL.Query().Get("sort"),
	})
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, mapTasks(tasks))
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	task, err := h.useCase.GetByID(r.Context(), chi.URLParam(r, "taskID"))
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, mapTask(*task))
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var request createTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON")
		return
	}

	task, err := h.useCase.Create(r.Context(), usecase.CreateInput{
		Title:    request.Title,
		Category: domain.Category(request.Category),
		Priority: domain.Priority(request.Priority),
	})
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, mapTask(*task))
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	var request updateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON")
		return
	}

	input, err := request.toUseCaseInput()
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_input", err.Error())
		return
	}

	task, err := h.useCase.Update(r.Context(), chi.URLParam(r, "taskID"), input)
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, mapTask(*task))
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.useCase.Delete(r.Context(), chi.URLParam(r, "taskID")); err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AddSubtask(w http.ResponseWriter, r *http.Request) {
	var request addSubtaskRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_json", "Request body must be valid JSON")
		return
	}

	subtask, err := h.useCase.AddSubtask(r.Context(), chi.URLParam(r, "taskID"), usecase.AddSubtaskInput{Title: request.Title})
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, mapSubtask(*subtask))
}

func (h *Handler) ToggleSubtask(w http.ResponseWriter, r *http.Request) {
	subtask, err := h.useCase.ToggleSubtask(r.Context(), chi.URLParam(r, "taskID"), chi.URLParam(r, "subtaskID"))
	if err != nil {
		h.writeUseCaseError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, mapSubtask(*subtask))
}

func (h *Handler) writeUseCaseError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, usecase.ErrInvalidInput):
		writeError(w, http.StatusBadRequest, "invalid_input", err.Error())
	case errors.Is(err, usecase.ErrNotFound):
		writeError(w, http.StatusNotFound, "not_found", "Resource not found")
	default:
		if h.log != nil {
			h.log.Error("task handler error", slog.String("error", err.Error()))
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Internal server error")
	}
}

type createTaskRequest struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	Priority string `json:"priority"`
}

type updateTaskRequest struct {
	Title    *string `json:"title"`
	Category *string `json:"category"`
	Priority *string `json:"priority"`
	Date     *string `json:"date"`
	Time     *string `json:"time"`
	Notes    *string `json:"notes"`
	Done     *bool   `json:"done"`
	Starred  *bool   `json:"starred"`
}

func (r updateTaskRequest) toUseCaseInput() (usecase.UpdateInput, error) {
	var input usecase.UpdateInput
	input.Title = r.Title
	input.Notes = r.Notes
	input.Done = r.Done
	input.Starred = r.Starred
	input.Time = r.Time
	if r.Category != nil {
		category := domain.Category(*r.Category)
		input.Category = &category
	}
	if r.Priority != nil {
		priority := domain.Priority(*r.Priority)
		input.Priority = &priority
	}
	if r.Date != nil {
		date, err := time.Parse("2006-01-02", *r.Date)
		if err != nil {
			return input, err
		}
		input.Date = &date
	}
	return input, nil
}

type addSubtaskRequest struct {
	Title string `json:"title"`
}

type taskResponse struct {
	ID        string            `json:"id"`
	Title     string            `json:"title"`
	Category  domain.Category   `json:"category"`
	Priority  domain.Priority   `json:"priority"`
	Date      string            `json:"date"`
	Time      string            `json:"time"`
	Notes     string            `json:"notes"`
	Done      bool              `json:"done"`
	Starred   bool              `json:"starred"`
	Subtasks  []subtaskResponse `json:"subtasks"`
	CreatedAt string            `json:"createdAt"`
	UpdatedAt string            `json:"updatedAt"`
}

type subtaskResponse struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Done      bool   `json:"done"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

func mapTasks(tasks []domain.Task) []taskResponse {
	response := make([]taskResponse, 0, len(tasks))
	for _, task := range tasks {
		response = append(response, mapTask(task))
	}
	return response
}

func mapTask(task domain.Task) taskResponse {
	subtasks := make([]subtaskResponse, 0, len(task.Subtasks))
	for _, subtask := range task.Subtasks {
		subtasks = append(subtasks, mapSubtask(subtask))
	}
	return taskResponse{
		ID:        task.ID,
		Title:     task.Title,
		Category:  task.Category,
		Priority:  task.Priority,
		Date:      task.Date.Format("2006-01-02"),
		Time:      task.Time,
		Notes:     task.Notes,
		Done:      task.Done,
		Starred:   task.Starred,
		Subtasks:  subtasks,
		CreatedAt: task.CreatedAt.Format(time.RFC3339),
		UpdatedAt: task.UpdatedAt.Format(time.RFC3339),
	}
}

func mapSubtask(subtask domain.Subtask) subtaskResponse {
	return subtaskResponse{
		ID:        subtask.ID,
		Title:     subtask.Title,
		Done:      subtask.Done,
		CreatedAt: subtask.CreatedAt.Format(time.RFC3339),
		UpdatedAt: subtask.UpdatedAt.Format(time.RFC3339),
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
