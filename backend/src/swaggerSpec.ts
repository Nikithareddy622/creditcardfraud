export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FalconShield AI - Credit Card Fraud Detection API',
    version: '1.0.0',
    description: 'Enterprise AI-powered Credit Card Fraud Monitoring & Risk Management Platform REST API documentation.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'User Login',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'analyst@falconshield.ai' },
                  password: { type: 'string', example: 'password123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Successful login returning JWT' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/api/transactions': {
      get: {
        summary: 'List Transactions',
        tags: ['Transactions'],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'riskCategory', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Paginated list of transactions' } }
      },
      post: {
        summary: 'Process New Transaction',
        tags: ['Transactions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string', example: 'c-101' },
                  amount: { type: 'number', example: 1450.00 },
                  merchant: { type: 'string', example: 'Luxuria Store' },
                  merchantCategory: { type: 'string', example: 'electronics' },
                  city: { type: 'string', example: 'New York' },
                  country: { type: 'string', example: 'USA' },
                  deviceType: { type: 'string', example: 'mobile_app' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Transaction processed and scored' } }
      }
    },
    '/api/fraud/predict': {
      post: {
        summary: 'Real-time ML Fraud Risk Prediction',
        tags: ['Fraud Detection'],
        responses: { 200: { description: 'ML Prediction result with confidence and recommended action' } }
      }
    },
    '/api/fraud/alerts': {
      get: {
        summary: 'Get Fraud Alerts Queue',
        tags: ['Fraud Detection'],
        responses: { 200: { description: 'Alert queue' } }
      }
    },
    '/api/admin/rules': {
      get: {
        summary: 'List Automated Fraud Rules',
        tags: ['Admin'],
        responses: { 200: { description: 'Configured rules' } }
      }
    }
  }
};
