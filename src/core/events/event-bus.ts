/**
 * Event Bus مرکزی — نسخه‌ی TypeScript شده‌ی همان الگویی که در MVP اول
 * (App.Events) استفاده شد. قانون معماری ثابت می‌ماند: ماژول‌ها با هم
 * مستقیم صحبت نمی‌کنند، فقط از طریق این باس رویداد منتشر/دریافت می‌کنند.
 *
 * این نسخه هم در کلاینت (مرورگر) و هم در سرور (Node runtime داخل
 * Next.js API Routes) کار می‌کند چون فقط به EventTarget استاندارد وابسته
 * است که در هر دو محیط در دسترس است.
 */

// نگاشت نام رویداد -> شکل payload آن. با اضافه‌شدن رویداد جدید، اینجا هم
// باید اضافه شود تا type-safety حفظ شود.
export interface AppEventMap {
  'card:created': { cardId: string };
  'card:updated': { cardId: string };
  'card:deleted': { cardId: string };
  'auth:login': { userId: string };
  'auth:logout': { userId: string };
  'upload:started': { fileName: string };
  'upload:completed': { url: string; publicId: string };
  'upload:failed': { error: string };
  'analytics:track': { eventName: string; params?: Record<string, unknown> };
  'toast:show': { message: string; variant?: 'success' | 'error' | 'info' };
}

export type AppEventName = keyof AppEventMap;

type Handler<K extends AppEventName> = (detail: AppEventMap[K]) => void;

class EventBus {
  private target = new EventTarget();

  emit<K extends AppEventName>(name: K, detail: AppEventMap[K]): void {
    this.target.dispatchEvent(new CustomEvent(name, { detail }));
  }

  on<K extends AppEventName>(name: K, handler: Handler<K>): () => void {
    const listener = (event: Event) => {
      handler((event as CustomEvent<AppEventMap[K]>).detail);
    };
    this.target.addEventListener(name, listener);
    // یک تابع unsubscribe برمی‌گردانیم تا در useEffect/cleanup راحت استفاده شود
    return () => this.target.removeEventListener(name, listener);
  }

  off<K extends AppEventName>(name: K, handler: EventListener): void {
    this.target.removeEventListener(name, handler);
  }
}

// یک نمونه‌ی Singleton برای کل اپلیکیشن — هم در کلاینت هم سرور import می‌شود
export const eventBus = new EventBus();
