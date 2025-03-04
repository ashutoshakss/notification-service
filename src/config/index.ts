import { env } from './env';

export const config = {
  server: env.server,
  database: env.database,
  providers: env.providers,
  webrtc: env.webrtc
}; 