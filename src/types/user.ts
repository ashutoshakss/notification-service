export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator';
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: User['role'];
} 