import React, { useEffect, useMemo, useState } from 'react';
import { RotateCw, FileDown, Sliders, ShieldCheck } from 'lucide-react';
import { Member, KtaCardSettings, KtaDataFieldConfig } from '../../types';
import { SakaLogo, formatDriveImageUrl } from '../common/SakaLogo';
import { Barcode } from '../common/Barcode';
import { storage } from '../../services/storage';
import { KtaQrCode } from './KtaQrCode';

interface Props {
  member: Member;
  onVerifyClick?: (member: Member) => void;
  onEditCard?: () => void;
  onEditPhoto?: (member: Member) => void;
  onEditMemberProfile?: (member: Member) => void;
  onPrintPdf?: (member: Member) => void;
  showControls?: boolean;
  allowAdminEdit?: boolean;
  previewSettings?: KtaCardSettings;
}

const valueOf = (member: Member, field: KtaDataFieldConfig['field']): string => {
  const values: Record<string, any> = {
    fullName: member.fullName, id: member.id, nationalMemberNumber: member.nationalMemberNumber,
    currentPosition: member.currentPosition, provinceName: member.provinceName, regencyName: member.regencyName,
    districtName: member.districtName, branchName: member.branchName, gugusDepan: member.gugusDepan,
    krida: member.krida, phone: member.phone, email: member.email, joinYear: member.joinYear, status: member.status
  };
  return String(values[field] ?? '');
};

const weight = (w: KtaDataFieldConfig['fontWeight'] | string) => ({ normal:400, medium:500, bold:700, black:900 } as any)[w] || 400;

export const DigitalMemberCard: React.FC<Props> = ({ member, onEditCard, onPrintPdf, showControls=true, allowAdminEdit=false, previewSettings }) => {
  const [settings, setSettings] = useState<KtaCardSettings>(previewSettings || storage.getKtaSettings());
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (previewSettings) { setSettings(previewSettings); return; }
    const refresh=()=>setSettings(storage.getKtaSettings());
    const unsub=storage.subscribe(refresh);
    const evt=(e:any)=>e.detail&&setSettings(e.detail);
    window.addEventListener('saka:kta-settings-updated',evt);
    return ()=>{unsub();window.removeEventListener('saka:kta-settings-updated',evt);};
  },[previewSettings]);

  const dataFields = Array.isArray(settings?.dataFields) ? settings.dataFields : [];
  const textElements = Array.isArray(settings?.textElements) ? settings.textElements : [];
  const logos = Array.isArray(settings?.logos) ? settings.logos : [];
  const terms = Array.isArray(settings?.terms) ? settings.terms : [];

  const ratio = Math.max(0.45, (settings?.widthMm || 85.6) / Math.max(settings?.heightMm || 53.98, 1));
  const widthPx = 380;
  const heightPx = widthPx / ratio;
  const photo = formatDriveImageUrl(member.avatarUrl) || member.avatarUrl;
  const frontFields = dataFields.filter(f=>f.side==='FRONT' && f.visible);
  const backFields = dataFields.filter(f=>f.side==='BACK' && f.visible);
  const frontTexts = textElements.filter(t=>t.side==='FRONT');
  const backTexts = textElements.filter(t=>t.side==='BACK');
  const frontLogos = logos.filter(l=>l.side==='FRONT' && l.url);
  const backLogos = logos.filter(l=>l.side==='BACK' && l.url);
  const bgFront = settings.frontBackgroundUrl || settings.bgImageUrl;
  const bgBack = settings.backBackgroundUrl || settings.bgImageUrl;
  const radius = Math.max(8, settings.cornerRadiusMm * 3);

  const renderField = (f:KtaDataFieldConfig) => {
    const raw=valueOf(member,f.field); const text=f.textTransform==='uppercase'?raw.toUpperCase():raw;
    return <div key={f.id} className="absolute overflow-hidden" style={{left:`${f.x}%`,top:`${f.y}%`,width:`${f.width}%`,fontSize:`${f.fontSize}px`,fontWeight:weight(f.fontWeight),color:f.color,textAlign:f.align||'left',lineHeight:1.15,whiteSpace:'nowrap',textOverflow:'ellipsis'}} title={text}>
      {f.label && <span style={{opacity:.75,marginRight:5,fontSize:Math.max(7,f.fontSize*.68)}}>{f.label}:</span>}{text || '—'}
    </div>;
  };
  const renderText=(t:any)=><div key={t.id} className="absolute overflow-hidden" style={{left:`${t.x}%`,top:`${t.y}%`,width:`${t.width}%`,fontSize:`${t.fontSize}px`,fontWeight:weight(t.fontWeight),color:t.color,textAlign:t.align||'left',whiteSpace:'nowrap',textTransform:t.textTransform||'none'}}>{t.text}</div>;
  const renderLogos=(logos:any[])=><>{logos.map(l=><img key={l.id} src={formatDriveImageUrl(l.url)||l.url} alt={l.name} className="absolute pointer-events-none" style={{left:`${l.x}%`,top:`${l.y}%`,width:`${l.width}%`,height:`${l.height}%`,opacity:l.opacity,objectFit:l.objectFit||'contain'}}/>)}</>;

  const bgStyle=(url?:string, color?:string):React.CSSProperties => ({backgroundColor:color||'#24105b',backgroundImage:url?`linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.12)),url("${formatDriveImageUrl(url)||url}")`:undefined,backgroundSize:'cover',backgroundPosition:'center'});

  return <div className="flex flex-col items-center gap-3 select-none">
    <div style={{width:widthPx,height:heightPx,perspective:'1000px'}} className="cursor-pointer" onClick={()=>setFlipped(v=>!v)}>
      <div className="relative w-full h-full transition-transform duration-500" style={{transformStyle:'preserve-3d',transform:flipped?'rotateY(180deg)':'none'}}>
        <div className="absolute inset-0 overflow-hidden shadow-2xl border border-white/20 text-white" style={{...bgStyle(bgFront,settings.customBackgroundColorFront),borderRadius:radius,backfaceVisibility:'hidden'}}>
          <div className="absolute inset-0 bg-black/10" style={{opacity:settings.bgOpacity??.1}}/>
          {renderLogos(frontLogos)}
          {!frontLogos.length && <div className="absolute left-[4%] top-[5%]"><SakaLogo size={38}/></div>}
          <div className="absolute left-[15%] top-[6%] right-[5%] font-bold text-[11px] uppercase tracking-wider">{settings.frontOrganizationTitle}</div>
          <div className="absolute left-[15%] top-[12%] right-[5%] text-[8px] opacity-80">{settings.frontOrganizationSubtitle}</div>
          {settings.showPhoto && <div className="absolute left-[4%] top-[27%] w-[22%] h-[48%] rounded-xl overflow-hidden border-2 border-amber-300 bg-slate-800"><img src={photo} alt={member.fullName} className="w-full h-full object-cover"/></div>}
          {settings.showQrCode && <div className="absolute right-[4%] top-[30%]"><KtaQrCode member={member} size={Math.round(Math.min(widthPx,heightPx)*.22)} showLabel={false} interactive={false}/></div>}
          {frontFields.map(renderField)}{frontTexts.map(renderText)}
          <div className="absolute left-[4%] right-[4%] bottom-[4%] border-t border-white/20 pt-1 text-[7px] opacity-80">{settings.frontValidityText}</div>
          {settings.showKridaBadge && member.krida && <div className="absolute right-[4%] bottom-[5%] px-2 py-1 rounded-full bg-amber-400 text-slate-950 text-[7px] font-black uppercase">{member.krida}</div>}
        </div>

        <div className="absolute inset-0 overflow-hidden shadow-2xl border border-white/20 text-white p-4" style={{...bgStyle(bgBack,settings.customBackgroundColorBack),borderRadius:radius,backfaceVisibility:'hidden',transform:'rotateY(180deg)'}}>
          {renderLogos(backLogos)}
          <div className="absolute left-[5%] top-[6%] right-[5%] font-bold text-[11px] uppercase">{settings.backHeaderTitle}</div>
          <div className="absolute left-[5%] top-[14%] right-[5%] text-[8px] opacity-70">{settings.backHeaderSubtitle}</div>
          <div className="absolute left-[5%] top-[25%] right-[5%] text-[7px] leading-relaxed opacity-85">{terms.map((t,i)=><div key={i} className="mb-1">{i+1}. {t}</div>)}</div>
          {backFields.map(renderField)}{backTexts.map(renderText)}
          <div className="absolute left-[5%] bottom-[5%] text-[7px] opacity-80"><div>{settings.issueLocationDate}</div><div className="font-bold text-[9px]">{settings.signerName}</div><div>{settings.signerTitle}</div></div>
          <div className="absolute right-[5%] bottom-[5%] flex flex-col items-center gap-1"><div className="bg-white rounded p-1"><Barcode value={settings.barcodeCustomValue?.trim()||member.nationalMemberNumber||member.id} width={80} height={18} barColor="#000" showText={false}/></div><div className="text-[6px] flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5"/>VERIFIKASI</div></div>
        </div>
      </div>
    </div>

    {showControls && <div className="flex items-center gap-2"><button type="button" onClick={()=>setFlipped(v=>!v)} className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"><RotateCw className="inline w-3.5 h-3.5 mr-1"/>Lihat {flipped?'Depan':'Belakang'}</button>{onPrintPdf&&<button type="button" onClick={()=>onPrintPdf(member)} className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold"><FileDown className="inline w-3.5 h-3.5 mr-1"/>PDF</button>}{allowAdminEdit&&onEditCard&&<button type="button" onClick={onEditCard} className="px-3 py-1.5 bg-purple-800 text-white rounded-xl text-xs font-semibold"><Sliders className="inline w-3.5 h-3.5 mr-1"/>Atur Desain</button>}</div>}
  </div>;
};
