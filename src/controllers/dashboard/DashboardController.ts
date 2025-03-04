import { Elysia } from 'elysia';
import { DashboardService } from '../../services/dashboard/DashboardService';
import { DashboardFilters } from '../../types/dashboard';

export function setupDashboardRoutes(app: Elysia) {
  const dashboardService = new DashboardService();

  return app.group('/api/v1/dashboard', (app) => 
    app
      .get('/stats', async ({ query }) => {
        const filters = query as DashboardFilters;
        return await dashboardService.getDashboardStats(filters);
      }, {
        detail: {
          tags: ['Dashboard'],
          summary: 'Get dashboard stats',
          description: 'Get comprehensive dashboard statistics and metrics'
        }
      })
      
      .get('/active-users', async () => {
        return await dashboardService.getActiveUsers();
      }, {
        detail: {
          tags: ['Dashboard'],
          summary: 'Get active users',
          description: 'Get list of currently active users'
        }
      })
      
      .get('/health', async () => {
        return await dashboardService.getSystemHealth();
      }, {
        detail: {
          tags: ['Dashboard'],
          summary: 'System health',
          description: 'Get system health and performance metrics'
        }
      })
  );
} 