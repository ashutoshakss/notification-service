import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { config } from './config';

// Middlewares
import { authMiddleware } from './middleware/auth';

// Setup Routes
import { setupDeviceRoutes } from './controllers/device/DeviceController';
import { setupTemplateRoutes } from './controllers/template/TemplateController';
import { setupCampaignRoutes } from './controllers/campaign/CampaignController';
import { setupNotificationRoutes } from './controllers/notification/NotificationController';
import { setupAnalyticsRoutes } from './controllers/analytics/AnalyticsController';
import { setupAuthRoutes } from './controllers/auth/AuthController';
import { setupDashboardRoutes } from './controllers/dashboard/DashboardController';
import { setupPreferenceRoutes } from './controllers/preferences/UserPreferenceController';
import { setupMessageLogRoutes } from './controllers/logs/MessageLogController';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Notification Service API',
        version: '1.0.0',
        description: 'Unified Notification Service API Documentation'
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Devices', description: 'Device management endpoints' },
        { name: 'Templates', description: 'Template management endpoints' },
        { name: 'Campaigns', description: 'Campaign management endpoints' },
        { name: 'Notifications', description: 'Notification dispatch endpoints' },
        { name: 'Analytics', description: 'Analytics and reporting endpoints' },
        { name: 'Dashboard', description: 'Dashboard statistics endpoints' },
        { name: 'Preferences', description: 'User preferences endpoints' },
        { name: 'Logs', description: 'Message logs endpoints' }
      ],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }));

// Public routes (no auth required)
setupAuthRoutes(app);

// Protected routes (require authentication)
const protectedRoutes = new Elysia()
  .use(authMiddleware)
  .group('', app => {
    setupDeviceRoutes(app);
    setupTemplateRoutes(app);
    setupCampaignRoutes(app);
    setupNotificationRoutes(app);
    setupAnalyticsRoutes(app);
    setupDashboardRoutes(app);
    setupPreferenceRoutes(app);
    setupMessageLogRoutes(app);
    return app;
  });

app.use(protectedRoutes);

// Start server
app.listen(config.server.port, () => {
  console.log(`🚀 Server running at http://${config.server.host}:${config.server.port}`);
});