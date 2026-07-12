'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Industry } from '@/types/industry';
import { apiClient } from '@/lib/api-client';

interface PendingIndustriesListProps {
  industries: Industry[];
}

export default function PendingIndustriesList({ industries }: PendingIndustriesListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoadingId(id);
    try {
      await apiClient.post(`/api/admin/industries/${id}/approve`);
      router.refresh();
    } catch {
      // خطا در همین نما نادیده گرفته می‌شود؛ کاربر می‌تواند دوباره تلاش کند
    } finally {
      setLoadingId(null);
    }
  }

  if (industries.length === 0) {
    return <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>موردی برای بازبینی وجود ندارد</p>;
  }

  return (
    <div>
      {industries.map((industry) => (
        <div
          key={industry.id}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F1F5' }}
        >
          <span style={{ fontSize: 13 }}>{industry.name}</span>
          <button
            onClick={() => handleApprove(industry.id)}
            disabled={loadingId === industry.id}
            style={{ fontSize: 12, fontWeight: 700, color: '#5B5FEF', background: 'none', border: 'none', padding: '4px 8px' }}
          >
            {loadingId === industry.id ? 'در حال تایید...' : 'تایید'}
          </button>
        </div>
      ))}
    </div>
  );
}
