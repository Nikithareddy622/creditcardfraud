import React, { createContext, useContext, useEffect, useState } from 'react';

interface SocketContextType {
  isConnected: boolean;
  latestEvent: any;
  liveEvents: any[];
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  latestEvent: null,
  liveEvents: []
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:5000/ws/live-feed`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type !== 'CONNECTED') {
            setLatestEvent(parsed);
            setLiveEvents(prev => [parsed, ...prev.slice(0, 49)]); // Keep last 50 events
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.warn('WebSocket connection attempt failed:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, latestEvent, liveEvents }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
