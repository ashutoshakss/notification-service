export interface NotificationMetrics {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  interval?: 'hour' | 'day' | 'week' | 'month';
} 