/**
 * کامپوننت آیکن مشترک — پورت‌شده از مجموعه SVG های inline در MVP اول.
 * جایگزین متن جایگزین موقتی که در StepServices و CardView استفاده شده
 * بود. هر آیکن یک path مستقل SVG دارد؛ رنگ با currentColor کنترل می‌شود
 * تا هرجا استفاده شود، رنگ متن والد را می‌گیرد.
 */

export type IconName =
  | 'phone' | 'mobile' | 'email' | 'website' | 'instagram' | 'telegram'
  | 'whatsapp' | 'linkedin' | 'twitter' | 'facebook' | 'youtube' | 'github'
  | 'bale' | 'eitaa' | 'rubika' | 'soroush'
  | 'address' | 'upload' | 'qr' | 'share' | 'save' | 'checkmark';

const PATHS: Record<IconName, string> = {
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  mobile: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  email: 'M2 4h20v16H2zM22 6l-10 7L2 6',
  website: 'M12 2a10 10 0 1 0 0.001 20.001A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  instagram: 'M2 7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5zM12 8a4 4 0 1 0 0.001 8.001A4 4 0 0 0 12 8zM17.5 6.5a1 1 0 1 0 0.001 2.001A1 1 0 0 0 17.5 6.5z',
  telegram: 'M22 2 2 11l7 2 2 7 3-4 5 4 3-18z',
  whatsapp: 'M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-6a8.5 8.5 0 1 1 16.3-3.5ZM8.5 9.5c0 3 3 6 6 6',
  linkedin: 'M2 9h4v12H2zM4 4a2 2 0 1 0 0.001 4.001A2 2 0 0 0 4 4zM10 9v12M10 13a4 4 0 0 1 8 0v8',
  twitter: 'M22 4s-.7 2-2 3c1.4 8-6.6 13.5-14 11 2.5.1 5-.7 6.7-2.3-2.5-.2-4.5-1.7-5.2-4 .8.15 1.6.1 2.3-.1-2.6-.5-4.4-2.8-4.4-5.3.7.4 1.5.6 2.3.6-2.4-1.6-3.1-4.7-1.6-7.2 2.7 3.3 6.7 5.3 11 5.5-.8-3.6 2.8-6.5 6-4.6.9 0 2.3-.9 2.9-1.6z',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  youtube: 'M2 9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4zM10 9l5 3-5 3z',
  github: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C7.5 2.8 6.4 3.1 6.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 5 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  // پیام‌رسان‌های ایرانی — فعلاً از یک آیکن حبابک پیام عمومی استفاده می‌شود
  // (برند رسمی هرکدام در فاز بعد در صورت نیاز اضافه می‌شود)
  bale: 'M4 4h16v12H8l-4 4z',
  eitaa: 'M4 4h16v12H8l-4 4z',
  rubika: 'M4 4h16v12H8l-4 4z',
  soroush: 'M4 4h16v12H8l-4 4z',
  address: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z',
  share: 'M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M18 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M8.6 13.5l6.8 3.9M15.4 6.6 8.6 10.5',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8',
  checkmark: 'M20 6 9 17l-5-5',
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
