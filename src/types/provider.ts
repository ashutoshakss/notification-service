export type NotificationProvider = 'fcm' | 'apns' | 'email' | 'sms' | 'whatsapp';

export interface ProviderConfig {
  fcm?: {
    serviceAccountKey: string;
  };
  apns?: {
    keyId: string;
    teamId: string;
    privateKey: string;
    bundleId: string;
  };
  email?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sms?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
}

export interface ProviderResponse {
  success: boolean;
  providerId?: string;
  error?: string;
} 