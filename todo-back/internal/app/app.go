package app

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"todo-back/internal/config"
	"todo-back/internal/infrastructure/postgres"
	"todo-back/internal/interfaces/http/router"
	statsrepo "todo-back/internal/repository/stats"
	taskrepo "todo-back/internal/repository/task"
	statsusecase "todo-back/internal/usecase/stats"
	taskusecase "todo-back/internal/usecase/task"
)

type App struct {
	cfg    *config.Config
	log    *slog.Logger
	server *http.Server
	db     *pgxpool.Pool
}

func New(ctx context.Context, cfg *config.Config, log *slog.Logger) (*App, error) {
	db, err := postgres.NewPool(ctx, cfg.Postgres)
	if err != nil {
		return nil, err
	}

	taskRepository := taskrepo.NewPostgresRepository(db)
	taskService := taskusecase.NewService(taskRepository)
	statsRepository := statsrepo.NewPostgresRepository(db)
	statsService := statsusecase.NewService(statsRepository)

	httpRouter := router.New(router.Dependencies{
		Log:          log,
		TaskUseCase:  taskService,
		StatsUseCase: statsService,
	})

	server := &http.Server{
		Addr:         cfg.HTTP.Addr(),
		Handler:      httpRouter,
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
		IdleTimeout:  cfg.HTTP.IdleTimeout,
	}

	return &App{cfg: cfg, log: log, server: server, db: db}, nil
}

func (a *App) Run(ctx context.Context) error {
	errCh := make(chan error, 1)

	go func() {
		a.log.Info("http server started", slog.String("addr", a.server.Addr))
		if err := a.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	select {
	case <-ctx.Done():
		return a.shutdown()
	case err := <-errCh:
		if err != nil {
			return err
		}
		return nil
	}
}

func (a *App) shutdown() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	a.log.Info("shutting down http server")
	serverErr := a.server.Shutdown(ctx)

	if a.db != nil {
		a.db.Close()
	}

	return serverErr
}
