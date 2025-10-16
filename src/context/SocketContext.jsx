import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';

// Create socket context
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection when the app loads
  useEffect(() => {
    initializeSocket();
    return () => cleanupSocket();
  }, []);

  // Initialize socket connection
  const initializeSocket = () => {
    try {
      // Clean up any existing connection
      if (socketRef.current) {
        cleanupSocket();
      }

      // Get the socket URL from the environment
      const socketURL = import.meta.env.VITE_APP_API_SOCKET_URL;
      
      if (!socketURL) {
        console.error('WebSocket URL not defined in environment variables');
        setSocketError('WebSocket URL not configured');
        return;
      }
      
      // Create socket instance with configuration
      const socket = io(socketURL, {
        transports: ['websocket', 'polling'], // Try WebSocket first, then fall back to polling
        reconnectionAttempts: 10,  // Try to reconnect 10 times
        reconnectionDelay: 1000,  // Start with 1 second delay
        reconnectionDelayMax: 5000, // Maximum delay between reconnections
        timeout: 20000, // Connection timeout
        autoConnect: true,
      });
      
      socketRef.current = socket;
      
      // Setup event listeners
      setupSocketListeners(socket);
      
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setSocketError(`Initialization error: ${error.message}`);
    }
  };
  
  // Clean up socket connection
  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.off();
      socketRef.current = null;
      setIsConnected(false);
    }
  };
  
  // Setup socket event listeners
  const setupSocketListeners = (socket) => {
    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError(null);
      
      // Get employee info from cookies
      const adminInfo = Cookies.get('adminInfo') ? JSON.parse(Cookies.get('adminInfo')) : null;
      
      // Join employee-specific room if logged in
      if (adminInfo && adminInfo.user && adminInfo.user._id) {
        socket.emit('join-employee-room', adminInfo.user._id);
      }
    });
    
    socket.on('connect_error', (err) => {
      console.error('WebSocket connect error:', err.message);
      setSocketError(`Connection error: ${err.message}`);
      setIsConnected(false);
    });
    
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // The server forcefully disconnected the socket
        socket.connect();
      }
    });
    
    // Reconnection events
    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setSocketError(null);
    });
    
    socket.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err.message);
      setSocketError(`Reconnection error: ${err.message}`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after multiple attempts');
      setSocketError('Reconnection failed');
    });
    
    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setSocketError(`Socket error: ${err.message || 'Unknown error'}`);
    });
  };
  
  // Manually reconnect socket
  const reconnect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    } else if (!socketRef.current) {
      initializeSocket();
    }
  };
  
  // Emit an event to the server
  const emit = (event, data, callback) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data, callback);
    } else {
      console.warn('Cannot emit event, socket not connected:', event);
    }
  };
  
  // Context value with socket state and methods
  const value = {
    socket: socketRef.current,
    isConnected,
    socketError,
    reconnect,
    emit
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 