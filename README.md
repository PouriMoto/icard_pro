# iCard — سازنده کارت ویزیت دیجیتال (SaaS)

پلتفرم ساخت کارت ویزیت دیجیتال با معماری ماژولار، event-driven، و آماده برای
رشد از MVP (~۱۰,۰۰۰ کاربر) تا مقیاس میلیونی.

## پشته‌ی فنی

- **Next.js 14** (App Router) — برای API Routes امن (مخفی نگه‌داشتن کلیدهای
  Cloudinary/Google) و آماده‌بودن برای SSR/SEO در فازهای بعدی
- **TypeScript** — تایپ‌های مشترک بین Storage/Service/UI
- **Google Sheets** — دیتابیس موقت فاز MVP (تا مهاجرت به Supabase در فاز تثبیت)
- **Cloudinary** — آپلود و resize تصاویر
- **Vercel** — هاست (پلن رایگان کافی برای MVP)

## فازبندی پروژه

| فاز | عنوان | وضعیت |
|---|---|---|
| ۰ | اسکلت Next.js + معماری پایه + Auth تلفن | در حال ساخت |
| ۱ | Google Sheets Repository + Cloudinary Service | برنامه‌ریزی‌شده |
| ۲ | Card Engine + Dashboard (User/Admin) | برنامه‌ریزی‌شده |
| ۳ | سیستم Analytics رویدادمحور | برنامه‌ریزی‌شده |
| ۴ | ویژگی‌های SaaS (QR پویا، Telegram Mini App، Campaign) | برنامه‌ریزی‌شده |
| ۵ | مهاجرت Storage به Supabase | بعداً (نزدیک ۲۰۰K کاربر) |

---

## ۱. راه‌اندازی محلی (Local Setup)

### پیش‌نیاز
- Node.js نسخه ۱۸ یا بالاتر (`node -v` را چک کنید)
- یک اکانت Google (برای Google Sheets + Apps Script)
- یک اکانت Cloudinary (رایگان کافی است)
- یک اکانت GitHub
- یک اکانت Vercel (رایگان)

### مراحل

```bash
# ۱. وارد پوشه پروژه شوید (همان پوشه‌ای که این فایل‌ها را در آن ذخیره می‌کنید)
cd icard

# ۲. نصب وابستگی‌ها
npm install

# ۳. کپی فایل env نمونه و پرکردن مقادیر واقعی
cp .env.example .env.local
# سپس .env.local را باز کنید و مقادیر را طبق بخش «متغیرهای محیطی» زیر پر کنید

# ۴. اجرای محلی
npm run dev
```

بعد از اجرا، آدرس `http://localhost:3000` را در مرورگر باز کنید.

---

## ۲. راه‌اندازی Google Sheet

1. یک Google Sheet جدید بسازید و نامش را **vcard** بگذارید (طبق درخواستتان).
2. از منوی بالا: **Extensions → Apps Script** را باز کنید.
3. محتوای فایل `apps-script/Code.gs` (در همین پروژه) را کپی کرده و در ادیتور
   Apps Script جایگزین کد پیش‌فرض کنید.
4. در بالای فایل `Code.gs`، مقدار `SPREADSHEET_ID` را با ID شیت خودتان جایگزین
   کنید. ID را از URL شیت می‌گیرید:
   ```
   https://docs.google.com/spreadsheets/d/AAAA_ID_SHEET_AAAA/edit
                                          ^^^^^^^^^^^^^^^^^^^^
                                          همین بخش را کپی کنید
   ```
5. یک مقدار دلخواه و تصادفی برای `SHARED_SECRET` در همان فایل انتخاب کنید
   (این مثل رمز عبور بین اپ شما و Google Sheet است، تا هرکسی نتواند به شیت
   شما بنویسد). همین مقدار را در `.env.local` هم به‌عنوان
   `GOOGLE_SCRIPT_SECRET` قرار می‌دهید.
6. از منوی **Deploy → New deployment** را بزنید:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. بعد از Deploy، یک URL به شما داده می‌شود (چیزی شبیه
   `https://script.google.com/macros/s/XXXXX/exec`). این را در `.env.local`
   به‌عنوان `GOOGLE_SCRIPT_URL` قرار دهید.

**نکته مهم:** جدول‌ها (تب‌های Users، Cards، AnalyticsEvents) را خودتان
دستی نمی‌سازید — کد `Code.gs` در اولین اجرا به‌صورت خودکار آن‌ها را با
هدرهای درست می‌سازد.

---

## ۳. راه‌اندازی Cloudinary

1. وارد پنل Cloudinary شوید (همان اکانتی که Key با نام `vcard` دارید).
2. از Dashboard این سه مقدار را بردارید:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. این‌ها را در `.env.local` قرار دهید (بخش بعدی).

آپلود تصاویر به‌صورت **امضا‌شده (signed)** و از طریق یک API Route داخلی
Next.js انجام می‌شود؛ یعنی `API Secret` هرگز به مرورگر کاربر ارسال نمی‌شود.

---

## ۴. متغیرهای محیطی (`.env.local`)

فایل `.env.example` را کپی کرده و مقادیر واقعی را جایگزین کنید:

```bash
# Google Sheets Backend
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
GOOGLE_SCRIPT_SECRET=یک-رشته-تصادفی-طولانی-و-محرمانه

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Auth / Session
SESSION_SECRET=یک-رشته-تصادفی-دیگر-برای-امضای-جلسه-کاربر

# Base URL (برای ساخت لینک‌های اشتراک‌گذاری کارت)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

برای ساخت رشته‌های تصادفی امن می‌توانید در ترمینال این را اجرا کنید:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ۵. اتصال به GitHub

```bash
cd icard
git init
git add .
git commit -m "chore: initial Next.js scaffold (phase 0)"
git branch -M main
git remote add origin https://github.com/USERNAME/icard.git
git push -u origin main
```

(`USERNAME/icard` را با ریپوی واقعی خودتان جایگزین کنید. اگر ریپو را از قبل
در GitHub نساخته‌اید، اول یک ریپوی خالی در GitHub بسازید، بدون README یا
gitignore پیش‌فرض، تا تداخلی با فایل‌های این پروژه پیش نیاید.)

---

## ۶. اتصال به Vercel (پلن رایگان)

### روش پیشنهادی: از طریق داشبورد Vercel (بدون نیاز به CLI)

1. وارد [vercel.com](https://vercel.com) شوید و با اکانت GitHub لاگین کنید.
2. **Add New → Project** را بزنید.
3. ریپوی `icard` را از لیست انتخاب کنید و **Import** بزنید.
4. Vercel به‌طور خودکار تشخیص می‌دهد این یک پروژه‌ی Next.js است — نیازی به
   تنظیم دستی build command نیست.
5. قبل از زدن Deploy، بخش **Environment Variables** را باز کنید و همان
   مقادیری که در `.env.local` گذاشتید را یکی‌یکی اضافه کنید (دقیقاً همان
   اسم متغیرها).
6. **Deploy** را بزنید.

بعد از چند دقیقه یک آدرس شبیه `https://icard-username.vercel.app` دریافت
می‌کنید — این آدرس تولید (production) شماست.

### به‌روزرسانی‌های بعدی
از این به بعد، هر بار که به شاخه‌ی `main` در گیت‌هاب `push` کنید، Vercel
به‌صورت خودکار نسخه‌ی جدید را deploy می‌کند (نیازی به کار دستی نیست).

---

## ۷. ساختار پوشه‌ها (خلاصه)

```
src/
  core/          → Event Bus، Config، Theme Engine (منطق پایه، مستقل از UI)
  types/         → تایپ‌های مشترک TypeScript
  repositories/  → لایه‌ی داده (فعلاً Google Sheets، بعداً قابل تعویض با Supabase)
  services/      → منطق کسب‌وکار (Card, Cloudinary, Analytics)
  auth/          → Provider های احراز هویت (Phone فعال، Google/Telegram اسکلت)
  app/           → صفحات Next.js (Wizard، Card عمومی، Dashboard، API Routes)
  components/    → کامپوننت‌های React
```

قانون معماری: **UI هرگز مستقیم با Repository یا API خارجی صحبت نمی‌کند** —
همیشه از طریق `services/` و Event Bus. این یعنی وقتی در فاز ۵ به Supabase
مهاجرت کنیم، فقط یک فایل در `repositories/` عوض می‌شود، نه کل پروژه.

---

## ۸. وضعیت فعلی احراز هویت (فاز ۰)

- ✅ **ورود با شماره موبایل** (بدون OTP در این فاز — طبق تصمیم محصول)
- ⏳ ورود با گوگل — فقط اسکلت آماده، غیرفعال
- ⏳ ورود با تلگرام (برای Telegram Mini App آینده) — فقط اسکلت آماده، غیرفعال

هر سه پشت یک اینترفیس مشترک (`AuthProvider`) هستند، پس فعال‌کردن هرکدام در
آینده نیازی به تغییر در بقیه‌ی کد ندارد.
