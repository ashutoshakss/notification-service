import { AuthService } from '../services/auth/AuthService';

async function createAdminUser() {
  const authService = new AuthService();
  
  try {
    const admin = await authService.createUser({
      email: 'admin@example.com',
      password: 'admin123', // Change this!
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  process.exit(0);
}

createAdminUser(); 