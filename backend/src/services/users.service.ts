import { UsersRepository } from '../repositories/users.repository';
import { User } from '../repositories/users.repository';

export class UsersService {
  private usersRepo: UsersRepository;

  constructor() {
    this.usersRepo = new UsersRepository();
  }

  /**
   * Obtener un usuario por ID
   */
  async getUser(userId: string): Promise<User | null> {
    return this.usersRepo.findById(userId);
  }

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    return this.usersRepo.findAll();
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return this.usersRepo.findByRole(role);
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    // Validaciones de negocio
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    if (data.role && !['student', 'teacher', 'admin'].includes(data.role)) {
      throw new Error('Invalid role');
    }

    await this.usersRepo.update(userId, data);
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(userId: string): Promise<void> {
    // Verificar si el usuario existe
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Aquí podrías agregar validaciones adicionales:
    // - Verificar si tiene cursos asignados (si es teacher)
    // - Verificar si tiene inscripciones activas (si es student)
    // etc.

    await this.usersRepo.delete(userId);
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    const [students, teachers, admins] = await Promise.all([
      this.usersRepo.countByRole('student'),
      this.usersRepo.countByRole('teacher'),
      this.usersRepo.countByRole('admin'),
    ]);

    return {
      total: students + teachers + admins,
      students,
      teachers,
      admins,
    };
  }

  /**
   * Validar formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}


