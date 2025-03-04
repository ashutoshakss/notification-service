import { Database } from 'bun:sqlite';
import { createClient } from 'redis';
import { MongoClient } from 'mongodb';
import postgres from 'postgres';
import { config } from '../config';

async function setupDatabase() {
  const sql = postgres(config.database.postgres);

  await sql`
    CREATE TABLE IF NOT EXISTS devices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      type TEXT NOT NULL,
      token TEXT,
      voip_token TEXT,
      status TEXT NOT NULL DEFAULT 'offline',
      metadata JSONB NOT NULL DEFAULT '{}',
      last_active TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      content JSONB NOT NULL,
      variables TEXT[] DEFAULT '{}',
      status TEXT NOT NULL,
      locale TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS template_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id UUID REFERENCES templates(id),
      version SERIAL,
      content JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      template_id UUID REFERENCES templates(id),
      segment JSONB NOT NULL,
      schedule JSONB NOT NULL,
      status TEXT NOT NULL,
      metrics JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id UUID REFERENCES templates(id),
      campaign_id UUID REFERENCES campaigns(id),
      user_id TEXT NOT NULL,
      device_id UUID REFERENCES devices(id),
      type TEXT NOT NULL,
      content JSONB NOT NULL,
      status TEXT NOT NULL,
      error_details TEXT,
      sent_at TIMESTAMP WITH TIME ZONE,
      delivered_at TIMESTAMP WITH TIME ZONE,
      opened_at TIMESTAMP WITH TIME ZONE,
      clicked_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      last_login_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS voip_calls (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      device_id UUID REFERENCES devices(id),
      status TEXT NOT NULL,
      webrtc_data JSONB NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      duration INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      channels JSONB NOT NULL DEFAULT '{
        "push": true,
        "email": true,
        "sms": true,
        "voip": true
      }',
      dnd_settings JSONB NOT NULL DEFAULT '{
        "enabled": false,
        "startTime": "22:00",
        "endTime": "07:00",
        "timezone": "UTC"
      }',
      contact_info JSONB NOT NULL DEFAULT '{}',
      notification_types JSONB NOT NULL DEFAULT '{
        "marketing": true,
        "transactional": true,
        "system": true,
        "security": true
      }',
      language TEXT NOT NULL DEFAULT 'en',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('Database setup completed');
  process.exit(0);
}

setupDatabase().catch(console.error); 