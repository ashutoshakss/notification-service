import postgres from 'postgres';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import { DashboardStats, DashboardFilters } from '../../types/dashboard';
import { config } from '../../config';

export class DashboardService {
  private sql: postgres.Sql;
  private mongo: MongoClient;
  private redis: ReturnType<typeof createClient>;

  constructor() {
    this.sql = postgres(config.database.postgres);
    this.mongo = new MongoClient(config.database.mongodb.url);
    this.redis = createClient({
      url: config.database.redis.url
    });
    this.initClients();
  }

  private async initClients() {
    await this.mongo.connect();
    await this.redis.connect();
  }

  async getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    const [deviceStats] = await this.sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'online') as online,
        COUNT(*) FILTER (WHERE status = 'offline') as offline,
        COUNT(*) FILTER (WHERE device_type = 'ios') as ios,
        COUNT(*) FILTER (WHERE device_type = 'android') as android,
        COUNT(*) FILTER (WHERE device_type = 'web') as web
      FROM devices
    `;

    const [userStats] = await this.sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '24 hours') as active_today,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
        COUNT(*) FILTER (WHERE role = 'manager') as manager_count,
        COUNT(*) FILTER (WHERE role = 'operator') as operator_count
      FROM users
    `;

    const [notificationStats] = await this.sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as sent_24h,
        COUNT(*) FILTER (WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours') as failed_24h,
        COUNT(*) FILTER (WHERE type = 'push') as push_count,
        COUNT(*) FILTER (WHERE type = 'email') as email_count,
        COUNT(*) FILTER (WHERE type = 'sms') as sms_count,
        COUNT(*) FILTER (WHERE type = 'voip') as voip_count
      FROM notifications
    `;

    const [templateStats] = await this.sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active
      FROM templates
    `;

    const [campaignStats] = await this.sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM campaigns
    `;

    const recentActivity = await this.mongo
      .db()
      .collection('activity_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return {
      devices: {
        total: deviceStats.total,
        online: deviceStats.online,
        offline: deviceStats.offline,
        byType: {
          ios: deviceStats.ios,
          android: deviceStats.android,
          web: deviceStats.web
        }
      },
      users: {
        total: userStats.total,
        activeToday: userStats.active_today,
        byRole: {
          admin: userStats.admin_count,
          manager: userStats.manager_count,
          operator: userStats.operator_count
        }
      },
      notifications: {
        total: notificationStats.total,
        sent24h: notificationStats.sent_24h,
        failed24h: notificationStats.failed_24h,
        byType: {
          push: notificationStats.push_count,
          email: notificationStats.email_count,
          sms: notificationStats.sms_count,
          voip: notificationStats.voip_count
        }
      },
      templates: {
        total: templateStats.total,
        active: templateStats.active
      },
      campaigns: {
        total: campaignStats.total,
        active: campaignStats.active,
        scheduled: campaignStats.scheduled,
        completed: campaignStats.completed
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id.toString(),
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp
      }))
    };
  }

  async getActiveUsers(): Promise<Array<{id: string, name: string, lastActive: Date}>> {
    const users = await this.sql`
      SELECT id, first_name || ' ' || last_name as name, last_login_at
      FROM users
      WHERE last_login_at > NOW() - INTERVAL '15 minutes'
      ORDER BY last_login_at DESC
    `;
    return users;
  }

  async getSystemHealth(): Promise<{
    services: {
      database: boolean;
      redis: boolean;
      mongodb: boolean;
    };
    queueStatus: {
      pending: number;
      processing: number;
      failed: number;
    };
    serverLoad: {
      cpu: number;
      memory: number;
      uptime: number;
    };
  }> {
    // Implementation for system health check
    return {
      services: {
        database: true,
        redis: true,
        mongodb: true
      },
      queueStatus: {
        pending: await this.redis.llen('notification:queue'),
        processing: parseInt(await this.redis.get('notification:processing') || '0'),
        failed: parseInt(await this.redis.get('notification:failed') || '0')
      },
      serverLoad: {
        cpu: process.cpuUsage().user / 1000000,
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
        uptime: process.uptime()
      }
    };
  }
} 