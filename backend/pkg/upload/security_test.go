package upload

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"io"
	"net"
	"strings"
	"testing"
)

func TestValidSignatureRejectsExtensionSpoofing(t *testing.T) {
	file := &memoryMultipartFile{Reader: bytes.NewReader([]byte("not an image"))}
	valid, err := validSignature(file, int64(file.Len()), ".png")
	if err != nil {
		t.Fatalf("validSignature returned error: %v", err)
	}
	if valid {
		t.Fatal("expected a fake PNG to be rejected")
	}
}

func TestScanClamAV(t *testing.T) {
	tests := []struct {
		name        string
		response    string
		wantMalware bool
	}{
		{name: "clean", response: "stream: OK\x00"},
		{name: "infected", response: "stream: Eicar-Test-Signature FOUND\x00", wantMalware: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			listener, err := net.Listen("tcp", "127.0.0.1:0")
			if err != nil {
				t.Fatal(err)
			}
			defer listener.Close()
			go func() {
				conn, acceptErr := listener.Accept()
				if acceptErr != nil {
					return
				}
				defer conn.Close()
				reader := bufio.NewReader(conn)
				command, _ := reader.ReadString('\x00')
				if command != "zINSTREAM\x00" {
					return
				}
				length := make([]byte, 4)
				for {
					if _, err := io.ReadFull(reader, length); err != nil {
						return
					}
					size := binary.BigEndian.Uint32(length)
					if size == 0 {
						break
					}
					if _, err := io.CopyN(io.Discard, reader, int64(size)); err != nil {
						return
					}
				}
				_, _ = conn.Write([]byte(test.response))
			}()

			err = scanClamAV(t.Context(), strings.NewReader("safe payload"), listener.Addr().String())
			if test.wantMalware && err != ErrMalwareFound {
				t.Fatalf("expected ErrMalwareFound, got %v", err)
			}
			if !test.wantMalware && err != nil {
				t.Fatalf("expected clean scan, got %v", err)
			}
		})
	}
}

type memoryMultipartFile struct {
	*bytes.Reader
}

func (f *memoryMultipartFile) Close() error { return nil }
