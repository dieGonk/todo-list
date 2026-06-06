package docs_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"todo-back/internal/interfaces/http/docs"
)

func TestUI(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/docs", nil)
	rec := httptest.NewRecorder()

	docs.UI().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	body := rec.Body.String()
	if !strings.Contains(body, "SwaggerUIBundle") {
		t.Fatalf("expected swagger ui bundle script in response")
	}

	if !strings.Contains(body, "/docs/openapi.yml") {
		t.Fatalf("expected openapi spec URL in response")
	}
}
