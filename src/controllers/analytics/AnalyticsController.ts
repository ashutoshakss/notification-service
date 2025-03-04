import { Elysia } from 'elysia';
import { AnalyticsService } from '../../services/analytics/AnalyticsService';
import { AnalyticsTimeframe } from '../../types/analytics';

export function setupAnalyticsRoutes(app: Elysia) {
  const analyticsService = new AnalyticsService();

  return app.group('/api/v1/analytics', (app) => 
    app
      .post('/track', async ({ body }) => {
        await analyticsService.trackNotificationEvent(body);
        return { success: true };
      }, {
        detail: {
          tags: ['Analytics'],
          summary: 'Track event',
          description: 'Track a notification event'
        }
      })
      
      .post('/metrics', async ({ body }) => {
        const timeframe = body as AnalyticsTimeframe;
        return await analyticsService.getNotificationMetrics(timeframe);
      }, {
        detail: {
          tags: ['Analytics'],
          summary: 'Get metrics',
          description: 'Get notification metrics for a timeframe'
        }
      })
  );
} 