# Authentication Setup Guide

## Quick Start

### 1. Configure Backend URL

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Replace with your actual backend URL.

### 2. Backend API Requirements

Your backend must implement the following endpoints:

#### Login Endpoint
```
POST /api/v1/user/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "mfa_code": "123456" // optional
}

Response (Success):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
    "expires_at": "2024-12-31T23:59:59Z",
    "mfa_required": false,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "email_verified": true,
      "status": "active",
      "profile": {
        "display_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "locale": "en-US",
        "time_zone": "America/New_York",
        "updated_at": "2024-01-15T10:30:00Z"
      },
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}

Response (Error):
{
  "status": "error",
  "message": "Invalid email or password"
}
```

#### Refresh Token Endpoint
```
POST /api/v1/user/refresh
Content-Type: application/json

Request Body:
{
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}

Response (Success):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}

Response (Error):
{
  "status": "error",
  "message": "Invalid or expired refresh token"
}
```

#### Logout Endpoint
```
POST /api/v1/user/logout
Content-Type: application/json
Authorization: Bearer <access_token>

Request Body:
{
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}

Response (Success):
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### 3. Key Features Implemented

✅ **Login UI** - Beautiful, modern login form with email/password  
✅ **Protected Routes** - Dashboard only accessible when authenticated  
✅ **Automatic Token Refresh** - Seamlessly refreshes expired access tokens  
✅ **401 Error Handling** - Redirects to login on authentication failure  
✅ **MFA Support** - Optional MFA code input if required by backend  
✅ **User Status Checking** - Handles locked, disabled, or deleted accounts  
✅ **Logout Functionality** - Secure logout with token cleanup  
✅ **Session Management** - Persists user session across page reloads  
✅ **User Profile Display** - Shows avatar and display name in header  

### 4. Authentication Flow

```
┌─────────────┐
│   User      │
│ visits /    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Protected Route │
│   Component     │
└──────┬──────────┘
       │
       ▼
┌────────────────┐     No Token      ┌──────────┐
│ Check Auth     │─────────────────▶│ Redirect │
│ (useAuth)      │                   │ to Login │
└──────┬─────────┘                   └──────────┘
       │ Has Token
       ▼
┌────────────────┐
│ Render         │
│ Dashboard      │
└────────────────┘
```

### 5. Token Refresh Flow

```
┌──────────────┐
│  API Request │
└──────┬───────┘
       │
       ▼
┌──────────────┐     401 Error      ┌────────────────┐
│  API Call    │───────────────────▶│ Interceptor    │
└──────────────┘                     │ catches 401    │
                                     └────────┬───────┘
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │ Call Refresh   │
                                     │ Token Endpoint │
                                     └────────┬───────┘
                                              │
                      ┌──────────────┬────────┴────────┬──────────────┐
                      │              │                 │              │
                      ▼              ▼                 ▼              ▼
              ┌───────────┐  ┌──────────┐    ┌──────────┐   ┌──────────────┐
              │  Success  │  │  Retry   │    │  Failed  │   │  Redirect to │
              │ New Token │  │ Original │    │  Clear   │   │    Login     │
              └───────────┘  │ Request  │    │  Tokens  │   └──────────────┘
                             └──────────┘    └──────────┘
```

### 6. Local Storage Structure

The app stores the following in localStorage:

```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",      // JWT access token
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg...", // Refresh token
  "tokenExpiresAt": "2024-12-31T23:59:59Z",      // Token expiry timestamp
  "user": "{...}"                                 // Stringified user object
}
```

### 7. User Status Handling

The system checks user status and handles different states:

- **active** - User can log in normally ✅
- **locked** - Login prevented, shows error message ❌
- **disabled** - Login prevented, shows error message ❌
- **deleted** - Login prevented, shows error message ❌

### 8. Multi-Factor Authentication (MFA)

If backend returns `mfa_required: true`:

1. Login form shows MFA code input field
2. User enters 6-digit MFA code
3. Code is sent with next login attempt
4. Backend validates and completes login

### 9. Security Features

- **Access tokens** stored in localStorage (short-lived)
- **Refresh tokens** stored in localStorage (long-lived)
- **Automatic token refresh** prevents session timeouts
- **401 handling** ensures expired sessions redirect to login
- **Token cleanup** on logout and auth failure
- **Request queuing** during token refresh prevents race conditions

### 10. Development & Testing

To test the authentication system locally:

1. Start your backend API server
2. Configure `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
3. Run the frontend: `npm run dev`
4. Navigate to `http://localhost:3000`
5. You'll be redirected to `/login`
6. Enter valid credentials from your backend
7. Upon successful login, you'll be redirected to the dashboard

### 11. Error Messages

Common error scenarios and their messages:

| Scenario | Error Message |
|----------|--------------|
| Wrong credentials | "Invalid email or password" |
| Account locked | "Account is locked. Please contact support." |
| Account disabled | "Account is disabled. Please contact support." |
| Session expired | "Your session has expired. Please log in again." |
| MFA required | "MFA code required" |
| Network error | Connection-specific error message |

### 12. API Client Usage

The API client is automatically configured. Just import and use:

```typescript
import apiClient from '@/lib/api/client'

// GET request (token added automatically)
const users = await apiClient.get('/api/v1/users')

// POST request
const result = await apiClient.post('/api/v1/posts', { title: 'Hello' })

// All requests automatically include:
// - Authorization: Bearer <token>
// - Automatic retry on 401 with token refresh
```

### 13. Using Auth Context

Access authentication state and methods:

```typescript
import { useAuth } from '@/lib/auth/auth-context'

function MyComponent() {
  const { user, isAuthenticated, logout, mfaRequired } = useAuth()
  
  return (
    <div>
      {isAuthenticated && (
        <div>
          <p>Welcome, {user?.profile.display_name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  )
}
```

### 14. Troubleshooting

**Problem**: Redirected to login immediately after successful login  
**Solution**: Check that your backend returns `status: 'active'` for the user

**Problem**: 401 errors not triggering token refresh  
**Solution**: Verify backend returns exactly 401 status code for expired tokens

**Problem**: CORS errors  
**Solution**: Ensure backend allows requests from `http://localhost:3000` during development

**Problem**: Token refresh loop  
**Solution**: Check that refresh endpoint doesn't return 401 when refresh token is valid

### 15. Production Deployment

Before deploying to production:

1. Set `NEXT_PUBLIC_BACKEND_URL` to production API URL
2. Ensure backend CORS allows your production domain
3. Use HTTPS for all API communication
4. Consider shorter access token expiry times
5. Implement proper logging and monitoring
6. Test MFA flow if enabled
7. Test all user status scenarios (locked, disabled, etc.)

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

