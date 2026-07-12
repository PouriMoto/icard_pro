import { GoogleSheetsCardRepository } from './google-sheets/google-sheets-card.repository';
import { GoogleSheetsUserRepository } from './google-sheets/google-sheets-user.repository';
import { GoogleSheetsAnalyticsRepository } from './google-sheets/google-sheets-analytics.repository';
import { GoogleSheetsQrCodeRepository } from './google-sheets/google-sheets-qr.repository';
import { GoogleSheetsIndustryRepository } from './google-sheets/google-sheets-industry.repository';
import type { CardRepository } from './interfaces/card-repository.interface';
import type { UserRepository } from './interfaces/user-repository.interface';
import type { AnalyticsRepository } from './interfaces/analytics-repository.interface';
import type { QrCodeRepository } from './interfaces/qr-repository.interface';
import type { IndustryRepository } from './interfaces/industry-repository.interface';

/**
 * نقطه‌ی واحد ترکیب (Composition Root). تمام Service ها و API Route ها
 * فقط از همین فایل Repository می‌گیرند، نه مستقیم از پیاده‌سازی
 * Google Sheets.
 *
 * ⚠️ فاز ۵ (مهاجرت به Supabase): فقط همین خطوط زیر عوض می‌شود
 * (مثلاً new GoogleSheetsCardRepository() -> new SupabaseCardRepository())
 * و هیچ فایل دیگری در کل پروژه نیازی به تغییر ندارد.
 */
export const cardRepository: CardRepository = new GoogleSheetsCardRepository();
export const userRepository: UserRepository = new GoogleSheetsUserRepository();
export const analyticsRepository: AnalyticsRepository = new GoogleSheetsAnalyticsRepository();
export const qrCodeRepository: QrCodeRepository = new GoogleSheetsQrCodeRepository();
export const industryRepository: IndustryRepository = new GoogleSheetsIndustryRepository();
