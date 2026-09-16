import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'falconshield_enterprise_super_secret_jwt_key_2026',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db'
};
