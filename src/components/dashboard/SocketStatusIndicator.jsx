import React from 'react';
// import { useSocket } from '@/context/SocketContext';

const SocketStatusIndicator = ({ showControls = false }) => {
  const { isConnected, socketError, reconnect } = useSocket();

  return (
    <div className="flex items-center space-x-3">
      {/* Connection status indicator */}
      <div className="flex items-center space-x-2">
        <span className="relative flex h-3 w-3">
          <span 
            className={`
              ${isConnected 
                ? 'animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75' 
                : 'animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75'
              }
            `}
          />
          <span 
            className={`
              relative inline-flex rounded-full h-3 w-3 
              ${isConnected ? 'bg-green-500' : 'bg-orange-500'}
            `}
          />
        </span>
        <span 
          className={`
            text-xs font-medium
            ${isConnected 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-orange-600 dark:text-orange-400'
            }
          `}
        >
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>
      
      {/* Error message if any */}
      {socketError && (
        <div className="text-xs text-red-500 dark:text-red-400">
          {socketError}
        </div>
      )}
      
      {/* Reconnect button */}
      {showControls && (
        <button 
          onClick={reconnect} 
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Reconnect
        </button>
      )}
    </div>
  );
};

export default SocketStatusIndicator; 