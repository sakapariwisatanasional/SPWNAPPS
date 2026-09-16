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

export const CR80_WIDTH_MM = 85.60;
export const CR80_HEIGHT_MM = 53.98;
export const CR80_CORNER_RADIUS_MM = 3.18;

// 300 DPI-equivalent render surface for the ISO/IEC 7810 ID-1 card.
const CANVAS_WIDTH = 1012;
const CANVAS_HEIGHT = 638;
const PREVIEW_WIDTH_PX = 380;
const PX_SCALE = CANVAS_WIDTH / PREVIEW_WIDTH_PX;

export type KtaPdfFormat = 'CR80_STANDARD' | 'A4_PRINT_SHEET';

type Side = 'FRONT' | 'BACK';

/**
 * KTA PDF renderer — single source of truth is KtaCardSettings.
 *
 * The renderer intentionally does NOT capture DigitalMemberCard DOM.
 * It renders the same designer model used by DigitalMemberCard:
 * backgrounds, logos, configured text/data fields, photo, QR, validity,
 * terms and signer information are all read from KtaCardSettings.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    if (!src) {
      resolve(new Image());
      return;
    }

    const primary = formatDriveImageUrl(src) || src;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = getDriveDirectFallbackUrl(src);
      if (fallback && fallback !== primary) {
        const retry = new Image();
        retry.crossOrigin = 'anonymous';
        retry.onload = () => resolve(retry);
        retry.onerror = () => {
          const raw = new Image();
          raw.onload = () => resolve(raw);
          raw.onerror = () => resolve(raw);
          raw.src = fallback;
        };
        retry.src = fallback;
        return;
      }

      const raw = new Image();
      raw.onload = () => resolve(raw);
      raw.onerror = () => resolve(raw);
      raw.src = primary;
    };
    img.src = primary;
  });
}

async function loadOfficialSakaLogo(): Promise<HTMLImageElement> {
  try {
    const local = await loadImage(SAKA_LOGO_URL);
    if (local.naturalWidth > 0) return local;
  } catch {}

  try {
    const drive = await loadImage(SAKA_LOGO_DRIVE_DIRECT_URL);
    if (drive.naturalWidth > 0) return drive;
  } catch {}

  return new Image();
}

async function loadCardBackground(url?: string): Promise<HTMLImageElement | null> {
  const source = url || SAKA_CARD_BG_DRIVE_DIRECT_URL;
  if (!source) return null;

  try {
    const img = await loadImage(source);
    if (img.naturalWidth > 0) return img;
  } catch {}

  if (SAKA_CARD_BG_FALLBACK_URL) {
    try {
      const fallback = await loadImage(SAKA_CARD_BG_FALLBACK_URL);
      if (fallback.naturalWidth > 0) return fallback;
    } catch {}
  }

  return null;
}

function pctX(value: number | undefined): number {
  return CANVAS_WIDTH * Number(value ?? 0) / 100;
}

function pctY(value: number | undefined): number {
  return CANVAS_HEIGHT * Number(value ?? 0) / 100;
}

function pctW(value: number | undefined): number {
  return CANVAS_WIDTH * Number(value ?? 0) / 100;
}

function pctH(value: number | undefined): number {
  return CANVAS_HEIGHT * Number(value ?? 0) / 100;
}

function fontWeight(value?: string): number {
  return ({
    normal: 400,
    medium: 500,
    bold: 700,
    black: 900
  } as Record<string, number>)[value || 'normal'] || 400;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const scale = Math.max(width / iw, height / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  const scale = Math.min(width / iw, height / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (width - dw) / 2, y + (height - dh) / 2, dw, dh);
}

function drawConfiguredImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cfg: any
) {
  if (!img || !img.naturalWidth) return;

  const x = pctX(cfg.x);
  const y = pctY(cfg.y);
  const width = pctW(cfg.width);
  const height = pctH(cfg.height);

  ctx.save();
  ctx.globalAlpha = Number(cfg.opacity ?? 1);

  if (cfg.objectFit === 'cover') {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    drawCoverImage(ctx, img, x, y, width, height);
  } else if (cfg.objectFit === 'fill') {
    ctx.drawImage(img, x, y, width, height);
  } else {
    drawContainImage(ctx, img, x, y, width, height);
  }

  ctx.restore();
}

function memberFieldValue(member: Member, field: string): string {
  const values: Record<string, unknown> = {
    fullName: member.fullName,
    id: member.id,
    nationalMemberNumber: member.nationalMemberNumber,
    currentPosition: member.currentPosition,
    provinceName: member.provinceName,
    regencyName: member.regencyName,
    districtName: member.districtName,
    kwartirName: (member as any).kwartirName,
    kwartirHierarchy: (member as any).kwartirHierarchy,
    branchName: (member as any).branchName,
    gugusDepan: (member as any).gugusDepan,
    krida: member.krida,
    phone: member.phone,
    email: member.email,
    joinYear: member.joinYear,
    status: member.status
  };
  const value = String(values[field] ?? '');

  if (field === 'currentPosition') {
    return value.toUpperCase();
  }

  if (field === 'provinceName') {
    return value.replace(/Kwartir Nasional/gi, 'KWARTIR NASIONAL').toUpperCase();
  }

  if (field === 'regencyName') {
    return value
      .replace(/KWARTIR NASIONAL\s*\(PUSAT\)/gi, 'TINGKAT NASIONAL')
      .replace(/^PUSAT NASIONAL$/i, 'TINGKAT NASIONAL')
      .toUpperCase();
  }

  if (field === 'districtName' && /^(nasional|pusat nasional)$/i.test(value.trim())) {
    return 'TINGKAT NASIONAL';
  }

  if (field === 'krida') {
    return value.toUpperCase();
  }

  return value;
}

function transformedText(text: string, cfg: any): string {
  if (cfg.textTransform === 'uppercase') return text.toUpperCase();
  if (cfg.textTransform === 'lowercase') return text.toLowerCase();
  return text;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cfg: any,
  fallbackColor: string,
  options: { uppercase?: boolean } = {}
) {
  if (!text) return 0;

  const x = pctX(cfg.x);
  const y = pctY(cfg.y);
  const width = pctW(cfg.width ?? 90);
  const size = Math.max(4, Number(cfg.fontSize ?? 8) * PX_SCALE);
  const lineHeight = Number(cfg.lineHeight ?? 1.2) * size;
  const align = cfg.align || 'left';
  const value = transformedText(
    options.uppercase ? text.toUpperCase() : text,
    cfg
  );

  ctx.save();
  ctx.fillStyle = cfg.color || fallbackColor;
  ctx.font = `${fontWeight(cfg.fontWeight)} ${size}px Arial, sans-serif`;
  const letterSpacing = Number(cfg.letterSpacing ?? 0) * PX_SCALE;
  void letterSpacing;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.globalAlpha = Number(cfg.opacity ?? 1);

  // Designer data fields are nowrap by default. Explicitly configured
  // multiline text is wrapped to the configured width.
  const shouldWrap = cfg.whiteSpace === 'normal' || cfg.wrap === true;
  const lines: string[] = [];

  if (!shouldWrap) {
    lines.push(value);
  } else {
    for (const paragraph of String(value).split(/\n/)) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines.push('');
        continue;
      }
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > width) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
    }
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight, width);
  });
  ctx.restore();
  return lines.length;
}

function drawDataFields(
  ctx: CanvasRenderingContext2D,
  member: Member,
  settings: KtaCardSettings,
  side: Side,
  fallbackColor: string
) {
  (settings.dataFields || [])
    .filter((field: any) => field.side === side && field.visible)
    .forEach((field: any) => {
      const raw = memberFieldValue(member, field.field);
      const text = field.showLabel && field.label
        ? `${field.label}: ${raw}`
        : raw;
      drawText(ctx, text, field, fallbackColor);
    });

  (settings.textElements || [])
    .filter((text: any) => text.side === side)
    .forEach((text: any) => {
      drawText(ctx, String(text.text || ''), text, fallbackColor);
    });
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  settings: KtaCardSettings,
  side: Side,
  image: HTMLImageElement | null
) {
  const color = side === 'FRONT'
    ? settings.customBackgroundColorFront || '#24105b'
    : settings.customBackgroundColorBack || '#24105b';

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (image?.naturalWidth) {
    ctx.save();
    drawCoverImage(ctx, image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Same dark overlay used by DigitalMemberCard.bgStyle().
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }

  // DigitalMemberCard has a second configurable black overlay.
  const opacity = Math.max(0, Math.min(1, Number(settings.bgOpacity ?? 0.1)));
  if (opacity > 0) {
    ctx.fillStyle = `rgba(0,0,0,${0.1 * opacity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 900,
    margin: 1,
    color: { dark: '#1e0842', light: '#ffffff' }
  });
}

function drawQr(
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  xPercent: number,
  yPercent: number,
  sizePercent: number,
  paddingPercent = 0,
  backgroundColor = '#ffffff',
  borderColor = 'transparent',
  borderWidth = 0,
  radius = 0
) {
  if (!qrImg || !qrImg.naturalWidth) return;

  // DigitalMemberCard sizes QR against the smaller card dimension.
  const side = Math.max(36, Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * sizePercent / 100);
  const x = pctX(xPercent);
  const y = pctY(yPercent);
  const padding = Math.max(0, Number(paddingPercent) * PX_SCALE);

  ctx.save();
  ctx.fillStyle = backgroundColor;
  roundedRect(ctx, x, y, side, side, radius);
  ctx.fill();

  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth * PX_SCALE;
    roundedRect(ctx, x, y, side, side, radius);
    ctx.stroke();
  }

  ctx.beginPath();
  roundedRect(ctx, x + padding, y + padding, side - padding * 2, side - padding * 2, Math.max(0, radius - padding));
  ctx.clip();
  ctx.drawImage(qrImg, x + padding, y + padding, side - padding * 2, side - padding * 2);
  ctx.restore();
}

function getVerificationValue(member: Member): string {
  return String(member.nationalMemberNumber || member.verificationToken || member.id || '');
}

async function loadSignerMember(settings: KtaCardSettings): Promise<Member | null> {
  const id = String((settings as any).signerMemberId || '').trim();
  if (!id) return null;

  try {
    const { storage } = await import('./storage');
    return storage.getMembers().find(m => String(m.id) === id) || null;
  } catch {
    return null;
  }
}

async function renderFront(
  member: Member,
  settings: KtaCardSettings,
  assets: {
    background: HTMLImageElement | null;
    officialLogo: HTMLImageElement;
    frontLogoImg: HTMLImageElement;
    backLogoImg: HTMLImageElement;
    avatar: HTMLImageElement;
    qrImg: HTMLImageElement;
    logos: Array<{ cfg: any; img: HTMLImageElement }>;
  }
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const radius = Number(settings.cornerRadiusMm || CR80_CORNER_RADIUS_MM) * CANVAS_WIDTH / Number(settings.widthMm || CR80_WIDTH_MM);
  ctx.save();
  roundedRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, radius);
  ctx.clip();

  drawBackground(ctx, settings, 'FRONT', assets.background);

  const frontLogos = assets.logos.filter(item => item.cfg.side === 'FRONT');
  if (frontLogos.length) {
    frontLogos.forEach(item => drawConfiguredImage(ctx, item.img, item.cfg));
  } else if (settings.frontLogoUrl) {
    drawConfiguredImage(ctx, assets.frontLogoImg?.naturalWidth ? assets.frontLogoImg : assets.officialLogo, {
      x: 4, y: 5, width: 10, height: 16, objectFit: 'contain', opacity: 1
    });
  } else {
    drawConfiguredImage(ctx, assets.officialLogo, { x: 4, y: 5, width: 10, height: 16, objectFit: 'contain', opacity: 1 });
  }

  drawText(ctx, settings.frontOrganizationTitle || '', {
    x: settings.frontOrganizationTitleX ?? 15,
    y: settings.frontOrganizationTitleY ?? 6,
    width: settings.frontOrganizationTitleWidth ?? 65,
    fontSize: settings.frontOrganizationTitleFontSize ?? 11,
    fontWeight: settings.frontOrganizationTitleFontWeight ?? 'bold',
    color: settings.frontOrganizationTitleColor ?? '#ffffff',
    align: settings.frontOrganizationTitleAlign ?? 'left',
    lineHeight: settings.frontOrganizationTitleLineHeight ?? 1.15,
    letterSpacing: settings.frontOrganizationTitleLetterSpacing ?? 0,
    whiteSpace: 'normal'
  }, '#ffffff', { uppercase: true });

  drawText(ctx, settings.frontOrganizationSubtitle || '', {
    x: settings.frontOrganizationSubtitleX ?? 15,
    y: settings.frontOrganizationSubtitleY ?? 12,
    width: settings.frontOrganizationSubtitleWidth ?? 70,
    fontSize: settings.frontOrganizationSubtitleFontSize ?? 8,
    fontWeight: settings.frontOrganizationSubtitleFontWeight ?? 'normal',
    color: settings.frontOrganizationSubtitleColor ?? '#e5e7eb',
    align: settings.frontOrganizationSubtitleAlign ?? 'left',
    lineHeight: settings.frontOrganizationSubtitleLineHeight ?? 1.2,
    letterSpacing: settings.frontOrganizationSubtitleLetterSpacing ?? 0,
    whiteSpace: 'normal'
  }, '#e5e7eb');

  if (settings.showPhoto !== false && assets.avatar.naturalWidth) {
    const x = pctX(settings.photoX ?? 4);
    const y = pctY(settings.photoY ?? 27);
    const w = pctW(settings.photoWidth ?? 22);
    const h = pctH(settings.photoHeight ?? 48);
    const r = Number(settings.photoRadius ?? 12) * PX_SCALE;

    ctx.save();
    ctx.fillStyle = '#1e293b';
    roundedRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.beginPath();
    roundedRect(ctx, x, y, w, h, r);
    ctx.clip();

    const fit = settings.photoObjectFit || 'cover';
    if (fit === 'contain') drawContainImage(ctx, assets.avatar, x, y, w, h);
    else if (fit === 'fill') ctx.drawImage(assets.avatar, x, y, w, h);
    else drawCoverImage(ctx, assets.avatar, x, y, w, h);
    ctx.restore();

    const borderWidth = Number(settings.photoBorderWidth ?? 2);
    if (borderWidth > 0) {
      ctx.save();
      ctx.strokeStyle = settings.photoBorderColor ?? '#ffffff';
      ctx.lineWidth = borderWidth * PX_SCALE;
      roundedRect(ctx, x, y, w, h, r);
      ctx.stroke();
      ctx.restore();
    }
  }

  if (settings.showQrCode !== false) {
    drawQr(
      ctx,
      assets.qrImg,
      Math.max(0, Math.min(100 - Number(settings.qrSize ?? 22), Number(settings.qrX ?? 78))),
      Math.max(0, Math.min(100 - Number(settings.qrSize ?? 22), Number(settings.qrY ?? 30))),
      Math.max(5, Math.min(60, Number(settings.qrSize ?? 22))),
      Math.max(0, Number((settings as any).qrPadding ?? 0)),
      String((settings as any).qrBackgroundColor || '#ffffff'),
      String((settings as any).qrBorderColor || 'transparent'),
      Number((settings as any).qrBorderWidth ?? 0),
      Number((settings as any).qrBorderRadius ?? 0)
    );
  }

  drawDataFields(ctx, member, settings, 'FRONT', '#e9d5ff');

  drawText(ctx, settings.frontValidityText || '', {
    x: (settings as any).frontValidityTextX ?? 4,
    y: (settings as any).frontValidityTextY ?? 92,
    width: (settings as any).frontValidityTextWidth ?? 92,
    fontSize: (settings as any).frontValidityTextFontSize ?? 7,
    fontWeight: (settings as any).frontValidityTextFontWeight ?? 'normal',
    color: (settings as any).frontValidityTextColor ?? '#ffffff',
    align: (settings as any).frontValidityTextAlign ?? 'left',
    lineHeight: (settings as any).frontValidityTextLineHeight ?? 1.2,
    letterSpacing: (settings as any).frontValidityTextLetterSpacing ?? 0,
    whiteSpace: 'normal'
  }, '#ffffff');

  // DigitalMemberCard intentionally does not render the old Krida badge.
  ctx.restore();
  return canvas;
}

async function renderBack(
  member: Member,
  settings: KtaCardSettings,
  assets: {
    background: HTMLImageElement | null;
    officialLogo: HTMLImageElement;
    frontLogoImg: HTMLImageElement;
    backLogoImg: HTMLImageElement;
    qrImg: HTMLImageElement;
    logos: Array<{ cfg: any; img: HTMLImageElement }>;
  },
  signerMember: Member | null
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const radius = Number(settings.cornerRadiusMm || CR80_CORNER_RADIUS_MM) * CANVAS_WIDTH / Number(settings.widthMm || CR80_WIDTH_MM);
  ctx.save();
  roundedRect(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, radius);
  ctx.clip();

  drawBackground(ctx, settings, 'BACK', assets.background);

  const backLogos = assets.logos.filter(item => item.cfg.side === 'BACK');
  if (backLogos.length) {
    backLogos.forEach(item => drawConfiguredImage(ctx, item.img, item.cfg));
  } else if (settings.backLogoUrl) {
    drawConfiguredImage(ctx, assets.backLogoImg?.naturalWidth ? assets.backLogoImg : assets.officialLogo, { x: 4, y: 3, width: 10, height: 16, objectFit: 'contain', opacity: 1 });
  }

  drawText(ctx, settings.backHeaderTitle || '', {
    x: (settings as any).backHeaderTitleX ?? 5,
    y: (settings as any).backHeaderTitleY ?? 6,
    width: (settings as any).backHeaderTitleWidth ?? 90,
    fontSize: (settings as any).backHeaderTitleFontSize ?? 11,
    fontWeight: (settings as any).backHeaderTitleFontWeight ?? 'bold',
    color: (settings as any).backHeaderTitleColor ?? '#ffffff',
    align: (settings as any).backHeaderTitleAlign ?? 'left',
    lineHeight: (settings as any).backHeaderTitleLineHeight ?? 1.15,
    letterSpacing: (settings as any).backHeaderTitleLetterSpacing ?? 0,
    whiteSpace: 'normal'
  }, '#ffffff', { uppercase: true });

  drawText(ctx, settings.backHeaderSubtitle || '', {
    x: (settings as any).backHeaderSubtitleX ?? 5,
    y: (settings as any).backHeaderSubtitleY ?? 14,
    width: (settings as any).backHeaderSubtitleWidth ?? 90,
    fontSize: (settings as any).backHeaderSubtitleFontSize ?? 8,
    fontWeight: (settings as any).backHeaderSubtitleFontWeight ?? 'normal',
    color: (settings as any).backHeaderSubtitleColor ?? '#e5e7eb',
    align: (settings as any).backHeaderSubtitleAlign ?? 'left',
    lineHeight: (settings as any).backHeaderSubtitleLineHeight ?? 1.2,
    letterSpacing: (settings as any).backHeaderSubtitleLetterSpacing ?? 0,
    whiteSpace: 'normal'
  }, '#e5e7eb');

  const terms = (settings.terms || []).length
    ? settings.terms
    : [
        'Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata.',
        'Keaslian data kartu dapat diverifikasi melalui QR Code.'
      ];

  const termsCfg = {
    x: (settings as any).termsX ?? 5,
    y: (settings as any).termsY ?? 25,
    width: (settings as any).termsWidth ?? 90,
    fontSize: (settings as any).termsFontSize ?? 7,
    fontWeight: (settings as any).termsFontWeight ?? 'normal',
    color: (settings as any).termsColor ?? '#ffffff',
    align: (settings as any).termsAlign ?? 'left',
    lineHeight: (settings as any).termsLineHeight ?? 1.35,
    letterSpacing: (settings as any).termsLetterSpacing ?? 0,
    whiteSpace: 'normal'
  };

  let termY = Number(termsCfg.y);
  terms.forEach((term, index) => {
    const lineCount = drawText(ctx, `${index + 1}. ${term}`, { ...termsCfg, y: termY }, '#ffffff');
    const lineHeightPx = Number(termsCfg.fontSize) * PX_SCALE * Number(termsCfg.lineHeight);
    const lineHeightPercent = (lineHeightPx / CANVAS_HEIGHT) * 100;
    termY += Math.max(3.8, lineCount * lineHeightPercent + 1.2);
  });

  drawDataFields(ctx, member, settings, 'BACK', '#e2e8f0');

  const signer = signerMember;
  if ((settings as any).issueLocationDate) {
    drawText(ctx, String((settings as any).issueLocationDate), {
      x: (settings as any).issueLocationDateX ?? 5,
      y: (settings as any).issueLocationDateY ?? 62,
      width: (settings as any).signerWidth ?? 55,
      fontSize: (settings as any).issueLocationDateFontSize ?? 7,
      fontWeight: 'normal',
      color: (settings as any).signerColor ?? '#ffffff',
      align: (settings as any).signerAlign ?? 'left',
      lineHeight: (settings as any).signerLineHeight ?? 1.2,
      letterSpacing: (settings as any).signerLetterSpacing ?? 0,
      whiteSpace: 'normal'
    }, '#ffffff');
  }

  if ((settings as any).showSignerQrCode !== false && signer) {
    const signerQrDataUrl = await generateQrDataUrl(`${window.location.origin}/verify?verifyId=${encodeURIComponent(getVerificationValue(signer))}`);
    const signerQrImg = await loadImage(signerQrDataUrl);
    drawQr(
      ctx,
      signerQrImg,
      Math.max(0, Math.min(100 - Number((settings as any).signerQrSize ?? 18), Number((settings as any).signerQrX ?? 68))),
      Math.max(0, Math.min(100 - Number((settings as any).signerQrSize ?? 18), Number((settings as any).signerQrY ?? 68))),
      Math.max(8, Math.min(35, Number((settings as any).signerQrSize ?? 18))),
      Number((settings as any).signerQrPadding ?? 2),
      String((settings as any).signerQrBackgroundColor || '#ffffff'),
      String((settings as any).signerQrBorderColor || 'transparent'),
      Number((settings as any).signerQrBorderWidth ?? 0),
      Number((settings as any).signerQrBorderRadius ?? 0)
    );
  }

  if (signer) {
    const sx = (settings as any).signerX ?? 5;
    const sy = (settings as any).signerY ?? 82;
    const sw = (settings as any).signerWidth ?? 55;
    const base = {
      x: sx,
      width: sw,
      color: (settings as any).signerColor ?? '#ffffff',
      align: (settings as any).signerAlign ?? 'left',
      lineHeight: (settings as any).signerLineHeight ?? 1.2,
      letterSpacing: (settings as any).signerLetterSpacing ?? 0,
      whiteSpace: 'normal'
    };

    drawText(ctx, signer.fullName, {
      ...base,
      y: sy + ((settings as any).signerNameYOffset ?? 0),
      fontSize: (settings as any).signerNameFontSize ?? 9,
      fontWeight: 'bold'
    }, '#ffffff');

    drawText(ctx, signer.currentPosition || '', {
      ...base,
      y: sy + 10,
      fontSize: (settings as any).signerTitleFontSize ?? 7,
      fontWeight: 'normal'
    }, '#ffffff');
  } else if ((settings as any).signerName || (settings as any).signerTitle) {
    const sx = (settings as any).signerX ?? 5;
    const sy = (settings as any).signerY ?? 82;
    drawText(ctx, String((settings as any).signerName || ''), {
      x: sx, y: sy, width: (settings as any).signerWidth ?? 55,
      fontSize: (settings as any).signerNameFontSize ?? 9,
      fontWeight: 'bold', color: (settings as any).signerColor ?? '#ffffff',
      align: (settings as any).signerAlign ?? 'left', whiteSpace: 'normal'
    }, '#ffffff');
    drawText(ctx, String((settings as any).signerTitle || ''), {
      x: sx, y: sy + 10, width: (settings as any).signerWidth ?? 55,
      fontSize: (settings as any).signerTitleFontSize ?? 7,
      fontWeight: 'normal', color: (settings as any).signerColor ?? '#ffffff',
      align: (settings as any).signerAlign ?? 'left', whiteSpace: 'normal'
    }, '#ffffff');
  }

  ctx.restore();
  return canvas;
}

export interface GenerateKtaOptions {
  member: Member;
  settings?: KtaCardSettings;
  format?: KtaPdfFormat;
  onProgress?: (step: string) => void;
}

export async function generateKtaPdf({
  member,
  settings = DEFAULT_KTA_SETTINGS,
  format = 'CR80_STANDARD',
  onProgress
}: GenerateKtaOptions): Promise<jsPDF> {
  // Clone once. This is the immutable design snapshot for this PDF job.
  const design: KtaCardSettings = JSON.parse(JSON.stringify(settings || DEFAULT_KTA_SETTINGS));

  onProgress?.('Mempersiapkan KtaCardSettings dari sumber pusat...');

  const verificationId = String(member.nationalMemberNumber || member.id || member.userId || '').trim();
  const verificationUrl = `${window.location.origin}/verify?verifyId=${encodeURIComponent(verificationId)}`;

  onProgress?.('Memuat foto, logo, background dan aset desain...');

  const configuredLogoConfigs = (design.logos || []).filter((logo: any) => logo?.url);
  const configuredLogos = await Promise.all(
    configuredLogoConfigs.map(async (cfg: any) => ({ cfg, img: await loadImage(cfg.url) }))
  );

  const [avatar, officialLogo, frontBackground, backBackground, frontLogoImg, backLogoImg, qrDataUrl, signerMember] = await Promise.all([
    loadImage(member.avatarUrl || ''),
    loadOfficialSakaLogo(),
    loadCardBackground(design.frontBackgroundUrl || design.bgImageUrl),
    loadCardBackground(design.backBackgroundUrl || design.bgImageUrl),
    design.frontLogoUrl ? loadImage(design.frontLogoUrl) : Promise.resolve(new Image()),
    design.backLogoUrl ? loadImage(design.backLogoUrl) : Promise.resolve(new Image()),
    generateQrDataUrl(verificationUrl),
    loadSignerMember(design)
  ]);

  const qrImg = await loadImage(qrDataUrl);

  onProgress?.('Me-render sisi depan berdasarkan KtaCardSettings...');
  const frontCanvas = await renderFront(member, design, {
    background: frontBackground,
    officialLogo,
    frontLogoImg,
    backLogoImg,
    avatar,
    qrImg,
    logos: configuredLogos
  });

  onProgress?.('Me-render sisi belakang berdasarkan KtaCardSettings...');
  const backCanvas = await renderBack(member, design, {
    background: backBackground,
    officialLogo,
    frontLogoImg,
    backLogoImg,
    qrImg,
    logos: configuredLogos
  }, signerMember);

  const frontImg = frontCanvas.toDataURL('image/png', 1);
  const backImg = backCanvas.toDataURL('image/png', 1);

  onProgress?.('Menyusun PDF dengan ukuran fisik KTA...');

  const widthMm = Number(design.widthMm || CR80_WIDTH_MM);
  const heightMm = Number(design.heightMm || CR80_HEIGHT_MM);

  if (format === 'CR80_STANDARD') {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [widthMm, heightMm]
    });

    doc.addImage(frontImg, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    doc.addPage([widthMm, heightMm], 'landscape');
    doc.addImage(backImg, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
    return doc;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const a4Width = 210;
  const a4Height = 297;

  // Header
  doc.setFillColor(30, 8, 66);
  doc.rect(0, 0, a4Width, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEMBAR CETAK RESMI KTA SAKA PARIWISATA', a4Width / 2, 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(216, 180, 254);
  doc.text('Standar Global ISO/IEC 7810 ID-1 (CR80: 85.60 mm × 53.98 mm) - Skala 100% (Actual Size)', a4Width / 2, 18, { align: 'center' });

  // Member information
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Nama Anggota: ${member.fullName.toUpperCase()}`, 15, 33);
  doc.text(`NTA: ${member.nationalMemberNumber || '-'}`, 15, 39);
  doc.text(`Wilayah: ${member.provinceName || ''}${member.districtName ? ` / ${member.districtName}` : ''}`, 15, 45);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, a4Width - 15, 33, { align: 'right' });
  doc.text('Instruksi: Cetak dengan opsi "Actual Size / 100%" (Jangan Scale/Fit)', a4Width - 15, 39, { align: 'right' });
  doc.text('Gunakan kertas PVC Card / Photo Glossy 230-260 gsm lalu laminasi', a4Width - 15, 45, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(15, 49, a4Width - 15, 49);

  const cardY = 60;
  const frontX = 16;
  const backX = frontX + widthMm + 6;

  doc.setTextColor(30, 8, 66);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SISI DEPAN (FRONT SIDE)', frontX + widthMm / 2, cardY - 3, { align: 'center' });
  doc.addImage(frontImg, 'PNG', frontX, cardY, widthMm, heightMm, undefined, 'FAST');

  doc.text('SISI BELAKANG (BACK SIDE)', backX + widthMm / 2, cardY - 3, { align: 'center' });
  doc.addImage(backImg, 'PNG', backX, cardY, widthMm, heightMm, undefined, 'FAST');

  drawCropMarks(doc, frontX, cardY, widthMm, heightMm);
  drawCropMarks(doc, backX, cardY, widthMm, heightMm);

  const foldX = frontX + widthMm + 3;
  doc.setDrawColor(168, 85, 247);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(foldX, cardY - 4, foldX, cardY + heightMm + 4);
  doc.setLineDashPattern([], 0);

  const cardY2 = cardY + heightMm + 30;
  doc.setTextColor(30, 8, 66);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PANDUAN MODEL LIPAT VERTIKAL (SIAP LAMINASI DUA SISI):', a4Width / 2, cardY2 - 6, { align: 'center' });

  const centerCardX = (a4Width - widthMm) / 2;
  const frontY2 = cardY2;
  const backY2 = cardY2 + heightMm;

  doc.addImage(frontImg, 'PNG', centerCardX, frontY2, widthMm, heightMm, undefined, 'FAST');
  doc.addImage(backImg, 'PNG', centerCardX, backY2, widthMm, heightMm, undefined, 'FAST');
  drawCropMarks(doc, centerCardX, frontY2, widthMm, heightMm * 2);

  doc.setDrawColor(234, 88, 12);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(centerCardX - 4, backY2, centerCardX + widthMm + 4, backY2);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text('--- Garis Lipat Tengah ---', centerCardX + widthMm / 2, backY2 - 1, { align: 'center' });

  doc.setFillColor(248, 250, 252);
  doc.rect(0, a4Height - 18, a4Width, 18, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Sistem Informasi Terpadu Satuan Karya Pramuka Pariwisata Nasional', 15, a4Height - 7);
  doc.text('Dokumen KTA Digital Sah & Terverifikasi Online', a4Width - 15, a4Height - 7, { align: 'right' });

  return doc;
}

function drawCropMarks(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.25);
  const markLength = 4;
  const offset = 1.5;

  doc.line(x - offset - markLength, y, x - offset, y);
  doc.line(x, y - offset - markLength, x, y - offset);
  doc.line(x + w + offset, y, x + w + offset + markLength, y);
  doc.line(x + w, y - offset - markLength, x + w, y - offset);
  doc.line(x - offset - markLength, y + h, x - offset, y + h);
  doc.line(x, y + h + offset, x, y + h + offset + markLength);
  doc.line(x + w + offset, y + h, x + w + offset + markLength, y + h);
  doc.line(x + w, y + h + offset, x + w, y + h + offset + markLength);
}

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
  const fileName = `KTA-SakaPariwisata-${nta}-${cleanName}-${format === 'CR80_STANDARD' ? 'CR80' : 'A4'}.pdf`;
  doc.save(fileName);
}

