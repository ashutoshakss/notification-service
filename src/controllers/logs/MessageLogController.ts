import { Elysia } from 'elysia';
import { MessageLogService } from '../../services/logs/MessageLogService';

export function setupMessageLogRoutes(app: Elysia) {
  const logService = new MessageLogService();

  return app.group('/api/v1/logs', (app) => 
    app
      .get('/messages', async ({ query }) => {
        return await logService.queryLogs(query);
      }, {
        detail: {
          tags: ['Logs'],
          summary: 'Query message logs',
          description: 'Search and filter message delivery logs'
        }
      })
  );
} 