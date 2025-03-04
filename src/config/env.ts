import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

const environment = process.env.NODE_ENV || 'development';
const envFile = `.env.${environment}`;

// Load environment variables from the appropriate .env file
dotenvConfig({ path: join(process.cwd(), envFile) });

export const env = {
  environment,
  isProduction: environment === 'production',
  isDevelopment: environment === 'development',
  isTest: environment === 'test',
  
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost'
  },

  database: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'notification_service',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true',
      max: 10
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    mongodb: {
      url: process.env.MONGO_URL || 'mongodb://localhost:27017/notification_service'
    }
  },

  providers: {
    fcm: {
      serviceAccountKey: process.env.FCM_SERVICE_ACCOUNT_KEY
    },
    apns: {
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID,
      privateKey: process.env.APNS_PRIVATE_KEY,
      bundleId: process.env.APNS_BUNDLE_ID
    },
    email: {
      sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'notifications@example.com',
        fromName: process.env.SENDGRID_FROM_NAME || 'Notification Service'
      },
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    }
  },

  webrtc: {
    port: parseInt(process.env.WEBRTC_PORT || '8080'),
    serverUrl: process.env.WEBRTC_SERVER_URL || 'ws://localhost:8080'
  }
}; 