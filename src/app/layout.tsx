import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'iCard — سازنده کارت ویزیت دیجیتال',
  description: 'کارت ویزیت دیجیتال خود را در چند دقیقه بسازید و به اشتراک بگذارید.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {/*
          اسکریپت رسمی Telegram Web App. با strategy="beforeInteractive"
          قبل از hydration کامپوننت‌های کلاینتی بارگذاری می‌شود، تا وقتی
          TelegramLoginBridge اجرا می‌شود، window.Telegram.WebApp از قبل
          آماده باشد. اگر سایت خارج از تلگرام باز شود، این اسکریپت هیچ
          اثری ندارد و بی‌خطر است.
        */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
