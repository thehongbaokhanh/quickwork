package upload

import (
	"archive/zip"
	"bufio"
	"bytes"
	"context"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net"
	"path/filepath"
	"strings"
	"time"
)

var (
	ErrInvalidUpload = errors.New("invalid upload")
	ErrMalwareFound  = errors.New("malware detected")
)

type SecurityPolicy struct {
	MaxBytes            int64
	AllowedExtensions   map[string]bool
	MalwareScanRequired bool
	ClamAVAddress       string
}

// OpenValidated verifies size, extension and file signature, then scans the
// exact bytes with ClamAV before returning a rewound reader.
func OpenValidated(ctx context.Context, header *multipart.FileHeader, policy SecurityPolicy) (multipart.File, error) {
	if header == nil || header.Size <= 0 || header.Size > policy.MaxBytes {
		return nil, ErrInvalidUpload
	}
	ext := strings.ToLower(filepath.Ext(strings.TrimSpace(header.Filename)))
	if !policy.AllowedExtensions[ext] {
		return nil, ErrInvalidUpload
	}

	file, err := header.Open()
	if err != nil {
		return nil, fmt.Errorf("open upload: %w", err)
	}
	valid, err := validSignature(file, header.Size, ext)
	if err != nil || !valid {
		file.Close()
		return nil, ErrInvalidUpload
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		file.Close()
		return nil, fmt.Errorf("rewind upload: %w", err)
	}

	if policy.MalwareScanRequired {
		if strings.TrimSpace(policy.ClamAVAddress) == "" {
			file.Close()
			return nil, errors.New("malware scanner is not configured")
		}
		if err := scanClamAV(ctx, file, policy.ClamAVAddress); err != nil {
			file.Close()
			return nil, err
		}
		if _, err := file.Seek(0, io.SeekStart); err != nil {
			file.Close()
			return nil, fmt.Errorf("rewind scanned upload: %w", err)
		}
	}
	return file, nil
}

func validSignature(file multipart.File, size int64, ext string) (bool, error) {
	header := make([]byte, 16)
	n, err := io.ReadFull(file, header)
	if err != nil && !errors.Is(err, io.ErrUnexpectedEOF) {
		return false, err
	}
	header = header[:n]
	switch ext {
	case ".jpg", ".jpeg":
		return len(header) >= 3 && bytes.Equal(header[:3], []byte{0xff, 0xd8, 0xff}), nil
	case ".png":
		return len(header) >= 8 && bytes.Equal(header[:8], []byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a}), nil
	case ".pdf":
		return len(header) >= 5 && bytes.Equal(header[:5], []byte("%PDF-")), nil
	case ".doc":
		return len(header) >= 8 && bytes.Equal(header[:8], []byte{0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1}), nil
	case ".docx":
		reader, err := zip.NewReader(file, size)
		if err != nil {
			return false, nil
		}
		hasContentTypes := false
		hasDocument := false
		for _, entry := range reader.File {
			name := strings.ToLower(strings.ReplaceAll(entry.Name, "\\", "/"))
			hasContentTypes = hasContentTypes || name == "[content_types].xml"
			hasDocument = hasDocument || name == "word/document.xml"
		}
		return hasContentTypes && hasDocument, nil
	default:
		return false, nil
	}
}

func scanClamAV(ctx context.Context, file io.Reader, address string) error {
	dialer := net.Dialer{Timeout: 5 * time.Second}
	conn, err := dialer.DialContext(ctx, "tcp", address)
	if err != nil {
		return fmt.Errorf("connect malware scanner: %w", err)
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(30 * time.Second))
	if _, err := conn.Write([]byte("zINSTREAM\x00")); err != nil {
		return fmt.Errorf("start malware scan: %w", err)
	}

	buffer := make([]byte, 64*1024)
	length := make([]byte, 4)
	for {
		n, readErr := file.Read(buffer)
		if n > 0 {
			binary.BigEndian.PutUint32(length, uint32(n))
			if _, err := conn.Write(length); err != nil {
				return fmt.Errorf("send malware scan chunk: %w", err)
			}
			if _, err := conn.Write(buffer[:n]); err != nil {
				return fmt.Errorf("send upload to malware scanner: %w", err)
			}
		}
		if errors.Is(readErr, io.EOF) {
			break
		}
		if readErr != nil {
			return fmt.Errorf("read upload for malware scan: %w", readErr)
		}
	}
	binary.BigEndian.PutUint32(length, 0)
	if _, err := conn.Write(length); err != nil {
		return fmt.Errorf("finish malware scan: %w", err)
	}
	response, err := bufio.NewReader(conn).ReadString('\x00')
	if err != nil && !errors.Is(err, io.EOF) {
		return fmt.Errorf("read malware scan result: %w", err)
	}
	response = strings.TrimSpace(strings.TrimSuffix(response, "\x00"))
	if strings.HasSuffix(response, " FOUND") {
		return ErrMalwareFound
	}
	if !strings.HasSuffix(response, " OK") {
		return fmt.Errorf("malware scanner rejected upload")
	}
	return nil
}
