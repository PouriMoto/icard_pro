/**
 * کمکی مشترک برای فراخوانی API از سمت کلاینت. یک نقطه‌ی واحد برای
 * مدیریت خطا و parse کردن پاسخ‌های JSON استاندارد ({status, data, message})
 * که همه‌ی API Route های پروژه با همین فرمت پاسخ می‌دهند.
 */

interface ApiResponse<T> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
}

export class ApiError extends Error {}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });

  const json: ApiResponse<T> = await res.json();

  if (json.status === 'error' || !res.ok) {
    throw new ApiError(json.message || 'خطای نامشخص در ارتباط با سرور');
  }

  return json.data as T;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
