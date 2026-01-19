# CORS Configuration

This application uses a modern, secure CORS configuration that follows best practices for web applications.

## Features

### 1. **Specific Allowed Origins**
Instead of using a wildcard (`*`), specific origins are whitelisted for security:
- `https://hobbies.yoonjin2.kr` - Production frontend
- `https://hobbies.yoonjin2.kr:3000` - Production with alternative port
- `http://localhost:3000` - Local development

### 2. **Environment Variable Support**
You can override the default allowed origins using the `ALLOWED_ORIGINS` environment variable:

```bash
export ALLOWED_ORIGINS="https://example.com,https://app.example.com"
./blog-backend run
```

Multiple origins should be comma-separated.

### 3. **Credentials Support**
`AllowCredentials: true` enables cookie-based authentication flows, which is essential for secure session management.

### 4. **Modern Headers**
The configuration includes headers commonly used by modern web applications:
- `Accept` - Content negotiation
- `Authorization` - Bearer tokens and other auth schemes
- `Content-Type` - Request payload type
- `X-CSRF-Token` - CSRF protection
- `X-Requested-With` - AJAX request identification

### 5. **Optimized Preflight Caching**
`MaxAge: 3600` (1 hour) reduces the number of preflight requests, improving performance while maintaining security.

## Security Benefits

1. **No wildcard origins** - Prevents unauthorized domains from accessing your API
2. **Credential support** - Enables secure cookie-based authentication
3. **Specific method allowlist** - Only allows necessary HTTP methods
4. **Header allowlist** - Restricts which headers can be sent in requests

## Troubleshooting

If you encounter CORS errors:

1. **Check the origin** - Make sure your frontend is running on one of the allowed origins
2. **Add custom origin** - Use the `ALLOWED_ORIGINS` environment variable if needed
3. **Check browser console** - Look for specific CORS error messages
4. **Verify credentials** - If using cookies, ensure `credentials: 'include'` in fetch requests

## Example Frontend Configuration

When making requests from the frontend with credentials:

```javascript
fetch('https://hobbies.yoonjin2.kr:8080/api/posts', {
  method: 'POST',
  credentials: 'include', // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
```
