package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8091"
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      true,
			"service": "rule-engine",
		})
	})

	log.Printf("rule-engine running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
