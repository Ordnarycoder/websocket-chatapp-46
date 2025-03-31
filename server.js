// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Store chat history in an array (in-memory)
const chatHistory = [];

// Create the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Listen for connection events
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send chat history to the newly connected client
  chatHistory.forEach(message => {
    ws.send(message);
  });

  // When a message is received from a client
  ws.on('message', (data) => {
    console.log(`Received: ${data}`);

    // Save message to history
    chatHistory.push(data);

    // Optionally: Limit history size
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }

    // Broadcast the received message to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
