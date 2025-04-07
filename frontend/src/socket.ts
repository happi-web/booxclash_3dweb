import { io } from 'socket.io-client';

// Update the connection with credentials set to true
const socket = io('http://localhost:5000', {
  withCredentials: true,  // Send cookies or headers for authentication
});

export default socket;
