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

/** Convert percentage-based designer coordinates into canvas pixels. */
const pxX = (v: number | undefined) => CANVAS_WIDTH * (v ?? 0) / 100;
const pxY = (v: number | undefined) => CANVAS_HEIGHT * (v ?? 0) / 100;
const pxW = (v: number | undefined) => CANVAS_WIDTH * (v ?? 0) / 100;
const pxH = (v: number | undefined) => CANVAS_HEIGHT * (v ?? 0) / 100;

function weightValue(w?: string): string {
  return ({ normal: '400', medium: '500', bold: '700', black: '900' } as Record<string,string>)[w || 'normal'] || '400';
}

function fieldValue(member: Member, field: string): string {
  const values: Record<string, unknown> = {
    fullName: member.fullName,
    id: member.id,
    nationalMemberNumber: member.nationalMemberNumber,
    currentPosition: member.currentPosition,
    provinceName: member.provinceName,
    regencyName: member.regencyName,
    districtName: member.districtName,
    krida: member.krida,
    phone: member.phone,
    email: member.email,
    joinYear: member.joinYear,
    status: member.status,
  };
  return String(values[field] ?? '');
}

function applyTextStyle(ctx: CanvasRenderingContext2D, cfg: any, fallbackColor: string, minSize = 7) {
  ctx.fillStyle = cfg.color || fallbackColor;
  ctx.textAlign = cfg.align || 'left';
  ctx.font = `${weightValue(cfg.fontWeight)} ${Math.max(minSize, Number(cfg.fontSize) || minSize)}px Arial, sans-serif`;
}

function drawConfiguredText(ctx: CanvasRenderingContext2D, text: string, cfg: any, fallbackColor: string) {
  if (!text) return;
  const x = pxX(cfg.x);
  const y = pxY(cfg.y);
  const maxW = pxW(cfg.width);
  const lineHeight = Number(cfg.lineHeight || 1.2) * Math.max(7, Number(cfg.fontSize) || 9);
  const value = cfg.textTransform === 'uppercase' ? text.toUpperCase() : cfg.textTransform === 'lowercase' ? text.toLowerCase() : text;
  applyTextStyle(ctx, cfg, fallbackColor);
  ctx.save();
  if (cfg.letterSpacing) {
    // Canvas has no portable letterSpacing; draw the normal text and keep the setting for browser parity.
  }
  const words = String(value).split(/\s+/);
  let line = '';
  let yy = y + Math.max(7, Number(cfg.fontSize) || 9);
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxW && line) {
      ctx.fillText(line, x, yy, maxW);
      yy += lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) ctx.fillText(line, x, yy, maxW);
  ctx.restore();
}

function drawConfiguredFields(ctx: CanvasRenderingContext2D, member: Member, settings: KtaCardSettings, side: 'FRONT'|'BACK', fallbackColor: string) {
  (settings.dataFields || []).filter((f: any) => f.side === side && f.visible).forEach((f: any) => {
    const raw = fieldValue(member, f.field);
    const text = f.showLabel && f.label ? `${f.label}: ${raw}` : raw;
    drawConfiguredText(ctx, text, f, fallbackColor);
  });
  (settings.textElements || []).filter((t: any) => t.side === side).forEach((t: any) => {
    drawConfiguredText(ctx, String(t.text || ''), t, fallbackColor);
  });
}

function drawConfiguredLogos(ctx: CanvasRenderingContext2D, logoImages: Array<{cfg:any; img:HTMLImageElement}>, side:'FRONT'|'BACK') {
  logoImages.filter(({cfg}) => cfg.side === side).forEach(({cfg,img}) => {
    if (!img || !img.complete || !(img.naturalWidth || img.width)) return;
    const x=pxX(cfg.x), y=pxY(cfg.y), w=pxW(cfg.width), h=pxH(cfg.height);
    ctx.save(); ctx.globalAlpha=cfg.opacity ?? 1;
    if (cfg.objectFit === 'cover') {
      const iw=img.naturalWidth||img.width, ih=img.naturalHeight||img.height;
      const scale=Math.max(w/iw,h/ih); const dw=iw*scale, dh=ih*scale;
      ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
    } else {
      drawFitImage(ctx,img,x,y,w,h);
    }
    ctx.restore();
  });
}

function drawBackground(ctx: CanvasRenderingContext2D, settings: KtaCardSettings, side:'FRONT'|'BACK', bgImg:HTMLImageElement|null, theme:any) {
  const grad=ctx.createLinearGradient(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  const colors=side==='FRONT'?theme.frontGrad:theme.backGrad;
  grad.addColorStop(0,colors[0]); grad.addColorStop(.55,colors[1]); grad.addColorStop(1,colors[2]);
  ctx.fillStyle=grad; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  if(bgImg && (bgImg.naturalWidth||bgImg.width)) { ctx.save(); ctx.globalAlpha=settings.bgOpacity ?? .10; ctx.drawImage(bgImg,0,0,CANVAS_WIDTH,CANVAS_HEIGHT); ctx.restore(); }
  const custom = side==='FRONT'?settings.customBackgroundColorFront:settings.customBackgroundColorBack;
  if(custom) { ctx.save(); ctx.globalAlpha=Math.min(1, settings.bgOpacity ?? .10); ctx.fillStyle=custom; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); ctx.restore(); }
}

function drawFrontSystemElements(ctx: CanvasRenderingContext2D, member: Member, settings: KtaCardSettings, logoImg:HTMLImageElement, avatarImg:HTMLImageElement, qrImg:HTMLImageElement, theme:any) {
  const logoUrl = settings.frontLogoUrl;
  if (!settings.logos?.some((l:any)=>l.side==='FRONT' && l.url) && !logoUrl && logoImg.complete && (logoImg.naturalWidth||logoImg.width)) {
    drawFitImage(ctx,logoImg,pxX(4),pxY(3),pxW(10),pxH(16));
  }

  drawConfiguredText(ctx, settings.frontOrganizationTitle || '', {
    x:settings.frontOrganizationTitleX ?? 15,y:settings.frontOrganizationTitleY ?? 6,width:settings.frontOrganizationTitleWidth ?? 65,
    fontSize:settings.frontOrganizationTitleFontSize ?? 11,fontWeight:settings.frontOrganizationTitleFontWeight ?? 'bold',color:settings.frontOrganizationTitleColor ?? '#fff',align:settings.frontOrganizationTitleAlign ?? 'left',
    lineHeight:settings.frontOrganizationTitleLineHeight ?? 1.15,letterSpacing:settings.frontOrganizationTitleLetterSpacing ?? 0,textTransform:'uppercase'
  }, '#fff');
  drawConfiguredText(ctx, settings.frontOrganizationSubtitle || '', {
    x:settings.frontOrganizationSubtitleX ?? 15,y:settings.frontOrganizationSubtitleY ?? 12,width:settings.frontOrganizationSubtitleWidth ?? 70,
    fontSize:settings.frontOrganizationSubtitleFontSize ?? 8,fontWeight:settings.frontOrganizationSubtitleFontWeight ?? 'normal',color:settings.frontOrganizationSubtitleColor ?? theme.accent,align:settings.frontOrganizationSubtitleAlign ?? 'left',
    lineHeight:settings.frontOrganizationSubtitleLineHeight ?? 1.2,letterSpacing:settings.frontOrganizationSubtitleLetterSpacing ?? 0
  }, theme.accent);

  if(settings.showPhoto !== false && avatarImg && (avatarImg.naturalWidth||avatarImg.width)) {
    const x=pxX(settings.photoX ?? 4), y=pxY(settings.photoY ?? 27), w=pxW(settings.photoWidth ?? 22), h=pxH(settings.photoHeight ?? 48), r=Number(settings.photoRadius ?? 12);
    ctx.save(); roundRect(ctx,x,y,w,h,r); ctx.clip();
    const fit=settings.photoObjectFit || 'cover';
    if(fit==='contain') drawFitImage(ctx,avatarImg,x,y,w,h); else if(fit==='fill') ctx.drawImage(avatarImg,x,y,w,h); else {
      const iw=avatarImg.naturalWidth||avatarImg.width, ih=avatarImg.naturalHeight||avatarImg.height, scale=Math.max(w/iw,h/ih), dw=iw*scale, dh=ih*scale;
      ctx.drawImage(avatarImg,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
    }
    ctx.restore();
    ctx.save(); ctx.strokeStyle=settings.photoBorderColor || theme.accent; ctx.lineWidth=Number(settings.photoBorderWidth ?? 2); roundRect(ctx,x,y,w,h,r); ctx.stroke(); ctx.restore();
  }

  if(settings.showQrCode !== false && qrImg && (qrImg.naturalWidth||qrImg.width)) {
    const x=pxX(settings.qrX ?? 78), y=pxY(settings.qrY ?? 29), size=Math.max(36,Math.min(pxW(settings.qrSize ?? 18),pxH(settings.qrSize ?? 18)));
    const qrPadding=Math.max(0,Number(settings.qrPadding ?? 6));
    const qrRadius=Math.max(0,Number(settings.qrBorderRadius ?? 10));
    const qrBorderWidth=Math.max(0,Number(settings.qrBorderWidth ?? 1));
    const qrBorderColor=settings.qrBorderColor || '#e9d5ff';
    const qrBg=settings.qrBackgroundColor || '#ffffff';
    ctx.save();
    ctx.fillStyle=qrBg; roundRect(ctx,x,y,size,size,qrRadius); ctx.fill();
    if(qrBorderWidth>0){ ctx.strokeStyle=qrBorderColor; ctx.lineWidth=qrBorderWidth; roundRect(ctx,x,y,size,size,qrRadius); ctx.stroke(); }
    const innerSize=Math.max(1,size-(qrPadding*2));
    ctx.drawImage(qrImg,x+qrPadding,y+qrPadding,innerSize,innerSize);
    ctx.restore();
  }

  if(settings.showBarcodeFront !== false) {
    const x=pxX(settings.barcodeFrontX ?? 4), y=pxY(settings.barcodeFrontY ?? 77), w=pxW(settings.barcodeFrontWidth ?? 32), h=pxH(settings.barcodeFrontHeight ?? 9);
    drawBarcode(ctx,x,y,w,h,settings.barcodeFrontCustomValue?.trim() || getMemberVerificationValue(member));
    if(settings.barcodeFrontShowText) { ctx.save(); ctx.fillStyle='#111827'; ctx.font='8px Arial'; ctx.textAlign='center'; ctx.fillText(settings.barcodeFrontCustomValue?.trim() || getMemberVerificationValue(member),x+w/2,y+h-2,w-8); ctx.restore(); }
    if(settings.barcodeFrontCaption) drawConfiguredText(ctx,settings.barcodeFrontCaption,{x:settings.barcodeFrontCaptionX ?? settings.barcodeFrontX ?? 4,y:settings.barcodeFrontCaptionY ?? ((settings.barcodeFrontY ?? 77)+(settings.barcodeFrontHeight ?? 9)+1),width:settings.barcodeFrontCaptionWidth ?? settings.barcodeFrontWidth ?? 32,fontSize:settings.barcodeFrontCaptionFontSize ?? 6,fontWeight:settings.barcodeFrontCaptionFontWeight ?? 'normal',color:settings.barcodeFrontCaptionColor ?? '#fff',align:settings.barcodeFrontCaptionAlign ?? 'center',lineHeight:settings.barcodeFrontCaptionLineHeight ?? 1.1,letterSpacing:settings.barcodeFrontCaptionLetterSpacing ?? 0},'#fff');
  }

  if(settings.frontValidityText) drawConfiguredText(ctx,settings.frontValidityText,{x:settings.frontValidityTextX ?? 4,y:settings.frontValidityTextY ?? 92,width:settings.frontValidityTextWidth ?? 92,fontSize:settings.frontValidityTextFontSize ?? 7,fontWeight:settings.frontValidityTextFontWeight ?? 'normal',color:settings.frontValidityTextColor ?? '#fff',align:settings.frontValidityTextAlign ?? 'left',lineHeight:settings.frontValidityTextLineHeight ?? 1.2,letterSpacing:settings.frontValidityTextLetterSpacing ?? 0},'#fff');
  if(settings.showKridaBadge && member.krida) drawConfiguredText(ctx,member.krida,{x:75,y:92,width:21,fontSize:6,fontWeight:'black',color:'#111827',align:'center',lineHeight:1.1},'#111827');
}

function getMemberVerificationValue(member: Member): string {
  return member.nationalMemberNumber || member.verificationToken || member.id;
}

async function renderFrontCardCanvas(member: Member, settings: KtaCardSettings, logoImg: HTMLImageElement, avatarImg: HTMLImageElement, qrImg: HTMLImageElement, bgImg: HTMLImageElement|null): Promise<HTMLCanvasElement> {
  const canvas=document.createElement('canvas'); canvas.width=CANVAS_WIDTH; canvas.height=CANVAS_HEIGHT; const ctx=canvas.getContext('2d')!; const theme=getThemePalette(settings.cardTheme);
  ctx.save(); roundRect(ctx,0,0,CANVAS_WIDTH,CANVAS_HEIGHT,Math.max(1,Number(settings.cornerRadiusMm||CR80_CORNER_RADIUS_MM)*CANVAS_WIDTH/(settings.widthMm||CR80_WIDTH_MM))); ctx.clip();
  drawBackground(ctx,settings,'FRONT',bgImg,theme);
  drawFrontSystemElements(ctx,member,settings,logoImg,avatarImg,qrImg,theme);
  drawConfiguredFields(ctx,member,settings,'FRONT',theme.accentLight);
  return canvas;
}

async function renderBackCardCanvas(member: Member, settings: KtaCardSettings, logoImg: HTMLImageElement, bgImg: HTMLImageElement|null): Promise<HTMLCanvasElement> {
  const canvas=document.createElement('canvas'); canvas.width=CANVAS_WIDTH; canvas.height=CANVAS_HEIGHT; const ctx=canvas.getContext('2d')!; const theme=getThemePalette(settings.cardTheme);
  ctx.save(); roundRect(ctx,0,0,CANVAS_WIDTH,CANVAS_HEIGHT,Math.max(1,Number(settings.cornerRadiusMm||CR80_CORNER_RADIUS_MM)*CANVAS_WIDTH/(settings.widthMm||CR80_WIDTH_MM))); ctx.clip();
  drawBackground(ctx,settings,'BACK',bgImg,theme);

  if(!settings.logos?.some((l:any)=>l.side==='BACK' && l.url) && settings.backLogoUrl && logoImg.complete && (logoImg.naturalWidth||logoImg.width)) drawFitImage(ctx,logoImg,pxX(4),pxY(3),pxW(10),pxH(16));
  drawConfiguredText(ctx,settings.backHeaderTitle || '',{x:settings.backHeaderTitleX ?? 5,y:settings.backHeaderTitleY ?? 6,width:settings.backHeaderTitleWidth ?? 90,fontSize:settings.backHeaderTitleFontSize ?? 11,fontWeight:settings.backHeaderTitleFontWeight ?? 'bold',color:settings.backHeaderTitleColor ?? theme.accent,align:settings.backHeaderTitleAlign ?? 'left',lineHeight:settings.backHeaderTitleLineHeight ?? 1.15,letterSpacing:settings.backHeaderTitleLetterSpacing ?? 0},theme.accent);
  drawConfiguredText(ctx,settings.backHeaderSubtitle || '',{x:settings.backHeaderSubtitleX ?? 5,y:settings.backHeaderSubtitleY ?? 14,width:settings.backHeaderSubtitleWidth ?? 90,fontSize:settings.backHeaderSubtitleFontSize ?? 8,fontWeight:settings.backHeaderSubtitleFontWeight ?? 'normal',color:settings.backHeaderSubtitleColor ?? '#e5e7eb',align:settings.backHeaderSubtitleAlign ?? 'left',lineHeight:settings.backHeaderSubtitleLineHeight ?? 1.2,letterSpacing:settings.backHeaderSubtitleLetterSpacing ?? 0},'#e5e7eb');

  const terms=(settings.terms||[]).length?settings.terms:['Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata.','Keaslian data kartu dapat diverifikasi melalui QR Code.'];
  const termsCfg={x:settings.termsX ?? 5,y:settings.termsY ?? 25,width:settings.termsWidth ?? 90,fontSize:settings.termsFontSize ?? 7,fontWeight:settings.termsFontWeight ?? 'normal',color:settings.termsColor ?? '#fff',align:settings.termsAlign ?? 'left',lineHeight:settings.termsLineHeight ?? 1.35,letterSpacing:settings.termsLetterSpacing ?? 0};
  terms.forEach((t,i)=>drawConfiguredText(ctx,`${i+1}. ${t}`,{...termsCfg,y:(termsCfg.y as number)+i*(Number(termsCfg.fontSize||7)*Number(termsCfg.lineHeight||1.35)+2)},'#fff'));

  drawConfiguredFields(ctx,member,settings,'BACK','#e2e8f0');

  if(settings.issueLocationDate || settings.signerName || settings.signerTitle) {
    const sx=settings.signerX ?? 5, sy=settings.signerY ?? 78, sw=settings.signerWidth ?? 55;
    const cfgBase={x:sx,y:sy,width:sw,color:settings.signerColor ?? '#fff',align:settings.signerAlign ?? 'left',lineHeight:settings.signerLineHeight ?? 1.2,letterSpacing:settings.signerLetterSpacing ?? 0};
    drawConfiguredText(ctx,settings.issueLocationDate||'',{...cfgBase,fontSize:settings.issueLocationDateFontSize ?? 7},'#fff');
    drawConfiguredText(ctx,settings.signerName||'',{...cfgBase,y:(sy as number)+8,fontSize:settings.signerNameFontSize ?? 9,fontWeight:'bold'},'#fff');
    drawConfiguredText(ctx,settings.signerTitle||'',{...cfgBase,y:(sy as number)+18,fontSize:settings.signerTitleFontSize ?? 7,fontWeight:'normal'},theme.accent);
    if(settings.signerSubtitle) drawConfiguredText(ctx,settings.signerSubtitle,{...cfgBase,y:(sy as number)+26,fontSize:settings.signerSubtitleFontSize ?? 6,fontWeight:'normal'},'#fff');
  }
  if(settings.showBarcode !== false) drawBarcode(ctx,pxX(settings.barcodeX ?? 68),pxY(settings.barcodeY ?? 70),pxW(settings.barcodeWidth ?? 27),pxH(settings.barcodeHeight ?? 9),settings.barcodeCustomValue?.trim() || getMemberVerificationValue(member));
  if(settings.barcodeCaption) drawConfiguredText(ctx,settings.barcodeCaption,{x:settings.barcodeX ?? 68,y:(settings.barcodeY ?? 70)+(settings.barcodeHeight ?? 9)+1,width:settings.barcodeWidth ?? 27,fontSize:6,fontWeight:'normal',color:'#fff',align:'center',lineHeight:1.1},'#fff');
  return canvas;
}

function drawKtaConfiguredElements(ctx: CanvasRenderingContext2D, member: Member, settings: KtaCardSettings, side: 'FRONT'|'BACK', logoImages: Array<{cfg:any; img:HTMLImageElement}>) {
  drawConfiguredLogos(ctx,logoImages,side);
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

  // QR KTA dibuat dengan dua identitas:
  // - verifyId = Nomor KTA (kompatibel dengan QR/KTA lama)
  // - memberId = ID Anggota permanen sebagai fallback jika Nomor KTA berubah
  // Halaman /verify menerima keduanya dan melakukan verifikasi ke Spreadsheet.
  const nta = String(member.nationalMemberNumber || '').trim();
  const memberId = String(member.id || member.userId || '').trim();
  const verificationParams = new URLSearchParams();
  if (nta) verificationParams.set('verifyId', nta);
  if (memberId) verificationParams.set('memberId', memberId);
  if (!nta && memberId) verificationParams.set('id', memberId);
  verificationParams.set('tab', 'verify-portal');
  const verificationUrl = `${window.location.origin}/verify?${verificationParams.toString()}`;

  const [qrDataUrl, avatarImg, logoImg, frontBgImg, backBgImg, configuredLogoImages] = await Promise.all([
    generateQrDataUrl(verificationUrl),
    loadImage(member.avatarUrl),
    loadOfficialSakaLogo(),
    loadCardBgImage(settings.frontBackgroundUrl || settings.bgImageUrl),
    loadCardBgImage(settings.backBackgroundUrl || settings.bgImageUrl),
    Promise.all([
      ...(settings.logos || []).filter((l:any)=>l.url).map(async (cfg:any) => ({ cfg, img: await loadImage(cfg.url) })),
      ...(settings.frontLogoUrl ? [{ cfg: { id: '__front-logo', name: 'Logo Depan', url: settings.frontLogoUrl, side: 'FRONT', x: 4, y: 3, width: 10, height: 16, opacity: 1, objectFit: 'contain' }, img: await loadImage(settings.frontLogoUrl) }] : []),
      ...(settings.backLogoUrl ? [{ cfg: { id: '__back-logo', name: 'Logo Belakang', url: settings.backLogoUrl, side: 'BACK', x: 4, y: 3, width: 10, height: 16, opacity: 1, objectFit: 'contain' }, img: await loadImage(settings.backLogoUrl) }] : [])
    ])
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
    frontBgImg
  );

  drawKtaConfiguredElements(frontCanvas.getContext('2d')!, member, settings, 'FRONT', configuredLogoImages);

  const backCanvas = await renderBackCardCanvas(member, settings, logoImg, backBgImg);
  drawKtaConfiguredElements(backCanvas.getContext('2d')!, member, settings, 'BACK', configuredLogoImages);

  const frontImgData = frontCanvas.toDataURL('image/png');
  const backImgData = backCanvas.toDataURL('image/png');

  if (onProgress) onProgress('Menyusun berkas PDF sesuai standar ukuran global...');

  if (format === 'CR80_STANDARD') {
    // Direct CR80 (ISO/IEC 7810 ID-1) Plastic Card Dimensions: 85.60 mm x 53.98 mm
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [settings.widthMm || CR80_WIDTH_MM, settings.heightMm || CR80_HEIGHT_MM]
    });

    // Page 1: Front Side
    doc.addImage(frontImgData, 'PNG', 0, 0, settings.widthMm || CR80_WIDTH_MM, settings.heightMm || CR80_HEIGHT_MM, undefined, 'FAST');

    // Page 2: Back Side
    doc.addPage([settings.widthMm || CR80_WIDTH_MM, settings.heightMm || CR80_HEIGHT_MM], 'landscape');
    doc.addImage(backImgData, 'PNG', 0, 0, settings.widthMm || CR80_WIDTH_MM, settings.heightMm || CR80_HEIGHT_MM, undefined, 'FAST');

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
    doc.text(`Wilayah: ${member.provinceName} / ${member.districtName}`, 15, 45);

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
