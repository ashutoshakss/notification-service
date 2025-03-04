export interface UserPreferences {
  id: string;
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    voip: boolean;
  };
  dndSettings: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;
    timezone: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    alternatePhone?: string;
  };
  notificationTypes: {
    marketing: boolean;
    transactional: boolean;
    system: boolean;
    security: boolean;
  };
  language: string;
  updatedAt: Date;
}

export interface UpdatePreferencesDTO {
  channels?: Partial<UserPreferences['channels']>;
  dndSettings?: Partial<UserPreferences['dndSettings']>;
  contactInfo?: Partial<UserPreferences['contactInfo']>;
  notificationTypes?: Partial<UserPreferences['notificationTypes']>;
  language?: string;
} 