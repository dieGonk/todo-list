package router

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"todo-back/internal/interfaces/http/check"
	"todo-back/internal/interfaces/http/docs"
	"todo-back/internal/interfaces/http/handlers"
)

type Dependencies struct {
	Log *slog.Logger
}

func New(deps Dependencies) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	r.Get("/check", check.Handler())
	r.Get("/docs", docs.UI())
	r.Get("/docs/openapi.yml", docs.OpenAPI("."))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("front to back api v1"))
	})

	r.Route("/srv/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("back to back api v1"))
	})

	r.Route("/admin/v1", func(r chi.Router) {
		r.Get("/", handlers.Message("admin api v1"))
	})

	return r
}
