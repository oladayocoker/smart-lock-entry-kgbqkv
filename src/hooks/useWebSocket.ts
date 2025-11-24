
import { useEffect, useRef, useState, useCallback } from 'react';
import { LockState } from '../types';

interface UseWebSocketProps {
  url: string;
  enabled: boolean;
  onLockStateChange?: (state: LockState) => void;
}

export const useWebSocket = ({ url, enabled, onLockStateChange }: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lockState, setLockState] = useState<LockState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || !url) {
      console.log('WebSocket not enabled or URL not provided');
      return;
    }

    try {
      const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://');
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(`${wsUrl}/ws/lock`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'lock_state') {
            const newState: LockState = {
              isLocked: data.isLocked,
              timestamp: data.timestamp,
            };
            setLockState(newState);
            onLockStateChange?.(newState);
          }
        } catch (error) {
          console.log('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.log('Error creating WebSocket:', error);
    }
  }, [url, enabled, onLockStateChange]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lockState,
    reconnect: connect,
  };
};
