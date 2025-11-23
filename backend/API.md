# Formiqa Backend API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. Signup
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "presenter"
  }
}
```

---

### 2. Login
**POST** `/api/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "presenter"
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "presenter"
  }
}
```

---

## Session Endpoints

### 1. Create Session
**POST** `/api/sessions`

Create a new live session (Presenter only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My First Live Session"
}
```

**Response:** `201 Created`
```json
{
  "session": {
    "id": "uuid",
    "code": "834192",
    "isActive": true,
    "title": "My First Live Session",
    "createdAt": "2025-11-22T..."
  }
}
```

---

### 2. Get Session by Code
**GET** `/api/sessions/:code`

Get session details by join code (public).

**Parameters:**
- `code` - 6-digit session code

**Response:** `200 OK`
```json
{
  "session": {
    "id": "uuid",
    "code": "834192",
    "title": "My First Live Session",
    "isActive": true,
    "createdAt": "2025-11-22T..."
  }
}
```

---

### 3. End Session
**POST** `/api/sessions/:id/end`

End an active session (Presenter only).

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Session UUID

**Response:** `200 OK`
```json
{
  "session": {
    "id": "uuid",
    "code": "834192",
    "isActive": false,
    "endedAt": "2025-11-22T..."
  }
}
```

---

## Feedback Endpoints

### 1. Submit Feedback
**POST** `/api/feedback`

Submit feedback for a session.

**Request Body:**
```json
{
  "sessionId": "uuid",
  "type": "thumbs_up",
  "emoji": "👍",
  "message": "Great presentation!"
}
```

**Response:** `201 Created`
```json
{
  "feedback": {
    "id": "uuid",
    "sessionId": "uuid",
    "type": "thumbs_up",
    "emoji": "👍",
    "message": "Great presentation!",
    "sentimentScore": 3,
    "createdAt": "2025-11-22T..."
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4000');
```

### Client → Server Events

#### 1. join-session
Join a live session room.

**Emit:**
```javascript
socket.emit('join-session', { sessionCode: '834192' });
```

**Response:**
```javascript
socket.on('session-joined', (data) => {
  // data: { session: { id, code, title } }
});

socket.on('error', (data) => {
  // data: { message: 'Invalid session code' }
});
```

---

#### 2. submit-feedback
Submit feedback via WebSocket.

**Emit:**
```javascript
socket.emit('submit-feedback', {
  type: 'thumbs_up',
  emoji: '👍',
  message: 'Great session!'
});
```

**Response:**
```javascript
socket.on('feedback-submitted', (data) => {
  // data: { success: true, feedbackId: 'uuid' }
});
```

---

### Server → Client Events

#### 1. presence-update
Real-time participant count update.

```javascript
socket.on('presence-update', (data) => {
  // data: { onlineCount: 42 }
});
```

---

#### 2. new-feedback
Real-time feedback notification (broadcasted to all in session).

```javascript
socket.on('new-feedback', (data) => {
  // data: { feedback: { id, type, emoji, message, sentimentScore, createdAt } }
});
```

---

## Error Responses

All endpoints follow standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Format:**
```json
{
  "error": "Error message description"
}
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
PORT=4000
SALT_ROUNDS=10
```

---

## Running the Server

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Sync database schema
npx prisma db push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
