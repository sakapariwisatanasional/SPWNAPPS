import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Member, KtaCardSettings } from '../types';
import { DEFAULT_KTA_SETTINGS } from './storage';
import { 
  SAKA_LOGO_URL, 
  SAKA_LOGO_DRIVE_DIRECT_URL,
  SAKA_CARD_BG_DRIVE_DIRECT_URL,
  SAKA_CARD_BG_FALLBACK_URL,
  formatDriveImageUrl,
  getDriveDirectFallbackUrl
} from '../components/common/SakaLogo';

// Global Standard ISO/IEC 7810 ID-1 Dimensions (CR80)
export const CR80_WIDTH_MM = 85.60;
export const CR80_HEIGHT_MM = 53.98;
export const CR80_CORNER_RADIUS_MM = 3.18;

// Canvas render resolution (300+ DPI equivalent for CR80 card: 1012px x 638px)
const CANVAS_WIDTH = 1012;
const CANVAS_HEIGHT = 638;

export type KtaPdfFormat = 'CR80_STANDARD' | 'A4_PRINT_SHEET';

/**
 * Safely load an image from URL or data URI with fallback
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src) {
      const fallbackImg = new Image();
      resolve(fallbackImg);
      return;
    }

    const primaryUrl = formatDriveImageUrl(src) || src;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // In case of CORS or Google Drive error, attempt direct UC fallback
      const fallbackUrl = getDriveDirectFallbackUrl(src);
      if (fallbackUrl && fallbackUrl !== primaryUrl) {
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => {
          // Retry without CORS
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
 * Generate QR Code as high-resolution data URL
 */
async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 1,
      color: {
        dark: '#1e0842',
        light: '#ffffff'
      }
    });
  } catch {
    return '';
  }
}

/**
 * Load the exact authentic Saka Pariwisata logo image matching the preview
 */
async function loadOfficialSakaLogo(): Promise<HTMLImageElement> {
  // 1. Try local public logo first
  try {
    const localImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0) resolve(img);
        else reject(new Error('Empty local logo'));
      };
      img.onerror = () => reject(new Error('Failed local logo'));
      img.src = SAKA_LOGO_URL;
    });
    return localImg;
  } catch {
    // 2. Fallback to direct cloud asset
    try {
      const driveImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (img.naturalWidth > 0) resolve(img);
          else reject(new Error('Empty drive logo'));
        };
        img.onerror = () => reject(new Error('Failed drive logo'));
        img.src = SAKA_LOGO_DRIVE_DIRECT_URL;
      });
      return driveImg;
    } catch {
      // 3. Fallback placeholder if offline
      const fallbackSvg = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getSakaLogoSvg())}`;
      return await loadImage(fallbackSvg);
    }
  }
}

/**
 * Load Card Background Image from Settings or Default Drive URL
 */
async function loadCardBgImage(url?: string): Promise<HTMLImageElement | null> {
  const rawUrl = url || SAKA_CARD_BG_DRIVE_DIRECT_URL;
  if (!rawUrl) return null;
  const targetUrl = formatDriveImageUrl(rawUrl);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => {
        if (el.naturalWidth > 0) resolve(el);
        else reject(new Error('Empty bg'));
      };
      el.onerror = () => {
        // Retry with fallback URL without crossOrigin if CORS issues occur
        const retryEl = new Image();
        retryEl.onload = () => resolve(retryEl);
        retryEl.onerror = () => resolve(el);
        retryEl.src = SAKA_CARD_BG_FALLBACK_URL;
      };
      el.src = targetUrl;
    });
    return img;
  } catch {
    return null;
  }
}

/**
 * Generates an SVG string representation for the official Saka logo for emergency offline fallback
 */
function getSakaLogoSvg(): string {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M 100 8 L 188 72 L 154 184 L 46 184 L 12 72 Z" fill="#2e1065" stroke="#e9d5ff" stroke-width="6"/>
      <path d="M 100 22 L 174 76 L 146 170 L 54 170 L 26 76 Z" fill="#4c1d95" stroke="#fbbf24" stroke-width="4"/>
      <circle cx="100" cy="98" r="42" fill="#6b21a8" stroke="#ffffff" stroke-width="3"/>
      <path d="M 100 68 L 108 90 L 132 90 L 112 104 L 120 126 L 100 112 L 80 126 L 88 104 L 68 90 L 92 90 Z" fill="#fbbf24"/>
      <path d="M 85 142 Q 100 134 115 142" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>
  `;
}

/**
 * Draw image with aspect ratio fit
 */
function drawFitImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!img.complete || w === 0 || h === 0) return;

  const imgAspect = w / h;
  const targetAspect = maxWidth / maxHeight;

  let drawW = maxWidth;
  let drawH = maxHeight;
  let drawX = x;
  let drawY = y;

  if (imgAspect > targetAspect) {
    drawH = maxWidth / imgAspect;
    drawY = y + (maxHeight - drawH) / 2;
  } else {
    drawW = maxHeight * imgAspect;
    drawX = x + (maxWidth - drawW) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/**
 * Helper to draw rounded rectangle path
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
 * Helper to wrap text cleanly in Canvas 2D
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

/**
 * Draw crisp barcode into canvas
 */
function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string
) {
  // White background container
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, width, height, 8);
  ctx.fill();

  const cleanVal = (value || 'SAKA-2026').toUpperCase();
  const pattern: number[] = [2, 1, 1, 2];
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    pattern.push(((code * 3 + 1) % 3) + 1);
    pattern.push(((code * 7 + 2) % 2) + 1);
    pattern.push(((code * 5 + 3) % 3) + 1);
    pattern.push(((code * 2 + 1) % 2) + 1);
  }
  pattern.push(2, 1, 2, 1, 2);

  const totalUnits = pattern.reduce((acc, curr) => acc + curr, 0);
  const paddingX = 14;
  const paddingY = 6;
  const barAreaWidth = width - (paddingX * 2);
  const barAreaHeight = height - (paddingY * 2);
  const unitWidth = barAreaWidth / totalUnits;

  let currentX = x + paddingX;
  ctx.fillStyle = '#0f172a';

  pattern.forEach((w, idx) => {
    const barW = w * unitWidth;
    if (idx % 2 === 0) {
      ctx.fillRect(currentX, y + paddingY, barW, barAreaHeight);
    }
    currentX += barW;
  });
}

/**
 * Get Color Palette for theme
 */
function getThemePalette(themeName?: string) {
  switch (themeName) {
    case 'emerald_pesona':
      return {
        frontGrad: ['#064e3b', '#022c22', '#0f172a'],
        backGrad: ['#022c22', '#064e3b', '#0f172a'],
        accent: '#6ee7b7',
        accentLight: '#a7f3d0',
        badgeBg: '#34d399',
        badgeText: '#022c22',
        boxBg: 'rgba(6, 78, 59, 0.85)',
        border: 'rgba(52, 211, 153, 0.45)'
      };
    case 'indigo_navy':
      return {
        frontGrad: ['#1e3a8a', '#1e1b4b', '#0f172a'],
        backGrad: ['#1e1b4b', '#1e3a8a', '#0f172a'],
        accent: '#93c5fd',
        accentLight: '#bfdbfe',
        badgeBg: '#60a5fa',
        badgeText: '#1e1b4b',
        boxBg: 'rgba(30, 27, 75, 0.85)',
        border: 'rgba(96, 165, 250, 0.45)'
      };
    case 'dark_slate':
      return {
        frontGrad: ['#334155', '#0f172a', '#000000'],
        backGrad: ['#000000', '#1e293b', '#0f172a'],
        accent: '#cbd5e1',
        accentLight: '#e2e8f0',
        badgeBg: '#f8fafc',
        badgeText: '#0f172a',
        boxBg: 'rgba(30, 41, 59, 0.85)',
        border: 'rgba(148, 163, 184, 0.45)'
      };
    case 'gold_amber':
      return {
        frontGrad: ['#78350f', '#292524', '#000000'],
        backGrad: ['#000000', '#451a03', '#1c1917'],
        accent: '#fcd34d',
        accentLight: '#fde68a',
        badgeBg: '#fbbf24',
        badgeText: '#451a03',
        boxBg: 'rgba(69, 26, 3, 0.85)',
        border: 'rgba(251, 191, 36, 0.45)'
      };
    case 'purple_saka':
    default:
      return {
        frontGrad: ['#3b0764', '#1e1b4b', '#0f172a'],
        backGrad: ['#0f172a', '#2e1065', '#1e1b4b'],
        accent: '#d8b4fe',
        accentLight: '#e9d5ff',
        badgeBg: '#c084fc',
        badgeText: '#2e1065',
        boxBg: 'rgba(59, 7, 100, 0.85)',
        border: 'rgba(192, 132, 252, 0.45)'
      };
  }
}

/**
 * Render Front Side of KTA onto a 300+ DPI HTML5 Canvas
 */
async function renderFrontCardCanvas(
  member: Member,
  settings: KtaCardSettings,
  logoImg: HTMLImageElement,
  avatarImg: HTMLImageElement,
  qrImg: HTMLImageElement,
  bgImg: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const theme = getThemePalette(settings.cardTheme);

  // 1. Clip Rounded Card Boundary
  roundRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 36);
  ctx.clip();

  // 2. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, theme.frontGrad[0]);
  grad.addColorStop(0.6, theme.frontGrad[1]);
  grad.addColorStop(1, theme.frontGrad[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2b. Custom Background Artwork Image (10% Default Opacity)
  if (bgImg && (bgImg.naturalWidth > 0 || bgImg.width > 0)) {
    ctx.save();
    ctx.globalAlpha = settings.bgOpacity ?? 0.10;
    ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  // 2c. Ambient Glow Accents (matching UI preview)
  ctx.save();
  const glow1 = ctx.createRadialGradient(CANVAS_WIDTH - 60, -30, 10, CANVAS_WIDTH - 60, -30, 240);
  glow1.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
  glow1.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(CANVAS_WIDTH - 300, 0, 300, 300);

  const glow2 = ctx.createRadialGradient(0, CANVAS_HEIGHT, 10, 0, CANVAS_HEIGHT, 220);
  glow2.addColorStop(0, 'rgba(99, 102, 241, 0.20)');
  glow2.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, CANVAS_HEIGHT - 300, 300, 300);
  ctx.restore();

  // 4. Border around card
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4, 36);
  ctx.stroke();

  // 5. Header Area
  // 5a. Logo
  if (logoImg.complete && (logoImg.naturalWidth > 0 || logoImg.width > 0)) {
    drawFitImage(ctx, logoImg, 48, 30, 78, 80);
  }

  // 5b. Header Titles
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 25px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(
    (settings.frontOrganizationTitle || 'SAKA PARIWISATA').toUpperCase(),
    140,
    64
  );

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 16px "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(
    (settings.frontOrganizationSubtitle || 'GERAKAN PRAMUKA INDONESIA').toUpperCase(),
    140,
    92
  );

  // 5c. Status Badge (Right side)
  const badgeText = member.status === 'ACTIVE' ? 'KTA AKTIF' : member.status;
  ctx.font = 'bold 14px "Inter", sans-serif';
  const badgeWidth = Math.max(120, ctx.measureText(badgeText).width + 36);
  const badgeX = CANVAS_WIDTH - 48 - badgeWidth;

  ctx.fillStyle = theme.badgeBg;
  roundRect(ctx, badgeX, 36, badgeWidth, 32, 16);
  ctx.fill();

  ctx.fillStyle = theme.badgeText;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeWidth / 2, 57);

  // 5d. Province Text
  ctx.fillStyle = theme.accentLight;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(member.provinceName, CANVAS_WIDTH - 48, 94);

  // 6. Header Divider Line
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 122);
  ctx.lineTo(CANVAS_WIDTH - 48, 122);
  ctx.stroke();

  // 7. Body Section (Vertically balanced from Y=136 to Y=550)
  // Available height is 414px, vertical center is Y=343
  const bodyCenterY = 343;

  // 7a. Photo Section (Left: 48, Y=220, 196 x 245)
  const photoW = 196;
  const photoH = 245;
  const photoX = 48;
  const photoY = Math.round(bodyCenterY - photoH / 2); // 220

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 18);
  ctx.clip();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (avatarImg.complete && avatarImg.width > 0) {
    ctx.drawImage(avatarImg, photoX, photoY, photoW, photoH);
  }
  ctx.restore();

  // Photo Frame Border
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 3.5;
  roundRect(ctx, photoX, photoY, photoW, photoH, 18);
  ctx.stroke();

  // Verified Green Checkmark Badge
  const checkX = photoX + photoW - 14;
  const checkY = photoY + photoH - 14;
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(checkX, checkY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✓', checkX, checkY + 5);

  // 7b. QR Code Box (Right Side: 172 x 214)
  const qrBoxW = 172;
  const qrBoxH = 214;
  const qrBoxX = CANVAS_WIDTH - 48 - qrBoxW;
  const qrBoxY = Math.round(bodyCenterY - qrBoxH / 2); // 236

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 18);
  ctx.fill();
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (qrImg.complete && qrImg.width > 0) {
    ctx.drawImage(qrImg, qrBoxX + 13, qrBoxY + 12, 146, 146);
  }

  ctx.fillStyle = '#1e0842';
  ctx.font = 'bold 11px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PINDAI VERIFIKASI', qrBoxX + qrBoxW / 2, qrBoxY + 188);

  // 7c. Identity & Member Data (Center: between photo and QR box)
  // Urutan Sesuai Ketentuan: 1. [Nomor urut anggota], 2. [Nama Lengkap], 3. [Jabatan], 4. [Kwartir]
  const infoX = 268;
  const infoMaxW = qrBoxX - infoX - 20; // ~506px
  ctx.textAlign = 'left';

  // 1. [Nomor Urut Anggota] Container Box
  const ntaBoxY = 200;
  const ntaBoxW = infoMaxW;
  const ntaBoxH = 60;
  ctx.fillStyle = theme.boxBg;
  roundRect(ctx, infoX, ntaBoxY, ntaBoxW, ntaBoxH, 12);
  ctx.fill();
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 11px "Inter", sans-serif';
  ctx.fillText('NOMOR URUT ANGGOTA (NTA)', infoX + 14, ntaBoxY + 20);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(
    member.nationalMemberNumber || 'MENUNGGU VERIFIKASI',
    infoX + 14,
    ntaBoxY + 47
  );

  // 2. [Nama Lengkap dari Anggota]
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 25px "Inter", -apple-system, sans-serif';
  ctx.fillText(member.fullName.toUpperCase(), infoX, 296, infoMaxW);

  // 3. [Jabatan dari Anggota]
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 18px "Inter", sans-serif';
  ctx.fillText(
    (member.currentPosition || 'Anggota Saka Pariwisata').toUpperCase(),
    infoX,
    334,
    infoMaxW
  );

  // 4. [Kwartir Nasional/Daerah/Cabang]
  const isNasional = member.provinceId === '00' || member.provinceName?.toLowerCase().includes('nasional');
  if (isNasional) {
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('Kwartir Nasional Gerakan Pramuka', infoX, 374, infoMaxW);
    ctx.fillStyle = theme.accentLight;
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('Pimpinan Saka Pariwisata Tingkat Nasional', infoX, 404, infoMaxW);
  } else {
    const kwartirCabangText = member.regencyName ? `Kwartir Cabang ${member.regencyName}` : '';
    const kwartirDaerahText = member.provinceName ? `Kwartir Daerah ${member.provinceName}` : '';

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText(
      kwartirCabangText || kwartirDaerahText || 'Kwartir Nasional Gerakan Pramuka',
      infoX,
      374,
      infoMaxW
    );

    if (kwartirCabangText && kwartirDaerahText) {
      ctx.fillStyle = theme.accentLight;
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText(kwartirDaerahText, infoX, 404, infoMaxW);
    }
  }

  // 8. Footer Section
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 560);
  ctx.lineTo(CANVAS_WIDTH - 48, 560);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = theme.accentLight;
  ctx.font = '14px monospace';
  ctx.fillText(
    settings.frontValidityText || 'Masa Berlaku: Selama Menjadi Anggota Aktif',
    48,
    594
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('ISO/IEC 7810 ID-1 STANDARD', CANVAS_WIDTH - 48, 594);

  return canvas;
}

/**
 * Render Back Side of KTA onto a 300+ DPI HTML5 Canvas
 */
async function renderBackCardCanvas(
  member: Member,
  settings: KtaCardSettings,
  logoImg: HTMLImageElement,
  bgImg: HTMLImageElement | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const theme = getThemePalette(settings.cardTheme);

  // 1. Clip Rounded Card Boundary
  roundRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 36);
  ctx.clip();

  // 2. Background Gradient
  const grad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  grad.addColorStop(0, theme.backGrad[0]);
  grad.addColorStop(0.5, theme.backGrad[1]);
  grad.addColorStop(1, theme.backGrad[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2b. Custom Background Artwork Image (10% Default Opacity)
  if (bgImg && (bgImg.naturalWidth > 0 || bgImg.width > 0)) {
    ctx.save();
    ctx.globalAlpha = (settings.bgOpacity ?? 0.10) * 0.85;
    ctx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  // 4. Border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 4;
  roundRect(ctx, 2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4, 36);
  ctx.stroke();

  // 5. Back Header Area
  if (logoImg.complete && (logoImg.naturalWidth > 0 || logoImg.width > 0)) {
    drawFitImage(ctx, logoImg, 48, 26, 58, 62);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 21px "Inter", -apple-system, sans-serif';
  ctx.fillText(
    (settings.backHeaderTitle || 'KETENTUAN KTA DIGITAL SAKA PARIWISATA').toUpperCase(),
    120,
    54
  );

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText(
    settings.backHeaderSubtitle || 'Kwartir Nasional Gerakan Pramuka',
    120,
    78
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = theme.accentLight;
  ctx.font = 'bold 13px monospace';
  ctx.fillText('STANDARD CR80 / ID-1', CANVAS_WIDTH - 48, 60);

  // Divider Line
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 102);
  ctx.lineTo(CANVAS_WIDTH - 48, 102);
  ctx.stroke();

  // 6. Terms Body
  const termsList =
    settings.terms && settings.terms.length > 0
      ? settings.terms
      : [
          '1. Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata tingkat Nasional.',
          '2. Keaslian data kartu dapat diverifikasi kapan pun secara publik melalui pemindaian QR Code di bagian depan.',
          '3. Anggota wajib menjunjung tinggi Tri Satya, Dasa Darma Pramuka, serta Sapta Pesona Pariwisata Indonesia.',
          '4. Apabila menemukan kartu ini tercecer, harap diserahkan ke Sekretariat Kwartir terdekat.'
        ];

  ctx.textAlign = 'left';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '17px "Inter", sans-serif';
  let termY = 136;
  const maxTermWidth = CANVAS_WIDTH - 96;

  termsList.forEach((term) => {
    termY = wrapText(ctx, term, 48, termY, maxTermWidth, 26);
    termY += 10;
  });

  // 7. Footer Divider
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 452);
  ctx.lineTo(CANVAS_WIDTH - 48, 452);
  ctx.stroke();

  // 8. Footer Left: Member ID & Registration Info
  ctx.textAlign = 'left';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px "Inter", sans-serif';

  ctx.fillText('ID Anggota: ', 48, 486);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(member.id, 140, 486);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText('Terdaftar: ', 48, 518);
  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 15px "Inter", sans-serif';
  const regDateFormatted = new Date(member.registeredAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  ctx.fillText(regDateFormatted, 130, 518);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText('Wilayah: ', 48, 550);
  ctx.fillStyle = '#ffffff';
  ctx.font = '15px "Inter", sans-serif';
  ctx.fillText(`${member.regencyName}, ${member.provinceName}`, 120, 550);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px "Inter", sans-serif';
  ctx.fillText('Otorisasi Resmi Kwartir Nasional Gerakan Pramuka', 48, 582);

  // 9. Footer Right: Issue Date, Barcode, Signer Info
  const rightBoxW = 280;
  const rightBoxX = CANVAS_WIDTH - 48 - rightBoxW;
  const centerSignX = rightBoxX + rightBoxW / 2;
  ctx.textAlign = 'center';

  // Issue location/date
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText(
    settings.issueLocationDate || 'Jakarta, 14 Agustus 2026',
    centerSignX,
    480
  );

  // Barcode Box
  drawBarcode(
    ctx,
    rightBoxX,
    492,
    rightBoxW,
    46,
    settings.barcodeCustomValue || member.nationalMemberNumber || member.id
  );

  // Signer Name & Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.fillText(settings.signerName || 'Rohadi Wijaya', centerSignX, 564);

  ctx.fillStyle = theme.accent;
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillText(
    settings.signerTitle || 'Ketua Pimpinan Saka Pariwisata Nasional',
    centerSignX,
    586
  );

  return canvas;
}

export interface GenerateKtaOptions {
  member: Member;
  settings?: KtaCardSettings;
  format?: KtaPdfFormat;
  onProgress?: (step: string) => void;
}

/**
 * Main function to generate standard ISO/IEC 7810 ID-1 KTA PDF without CSS / oklch issues
 */
export async function generateKtaPdf({
  member,
  settings = DEFAULT_KTA_SETTINGS,
  format = 'CR80_STANDARD',
  onProgress
}: GenerateKtaOptions): Promise<jsPDF> {
  if (onProgress) onProgress('Mempersiapkan data dan aset KTA...');

  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = `${window.location.origin}/?verifyId=${encodeURIComponent(nta)}&tab=verify-portal`;

  const [qrDataUrl, avatarImg, logoImg, bgImg] = await Promise.all([
    generateQrDataUrl(verificationUrl),
    loadImage(member.avatarUrl),
    loadOfficialSakaLogo(),
    loadCardBgImage(settings.bgImageUrl)
  ]);

  const qrImg = await loadImage(qrDataUrl);

  if (onProgress) onProgress('Me-render tampilan KTA resolusi tinggi (300 DPI)...');

  // Render front and back canvases directly with Canvas 2D API
  const frontCanvas = await renderFrontCardCanvas(
    member,
    settings,
    logoImg,
    avatarImg,
    qrImg,
    bgImg
  );

  const backCanvas = await renderBackCardCanvas(member, settings, logoImg, bgImg);

  const frontImgData = frontCanvas.toDataURL('image/png');
  const backImgData = backCanvas.toDataURL('image/png');

  if (onProgress) onProgress('Menyusun berkas PDF sesuai standar ukuran global...');

  if (format === 'CR80_STANDARD') {
    // Direct CR80 (ISO/IEC 7810 ID-1) Plastic Card Dimensions: 85.60 mm x 53.98 mm
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [CR80_WIDTH_MM, CR80_HEIGHT_MM]
    });

    // Page 1: Front Side
    doc.addImage(frontImgData, 'PNG', 0, 0, CR80_WIDTH_MM, CR80_HEIGHT_MM, undefined, 'FAST');

    // Page 2: Back Side
    doc.addPage([CR80_WIDTH_MM, CR80_HEIGHT_MM], 'landscape');
    doc.addImage(backImgData, 'PNG', 0, 0, CR80_WIDTH_MM, CR80_HEIGHT_MM, undefined, 'FAST');

    return doc;
  } else {
    // A4 Sheet Layout (210 x 297 mm) with front & back side side-by-side or stacked, with cut/fold lines
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const a4Width = 210;
    const a4Height = 297;

    // Header Banner on A4
    doc.setFillColor(30, 8, 66);
    doc.rect(0, 0, a4Width, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('LEMBAR CETAK RESMI KTA SAKA PARIWISATA', a4Width / 2, 11, {
      align: 'center'
    });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(216, 180, 254);
    doc.text(
      'Standar Global ISO/IEC 7810 ID-1 (CR80: 85.60 mm × 53.98 mm) - Skala 100% (Actual Size)',
      a4Width / 2,
      18,
      { align: 'center' }
    );

    // Information Box
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nama Anggota: ${member.fullName.toUpperCase()}`, 15, 33);
    doc.text(`NTA: ${member.nationalMemberNumber || '-'}`, 15, 39);
    doc.text(`Wilayah: ${member.provinceName} / ${member.branchName}`, 15, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, a4Width - 15, 33, {
      align: 'right'
    });
    doc.text(
      'Instruksi: Cetak dengan opsi "Actual Size / 100%" (Jangan Scale/Fit)',
      a4Width - 15,
      39,
      { align: 'right' }
    );
    doc.text(
      'Gunakan kertas PVC Card / Photo Glossy 230-260 gsm lalu laminasi',
      a4Width - 15,
      45,
      { align: 'right' }
    );

    // Divider line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(15, 49, a4Width - 15, 49);

    // Card Positions on A4 (Side by Side)
    const cardY = 60;
    const frontX = 16;
    const backX = frontX + CR80_WIDTH_MM + 6; // 6mm gap

    // Front Card
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 8, 66);
    doc.text('SISI DEPAN (FRONT SIDE)', frontX + CR80_WIDTH_MM / 2, cardY - 3, {
      align: 'center'
    });
    doc.addImage(
      frontImgData,
      'PNG',
      frontX,
      cardY,
      CR80_WIDTH_MM,
      CR80_HEIGHT_MM,
      undefined,
      'FAST'
    );

    // Back Card
    doc.text('SISI BELAKANG (BACK SIDE)', backX + CR80_WIDTH_MM / 2, cardY - 3, {
      align: 'center'
    });
    doc.addImage(
      backImgData,
      'PNG',
      backX,
      cardY,
      CR80_WIDTH_MM,
      CR80_HEIGHT_MM,
      undefined,
      'FAST'
    );

    // Crop Marks for Front
    drawCropMarks(doc, frontX, cardY, CR80_WIDTH_MM, CR80_HEIGHT_MM);
    // Crop Marks for Back
    drawCropMarks(doc, backX, cardY, CR80_WIDTH_MM, CR80_HEIGHT_MM);

    // Center fold guide
    const foldX = frontX + CR80_WIDTH_MM + 3;
    doc.setDrawColor(168, 85, 247);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(foldX, cardY - 4, foldX, cardY + CR80_HEIGHT_MM + 4);
    doc.setLineDashPattern([], 0);

    // Second layout for Vertical folding
    const cardY2 = cardY + CR80_HEIGHT_MM + 30;
    doc.setTextColor(30, 8, 66);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'PANDUAN MODEL LIPAT VERTIKAL (SIAP LAMINASI DUA SISI):',
      a4Width / 2,
      cardY2 - 6,
      { align: 'center' }
    );

    const centerCardX = (a4Width - CR80_WIDTH_MM) / 2;
    const frontY2 = cardY2;
    const backY2 = cardY2 + CR80_HEIGHT_MM;

    doc.addImage(
      frontImgData,
      'PNG',
      centerCardX,
      frontY2,
      CR80_WIDTH_MM,
      CR80_HEIGHT_MM,
      undefined,
      'FAST'
    );
    doc.addImage(
      backImgData,
      'PNG',
      centerCardX,
      backY2,
      CR80_WIDTH_MM,
      CR80_HEIGHT_MM,
      undefined,
      'FAST'
    );

    // Cut marks for vertical card
    drawCropMarks(doc, centerCardX, frontY2, CR80_WIDTH_MM, CR80_HEIGHT_MM * 2);

    // Fold line in between
    doc.setDrawColor(234, 88, 12);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(centerCardX - 4, backY2, centerCardX + CR80_WIDTH_MM + 4, backY2);
    doc.setLineDashPattern([], 0);

    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12);
    doc.text('--- Garis Lipat Tengah ---', centerCardX + CR80_WIDTH_MM / 2, backY2 - 1, {
      align: 'center'
    });

    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, a4Height - 18, a4Width, 18, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Sistem Informasi Terpadu Satuan Karya Pramuka Pariwisata Nasional',
      15,
      a4Height - 7
    );
    doc.text('Dokumen KTA Digital Sah & Terverifikasi Online', a4Width - 15, a4Height - 7, {
      align: 'right'
    });

    return doc;
  }
}

/**
 * Draw standard corner crop marks (garis potong) for print precision
 */
function drawCropMarks(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.25);
  const markLen = 4;
  const offset = 1.5;

  // Top-Left
  doc.line(x - offset - markLen, y, x - offset, y);
  doc.line(x, y - offset - markLen, x, y - offset);

  // Top-Right
  doc.line(x + w + offset, y, x + w + offset + markLen, y);
  doc.line(x + w, y - offset - markLen, x + w, y - offset);

  // Bottom-Left
  doc.line(x - offset - markLen, y + h, x - offset, y + h);
  doc.line(x, y + h + offset, x, y + h + offset + markLen);

  // Bottom-Right
  doc.line(x + w + offset, y + h, x + w + offset + markLen, y + h);
  doc.line(x + w, y + h + offset, x + w, y + h + offset + markLen);
}

/**
 * Direct download helper for KTA PDF
 */
export async function downloadKtaPdfFile(
  member: Member,
  settings: KtaCardSettings = DEFAULT_KTA_SETTINGS,
  format: KtaPdfFormat = 'CR80_STANDARD',
  onProgress?: (step: string) => void
): Promise<void> {
  const doc = await generateKtaPdf({ member, settings, format, onProgress });
  const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const nta = member.nationalMemberNumber
    ? member.nationalMemberNumber.replace(/[^a-zA-Z0-9]/g, '-')
    : member.id;
  const fileName = `KTA-SakaPariwisata-${nta}-${cleanName}-${
    format === 'CR80_STANDARD' ? 'CR80' : 'A4'
  }.pdf`;
  doc.save(fileName);
}
