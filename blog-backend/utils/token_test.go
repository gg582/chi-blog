package utils

import (
	"encoding/hex"
	"strconv"
	"strings"
	"testing"
	"time"
)

func TestTokenRoundTrip(t *testing.T) {
	SetAuthSecret("test-secret")
	token := GenerateToken("admin")
	if !ValidateToken(token) {
		t.Fatalf("expected generated token to be valid, got %q", token)
	}
	if !strings.HasPrefix(token, "admin.") {
		t.Fatalf("expected token to start with username, got %q", token)
	}
}

func TestTokenWrongSecretRejected(t *testing.T) {
	SetAuthSecret("secret-a")
	token := GenerateToken("admin")

	SetAuthSecret("secret-b")
	if ValidateToken(token) {
		t.Fatal("expected token signed with a different secret to be rejected")
	}
}

func TestTokenTamperedRejected(t *testing.T) {
	SetAuthSecret("test-secret")
	token := GenerateToken("admin")

	parts := strings.Split(token, ".")
	tampered := parts[0] + "." + parts[1] + ".deadbeef"
	if ValidateToken(tampered) {
		t.Fatal("expected tampered token to be rejected")
	}
	if ValidateToken("garbage") {
		t.Fatal("expected malformed token to be rejected")
	}
}

func TestTokenExpiry(t *testing.T) {
	SetAuthSecret("test-secret")

	pastExpiry := time.Now().Add(-time.Hour).Unix()
	payload := "admin." + strconv.FormatInt(pastExpiry, 10)
	expiredToken := payload + "." + hex.EncodeToString(sign(payload))
	if ValidateToken(expiredToken) {
		t.Fatal("expected expired token to be rejected")
	}
}
