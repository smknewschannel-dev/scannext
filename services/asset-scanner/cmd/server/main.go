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
		port = "8090"
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      true,
			"service": "asset-scanner",
		})
	})

	log.Printf("asset-scanner running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
