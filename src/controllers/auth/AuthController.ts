import { Elysia } from 'elysia';
import { AuthService } from '../../services/auth/AuthService';
import { LoginDTO, CreateUserDTO } from '../../types/user';

export function setupAuthRoutes(app: Elysia) {
  const authService = new AuthService();

  return app.group('/api/v1/auth', (app) => 
    app
      .post('/login', async ({ body }) => {
        const data = body as LoginDTO;
        return await authService.login(data);
      }, {
        detail: {
          tags: ['Auth'],
          summary: 'User login',
          description: 'Authenticate user and get access token'
        }
      })
      
      .post('/logout', async ({ headers }) => {
        const token = headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token provided');
        await authService.logout(token);
        return { success: true };
      }, {
        detail: {
          tags: ['Auth'],
          summary: 'User logout',
          description: 'Invalidate current session'
        }
      })
      
      .get('/validate', async ({ headers }) => {
        const token = headers.authorization?.split(' ')[1];
        if (!token) throw new Error('No token provided');
        const user = await authService.validateSession(token);
        if (!user) throw new Error('Invalid session');
        return user;
      }, {
        detail: {
          tags: ['Auth'],
          summary: 'Validate session',
          description: 'Validate current session token'
        }
      })
      
      .post('/users', async ({ body }) => {
        const data = body as CreateUserDTO;
        return await authService.createUser(data);
      }, {
        detail: {
          tags: ['Auth'],
          summary: 'Create user',
          description: 'Create a new user account'
        }
      })
  );
} 