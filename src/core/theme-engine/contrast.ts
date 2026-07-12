import { THEMES, DEFAULT_THEME } from '@/core/config/constants';
import type { ThemeId } from '@/types/card';

/**
 * محاسبه‌ی کنتراست رنگ — همان منطق MVP اول، فقط با تایپ TypeScript.
 * تابع خالص و قابل تست است: رنگ هگز می‌گیرد، رنگ متن مناسب برمی‌گرداند.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// فرمول استاندارد WCAG برای luminance نسبی
export function relativeLuminance({ r, g, b }: RGB): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

export function getContrastColor(hexColor: string): '#1F2430' | '#FFFFFF' {
  try {
    const rgb = hexToRgb(hexColor);
    const lum = relativeLuminance(rgb);
    return lum > 0.5 ? '#1F2430' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

export function getThemeById(id: ThemeId) {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME)!;
}

export interface ResolvedTheme {
  background: string;
  textColor: string;
  themeId: ThemeId;
}

export function resolveTheme(themeId: ThemeId): ResolvedTheme {
  const theme = getThemeById(themeId);
  const textColor = getContrastColor(theme.base);
  return { background: theme.css, textColor, themeId: theme.id };
}
