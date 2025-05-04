# LiveCloud - LiveKit Video Conferencing Backend

A Node.js backend server for video conferencing using LiveKit.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```env
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_SERVER_URL=your_livekit_server_url
PORT=3000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns the server health status.

### Create Meeting Room
```
POST /create-meet
Content-Type: application/json

{
    "roomName": "my-room-name" // optional, will generate one if not provided
}
```

### Join Meeting
```
POST /join-meet
Content-Type: application/json

{
    "roomName": "my-room-name",
    "userIdentity": "user123"
}
```

## Environment Variables

- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret
- `LIVEKIT_SERVER_URL`: Your LiveKit server URL (e.g., wss://your-livekit-server.com)
- `PORT`: Server port (default: 3000)

## Features

- Create video conference rooms
- Generate participant tokens with permissions
- CORS enabled
- Error handling
- Health check endpoint
- Room configuration (10 minutes timeout, 50 participants max)
- Participant metadata support 