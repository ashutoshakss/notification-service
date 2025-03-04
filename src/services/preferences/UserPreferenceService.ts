import postgres from 'postgres';
import { UserPreferences, UpdatePreferencesDTO } from '../../types/preferences';
import { config } from '../../config';

export class UserPreferenceService {
  private sql: postgres.Sql;

  constructor() {
    this.sql = postgres(config.database.postgres);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const [prefs] = await this.sql<UserPreferences[]>`
      SELECT * FROM user_preferences WHERE user_id = ${userId}
    `;
    return prefs;
  }

  async updatePreferences(userId: string, data: UpdatePreferencesDTO): Promise<UserPreferences> {
    const [updated] = await this.sql<UserPreferences[]>`
      UPDATE user_preferences
      SET 
        channels = COALESCE(${data.channels}::jsonb, channels),
        dnd_settings = COALESCE(${data.dndSettings}::jsonb, dnd_settings),
        contact_info = COALESCE(${data.contactInfo}::jsonb, contact_info),
        notification_types = COALESCE(${data.notificationTypes}::jsonb, notification_types),
        language = COALESCE(${data.language}, language),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING *
    `;
    return updated;
  }
} 