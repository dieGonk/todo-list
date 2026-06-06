package router_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"todo-back/internal/interfaces/http/router"
)

func TestRouterCheck(t *testing.T) {
	r := router.New(router.Dependencies{})
	req := httptest.NewRequest(http.MethodGet, "/check", nil)
	rec := httptest.NewRecorder()

	r.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}

func TestRouterAPIGroups(t *testing.T) {
	tests := []string{"/api/v1/", "/srv/v1/", "/admin/v1/"}
	r := router.New(router.Dependencies{})

	for _, path := range tests {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rec := httptest.NewRecorder()
		r.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("%s: expected status %d, got %d", path, http.StatusOK, rec.Code)
		}
	}
}
