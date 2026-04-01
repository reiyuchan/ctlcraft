package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/reiyuchan/ctlcraft/internal/config"
	"github.com/reiyuchan/ctlcraft/internal/server"
)

func main() {
	cfg := config.New()
	app := server.New(cfg)

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		log.Println("Shutdown signal received")
		if err := app.Stop(); err != nil {
			log.Printf("Error stopping server: %v", err)
		}
		os.Exit(0)
	}()

	log.Fatal(app.Listen())
}
