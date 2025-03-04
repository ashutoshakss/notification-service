import { Elysia } from 'elysia';
import { AuthService } from '../services/auth/AuthService';

export function authMiddleware(app: Elysia) {
  const authService = new AuthService();

  return app.derive(async ({ headers }) => {
    const token = headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const user = await authService.validateSession(token);
    if (!user) throw new Error('Invalid session');

    return { user };
  });
} 