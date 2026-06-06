package config

import (
	"fmt"
	"net"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	App      AppConfig      `yaml:"app"`
	HTTP     HTTPConfig     `yaml:"http"`
	Postgres PostgresConfig `yaml:"postgres"`
}

type AppConfig struct {
	Name string `yaml:"name"`
	Env  string `yaml:"env"`
}

type HTTPConfig struct {
	Host         string        `yaml:"host"`
	Port         int           `yaml:"port"`
	ReadTimeout  time.Duration `yaml:"read_timeout"`
	WriteTimeout time.Duration `yaml:"write_timeout"`
	IdleTimeout  time.Duration `yaml:"idle_timeout"`
}

type PostgresConfig struct {
	Host            string        `yaml:"host"`
	Port            int           `yaml:"port"`
	Database        string        `yaml:"database"`
	User            string        `yaml:"user"`
	Password        string        `yaml:"password"`
	SSLMode         string        `yaml:"ssl_mode"`
	MaxConns        int32         `yaml:"max_conns"`
	MinConns        int32         `yaml:"min_conns"`
	MaxConnLifetime time.Duration `yaml:"max_conn_lifetime"`
}

func Load(path string) (*Config, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(content, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}

	return &cfg, nil
}

func (c HTTPConfig) Addr() string {
	return net.JoinHostPort(c.Host, fmt.Sprintf("%d", c.Port))
}

func (c PostgresConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		c.User,
		c.Password,
		c.Host,
		c.Port,
		c.Database,
		c.SSLMode,
	)
}
