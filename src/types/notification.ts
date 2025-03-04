export interface Notification {
  id: string;
  templateId: string;
  campaignId?: string;
  userId: string;
  deviceId?: string;
  type: 'push' | 'email' | 'sms' | 'whatsapp' | 'in-app';
  content: {
    title?: string;
    body: string;
    mediaUrl?: string;
    data?: Record<string, any>;
  };
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  errorDetails?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendNotificationDTO {
  userId: string;
  deviceId?: string;
  templateId: string;
  type: Notification['type'];
  data?: Record<string, any>;
}

export interface BatchNotificationDTO {
  templateId: string;
  type: Notification['type'];
  users: Array<{
    userId: string;
    deviceId?: string;
    data?: Record<string, any>;
  }>;
} 