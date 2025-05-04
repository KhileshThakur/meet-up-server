require('dotenv').config();
const express = require('express');
const { RoomServiceClient, AccessToken } = require('livekit-server-sdk');

// Environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_SERVER_URL = process.env.LIVEKIT_SERVER_URL;
const PORT = process.env.PORT;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;


// Initialize the LiveKit server SDK
const roomService = new RoomServiceClient(LIVEKIT_SERVER_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

// Create a room
async function createRoom(roomName) {
  try {
    console.log('Creating room:', roomName);
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 50,
    });
    console.log('Room Created Successfully:', room.name);
    return room;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Generate a token for a participant
function generateToken(roomName, userIdentity) {
  try {
    console.log('Generating token for:', userIdentity, 'in room:', roomName);
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userIdentity,
      name: userIdentity,
      metadata: JSON.stringify({ joinedAt: new Date().toISOString() }),
    });
    
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return token.toJwt();
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

// Express setup
const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // Log incoming requests
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'healthy' });
});

// API to create a new meeting room
// API to create a new meeting room
app.post('/create-meet', async (req, res) => {
  try {
    console.log('Create meeting request received:', req.body);
    const roomName = req.body.roomName || `room-${Date.now()}`;
    const room = await createRoom(roomName);

    const joinUrl = `${FRONTEND_BASE_URL}/join/${room.name}`;

    const response = { 
      success: true,
      roomName: room.name, 
      roomId: room.sid,
      joinUrl,
      message: 'Room created successfully' 
    };

    console.log('Create meeting response:', response);
    res.json(response);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create room',
      message: error.message 
    });
  }
});


// API to join a meeting with a token
app.post('/join-meet', (req, res) => {
  try {
    console.log('Join meeting request received:', req.body);
    const { roomName, userIdentity } = req.body;
    
    if (!roomName || !userIdentity) {
      console.log('Missing required parameters');
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Both roomName and userIdentity are required'
      });
    }

    const token = generateToken(roomName, userIdentity);
    const response = { 
      success: true,
      token,
      roomName,
      userIdentity,
      serverUrl: LIVEKIT_SERVER_URL
    };
    console.log('Join meeting response:', { ...response, token: '***' });
    res.json(response);
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate token',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend is running at ${PORT}`);
}); 