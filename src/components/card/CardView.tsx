import type { Card, Contact, ContactType } from '@/types/card';
import { resolveTheme } from '@/core/theme-engine/contrast';
import { CONTACT_TYPES } from '@/core/config/constants';
import Icon, { type IconName } from '@/components/ui/Icon';

/**
 * نگاشت نوع تماس به نام آیکن — بیشتر نوع‌ها مستقیم با نام آیکن یکی
 * هستند؛ فقط چند مورد نیاز به نگاشت دستی دارند.
 */
const CONTACT_ICON_MAP: Record<ContactType, IconName> = {
  phone: 'phone', mobile: 'mobile', email: 'email', website: 'website',
  instagram: 'instagram', telegram: 'telegram', whatsapp: 'whatsapp',
  linkedin: 'linkedin', twitter: 'twitter', facebook: 'facebook',
  youtube: 'youtube', github: 'github', bale: 'bale', eitaa: 'eitaa',
  rubika: 'rubika', soroush: 'soroush',
};

/**
 * کامپوننت واحد نمایش کارت — جایگزین React برای buildCardHTML قدیمی.
 *
 * نکته‌ی مهم امنیتی نسبت به نسخه‌ی MVP اول: در آن نسخه چون HTML به‌صورت
 * رشته ساخته می‌شد، sanitizeText دستی لازم بود تا XSS رخ ندهد. اینجا
 * چون از JSX استفاده می‌کنیم و مقادیر را به‌عنوان children (نه
 * dangerouslySetInnerHTML) قرار می‌دهیم، React خودش به‌طور خودکار همه‌ی
 * متن‌ها را escape می‌کند — نیازی به sanitizeText دستی نیست. این یکی از
 * دلایل واقعی است که React امن‌تر از دستکاری مستقیم innerHTML است.
 *
 * این کامپوننت هم در پیش‌نمایش زنده‌ی Wizard و هم در صفحه‌ی عمومی کارت
 * (/card/[slug]) به‌طور یکسان استفاده می‌شود — طبق اصل «یک منبع حقیقت
 * برای ساختار کارت».
 */

function contactHref(type: ContactType, value: string): string {
  const v = value.trim();
  if (!v) return '#';
  switch (type) {
    case 'phone':
    case 'mobile':
      return 'tel:' + v.replace(/[^\d+]/g, '');
    case 'email':
      return 'mailto:' + v;
    case 'whatsapp':
      return 'https://wa.me/' + v.replace(/[^\d]/g, '');
    case 'instagram':
      return v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`;
    case 'telegram':
      return v.startsWith('http') ? v : `https://t.me/${v.replace('@', '')}`;
    case 'twitter':
      return v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`;
    case 'github':
      return v.startsWith('http') ? v : `https://github.com/${v.replace('@', '')}`;
    case 'website':
    case 'linkedin':
    case 'facebook':
    case 'youtube':
    case 'bale':
    case 'eitaa':
    case 'rubika':
    case 'soroush':
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;
    default:
      return v;
  }
}

function buildMapLink(address?: Card['address']): string {
  if (!address) return '';
  if (address.lat && address.lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(address.lat)},${encodeURIComponent(address.lng)}`;
  }
  if (address.text) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.text)}`;
  }
  return '';
}

interface CardViewProps {
  card: Card;
  onContactClick?: (contact: Contact) => void;
  onMapClick?: () => void;
  onShareClick?: () => void;
  onQrClick?: () => void;
  onSaveVcardClick?: () => void;
  onGalleryImageClick?: (index: number) => void;
}

export default function CardView({
  card,
  onContactClick,
  onMapClick,
  onShareClick,
  onQrClick,
  onSaveVcardClick,
  onGalleryImageClick,
}: CardViewProps) {
  const theme = resolveTheme(card.theme);
  const primaryContact = card.contacts.find((c) => c.type === 'mobile' || c.type === 'phone');
  const visibleContacts = card.contacts.filter((c) => c.value?.trim());
  const visibleServices = card.services.filter((s) => s.title?.trim());
  const mapLink = buildMapLink(card.address);
  const hasAnyContent =
    card.description || visibleContacts.length || visibleServices.length || card.gallery.length || card.address?.text;

  return (
    <div style={cardStyles.liveCard}>
      {/* ---------- Hero ---------- */}
      <div style={{ ...cardStyles.hero, background: theme.background, color: theme.textColor }}>
        {card.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.avatarUrl} alt={card.name} style={cardStyles.avatar} />
        ) : (
          <div style={{ ...cardStyles.avatar, ...cardStyles.avatarPlaceholder }}>
            {card.name.charAt(0) || '؟'}
          </div>
        )}
        <h1 style={cardStyles.heroName}>{card.name}</h1>
        {card.jobTitle && <p style={cardStyles.heroTitle}>{card.jobTitle}</p>}

        <div style={cardStyles.heroActions}>
          {primaryContact && (
            <a
              href={contactHref(primaryContact.type, primaryContact.value)}
              style={{ ...cardStyles.heroBtn, color: theme.textColor }}
              onClick={() => onContactClick?.(primaryContact)}
            >
              تماس
            </a>
          )}
          <button
            type="button"
            style={{ ...cardStyles.heroBtn, color: theme.textColor, border: 'none' }}
            onClick={onSaveVcardClick}
          >
            ذخیره مخاطب
          </button>
        </div>
      </div>

      {/* ---------- Body ---------- */}
      <div style={cardStyles.body}>
        {card.description && (
          <section style={cardStyles.section}>
            <p style={cardStyles.desc}>{card.description}</p>
          </section>
        )}

        {visibleContacts.length > 0 && (
          <section style={cardStyles.section}>
            <p style={cardStyles.sectionTitle}>راه‌های ارتباطی</p>
            <div style={cardStyles.contactGrid}>
              {visibleContacts.map((c) => (
                <a
                  key={c.id}
                  href={contactHref(c.type, c.value)}
                  style={cardStyles.contactBtn}
                  onClick={() => onContactClick?.(c)}
                >
                  <Icon name={CONTACT_ICON_MAP[c.type]} size={20} />
                  <span>{CONTACT_TYPES[c.type]?.label ?? c.type}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {visibleServices.length > 0 && (
          <section style={cardStyles.section}>
            <p style={cardStyles.sectionTitle}>خدمات</p>
            {visibleServices.map((s) => (
              <div key={s.id} style={cardStyles.serviceItem}>
                <div style={cardStyles.serviceIcon}>
                  <Icon name={(s.icon as IconName) ?? 'checkmark'} size={19} />
                </div>
                <div>
                  <p style={cardStyles.serviceTitle}>{s.title}</p>
                  {s.desc && <p style={cardStyles.serviceDesc}>{s.desc}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {card.gallery.length > 0 && (
          <section style={cardStyles.section}>
            <p style={cardStyles.sectionTitle}>نمونه‌کارها</p>
            <div style={cardStyles.galleryGrid}>
              {card.gallery.map((g, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={g.id}
                  src={g.url}
                  alt="نمونه کار"
                  style={cardStyles.galleryImg}
                  onClick={() => onGalleryImageClick?.(index)}
                />
              ))}
            </div>
          </section>
        )}

        {(card.address?.text || mapLink) && (
          <section style={cardStyles.section}>
            <p style={cardStyles.sectionTitle}>آدرس</p>
            <div style={cardStyles.addressBox}>
              <span>{card.address?.text || 'مشاهده روی نقشه'}</span>
            </div>
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={cardStyles.mapLink}
                onClick={onMapClick}
              >
                باز کردن در نقشه ←
              </a>
            )}
          </section>
        )}

        {!hasAnyContent && <p style={cardStyles.emptyHint}>هنوز محتوایی اضافه نشده است</p>}
      </div>

      {/* ---------- Footer ---------- */}
      <div style={cardStyles.footer}>
        <button type="button" style={cardStyles.footerBtn} onClick={onShareClick}>
          اشتراک‌گذاری
        </button>
        <button type="button" style={cardStyles.footerBtn} onClick={onQrClick}>
          QR کد
        </button>
      </div>
    </div>
  );
}

const cardStyles: Record<string, React.CSSProperties> = {
  liveCard: {
    borderRadius: 28,
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
    background: '#fff',
  },
  hero: { padding: '36px 20px 24px', textAlign: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: '50%',
    objectFit: 'cover',
    margin: '0 auto 14px',
    border: '3px solid rgba(255,255,255,0.7)',
  },
  avatarPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.25)',
  },
  heroName: { fontSize: 21, fontWeight: 800, margin: '0 0 2px' },
  heroTitle: { fontSize: 13.5, opacity: 0.85, margin: 0 },
  heroActions: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 },
  heroBtn: {
    padding: '9px 16px',
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.22)',
    cursor: 'pointer',
  },
  body: { padding: 20, background: '#fff', color: '#1F2430' },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    margin: '0 0 10px',
  },
  desc: { fontSize: 14, lineHeight: 1.8, color: '#374151', margin: 0 },
  contactGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  contactBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '10px 4px',
    borderRadius: 12,
    background: '#F5F6FA',
    fontSize: 10.5,
    color: '#374151',
  },
  serviceItem: { display: 'flex', gap: 12, padding: 12, borderRadius: 12, background: '#F9FAFB', marginBottom: 8 },
  serviceIcon: { width: 38, height: 38, borderRadius: 10, background: '#EEF0FF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B5FEF' },
  serviceTitle: { fontSize: 13.5, fontWeight: 700, margin: '0 0 2px' },
  serviceDesc: { fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.6 },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 },
  galleryImg: { width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' },
  addressBox: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#F9FAFB', borderRadius: 12, fontSize: 13 },
  mapLink: { marginTop: 8, display: 'inline-block', fontSize: 12.5, color: '#5B5FEF', fontWeight: 600 },
  emptyHint: { textAlign: 'center', color: '#B0B4BC', fontSize: 12.5, padding: 10 },
  footer: { padding: '16px 20px 22px', display: 'flex', gap: 10, borderTop: '1px solid #F0F1F5' },
  footerBtn: {
    flex: 1,
    fontSize: 13,
    padding: 10,
    borderRadius: 10,
    border: 'none',
    background: '#F1F2F6',
    color: '#374151',
  },
};
