import { MongoClient } from 'mongodb';
import { NotificationMetrics, AnalyticsTimeframe } from '../../types/analytics';
import { config } from '../../config';

export class AnalyticsService {
  private mongoClient: MongoClient;

  constructor() {
    this.mongoClient = new MongoClient(config.database.mongodb.url);
    this.initMongo();
  }

  private async initMongo() {
    await this.mongoClient.connect();
  }

  async trackNotificationEvent(data: {
    notificationId: string;
    event: string;
    userId: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const db = this.mongoClient.db('notification_analytics');
    await db.collection('events').insertOne({
      ...data,
      timestamp: new Date()
    });
  }

  async getNotificationMetrics(timeframe: AnalyticsTimeframe): Promise<NotificationMetrics> {
    const db = this.mongoClient.db('notification_analytics');
    const events = db.collection('events');

    const [metrics] = await events.aggregate([
      {
        $match: {
          timestamp: {
            $gte: timeframe.start,
            $lte: timeframe.end
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$event', 'sent'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$event', 'delivered'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$event', 'failed'] }, 1, 0] } },
          opened: { $sum: { $cond: [{ $eq: ['$event', 'opened'] }, 1, 0] } },
          clicked: { $sum: { $cond: [{ $eq: ['$event', 'clicked'] }, 1, 0] } }
        }
      }
    ]).toArray();

    const result = metrics || { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0 };

    return {
      ...result,
      deliveryRate: result.delivered / result.sent || 0,
      openRate: result.opened / result.delivered || 0,
      clickRate: result.clicked / result.opened || 0
    };
  }
} 