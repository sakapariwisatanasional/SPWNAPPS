import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Member } from '../types';
import { 
  SAKA_LOGO_URL, 
  SAKA_LOGO_DRIVE_DIRECT_URL,
  SAKA_CARD_BG_DRIVE_DIRECT_URL,
  SAKA_CARD_BG_FALLBACK_URL,
  formatDriveImageUrl,
  getDriveDirectFallbackUrl
} from '../components/common/SakaLogo';
import { getMemberVerificationUrl } from '../components/member/KtaQrCode';

export type BadgeTheme = 'purple_gold' | 'emerald_pesona' | 'midnight_slate' | 'clean_white';
export type BadgeFormat = 'VERTICAL_LANYARD' | 'HORIZONTAL_CARD';

export interface BadgeOptions {
  theme: BadgeTheme;
  format: BadgeFormat;
  eventName?: string;
  showContactPhone?: boolean;
  showEmail?: boolean;
  showSkills?: boolean;
  showKwartirDetails?: boolean;
}

export const DEFAULT_BADGE_OPTIONS: BadgeOptions = {
  theme: 'purple_gold',
  format: 'VERTICAL_LANYARD',
  eventName: 'Saka Pariwisata • Networking & Event Pass',
  showContactPhone: true,
  showEmail: true,
  showSkills: true,
  showKwartirDetails: true,
};

/**
 * Dimensions for badge rendering (High resolution for crisp printing)
 */
const VERTICAL_WIDTH = 900;
const VERTICAL_HEIGHT = 1400;

const HORIZONTAL_WIDTH = 1200;
const HORIZONTAL_HEIGHT = 750;

/**
 * Safely load an image from URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(new Image());
      return;
    }

    const primaryUrl = formatDriveImageUrl(src) || src;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallbackUrl = getDriveDirectFallbackUrl(src);
      if (fallbackUrl && fallbackUrl !== primaryUrl) {
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => {
          const rawImg = new Image();
          rawImg.onload = () => resolve(rawImg);
          rawImg.onerror = () => resolve(rawImg);
          rawImg.src = fallbackUrl;
        };
        fallbackImg.src = fallbackUrl;
      } else if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () => resolve(retryImg);
        retryImg.src = primaryUrl;
      } else {
        resolve(img);
      }
    };
    img.src = primaryUrl;
  });
}

/**
 * Generate QR code data URL
 */
async function generateQrDataUrl(text: string, darkColor = '#1e0842', lightColor = '#ffffff'): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: darkColor,
        light: lightColor
      }
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

/**
 * Load official Saka Logo
 */
async function loadSakaLogo(): Promise<HTMLImageElement> {
  try {
    const localImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error('Empty')));
      img.onerror = () => reject(new Error('Failed'));
      img.src = SAKA_LOGO_URL;
    });
    return localImg;
  } catch {
    try {
      const driveImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => (img.naturalWidth > 0 ? resolve(img) : reject(new Error('Empty')));
        img.onerror = () => reject(new Error('Failed'));
        img.src = SAKA_LOGO_DRIVE_DIRECT_URL;
      });
      return driveImg;
    } catch {
      return new Image();
    }
  }
}

/**
 * Load background watermark
 */
async function loadBgImage(): Promise<HTMLImageElement | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => resolve(el);
      el.onerror = () => {
        const retry = new Image();
        retry.onload = () => resolve(retry);
        retry.onerror = () => resolve(el);
        retry.src = SAKA_CARD_BG_FALLBACK_URL;
      };
      el.src = formatDriveImageUrl(SAKA_CARD_BG_DRIVE_DIRECT_URL);
    });
    return img;
  } catch {
    return null;
  }
}

/**
 * Draw rounded rectangle path helper
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Get Color Palette for theme
 */
function getBadgePalette(theme: BadgeTheme) {
  switch (theme) {
    case 'emerald_pesona':
      return {
        bgGradient: ['#022c22', '#064e3b', '#0f172a'],
        accent: '#34d399',
        accentLight: '#a7f3d0',
        cardBg: 'rgba(6, 78, 59, 0.75)',
        border: 'rgba(52, 211, 153, 0.4)',
        headerBg: '#047857',
        headerText: '#ffffff',
        gold: '#fbbf24',
        textLight: '#f0fdf4',
        textMuted: '#99f6e4',
        qrDark: '#022c22',
        badgePillBg: '#059669',
        badgePillText: '#ffffff',
        strapHole: '#022c22',
        isLight: false
      };
    case 'midnight_slate':
      return {
        bgGradient: ['#0f172a', '#1e293b', '#020617'],
        accent: '#94a3b8',
        accentLight: '#e2e8f0',
        cardBg: 'rgba(30, 41, 59, 0.75)',
        border: 'rgba(148, 163, 184, 0.35)',
        headerBg: '#334155',
        headerText: '#ffffff',
        gold: '#38bdf8',
        textLight: '#f8fafc',
        textMuted: '#cbd5e1',
        qrDark: '#0f172a',
        badgePillBg: '#475569',
        badgePillText: '#ffffff',
        strapHole: '#020617',
        isLight: false
      };
    case 'clean_white':
      return {
        bgGradient: ['#f8fafc', '#f1f5f9', '#e2e8f0'],
        accent: '#7c3aed',
        accentLight: '#6d28d9',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(124, 58, 237, 0.25)',
        headerBg: '#2e1065',
        headerText: '#ffffff',
        gold: '#b45309',
        textLight: '#0f172a',
        textMuted: '#475569',
        qrDark: '#1e0842',
        badgePillBg: '#ede9fe',
        badgePillText: '#5b21b6',
        strapHole: '#cbd5e1',
        isLight: true
      };
    case 'purple_gold':
    default:
      return {
        bgGradient: ['#1e0842', '#3b0764', '#0f172a'],
        accent: '#d8b4fe',
        accentLight: '#f3e8ff',
        cardBg: 'rgba(59, 7, 100, 0.75)',
        border: 'rgba(192, 132, 252, 0.4)',
        headerBg: '#581c87',
        headerText: '#ffffff',
        gold: '#fbbf24',
        textLight: '#faf5ff',
        textMuted: '#e9d5ff',
        qrDark: '#1e0842',
        badgePillBg: '#7e22ce',
        badgePillText: '#ffffff',
        strapHole: '#0f0521',
        isLight: false
      };
  }
}

/**
 * Render Vertical Lanyard Event Badge onto HTML5 Canvas
 */
export async function renderVerticalLanyardCanvas(
  member: Member,
  options: BadgeOptions = DEFAULT_BADGE_OPTIONS
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = VERTICAL_WIDTH;
  canvas.height = VERTICAL_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const palette = getBadgePalette(options.theme);
  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = getMemberVerificationUrl(member);

  // Load assets in parallel
  const [avatarImg, logoImg, bgImg, qrDataUrl] = await Promise.all([
    loadImage(member.avatarUrl),
    loadSakaLogo(),
    loadBgImage(),
    generateQrDataUrl(verificationUrl, palette.qrDark, '#ffffff')
  ]);

  const qrImg = await loadImage(qrDataUrl);

  // 1. Clip Rounded Outer Badge
  roundRect(ctx, 0, 0, VERTICAL_WIDTH, VERTICAL_HEIGHT, 44);
  ctx.clip();

  // 2. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, VERTICAL_WIDTH, VERTICAL_HEIGHT);
  grad.addColorStop(0, palette.bgGradient[0]);
  grad.addColorStop(0.5, palette.bgGradient[1]);
  grad.addColorStop(1, palette.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VERTICAL_WIDTH, VERTICAL_HEIGHT);

  // 2b. Background Watermark Artwork
  if (bgImg && (bgImg.naturalWidth > 0 || bgImg.width > 0)) {
    ctx.save();
    ctx.globalAlpha = palette.isLight ? 0.05 : 0.08;
    ctx.drawImage(bgImg, 0, 0, VERTICAL_WIDTH, VERTICAL_HEIGHT);
    ctx.restore();
  }

  // 2c. Outer Border
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 6;
  roundRect(ctx, 3, 3, VERTICAL_WIDTH - 6, VERTICAL_HEIGHT - 6, 44);
  ctx.stroke();

  // 3. Realistic Lanyard Slot / Punch Hole at Top
  const strapSlotW = 160;
  const strapSlotH = 22;
  const strapSlotX = (VERTICAL_WIDTH - strapSlotW) / 2;
  const strapSlotY = 28;

  ctx.fillStyle = palette.strapHole;
  roundRect(ctx, strapSlotX, strapSlotY, strapSlotW, strapSlotH, 11);
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4. Header Section: Event & Organization Title Banner
  const headerTopY = 70;
  
  // Header background pill
  ctx.fillStyle = palette.cardBg;
  roundRect(ctx, 40, headerTopY, VERTICAL_WIDTH - 80, 110, 24);
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Logo on Left
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, 64, headerTopY + 16, 78, 78);
  }

  // Title Texts
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.gold;
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillText(
    (options.eventName || 'SAKA PARIWISATA • EVENT PASS').toUpperCase(),
    160,
    headerTopY + 42
  );

  ctx.fillStyle = palette.isLight ? '#1e0842' : '#ffffff';
  ctx.font = '900 24px "Inter", -apple-system, sans-serif';
  ctx.fillText('SATUAN KARYA PRAMUKA PARIWISATA', 160, headerTopY + 72);

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 13px "Inter", sans-serif';
  ctx.fillText('KWARTIR NASIONAL GERAKAN PRAMUKA INDONESIA', 160, headerTopY + 95);

  // 5. Member Profile Section (Avatar + Name + Position)
  const profileCenterY = 320;

  // Avatar Ring & Image
  const avatarSize = 210;
  const avatarX = (VERTICAL_WIDTH - avatarSize) / 2;
  const avatarY = 205;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

  if (avatarImg.complete && avatarImg.width > 0) {
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
  }
  ctx.restore();

  // Avatar Circular Golden/Accent Border
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Verified Badge on Avatar
  const badgeRadius = 24;
  const badgeX = avatarX + avatarSize - 18;
  const badgeY = avatarY + avatarSize - 18;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓', badgeX, badgeY + 8);

  // Full Name
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.isLight ? '#0f172a' : '#ffffff';
  ctx.font = '900 36px "Inter", -apple-system, sans-serif';
  ctx.fillText(member.fullName.toUpperCase(), VERTICAL_WIDTH / 2, 470, VERTICAL_WIDTH - 100);

  // Position / Role Badge Pill
  const roleText = (member.currentPosition || 'ANGGOTA SAKA PARIWISATA').toUpperCase();
  ctx.font = 'bold 16px "Inter", sans-serif';
  const roleWidth = Math.max(220, ctx.measureText(roleText).width + 50);
  const roleX = (VERTICAL_WIDTH - roleWidth) / 2;

  ctx.fillStyle = palette.badgePillBg;
  roundRect(ctx, roleX, 492, roleWidth, 38, 19);
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = palette.badgePillText;
  ctx.fillText(roleText, VERTICAL_WIDTH / 2, 517);

  // 6. NTA (Nomor Tanda Anggota) Box - Very Prominent
  const ntaBoxW = VERTICAL_WIDTH - 120;
  const ntaBoxH = 88;
  const ntaBoxX = 60;
  const ntaBoxY = 550;

  ctx.fillStyle = palette.cardBg;
  roundRect(ctx, ntaBoxX, ntaBoxY, ntaBoxW, ntaBoxH, 20);
  ctx.fill();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = palette.gold;
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillText('NOMOR TANDA ANGGOTA NASIONAL (NTA)', VERTICAL_WIDTH / 2, ntaBoxY + 28);

  ctx.fillStyle = palette.isLight ? '#1e0842' : '#ffffff';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.fillText(nta, VERTICAL_WIDTH / 2, ntaBoxY + 66);

  // 7. Kwartir & Krida Details
  let currentY = 660;

  if (options.showKwartirDetails) {
    const kwartirText = `${member.regencyName ? `Kwarcab ${member.regencyName}` : ''} • Kwarda ${member.provinceName}`;
    ctx.fillStyle = palette.isLight ? '#334155' : palette.accentLight;
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText(kwartirText, VERTICAL_WIDTH / 2, currentY);
    currentY += 28;

    if (member.krida) {
      const kridaText = `Krida Utama: ${member.krida}`;
      ctx.fillStyle = palette.gold;
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText(kridaText, VERTICAL_WIDTH / 2, currentY);
      currentY += 28;
    }
  }

  // 8. Top Skills Pills (if enabled)
  if (options.showSkills && member.skills && member.skills.length > 0) {
    const topSkills = member.skills.slice(0, 3).map(s => s.skillName);
    const skillsString = topSkills.join('  •  ');
    ctx.fillStyle = palette.isLight ? '#64748b' : palette.textMuted;
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(`Keahlian: ${skillsString}`, VERTICAL_WIDTH / 2, currentY);
    currentY += 26;
  }

  // 9. Large Scannable QR Code Box
  const qrBoxSize = 340;
  const qrBoxX = (VERTICAL_WIDTH - qrBoxSize) / 2;
  const qrBoxY = 780;

  // QR Container Card
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize + 85, 28);
  ctx.fill();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  // QR Image
  const qrImgSize = 280;
  const qrImgX = (VERTICAL_WIDTH - qrImgSize) / 2;
  const qrImgY = qrBoxY + 24;

  if (qrImg.complete && qrImg.width > 0) {
    ctx.drawImage(qrImg, qrImgX, qrImgY, qrImgSize, qrImgSize);
  }

  // QR Center Saka Badge
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    const centerLogoSize = 52;
    const centerLogoX = (VERTICAL_WIDTH - centerLogoSize) / 2;
    const centerLogoY = qrImgY + (qrImgSize - centerLogoSize) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerLogoX + centerLogoSize / 2, centerLogoY + centerLogoSize / 2, centerLogoSize / 2 + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.drawImage(logoImg, centerLogoX, centerLogoY, centerLogoSize, centerLogoSize);
  }

  // QR Label below code
  ctx.fillStyle = '#1e0842';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillText('PINDAI UNTUK PROFIL & PORTOFOLIO RESMI', VERTICAL_WIDTH / 2, qrBoxY + qrBoxSize + 32);

  ctx.fillStyle = '#6b7280';
  ctx.font = '12px monospace';
  ctx.fillText('Verifikasi KTA Digital Saka Pariwisata', VERTICAL_WIDTH / 2, qrBoxY + qrBoxSize + 55);

  // 10. Contact Info Banner at Bottom (Optional)
  const contactY = 1240;
  if (options.showContactPhone || options.showEmail) {
    const contactParts: string[] = [];
    if (options.showContactPhone && member.phone) contactParts.push(`WA: ${member.phone}`);
    if (options.showEmail && member.email) contactParts.push(member.email);

    if (contactParts.length > 0) {
      ctx.fillStyle = palette.cardBg;
      roundRect(ctx, 80, contactY, VERTICAL_WIDTH - 160, 46, 23);
      ctx.fill();
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = palette.isLight ? '#1e0842' : palette.textLight;
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(contactParts.join('   |   '), VERTICAL_WIDTH / 2, contactY + 28);
    }
  }

  // 11. Security Footer Watermark
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.45)';
  ctx.font = '11px monospace';
  ctx.fillText('OFFICIAL DIGITAL CREDENTIAL • KWARTIR NASIONAL GERAKAN PRAMUKA', VERTICAL_WIDTH / 2, 1340);
  ctx.fillText(`TOKEN VERIFIKASI: ${member.verificationToken || member.id.slice(0, 16).toUpperCase()}`, VERTICAL_WIDTH / 2, 1360);

  return canvas;
}

/**
 * Render Horizontal Networking Card onto HTML5 Canvas
 */
export async function renderHorizontalBadgeCanvas(
  member: Member,
  options: BadgeOptions = DEFAULT_BADGE_OPTIONS
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = HORIZONTAL_WIDTH;
  canvas.height = HORIZONTAL_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const palette = getBadgePalette(options.theme);
  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = getMemberVerificationUrl(member);

  const [avatarImg, logoImg, bgImg, qrDataUrl] = await Promise.all([
    loadImage(member.avatarUrl),
    loadSakaLogo(),
    loadBgImage(),
    generateQrDataUrl(verificationUrl, palette.qrDark, '#ffffff')
  ]);

  const qrImg = await loadImage(qrDataUrl);

  // 1. Clip Rounded Outer Card
  roundRect(ctx, 0, 0, HORIZONTAL_WIDTH, HORIZONTAL_HEIGHT, 36);
  ctx.clip();

  // 2. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, HORIZONTAL_WIDTH, HORIZONTAL_HEIGHT);
  grad.addColorStop(0, palette.bgGradient[0]);
  grad.addColorStop(0.5, palette.bgGradient[1]);
  grad.addColorStop(1, palette.bgGradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, HORIZONTAL_WIDTH, HORIZONTAL_HEIGHT);

  // 2b. Background Watermark
  if (bgImg && (bgImg.naturalWidth > 0 || bgImg.width > 0)) {
    ctx.save();
    ctx.globalAlpha = palette.isLight ? 0.05 : 0.08;
    ctx.drawImage(bgImg, 0, 0, HORIZONTAL_WIDTH, HORIZONTAL_HEIGHT);
    ctx.restore();
  }

  // 2c. Outer Border
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 5;
  roundRect(ctx, 2.5, 2.5, HORIZONTAL_WIDTH - 5, HORIZONTAL_HEIGHT - 5, 36);
  ctx.stroke();

  // 3. Header Banner
  const headerY = 32;
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, 48, headerY, 68, 68);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.gold;
  ctx.font = 'bold 14px "Inter", sans-serif';
  ctx.fillText((options.eventName || 'SAKA PARIWISATA • EVENT NETWORKING PASS').toUpperCase(), 130, headerY + 24);

  ctx.fillStyle = palette.isLight ? '#1e0842' : '#ffffff';
  ctx.font = '900 22px "Inter", sans-serif';
  ctx.fillText('SATUAN KARYA PRAMUKA PARIWISATA', 130, headerY + 50);

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillText('Kwartir Nasional Gerakan Pramuka', 130, headerY + 70);

  // Verified Badge Header Right
  ctx.fillStyle = palette.badgePillBg;
  roundRect(ctx, HORIZONTAL_WIDTH - 240, headerY + 12, 190, 36, 18);
  ctx.fill();
  ctx.fillStyle = palette.badgePillText;
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Inter", sans-serif';
  ctx.fillText('✓ ANGGOTA TERVERIFIKASI', HORIZONTAL_WIDTH - 145, headerY + 35);

  // Header Divider
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 116);
  ctx.lineTo(HORIZONTAL_WIDTH - 48, 116);
  ctx.stroke();

  // 4. Left Column: Avatar & Main Profile Details (Width ~ 680px)
  const avatarSize = 170;
  const avatarX = 48;
  const avatarY = 150;

  ctx.save();
  roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize * 1.25, 20);
  ctx.clip();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize * 1.25);
  if (avatarImg.complete && avatarImg.width > 0) {
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize * 1.25);
  }
  ctx.restore();

  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 3.5;
  roundRect(ctx, avatarX, avatarY, avatarSize, avatarSize * 1.25, 20);
  ctx.stroke();

  // Profile Details to the right of Avatar
  const infoX = 245;
  ctx.textAlign = 'left';

  // NTA Box
  ctx.fillStyle = palette.cardBg;
  roundRect(ctx, infoX, 150, 480, 56, 14);
  ctx.fill();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = palette.gold;
  ctx.font = 'bold 11px "Inter", sans-serif';
  ctx.fillText('NOMOR TANDA ANGGOTA (NTA)', infoX + 16, 172);

  ctx.fillStyle = palette.isLight ? '#1e0842' : '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(nta, infoX + 16, 196);

  // Full Name
  ctx.fillStyle = palette.isLight ? '#0f172a' : '#ffffff';
  ctx.font = '900 30px "Inter", sans-serif';
  ctx.fillText(member.fullName.toUpperCase(), infoX, 245, 480);

  // Position
  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.fillText((member.currentPosition || 'Anggota Saka Pariwisata').toUpperCase(), infoX, 278, 480);

  // Kwartir & Krida
  ctx.fillStyle = palette.isLight ? '#334155' : palette.textLight;
  ctx.font = '15px "Inter", sans-serif';
  const kwartirLine = `${member.regencyName ? `Kwarcab ${member.regencyName}` : ''} • Kwarda ${member.provinceName}`;
  ctx.fillText(kwartirLine, infoX, 310, 480);

  if (member.krida) {
    ctx.fillStyle = palette.gold;
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText(`Krida: ${member.krida}`, infoX, 336, 480);
  }

  // Skills
  if (options.showSkills && member.skills && member.skills.length > 0) {
    const skillsList = member.skills.slice(0, 3).map(s => s.skillName).join('  •  ');
    ctx.fillStyle = palette.isLight ? '#64748b' : palette.textMuted;
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText(`Keahlian: ${skillsList}`, infoX, 362, 480);
  }

  // 5. Right Column: Large QR Code Box (Width ~ 380px)
  const qrBoxW = 380;
  const qrBoxH = 460;
  const qrBoxX = HORIZONTAL_WIDTH - 48 - qrBoxW;
  const qrBoxY = 150;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 24);
  ctx.fill();
  ctx.strokeStyle = palette.gold;
  ctx.lineWidth = 3;
  ctx.stroke();

  // QR Code Image
  const qrImgSize = 280;
  const qrImgX = qrBoxX + (qrBoxW - qrImgSize) / 2;
  const qrImgY = qrBoxY + 25;

  if (qrImg.complete && qrImg.width > 0) {
    ctx.drawImage(qrImg, qrImgX, qrImgY, qrImgSize, qrImgSize);
  }

  // Center Logo
  if (logoImg.complete && logoImg.naturalWidth > 0) {
    const centerLogoSize = 48;
    const centerLogoX = qrImgX + (qrImgSize - centerLogoSize) / 2;
    const centerLogoY = qrImgY + (qrImgSize - centerLogoSize) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerLogoX + centerLogoSize / 2, centerLogoY + centerLogoSize / 2, centerLogoSize / 2 + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(logoImg, centerLogoX, centerLogoY, centerLogoSize, centerLogoSize);
  }

  // Text below QR
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e0842';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillText('PINDAI VERIFIKASI RESMI', qrBoxX + qrBoxW / 2, qrBoxY + 340);

  ctx.fillStyle = '#6b7280';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillText('Scan dengan Smartphone / Google Lens', qrBoxX + qrBoxW / 2, qrBoxY + 365);
  ctx.fillText('untuk portofolio & kontak', qrBoxX + qrBoxW / 2, qrBoxY + 385);

  ctx.fillStyle = '#1e0842';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`NTA: ${nta}`, qrBoxX + qrBoxW / 2, qrBoxY + 420);

  // 6. Bottom Bar / Contact Information
  const bottomBarY = 640;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, bottomBarY);
  ctx.lineTo(HORIZONTAL_WIDTH - 48, bottomBarY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = palette.isLight ? '#334155' : palette.textLight;
  ctx.font = 'bold 13px "Inter", sans-serif';

  const contactList: string[] = [];
  if (options.showContactPhone && member.phone) contactList.push(`WhatsApp: ${member.phone}`);
  if (options.showEmail && member.email) contactList.push(`Email: ${member.email}`);
  contactList.push(`Pangkalan: ${member.branchName || member.gugusDepan}`);

  ctx.fillText(contactList.join('   •   '), 48, bottomBarY + 35);

  ctx.textAlign = 'right';
  ctx.fillStyle = palette.isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.5)';
  ctx.font = '11px monospace';
  ctx.fillText('KARTU PENGENAL JEJARING RESMI SAKA PARIWISATA', HORIZONTAL_WIDTH - 48, bottomBarY + 35);

  return canvas;
}

/**
 * Download Badge as High-Resolution PNG
 */
export async function downloadBadgePng(
  member: Member,
  options: BadgeOptions = DEFAULT_BADGE_OPTIONS
): Promise<void> {
  const canvas = options.format === 'VERTICAL_LANYARD'
    ? await renderVerticalLanyardCanvas(member, options)
    : await renderHorizontalBadgeCanvas(member, options);

  const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
  const filename = `Badge-Networking-SakaPariwisata-${cleanNta}-${cleanName}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download Badge as Printable PDF (A6 or Standard Page)
 */
export async function downloadBadgePdf(
  member: Member,
  options: BadgeOptions = DEFAULT_BADGE_OPTIONS
): Promise<void> {
  const canvas = options.format === 'VERTICAL_LANYARD'
    ? await renderVerticalLanyardCanvas(member, options)
    : await renderHorizontalBadgeCanvas(member, options);

  const imgData = canvas.toDataURL('image/png', 1.0);

  if (options.format === 'VERTICAL_LANYARD') {
    // Standard A6 Vertical Badge Card (105 mm x 148 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
    });

    const a6Width = 105;
    const a6Height = 148;

    doc.addImage(imgData, 'PNG', 0, 0, a6Width, a6Height, undefined, 'FAST');

    const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
    doc.save(`Badge-Pass-SakaPariwisata-${cleanNta}-${cleanName}-A6.pdf`);
  } else {
    // A5 Horizontal Card (210 mm x 148 mm)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    const a5Width = 210;
    const a5Height = 148;

    doc.addImage(imgData, 'PNG', 0, 0, a5Width, a5Height, undefined, 'FAST');

    const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
    doc.save(`Badge-Networking-SakaPariwisata-${cleanNta}-${cleanName}-A5.pdf`);
  }
}
