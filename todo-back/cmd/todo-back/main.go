package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"todo-back/internal/app"
	"todo-back/internal/config"
	"todo-back/internal/pkg/logger"
)

func main() {
	configPath := flag.String("config", "./configs/local.yml", "path to yml config")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		slog.Error("failed to load config", slog.String("error", err.Error()))
		os.Exit(1)
	}

	log := logger.New(cfg.App.Env)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	application, err := app.New(ctx, cfg, log)
	if err != nil {
		log.Error("failed to initialize app", slog.String("error", err.Error()))
		os.Exit(1)
	}

	if err := application.Run(ctx); err != nil {
		log.Error("app stopped with error", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
