import express from 'express';
import cors from 'cors';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerDocument } from './swaggerSpec';
import { initWebSocketServer } from './services/socketService';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import fraudRoutes from './routes/fraudRoutes';
import customerRoutes from './routes/customerRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// API Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FalconShield AI Backend API',
    timestamp: new Date()
  });
});

const server = http.createServer(app);

// Initialize WebSocket server for live updates
initWebSocketServer(server);

server.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`FalconShield AI Backend running on http://localhost:${config.port}`);
  console.log(`Swagger Docs available at http://localhost:${config.port}/api-docs`);
  console.log(`WebSocket Live Stream at ws://localhost:${config.port}/ws/live-feed`);
  console.log(`====================================================`);
});

export default app;
