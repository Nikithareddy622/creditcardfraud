import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server, path: '/ws/live-feed' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] Client connected to live transaction stream.');

    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected to FalconShield AI Live Stream',
      timestamp: new Date()
    }));

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected.');
    });
  });
}

export function broadcastTransactionEvent(event: { type: string; payload: any }) {
  if (!wss) return;

  const data = JSON.stringify({
    ...event,
    timestamp: new Date()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
