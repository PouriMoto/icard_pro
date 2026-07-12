import type { Card } from '@/types/card';

/**
 * سرویس ساخت vCard استاندارد (RFC 6350 نسخه‌ی ساده‌شده، سازگار با اکثر
 * اپلیکیشن‌های مخاطبین). هم برای دانلود فایل .vcf و هم برای QR آفلاین
 * استفاده می‌شود.
 */
export function buildVCardText(card: Card): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];

  lines.push(`FN:${card.name}`);
  lines.push(`N:${card.name};;;;`);

  if (card.jobTitle) {
    lines.push(`TITLE:${card.jobTitle}`);
  }

  const mobile = card.contacts.find((c) => c.type === 'mobile');
  const phone = card.contacts.find((c) => c.type === 'phone');
  const email = card.contacts.find((c) => c.type === 'email');
  const website = card.contacts.find((c) => c.type === 'website');

  if (mobile?.value) lines.push(`TEL;TYPE=CELL:${mobile.value}`);
  if (phone?.value) lines.push(`TEL;TYPE=WORK:${phone.value}`);
  if (email?.value) lines.push(`EMAIL:${email.value}`);
  if (website?.value) lines.push(`URL:${website.value}`);
  if (card.address?.text) lines.push(`ADR;TYPE=WORK:;;${card.address.text};;;;`);

  // لینک کارت آنلاین در فیلد NOTE قرار می‌گیرد تا هرکسی که مخاطب را
  // ذخیره می‌کند، دسترسی سریع به نسخه‌ی زنده‌ی کارت هم داشته باشد
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  if (baseUrl) {
    lines.push(`NOTE:کارت دیجیتال: ${baseUrl}/card/${card.slug}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function vCardFileName(card: Card): string {
  const safe = card.name.trim().replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '-') || 'card';
  return `${safe}.vcf`;
}
