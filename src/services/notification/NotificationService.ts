import postgres from 'postgres';
import { createClient } from 'redis';
import { Notification, SendNotificationDTO, BatchNotificationDTO } from '../../types/notification';
import { config } from '../../config';

export class NotificationService {
  private sql: postgres.Sql;
  private redis: ReturnType<typeof createClient>;

  constructor() {
    this.sql = postgres(config.database.postgres);
    this.redis = createClient({
      url: config.database.redis.url
    });
    this.initRedis();
  }

  private async initRedis() {
    await this.redis.connect();
  }

  async sendNotification(data: SendNotificationDTO): Promise<Notification> {
    // Create notification record
    const [notification] = await this.sql<Notification[]>`
      INSERT INTO notifications (
        template_id, user_id, device_id, type, 
        status, content
      ) VALUES (
        ${data.templateId}, ${data.userId}, ${data.deviceId}, 
        ${data.type}, 'pending', ${JSON.stringify({})}
      )
      RETURNING *
    `;

    // Add to processing queue
    await this.redis.rPush('notifications:queue', JSON.stringify({
      ...notification,
      data: data.data
    }));

    return notification;
  }

  async sendBatchNotifications(data: BatchNotificationDTO): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const user of data.users) {
      const notification = await this.sendNotification({
        templateId: data.templateId,
        type: data.type,
        userId: user.userId,
        deviceId: user.deviceId,
        data: user.data
      });
      notifications.push(notification);
    }

    return notifications;
  }

  async updateNotificationStatus(
    notificationId: string, 
    status: Notification['status'],
    details?: { error?: string }
  ): Promise<Notification> {
    const statusField = `${status}_at`;
    
    const [notification] = await this.sql<Notification[]>`
      UPDATE notifications 
      SET status = ${status},
          ${this.sql(statusField)} = CURRENT_TIMESTAMP,
          error_details = ${details?.error}
      WHERE id = ${notificationId}
      RETURNING *
    `;

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async getNotificationStatus(notificationId: string): Promise<Notification> {
    const [notification] = await this.sql<Notification[]>`
      SELECT * FROM notifications 
      WHERE id = ${notificationId}
    `;

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }
} 