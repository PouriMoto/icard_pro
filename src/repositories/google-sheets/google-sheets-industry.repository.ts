import { nanoid } from 'nanoid';
import type { IndustryRepository } from '@/repositories/interfaces/industry-repository.interface';
import type { Industry, IndustryStatus } from '@/types/industry';
import { sheetGet, sheetPost } from './google-sheets-client';

interface RawIndustryRow {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

function rowToIndustry(row: RawIndustryRow): Industry {
  return {
    id: row.id,
    name: row.name,
    status: (row.status === 'approved' ? 'approved' : 'pending') as IndustryStatus,
    createdAt: String(row.created_at),
  };
}

export class GoogleSheetsIndustryRepository implements IndustryRepository {
  async findByName(name: string): Promise<Industry | null> {
    const rows = await sheetGet<RawIndustryRow[]>('industries', { name });
    const row = rows[0];
    return row ? rowToIndustry(row) : null;
  }

  async findAll(): Promise<Industry[]> {
    const rows = await sheetGet<RawIndustryRow[]>('industries', {});
    return rows.map(rowToIndustry);
  }

  async findPending(): Promise<Industry[]> {
    const rows = await sheetGet<RawIndustryRow[]>('industries', { status: 'pending' });
    return rows.map(rowToIndustry);
  }

  async create(name: string): Promise<Industry> {
    const id = nanoid(12);
    const now = new Date().toISOString();

    await sheetPost('add_industry', {
      id,
      name,
      status: 'pending',
      created_at: now,
    });

    return { id, name, status: 'pending', createdAt: now };
  }

  async approve(id: string): Promise<void> {
    await sheetPost('approve_industry', { id });
  }
}
