import { BaseRepository } from './base.repository';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  photo_url?: string;
  created_at: string;
}

export class UsersRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return this.findBy('role', role);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findBy('email', email);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Contar usuarios por rol
   */
  async countByRole(role: 'student' | 'teacher' | 'admin'): Promise<number> {
    return this.countBy('role', role);
  }
}


