export interface Device {
  id: string;
  userId: string;
  type: 'ios' | 'android' | 'web' | 'desktop';
  token?: string;
  voipToken?: string;
  status: 'online' | 'offline' | 'disabled';
  metadata: {
    manufacturer?: string;
    model?: string;
    osVersion?: string;
    appVersion?: string;
    lastIp?: string;
    timezone?: string;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceRegistrationDTO {
  userId: string;
  type: Device['type'];
  token?: string;
  voipToken?: string;
  metadata?: Device['metadata'];
}

export interface UpdateDeviceDTO {
  token?: string;
  voipToken?: string;
  status?: Device['status'];
  metadata?: Partial<Device['metadata']>;
} 