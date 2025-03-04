import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000')
  },
  database: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'notification_service',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
      ssl: process.env.DB_SSL === 'true'
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    mongodb: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017/notification_service'
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
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    sms: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER
    }
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  }
};

// Validate critical environment variables
const requiredEnvVars = [
  'SENDGRID_API_KEY',
  // Add other required variables as needed
];

// Validate all required environment variables
requiredEnvVars.forEach(requireEnv); 