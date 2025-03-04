import { Elysia } from 'elysia';
import { DeviceService } from '../../services/device/DeviceService';

export function setupDeviceRoutes(app: Elysia) {
  const deviceService = new DeviceService();

  return app.group('/api/v1/devices', (app) => 
    app
      .post('/register', async ({ body }) => {
        return await deviceService.registerDevice(body);
      }, {
        detail: {
          tags: ['Devices'],
          summary: 'Register device',
          description: 'Register a new device for notifications'
        }
      })
      
      .put('/:deviceId/token', async ({ params: { deviceId }, body }) => {
        const { token } = body;
        return await deviceService.updateDeviceToken(deviceId, token);
      }, {
        detail: {
          tags: ['Devices'],
          summary: 'Update device token',
          description: 'Update push notification token for a device'
        }
      })
      
      .put('/:deviceId/status', async ({ params: { deviceId }, body }) => {
        const { status } = body;
        return await deviceService.updateDeviceStatus(deviceId, status);
      }, {
        detail: {
          tags: ['Devices'],
          summary: 'Update device status',
          description: 'Update online/offline status of a device'
        }
      })
      
      .get('/user/:userId', async ({ params: { userId } }) => {
        return await deviceService.getUserDevices(userId);
      }, {
        detail: {
          tags: ['Devices'],
          summary: 'Get user devices',
          description: 'Get all devices registered for a user'
        }
      })
      
      .delete('/:deviceId', async ({ params: { deviceId } }) => {
        return await deviceService.deleteDevice(deviceId);
      }, {
        detail: {
          tags: ['Devices'],
          summary: 'Delete device',
          description: 'Remove a device registration'
        }
      })
  );
} 