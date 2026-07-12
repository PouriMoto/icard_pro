/**
 * موجودیت «صنعت» — فقط برای مقادیری که کاربران وارد کرده‌اند و در
 * فهرست ثابت CURATED_INDUSTRIES نبوده‌اند. این‌ها با وضعیت pending
 * ثبت می‌شوند تا ادمین تصمیم بگیرد آیا به فهرست رسمی اضافه شوند.
 *
 * مقدار «صنعت» روی خود Card به‌صورت رشته‌ی آزاد ذخیره می‌شود (نه
 * foreign key) — چون در MVP فعلی نیازی به join نیست؛ این جدول فقط
 * برای صف بازبینی و آمار ادمین است.
 */
export type IndustryStatus = 'approved' | 'pending';

export interface Industry {
  id: string;
  name: string;
  status: IndustryStatus;
  createdAt: string;
}
