package check_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"todo-back/internal/interfaces/http/check"
)

func TestHandler(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/check", nil)
	rec := httptest.NewRecorder()

	check.Handler().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	var body check.Response
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode response: %v", err)
	}

	if body.Status != "ok" {
		t.Fatalf("unexpected status: %s", body.Status)
	}
}
