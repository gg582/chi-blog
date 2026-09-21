package utils

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"
)

// tokenTTL is how long an issued token stays valid.
const tokenTTL = 72 * time.Hour

// authSecret is the HMAC key used to sign and verify auth tokens.
var authSecret []byte

// SetAuthSecret sets the HMAC secret used for token signing.
// If secret is empty, a random secret is generated and a warning is logged:
// tokens issued before a restart will no longer be valid.
func SetAuthSecret(secret string) {
	if secret != "" {
		authSecret = []byte(secret)
		return
	}
	authSecret = make([]byte, 32)
	if _, err := rand.Read(authSecret); err != nil {
		log.Fatalf("failed to generate random auth secret: %v", err)
	}
	log.Print("WARNING: AUTH_SECRET is not set; a random secret was generated. All tokens are invalidated on restart.")
}

// GenerateToken returns a signed token of the form "<username>.<expiryUnix>.<sig>".
func GenerateToken(username string) string {
	expiry := time.Now().Add(tokenTTL).Unix()
	payload := fmt.Sprintf("%s.%d", username, expiry)
	sig := hex.EncodeToString(sign(payload))
	return payload + "." + sig
}

// ValidateToken checks the token signature and expiry.
func ValidateToken(token string) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return false
	}

	payload := parts[0] + "." + parts[1]
	providedSig, err := hex.DecodeString(parts[2])
	if err != nil {
		return false
	}
	if !hmac.Equal(sign(payload), providedSig) {
		return false
	}

	expiry, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return false
	}
	return time.Now().Unix() < expiry
}

// sign returns the HMAC-SHA256 of payload using authSecret.
func sign(payload string) []byte {
	mac := hmac.New(sha256.New, authSecret)
	mac.Write([]byte(payload))
	return mac.Sum(nil)
}
