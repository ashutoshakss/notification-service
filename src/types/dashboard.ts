export interface DashboardStats {
  devices: {
    total: number;
    online: number;
    offline: number;
    byType: {
      ios: number;
      android: number;
      web: number;
    };
  };
  users: {
    total: number;
    activeToday: number;
    byRole: {
      admin: number;
      manager: number;
      operator: number;
    };
  };
  notifications: {
    total: number;
    sent24h: number;
    failed24h: number;
    byType: {
      push: number;
      email: number;
      sms: number;
      voip: number;
    };
  };
  templates: {
    total: number;
    active: number;
  };
  campaigns: {
    total: number;
    active: number;
    scheduled: number;
    completed: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'notification' | 'campaign' | 'user_login' | 'device_status';
    description: string;
    timestamp: Date;
  }>;
}

export interface DashboardFilters {
  timeframe?: 'today' | 'week' | 'month';
  deviceType?: 'ios' | 'android' | 'web';
  notificationType?: 'push' | 'email' | 'sms' | 'voip';
} 