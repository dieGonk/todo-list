package check

import (
	"encoding/json"
	"net/http"
	"time"
)

type Response struct {
	Status string `json:"status"`
	Time   string `json:"time"`
}

func Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(Response{
			Status: "ok",
			Time:   time.Now().UTC().Format(time.RFC3339),
		})
	}
}
