export interface MessageLog {
  id: string;
  notificationId: string;
  userId: string;
  deviceId?: string;
  type: 'push' | 'email' | 'sms' | 'voip';
  status: 'sent' | 'delivered' | 'failed' | 'read';
  provider: string;
  providerId?: string;
  error?: string;
  metadata: {
    templateId?: string;
    campaignId?: string;
    deviceType?: string;
    platform?: string;
  };
  timestamps: {
    sent: Date;
    delivered?: Date;
    read?: Date;
    failed?: Date;
  };
}

export interface MessageLogQuery {
  userId?: string;
  deviceId?: string;
  type?: MessageLog['type'];
  status?: MessageLog['status'];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
} 