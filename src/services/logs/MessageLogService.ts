import { MongoClient } from 'mongodb';
import { MessageLog, MessageLogQuery } from '../../types/logs';
import { config } from '../../config';

export class MessageLogService {
  private mongo: MongoClient;

  constructor() {
    this.mongo = new MongoClient(config.database.mongodb.url);
    this.initMongo();
  }

  private async initMongo() {
    await this.mongo.connect();
  }

  async logMessage(log: Omit<MessageLog, 'id'>): Promise<MessageLog> {
    const result = await this.mongo
      .db()
      .collection('message_logs')
      .insertOne({ ...log, createdAt: new Date() });

    return {
      id: result.insertedId.toString(),
      ...log
    } as MessageLog;
  }

  async queryLogs(query: MessageLogQuery): Promise<{
    logs: MessageLog[];
    total: number;
  }> {
    const filter: any = {};
    if (query.userId) filter.userId = query.userId;
    if (query.deviceId) filter.deviceId = query.deviceId;
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.startDate || query.endDate) {
      filter['timestamps.sent'] = {};
      if (query.startDate) filter['timestamps.sent'].$gte = query.startDate;
      if (query.endDate) filter['timestamps.sent'].$lte = query.endDate;
    }

    const total = await this.mongo
      .db()
      .collection('message_logs')
      .countDocuments(filter);

    const logs = await this.mongo
      .db()
      .collection('message_logs')
      .find(filter)
      .sort({ 'timestamps.sent': -1 })
      .skip(query.offset || 0)
      .limit(query.limit || 50)
      .toArray();

    return {
      logs: logs.map(log => ({
        ...log,
        id: log._id.toString()
      })) as MessageLog[],
      total
    };
  }
} 