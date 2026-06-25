package password

import "testing"

func TestHashAndVerify(t *testing.T) {
	password := "123456"

	hash, err := Hash(password)
	if err != nil {
		t.Fatalf("Hash() error = %v", err)
	}

	if hash == password {
		t.Error("Password should not equal hash")
	}

	if !Verify(hash, password) {
		t.Error("Verify() should return true")
	}

	if Verify(hash, "abcdef") {
		t.Error("Verify() should return false")
	}
}