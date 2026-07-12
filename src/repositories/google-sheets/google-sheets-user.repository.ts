import { nanoid } from 'nanoid';
import type { UserRepository } from '@/repositories/interfaces/user-repository.interface';
import type { User } from '@/types/card';
import { sheetGet, sheetPost } from './google-sheets-client';

interface RawUserRow {
  id: string;
  phone?: string;
  name?: string;
  created_at: string;
  plan: string;
  phone_verified: boolean | string;
  role?: string;
  telegram_id?: string;
}

function rowToUser(row: RawUserRow): User {
  return {
    id: row.id,
    phone: row.phone || undefined,
    telegramId: row.telegram_id || undefined,
    name: row.name || undefined,
    createdAt: String(row.created_at),
    plan: (row.plan === 'pro' ? 'pro' : 'free') as User['plan'],
    // مقدار boolean از Google Sheets گاهی به‌صورت رشته 'TRUE'/'FALSE' برمی‌گردد
    phoneVerified: row.phone_verified === true || row.phone_verified === 'TRUE',
    role: row.role === 'admin' ? 'admin' : 'user',
  };
}

export class GoogleSheetsUserRepository implements UserRepository {
  async findByPhone(phone: string): Promise<User | null> {
    const rows = await sheetGet<RawUserRow[]>('users', { phone });
    const row = rows[0];
    return row ? rowToUser(row) : null;
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    const rows = await sheetGet<RawUserRow[]>('users', { telegram_id: telegramId });
    const row = rows[0];
    return row ? rowToUser(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await sheetGet<RawUserRow[]>('users', {});
    const row = rows.find((r) => r.id === id);
    return row ? rowToUser(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await sheetGet<RawUserRow[]>('users', {});
    return rows.map(rowToUser);
  }

  async create(phone: string, name?: string): Promise<User> {
    const id = nanoid(12);
    const now = new Date().toISOString();

    await sheetPost('add_user', {
      id,
      phone,
      name: name ?? '',
      created_at: now,
      plan: 'free',
      // در فاز MVP فعلی، طبق تصمیم محصول، بدون OTP — یعنی شماره تایید نشده است
      phone_verified: false,
      role: 'user',
    });

    return { id, phone, name, createdAt: now, plan: 'free', phoneVerified: false, role: 'user' };
  }

  async createFromTelegram(telegramId: string, name?: string): Promise<User> {
    const id = nanoid(12);
    const now = new Date().toISOString();

    await sheetPost('add_user', {
      id,
      telegram_id: telegramId,
      name: name ?? '',
      created_at: now,
      plan: 'free',
      phone_verified: false,
      role: 'user',
    });

    return { id, telegramId, name, createdAt: now, plan: 'free', phoneVerified: false, role: 'user' };
  }
}
