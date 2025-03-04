import { Elysia } from 'elysia';
import { NotificationService } from '../../services/notification/NotificationService';
import { SendNotificationDTO, BatchNotificationDTO } from '../../types/notification';

export function setupNotificationRoutes(app: Elysia) {
  const notificationService = new NotificationService();

  return app.group('/api/v1/notifications', (app) => 
    app
      .post('/send', async ({ body }) => {
        const data = body as SendNotificationDTO;
        return await notificationService.sendNotification(data);
      }, {
        detail: {
          tags: ['Notifications'],
          summary: 'Send notification',
          description: 'Send a single notification'
        }
      })
      
      .post('/batch', async ({ body }) => {
        const data = body as BatchNotificationDTO;
        return await notificationService.sendBatchNotifications(data);
      }, {
        detail: {
          tags: ['Notifications'],
          summary: 'Send batch notifications',
          description: 'Send notifications to multiple recipients'
        }
      })
      
      .get('/status/:notificationId', async ({ params: { notificationId } }) => {
        return await notificationService.getNotificationStatus(notificationId);
      }, {
        detail: {
          tags: ['Notifications'],
          summary: 'Get notification status',
          description: 'Check the status of a sent notification'
        }
      })
  );
} 