# Backend Connection Guide

## Quick Setup

Your frontend is configured to connect to: `http://localhost:8080/api/v1`

### Option 1: Use Default Configuration
If your backend runs on port 8080, just start both servers:

```bash
# Terminal 1 - Backend
cd your-backend-folder
npm start  # or your backend start command

# Terminal 2 - Frontend (this project)
npm run dev
```

### Option 2: Change Backend URL

If your backend runs on a different port/URL:

1. Create a `.env` file in the project root:
```bash
copy .env.example .env
```

2. Edit `.env` and set your backend URL:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
# or
VITE_API_BASE_URL=http://localhost:5000/api/v1
# or your deployed backend
VITE_API_BASE_URL=https://your-api.herokuapp.com/api/v1
```

3. Restart your frontend dev server

## Required Backend Endpoints

Your backend MUST implement these endpoints:

### 1. POST /api/v1/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com"
  }
}

Error Response (401 Unauthorized):
{
  "message": "Invalid credentials"
}
```

### 2. POST /api/v1/auth/register
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201 Created):
{
  "message": "Registration successful",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error Response (400 Bad Request):
{
  "message": "Email already exists"
}
```

### 3. GET /api/v1/stations
**Requires Authentication** - Include Bearer token in header

```json
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "data": [
    {
      "id": 1,
      "name": "Tesla Supercharger Station",
      "location": "123 Main St, New York, NY",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "available": true
    },
    {
      "id": 2,
      "name": "ChargePoint Station",
      "location": "456 Park Ave, New York, NY",
      "latitude": 40.7589,
      "longitude": -73.9851,
      "available": false
    }
  ]
}

Error Response (401 Unauthorized):
{
  "message": "Unauthorized - Invalid or missing token"
}
```

## CORS Setup (Backend Configuration)

Your backend needs to allow requests from your frontend. Add CORS configuration:

### Node.js/Express Example:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5174', // Your frontend URL
  credentials: true
}));
```

### Spring Boot Example:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5174")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

### Django Example:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
]
CORS_ALLOW_CREDENTIALS = True
```

## Testing the Connection

### 1. Check if Backend is Running
Open your browser and go to: `http://localhost:8080/api/v1/stations`

You should see either:
- Station data (JSON response)
- 401 Unauthorized (this is OK - means endpoint exists but needs auth)

### 2. Test Login from Frontend
1. Start frontend: `npm run dev`
2. Go to: http://localhost:5174/login
3. Try logging in with test credentials
4. Open Browser DevTools (F12) → Network tab
5. Look for the request to `/api/v1/auth/login`
6. Check the response

### 3. Common Issues

#### Issue: "Network Error" or "Failed to fetch"
**Solution:** Backend is not running or wrong URL
- Check if backend server is running
- Verify the port number in `.env`
- Check terminal for backend errors

#### Issue: "CORS Error"
**Solution:** Backend needs CORS configuration
- Add CORS middleware in your backend
- Allow origin: `http://localhost:5174`

#### Issue: "404 Not Found"
**Solution:** Backend endpoint doesn't exist
- Check your backend routes
- Verify endpoint paths match exactly

#### Issue: "401 Unauthorized" on /stations
**Solution:** This is normal - login first
- Login page will save the token
- Token is automatically added to all requests

## Sample Backend Data

Here's sample station data your backend should return:

```json
[
  {
    "id": 1,
    "name": "Tesla Supercharger - Downtown",
    "location": "123 Main Street, New York, NY 10001",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "available": true
  },
  {
    "id": 2,
    "name": "ChargePoint Station",
    "location": "456 Broadway, New York, NY 10013",
    "latitude": 40.7589,
    "longitude": -73.9851,
    "available": false
  },
  {
    "id": 3,
    "name": "EVgo Fast Charging",
    "location": "789 5th Avenue, New York, NY 10022",
    "latitude": 40.7614,
    "longitude": -73.9776,
    "available": true
  },
  {
    "id": 4,
    "name": "Electrify America",
    "location": "321 Park Avenue, New York, NY 10010",
    "latitude": 40.7450,
    "longitude": -73.9820,
    "available": true
  }
]
```

## Environment Variables Reference

Create `.env` file with these variables:

```env
# Backend API URL (change port if needed)
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Google Maps API Key (optional - for interactive maps)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Note:** After changing `.env`, restart the dev server!

## Need a Mock Backend?

If you don't have a backend yet, I can help you:
1. Create a simple mock API server
2. Set up JSON Server for quick testing
3. Use Mock Service Worker (MSW) for frontend-only development

Let me know if you need any of these options!
