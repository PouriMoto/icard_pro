import type { User } from '@/types/card';

export interface UserRepository {
  findByPhone(phone: string): Promise<User | null>;
  findByTelegramId(telegramId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>; // برای Admin Dashboard
  create(phone: string, name?: string): Promise<User>;
  createFromTelegram(telegramId: string, name?: string): Promise<User>;
}
