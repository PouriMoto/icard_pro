import { createHash } from 'crypto';

/**
 * سرویس Cloudinary — تولید امضای آپلود سمت سرور.
 *
 * الگوی امنیتی: کلاینت هرگز API Secret را نمی‌بیند. به‌جایش:
 *   ۱. کلاینت از API Route ما (/api/upload) یک "امضا" (signature) می‌خواهد.
 *   ۲. این فایل امضا را با API Secret (که فقط سمت سرور در دسترس است) می‌سازد.
 *   ۳. کلاینت مستقیماً با آن امضا به Cloudinary آپلود می‌کند — بدون آنکه
 *      هرگز Secret واقعی را ببیند.
 *
 * این دقیقاً همان چیزی است که در ارزیابی امنیتی اولیه به‌عنوان یک خطر
 * جدی (قرار گرفتن API Secret در کد فرانت) مشخص شد و اینجا حل می‌شود.
 */

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('تنظیمات Cloudinary کامل نیست (.env.local را بررسی کنید)');
  }

  return { cloudName, apiKey, apiSecret };
}

export interface UploadSignaturePayload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * امضای آپلود را می‌سازد. پارامترهایی که اینجا امضا می‌شوند باید دقیقاً
 * همان پارامترهایی باشند که کلاینت هنگام آپلود به Cloudinary می‌فرستد،
 * وگرنه Cloudinary درخواست را رد می‌کند.
 */
export function createUploadSignature(folder: string): UploadSignaturePayload {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary انتظار دارد پارامترها به ترتیب حروف الفبا و به‌صورت
  // key=value&key=value پشت سر هم با apiSecret ترکیب و SHA-1 شوند.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(paramsToSign).digest('hex');

  return { timestamp, signature, apiKey, cloudName, folder };
}

/**
 * ساخت URL تبدیل‌شده (resize/optimize) از یک publicId موجود در Cloudinary.
 * به‌جای ذخیره‌ی چند نسخه از هر عکس، فقط یک URL با پارامتر متفاوت می‌سازیم.
 */
export function buildTransformedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: 'fill' | 'fit' } = {}
): string {
  const { cloudName } = getCloudinaryConfig();
  const { width = 500, height = 500, crop = 'fill' } = options;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_auto,f_auto/${publicId}`;
}
