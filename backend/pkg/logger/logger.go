// Package logger provides structured and levels-based logging utilities.
package logger

import (
	"fmt"
	"log"
	"os"
)

var (
	infoLog  = log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	warnLog  = log.New(os.Stdout, "WARN: ", log.Ldate|log.Ltime|log.Lshortfile)
	errorLog = log.New(os.Stderr, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
)

// Info logs messages at information level.
func Info(format string, v ...interface{}) {
	infoLog.Output(2, fmt.Sprintf(format, v...))
}

// Warn logs messages at warning level.
func Warn(format string, v ...interface{}) {
	warnLog.Output(2, fmt.Sprintf(format, v...))
}

// Error logs messages at error level.
func Error(format string, v ...interface{}) {
	errorLog.Output(2, fmt.Sprintf(format, v...))
}

// Fatal logs messages at error level and terminates the program.
func Fatal(format string, v ...interface{}) {
	errorLog.Output(2, fmt.Sprintf(format, v...))
	os.Exit(1)
}
