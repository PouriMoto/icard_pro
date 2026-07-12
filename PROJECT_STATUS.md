# iCard — وضعیت پروژه (برای ادامه در چت جدید)

> این فایل طوری نوشته شده که یک نمونه‌ی تازه از Claude (بدون هیچ حافظه‌ای از
> مکالمات قبلی) با خواندن همین یک فایل، بتواند دقیقاً از همین نقطه ادامه
> دهد. اگر این فایل را به Claude دادی و گفتی «این status را بخوان و فاز ۳ را
> شروع کن»، همه‌چیز لازم اینجاست.

---

## ۱. محصول چیست و چه تصمیماتی گرفته شده

**iCard** یک SaaS برای ساخت کارت ویزیت دیجیتال است (شبیه HiHello). کاربر با
شماره موبایل وارد می‌شود، در یک Wizard نه‌مرحله‌ای کارتش را می‌سازد (عکس، تم
رنگ، نام/سمت/توضیحات، راه‌های ارتباطی، خدمات، گالری، آدرس)، و یک لینک/QR
عمومی دریافت می‌کند.

### تصمیمات محصول (قطعی، تغییر نده مگر کاربر بخواهد)
- **مسیر رشد هدف:** MVP تا ~۱۰,۰۰۰ کاربر → فاز تثبیت تا ~۲۰۰,۰۰۰ → فاز
  بعدی تا ۱M+
- **Auth فاز MVP:** فقط شماره موبایل، **بدون OTP** (تصمیم صریح کاربر).
  Google و Telegram Mini App بعداً فعال می‌شوند؛ ساختارشان (Provider
  Pattern) از الان آماده است.
- **Telegram Mini App:** برنامه‌ریزی‌شده برای فاز ۴، نه الان. چون Next.js
  روی Vercel است، هر لینک تولیدی مستقیم به یک Mini App تبدیل‌پذیر است —
  کار خاصی الان لازم نیست.
- **دیتابیس MVP:** Google Sheets (یک شیت با نام **vcard**، ساخته‌شده توسط
  کاربر). جدول‌ها (Users, Cards, AnalyticsEvents) را کد Apps Script
  خودش خودکار می‌سازد. **در نزدیکی ۲۰۰K کاربر باید به Supabase مهاجرت
  شود** — معماری (Repository Pattern) از الان برای این آماده است.
- **آپلود تصویر:** مستقیم به Cloudinary (نه از سرور ما عبور می‌کند)، با
  امضای امن سمت سرور.
- **اولویت اول کاربر برای فاز بعد: Analytics** — این مزیت رقابتی اصلی
  محصول تلقی می‌شود.
- **زبان:** رابط کاربری فارسی/RTL. کدها و کامنت‌ها فارسی/انگلیسی مخلوط
  (اکثراً فارسی، طبق روال این پروژه).

---

## ۲. پشته‌ی فنی نهایی

- **Next.js 14.2.35** (App Router) — نسخه عمداً pin شده روی ۱۴.۲.۳۵ چون
  ۱۴.۲.۵ یک آسیب‌پذیری امنیتی جدی داشت (CVE مربوط به App Router،
  دسامبر ۲۰۲۵). **هرگز نسخه را به زیر ۱۴.۲.۳۵ برنگردان.**
- **TypeScript** (strict mode)
- **Google Sheets** (از طریق Google Apps Script Web App) — دیتابیس موقت
- **Cloudinary** — آپلود/resize تصویر
- **Vercel** — هاست (پلن رایگان)
- کتابخانه‌های کلیدی: `jose` (JWT session)، `nanoid` (شناسه‌ساز)،
  `qrcode` (تولید QR سمت کلاینت، نسخه npm نه CDN)

---

## ۳. الگوهای معماری (این‌ها را نقض نکن)

1. **Repository Pattern:** هیچ Service یا API Route مستقیم با Google
   Sheets صحبت نمی‌کند. همه از `src/repositories/index.ts` (composition
   root) می‌گیرند. فاز ۵ (مهاجرت Supabase) فقط همین یک فایل را عوض
   می‌کند.
2. **Auth Provider Pattern:** هر روش ورود (`phone`, `google`, `telegram`)
   پیاده‌سازی مستقلی از یک اینترفیس مشترک است. فقط `phone` فعال است.
3. **Event Bus:** `src/core/events/event-bus.ts`، type-safe با
   TypeScript. برای رویدادهای cross-module (نه state محلی یک فرم —
   Wizard از useState معمولی React استفاده می‌کند، نه Event Bus).
4. **Service Layer:** منطق کسب‌وکار (چک مالکیت، ساخت slug و...) در
   `src/services/*`، نه در API Route و نه در UI.
5. **بدون هاردکود پخش‌شده:** همه‌ی تم‌ها/آیکن‌ها/محدودیت‌ها در
   `src/core/config/constants.ts`.
6. **React به‌جای innerHTML دستی:** برخلاف MVP اول (که یک فایل HTML/JS
   خام بود و نیاز به `sanitizeText` دستی داشت)، الان از JSX استفاده
   می‌شود که خودش XSS را می‌بندد (مقادیر به‌عنوان children، نه
   dangerouslySetInnerHTML).

---

## ۴. ساختار کامل پوشه‌ها و فایل‌ها (۵۸ فایل — همه ساخته و تست شده‌اند)

```
icard/
├── README.md                              نصب، Google Sheet، Cloudinary، GitHub، Vercel
├── PROJECT_STATUS.md                       همین فایل
├── package.json                            وابستگی‌ها (next@14.2.35 !)
├── next.config.js                          اجازه‌ی تصویر از res.cloudinary.com
├── tsconfig.json                           مسیر میان‌بر @/* -> src/*
├── .eslintrc.json                          next/core-web-vitals
├── .gitignore                              شامل .env*.local
├── .env.example                            قالب متغیرهای محیطی
├── apps-script/
│   └── Code.gs                             بک‌اند Sheets؛ جدول‌ها خودکار ساخته می‌شوند
│                                            (Users has role column, Cards, AnalyticsEvents)
│
├── src/
│   ├── types/card.ts                       تایپ‌های Card, User(+role), Contact, AnalyticsEvent
│   │
│   ├── core/
│   │   ├── events/event-bus.ts             Event Bus type-safe
│   │   ├── config/constants.ts             THEMES, CONTACT_TYPES(+ایرانی), LIMITS
│   │   └── theme-engine/contrast.ts        محاسبه‌ی کنتراست رنگ متن
│   │
│   ├── repositories/
│   │   ├── interfaces/                     card/user/analytics repository interfaces
│   │   ├── google-sheets/
│   │   │   ├── google-sheets-client.ts     fetch wrapper پایه (GET/POST + secret)
│   │   │   ├── google-sheets-card.repository.ts
│   │   │   ├── google-sheets-user.repository.ts   (شامل role)
│   │   │   └── google-sheets-analytics.repository.ts
│   │   └── index.ts                        composition root (نقطه‌ی سوییچ Supabase آینده)
│   │
│   ├── auth/
│   │   ├── providers/
│   │   │   ├── auth-provider.interface.ts
│   │   │   ├── phone.provider.ts           فعال، بدون OTP
│   │   │   ├── google.provider.ts          اسکلت غیرفعال
│   │   │   └── telegram.provider.ts        اسکلت غیرفعال + یادداشت الگوریتم HMAC
│   │   └── session.ts                      JWT در کوکی httpOnly
│   │
│   ├── services/
│   │   ├── cloudinary.service.ts           امضای آپلود امن سمت سرور
│   │   ├── card.service.ts                 منطق کارت + چک مالکیت
│   │   ├── analytics.service.ts            نسخه‌ی پایه (فاز ۳ این را گسترش می‌دهد)
│   │   └── vcard.service.ts                ساخت متن vCard استاندارد
│   │
│   ├── lib/
│   │   ├── utils.ts                        slugify, sanitizeText, generateVisitorId و...
│   │   └── api-client.ts                   fetch helper مشترک کلاینت
│   │
│   ├── components/
│   │   ├── ui/Icon.tsx                     آیکن‌های SVG مشترک (۲۲ آیکن)
│   │   ├── auth/PhoneLoginForm.tsx
│   │   ├── card/
│   │   │   ├── CardView.tsx                رندر خالص کارت (Server-renderable)
│   │   │   ├── CardInteractive.tsx         پوسته‌ی کلاینتی (share/qr/vcard/tracking hooks)
│   │   │   └── QrModal.tsx                 QR با کتابخانه npm qrcode
│   │   └── wizard/
│   │       ├── useWizardState.ts           hook + localStorage draft
│   │       ├── WizardShell.tsx             orchestrator (نه مرحله، ناوبری، submit)
│   │       └── steps/
│   │           ├── StepAvatar.tsx          آپلود مستقیم Cloudinary
│   │           ├── StepTheme.tsx
│   │           ├── StepTextFields.tsx      (نام + سمت + توضیحات، ۳ کامپوننت export شده)
│   │           ├── StepContacts.tsx        تکرارشونده
│   │           ├── StepServices.tsx        تکرارشونده (⚠️ آیکن‌ها هنوز متنی، نه Icon.tsx)
│   │           ├── StepGallery.tsx         آپلود چندتایی
│   │           └── StepAddress.tsx
│   │
│   └── app/
│       ├── layout.tsx                      RTL + فونت Vazirmatn با fallback
│       ├── globals.css                     CSS variables رنگ
│       ├── page.tsx                        صفحه‌ی ورود (ریدایرکت اگر لاگین)
│       ├── wizard/page.tsx                 چک session سمت سرور + WizardShell
│       ├── card/[slug]/page.tsx            صفحه‌ی عمومی (از CardInteractive استفاده می‌کند)
│       ├── dashboard/page.tsx              لیست کارت‌های کاربر
│       ├── dashboard/admin/page.tsx        ⚠️ چک role واقعی (تازه اصلاح شد)
│       └── api/
│           ├── auth/phone/route.ts         POST: ورود/ثبت‌نام
│           ├── auth/logout/route.ts        POST
│           ├── cards/route.ts              GET (لیست) + POST (ساخت)
│           ├── cards/[id]/route.ts         PATCH + DELETE (چک مالکیت)
│           ├── cards/[id]/vcard/route.ts   GET عمومی، دانلود .vcf
│           └── upload/route.ts             POST: امضای Cloudinary
```

---

## ۵. چه چیزی الان واقعاً کار می‌کند (تست‌شده با build واقعی)

مسیر کامل: **ورود با موبایل → Wizard ۹ مرحله‌ای با پیش‌نمایش زنده → آپلود
عکس مستقیم Cloudinary → ساخت کارت در Google Sheets → صفحه‌ی عمومی کارت با
Share/QR/دانلود vCard واقعی → لیست کارت‌ها در داشبورد → داشبورد ادمین با
چک نقش واقعی.**

### آخرین تست‌های اجراشده (هر دو موفق، صفر خطا)
```bash
npx tsc --noEmit      # صفر خطای تایپ
npx next build        # build کامل موفق، ۱۲ مسیر
```

### باگ‌ها/آسیب‌پذیری‌هایی که در حین تست پیدا و رفع شدند
1. `next@14.2.5` → آسیب‌پذیری امنیتی جدی → ارتقا به `14.2.35`
2. تایپ `CardDraft` فیلد `slug` را Omit نکرده بود → تناقض در ۴ فایل → رفع شد
3. داشبورد ادمین فقط وجود session را چک می‌کرد نه نقش واقعی → فیلد `role`
   به User اضافه شد و چک واقعی گذاشته شد

---

## ۶. محدودیت‌های شناخته‌شده (صادقانه، عمدی، نه فراموش‌شده)

| محدودیت | وضعیت |
|---|---|
| `StepServices.tsx` و بخشی از `CardView.tsx` هنوز از `Icon.tsx` جدید استفاده نمی‌کنند (متن جایگزین دارند) | کار کوچک باقی‌مانده، اولویت پایین |
| استایل‌ها همه inline هستند، نه یک design system یکدست | فاز ۲ |
| آیکن پیام‌رسان‌های ایرانی (بله/ایتا/روبیکا/سروش) از یک شکل حبابک عمومی استفاده می‌کند، نه لوگوی رسمی | عمدی، نیاز به مجوز برند |
| ویرایش کامل کارت در داشبورد وجود ندارد (فقط مشاهده) | فاز ۲ |
| Lightbox گالری وجود ندارد | فاز ۲ |
| متادیتای Open Graph برای SEO در صفحه‌ی عمومی کارت نیست | فاز ۲/۴ |
| اولین ادمین باید دستی در Google Sheet ساخته شود (ستون role را به admin تغییر بده) | عمدی — نباید UI برایش ساخته شود، ریسک امنیتی دارد |

---

## ۷. نقشه‌ی راه — فاز ۳: Analytics (این باید الان ساخته شود)

طبق طرح اولیه، این سیستم باید رویدادمحور باشد:

```
UI (کلاینت) → API Route ثبت رویداد → Repository (Google Sheets) → Dashboard
```

### رویدادهایی که باید ردیابی شوند (طبق طرح مشاور که قبلاً تأیید شد)
`card_open`, `card_close`, `phone_click`, `email_click`, `website_click`,
`portfolio_open`, `share_click`, `copy_link`, `download_vcf`, `qr_scan`,
`scroll_depth`, `time_on_page`, `button_click`

این‌ها از قبل در `AnalyticsEventName` (`src/types/card.ts`) تعریف شده‌اند.
`AnalyticsEvent` تایپ کامل (با `visitorId`, `sessionId`, `utm*`, `device`,
`browser`, `country`, `city`) هم از قبل آماده است.

`GoogleSheetsAnalyticsRepository` و `AnalyticsRepository` interface هم از
قبل ساخته شده‌اند (`record()` و `findByCardId()`). یعنی **لایه‌ی داده
Analytics کاملاً آماده است** — کاری که در فاز ۳ باید انجام شود صرفاً
اتصال end-to-end است.

### فایل‌های پیشنهادی فاز ۳ (هنوز ساخته نشده‌اند)
| فایل | نقش |
|---|---|
| `src/app/api/analytics/track/route.ts` | دریافت رویداد از کلاینت؛ اینجا باید device/browser از User-Agent، و اگر ممکن شد کشور/شهر از IP استخراج شود |
| `src/components/analytics/useAnalyticsTracker.ts` | hook کلاینتی: ساخت/بازیابی visitorId و sessionId از localStorage، ارسال خودکار card_open هنگام mount، scroll_depth با listener، time_on_page هنگام unload |
| به‌روزرسانی `CardInteractive.tsx` | جایگزینی `console.log('[analytics]', ...)` فعلی با فراخوانی واقعی tracker |
| `src/services/analytics.service.ts` (اصلاح) | افزودن توابع تجمیع: `getStatsForCard(cardId)` — بازدید امروز/هفته/ماه، CTR، دستگاه‌های برتر |
| `src/app/dashboard/analytics/page.tsx` یا بخشی داخل `dashboard/page.tsx` | نمایش آمار کاربر برای هرکارت |
| `src/app/dashboard/admin/page.tsx` (اصلاح) | افزودن آمار سراسری: کارت‌های برتر، شهرهای برتر |
| احتمالاً یک کتابخانه‌ی نمودار سبک (مثلاً recharts) یا نمودار SVG دستی ساده | تصمیم لازم: آیا کتابخانه‌ی نمودار اضافه کنیم یا فعلاً فقط عدد/جدول نشان دهیم؟ |

### تصمیمی که در چت جدید باید گرفته شود
قبل از شروع فاز ۳ باید مشخص شود: آیا برای تشخیص کشور/شهر از IP یک سرویس
ثالث (مثلاً ipapi.co رایگان) اضافه کنیم، یا فعلاً این دو فیلد را خالی
بگذاریم و فقط device/browser/UTM را از هدرهای درخواست استخراج کنیم؟
(پیشنهاد: فعلاً بدون IP lookup شروع کنیم تا سرعت پیاده‌سازی بالا بماند،
بعداً اضافه شود.)

---

## ۸. نقشه‌ی راه فازهای بعدی (بعد از فاز ۳)

- **فاز ۲ باقی‌مانده:** ویرایش کامل کارت در Dashboard، Lightbox گالری،
  سیستم استایل یکدست، اتصال Icon.tsx به همه‌جا
- **فاز ۴:** QR پویا + کوتاه‌کننده لینک، فعال‌سازی واقعی Google Auth،
  فعال‌سازی واقعی Telegram Mini App (الگوریتم HMAC از قبل مستند شده در
  `telegram.provider.ts`)، Industry Taxonomy، Campaign/Lead Tracking
- **فاز ۵ (نزدیک ۲۰۰K کاربر):** ساخت `SupabaseCardRepository` و مشابه؛
  فقط `src/repositories/index.ts` عوض می‌شود

---

## ۹. نحوه‌ی کار با فایل‌ها در این پروژه (قواعد تثبیت‌شده)

- فایل‌ها **یکی‌یکی** با مسیر دقیق ارائه می‌شوند (نه zip یکجا) — به دلیل
  محدودیت توکن.
- بعد از هر ۶ تا ۱۰ فایل، مکث می‌شود و از کاربر «ادامه» گرفته می‌شود.
- بعد از هر دسته‌ی مهم، `tsc --noEmit` و `next build` واقعی اجرا می‌شود
  تا باگ واقعی (نه فرضی) پیدا شود — این تا الان دو بار باگ واقعی و یک
  آسیب‌پذیری امنیتی واقعی پیدا کرده است، پس این مرحله را حذف نکن.
- محدودیت‌های شناخته‌شده صادقانه اعلام می‌شوند، نه پنهان.
