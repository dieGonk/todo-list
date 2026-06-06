package config_test

import (
	"testing"
	"time"

	"todo-back/internal/config"
)

func TestLoadLocalConfig(t *testing.T) {
	cfg, err := config.Load("../../configs/local.yml")
	if err != nil {
		t.Fatalf("expected config to load: %v", err)
	}

	if cfg.App.Name != "todo-back" {
		t.Fatalf("unexpected app name: %s", cfg.App.Name)
	}

	if cfg.HTTP.Port != 8080 {
		t.Fatalf("unexpected http port: %d", cfg.HTTP.Port)
	}

	if cfg.HTTP.ReadTimeout != 5*time.Second {
		t.Fatalf("unexpected read timeout: %s", cfg.HTTP.ReadTimeout)
	}
}
