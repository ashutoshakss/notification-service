import { NotificationService } from './NotificationService';
import { NotificationProviderFactory } from '../provider/NotificationProviderFactory';
import { Notification } from '../../types/notification';
import { TemplateService } from '../template/TemplateService';
import { DeviceService } from '../device/DeviceService';

export class NotificationDispatcher {
  private notificationService: NotificationService;
  private templateService: TemplateService;
  private deviceService: DeviceService;
  private providerFactory: NotificationProviderFactory;

  constructor() {
    this.notificationService = new NotificationService();
    this.templateService = new TemplateService();
    this.deviceService = new DeviceService();
    this.providerFactory = NotificationProviderFactory.getInstance();
  }

  async dispatch(notification: Notification): Promise<void> {
    try {
      const template = await this.templateService.getTemplateById(notification.templateId);
      
      let response;
      switch (notification.type) {
        case 'push': {
          const device = await this.deviceService.getDeviceById(notification.deviceId);
          const provider = device.deviceType === 'ios' ? 'apns' : 'fcm';
          response = await this.providerFactory.sendPushNotification(
            provider,
            device.deviceToken,
            template.content.title,
            template.content.body,
            notification.content.data
          );
          break;
        }
        
        case 'email': {
          // Check if the template has a SendGrid template ID
          const sendgridTemplateId = template.content.sendgridTemplateId;
          
          if (sendgridTemplateId) {
            // Use SendGrid template
            response = await this.providerFactory.sendEmail(
              notification.userId, // Assuming userId is email in this case
              template.content.title || 'Notification',
              template.content.body || '',
              template.content.html,
              sendgridTemplateId,
              notification.content.data
            );
          } else {
            // Use regular email
            response = await this.providerFactory.sendEmail(
              notification.userId,
              template.content.title,
              template.content.body,
              template.content.html
            );
          }
          break;
        }
        
        case 'sms': {
          response = await this.providerFactory.sendSMS(
            notification.userId, // Assuming userId is phone number in this case
            template.content.body
          );
          break;
        }
      }

      if (response.success) {
        await this.notificationService.updateNotificationStatus(
          notification.id,
          'sent',
          { providerId: response.providerId }
        );
      } else {
        await this.notificationService.updateNotificationStatus(
          notification.id,
          'failed',
          { error: response.error }
        );
      }
    } catch (error) {
      await this.notificationService.updateNotificationStatus(
        notification.id,
        'failed',
        { error: error.message }
      );
    }
  }
} 