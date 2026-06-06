package router

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"todo-back/internal/interfaces/http/check"
	"todo-back/internal/interfaces/http/docs"
	"todo-back/internal/interfaces/http/handlers"
	taskhandler "todo-back/internal/interfaces/http/handlers/task"
	httpmiddleware "todo-back/internal/interfaces/http/middleware"
)

type Dependencies struct {
	Log         *slog.Logger
	TaskUseCase taskhandler.UseCase
}

func New(deps Dependencies) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Heartbeat("/ping"))
	r.Use(httpmiddleware.CORS)

	r.Get("/check", check.Handler())
	r.Get("/docs", docs.UI())
	r.Get("/docs/openapi.yml", docs.OpenAPI("."))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("front to back api v1"))
		r.Route("/tasks", taskhandler.NewHandler(deps.TaskUseCase, deps.Log).Register)
	})

	r.Route("/srv/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("back to back api v1"))
	})

	r.Route("/admin/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("admin api v1"))
	})

	return r
}
