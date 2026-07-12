import type { Industry } from '@/types/industry';

export interface IndustryRepository {
  findByName(name: string): Promise<Industry | null>;
  findAll(): Promise<Industry[]>;
  findPending(): Promise<Industry[]>;
  create(name: string): Promise<Industry>;
  approve(id: string): Promise<void>;
}
