import { Elysia } from 'elysia';
import { UserPreferenceService } from '../../services/preferences/UserPreferenceService';

export function setupPreferenceRoutes(app: Elysia) {
  const preferenceService = new UserPreferenceService();

  return app.group('/api/v1/preferences', (app) => 
    app
      .get('/:userId', async ({ params: { userId } }) => {
        return await preferenceService.getUserPreferences(userId);
      }, {
        detail: {
          tags: ['Preferences'],
          summary: 'Get user preferences',
          description: 'Get notification preferences for a user'
        }
      })
      
      .put('/:userId', async ({ params: { userId }, body }) => {
        return await preferenceService.updatePreferences(userId, body);
      }, {
        detail: {
          tags: ['Preferences'],
          summary: 'Update preferences',
          description: 'Update user notification preferences'
        }
      })
  );
} 