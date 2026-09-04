package database

import (
	"strings"
	"testing"

	"quickwork.local/backend/config"
)

func TestBuildMySQLDSNIncludesTLSForExternalDemoDatabase(t *testing.T) {
	dsn := buildMySQLDSN(&config.Config{
		DBHost:     "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
		DBPort:     "4000",
		DBName:     "quickwork",
		DBUser:     "demo.root",
		DBPassword: "strong-password",
		DBTLS:      "true",
	})

	for _, expected := range []string{
		"demo.root:strong-password@tcp(gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000)/quickwork?",
		"charset=utf8mb4",
		"parseTime=True",
		"tls=true",
	} {
		if !strings.Contains(dsn, expected) {
			t.Fatalf("expected DSN %q to contain %q", dsn, expected)
		}
	}
}

func TestBuildMySQLDSNOmitsTLSForLocalMySQL(t *testing.T) {
	dsn := buildMySQLDSN(&config.Config{
		DBHost: "mysql", DBPort: "3306", DBName: "quickwork",
		DBUser: "quickwork", DBPassword: "local-password", DBTLS: "false",
	})
	if strings.Contains(dsn, "tls=") {
		t.Fatalf("expected local DSN without TLS option, got %q", dsn)
	}
}
