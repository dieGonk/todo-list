package handlers

import (
	"encoding/json"
	"net/http"
)

type MessageResponse struct {
	Message string `json:"message"`
}

func Message(message string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(MessageResponse{Message: message})
	}
}
