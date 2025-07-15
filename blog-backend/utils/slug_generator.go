package utils

import (
	"regexp"
	"strings"
)

// slugRegex matches any character that is NOT a letter, number, or Korean character, or a hyphen.
// It helps in removing unwanted characters for slug creation.
var slugRegex = regexp.MustCompile(`[^\p{L}\p{N}\s-]+`) // \p{L} for Unicode letters, \p{N} for Unicode numbers

// GenerateSlug creates a URL-friendly slug from a given title.
// It handles non-ASCII characters by preserving them and replaces spaces/special chars with hyphens,
// similar to Jekyll's behavior for international characters.
func GenerateSlug(title string) string {
	// 1. Convert to lowercase
	slug := strings.ToLower(title)

	// 2. Replace non-alphanumeric, non-hyphen, non-space, non-Korean characters with empty string.
	// This regex allows letters (including Unicode), numbers, spaces, and hyphens.
	slug = slugRegex.ReplaceAllString(slug, "")

	// 3. Replace spaces and multiple hyphens with a single hyphen
	slug = regexp.MustCompile(`[\s-]+`).ReplaceAllString(slug, "-")

	// 4. Trim leading/trailing hyphens
	slug = strings.Trim(slug, "-")

	// Handle empty slug if title was just special characters
	if slug == "" {
		// Fallback for titles that result in empty slugs (e.g., "!!!")
		// You might want to generate a random string or a default slug here.
		return "untitled-post"
	}

	return slug
}

// This is an alternative slug generation that encodes non-ASCII characters.
// Not used by default, but kept for reference if explicit encoding is preferred.
func GenerateEncodedSlug(title string) string {
	// Replace non-alphanumeric with hyphen
	re := regexp.MustCompile(`[^\p{L}\p{N}]+`)
	slug := re.ReplaceAllString(strings.ToLower(title), "-")
	slug = strings.Trim(slug, "-")
	return slug
}
