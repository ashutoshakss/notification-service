import postgres from 'postgres';
import { createClient } from 'redis';
import { User, UserSession, LoginDTO, CreateUserDTO } from '../../types/user';
import { config } from '../../config';
import { randomUUID } from 'crypto';

export class AuthService {
  private sql: postgres.Sql;
  private redis: ReturnType<typeof createClient>;

  constructor() {
    this.sql = postgres(config.database.postgres);
    this.redis = createClient({
      url: config.database.redis.url
    });
    this.initRedis();
  }

  private async initRedis() {
    await this.redis.connect();
  }

  private async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: "bcrypt",
      cost: 10 // You can adjust the cost factor
    });
  }

  private async verifyPassword(hash: string, password: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }

  async createUser(data: CreateUserDTO): Promise<Omit<User, 'password'>> {
    const hashedPassword = await this.hashPassword(data.password);

    const [user] = await this.sql<User[]>`
      INSERT INTO users (
        email, password, first_name, last_name, 
        role, status
      ) VALUES (
        ${data.email}, ${hashedPassword}, ${data.firstName},
        ${data.lastName}, ${data.role}, 'active'
      )
      RETURNING id, email, first_name, last_name, role, status, created_at, updated_at
    `;

    return user;
  }

  async login(data: LoginDTO): Promise<{ user: Omit<User, 'password'>, token: string }> {
    const [user] = await this.sql<User[]>`
      SELECT * FROM users 
      WHERE email = ${data.email} AND status = 'active'
    `;

    if (!user || !(await this.verifyPassword(user.password, data.password))) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.sql`
      INSERT INTO user_sessions (
        user_id, token, expires_at
      ) VALUES (
        ${user.id}, ${token}, ${expiresAt}
      )
    `;

    // Update last login
    await this.sql`
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    // Cache session
    await this.redis.set(`session:${token}`, user.id, {
      EX: 24 * 60 * 60 // 24 hours
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async validateSession(token: string): Promise<Omit<User, 'password'> | null> {
    const userId = await this.redis.get(`session:${token}`);
    if (!userId) return null;

    const [user] = await this.sql<User[]>`
      SELECT id, email, first_name, last_name, role, status, 
             last_login_at, created_at, updated_at
      FROM users 
      WHERE id = ${userId} AND status = 'active'
    `;

    return user || null;
  }

  async logout(token: string): Promise<void> {
    await this.sql`
      DELETE FROM user_sessions 
      WHERE token = ${token}
    `;
    await this.redis.del(`session:${token}`);
  }
} 