package logger

import "testing"

func TestLogger(t *testing.T) {

	Info("Hello")
	Warn("Warning")
	Error("Error")

}