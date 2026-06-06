package docs

import (
	"net/http"
	"os"
	"path/filepath"
)

func UI() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte(html))
	}
}

func OpenAPI(projectRoot string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		content, err := os.ReadFile(filepath.Join(projectRoot, "docs", "openapi", "openapi.yml"))
		if err != nil {
			http.Error(w, "openapi spec not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		_, _ = w.Write(content)
	}
}

const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TK.Tasks API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.yml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        displayRequestDuration: true,
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>`
