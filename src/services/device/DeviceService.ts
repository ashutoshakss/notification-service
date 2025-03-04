import postgres from 'postgres';
import { createClient } from 'redis';
import { Device, DeviceRegistrationDTO } from '../../types/device';
import { config } from '../../config';

export class DeviceService {
  private sql: postgres.Sql;
  private redis: ReturnType<typeof createClient>;

  constructor() {
    this.sql = postgres(config.database.postgres);
    this.redis = createClient({
      url: config.database.redis.url
    });
    // Initialize Redis connection
    this.initRedis();
  }

  private async initRedis() {
    await this.redis.connect();
  }

  async registerDevice(data: DeviceRegistrationDTO): Promise<Device> {
    const [device] = await this.sql<Device[]>`
      INSERT INTO devices (
        user_id, device_token, device_type, platform, 
        model, os_version, app_version, is_online
      ) VALUES (
        ${data.userId}, ${data.deviceToken}, ${data.deviceType}, 
        ${data.platform}, ${data.model}, ${data.osVersion}, 
        ${data.appVersion}, true
      )
      RETURNING *
    `;

    // Cache device token for quick lookup
    await this.redis.set(`device:${device.id}:token`, device.deviceToken);
    
    return device;
  }

  async updateDeviceToken(deviceId: string, newToken: string): Promise<Device> {
    const [device] = await this.sql<Device[]>`
      UPDATE devices 
      SET device_token = ${newToken}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${deviceId}
      RETURNING *
    `;

    if (!device) {
      throw new Error('Device not found');
    }

    await this.redis.set(`device:${deviceId}:token`, newToken);
    return device;
  }

  async updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<Device> {
    const [device] = await this.sql<Device[]>`
      UPDATE devices 
      SET is_online = ${isOnline},
          last_active = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${deviceId}
      RETURNING *
    `;

    if (!device) {
      throw new Error('Device not found');
    }

    return device;
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    const devices = await this.sql<Device[]>`
      SELECT * FROM devices 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    return devices;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    const result = await this.sql`
      DELETE FROM devices 
      WHERE id = ${deviceId}
    `;

    if (result.count === 0) {
      throw new Error('Device not found');
    }

    await this.redis.del(`device:${deviceId}:token`);
  }
} 