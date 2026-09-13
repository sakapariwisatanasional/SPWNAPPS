import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Sliders, Check, Save, RotateCcw, Sparkles, Upload, Plus, Trash2,
  LayoutTemplate, Type, Image as ImageIcon, Eye, MapPin, RefreshCw
} from 'lucide-react';
import { KtaCardSettings, KtaCardPreset, KtaCardSide, KtaDataFieldConfig, KtaMemberFieldKey, KtaLogoElement, KtaTextElement, Member } from '../../types';
import { storage, DEFAULT_KTA_SETTINGS } from '../../services/storage';
import { spreadsheetService } from '../../services/spreadsheetService';
import { DigitalMemberCard } from './DigitalMemberCard';

interface Props { isOpen: boolean; onClose: () => void; onSuccess?: () => void; }

const FIELD_OPTIONS: Array<{ value: KtaMemberFieldKey; label: string }> = [
  { value:'fullName', label:'Nama Lengkap' }, { value:'id', label:'No. Anggota (SPW)' },
  { value:'nationalMemberNumber', label:'Nomor KTA / NTA' }, { value:'currentPosition', label:'Jabatan' },
  { value:'provinceName', label:'Kwartir / Provinsi' }, { value:'regencyName', label:'Kwarcab / Kabupaten' },
  { value:'districtName', label:'Kwarran / Kecamatan' }, { value:'branchName', label:'Gugus / Pangkalan' },
  { value:'gugusDepan', label:'Gugus Depan' }, { value:'krida', label:'Krida' },
  { value:'phone', label:'WhatsApp' }, { value:'email', label:'Email' },
  { value:'joinYear', label:'Tahun Bergabung' }, { value:'status', label:'Status' }
];

const PRESETS: Record<KtaCardPreset, { label:string; width:number; height:number; radius:number }> = {
  CR80_KTA: { label:'KTA / CR80 (ISO ID-1)', width:85.60, height:53.98, radius:3.18 },
  KTP: { label:'KTP / ID-1', width:85.60, height:53.98, radius:3.18 },
  SIM: { label:'SIM', width:85.60, height:53.98, radius:3.18 },
  CUSTOM: { label:'Ukuran Custom', width:85.60, height:53.98, radius:3.18 }
};

const clone = <T,>(v:T):T => JSON.parse(JSON.stringify(v));

// Konfigurasi KTA lama/hasil sinkronisasi spreadsheet dapat berupa object parsial.
// Normalisasi collection wajib dilakukan SEBELUM useMemo dijalankan karena modal
// tetap dirender oleh App walaupun isOpen=false.
const normalizeKtaSettings = (value: KtaCardSettings): KtaCardSettings => ({
  ...clone(DEFAULT_KTA_SETTINGS),
  ...value,
  dataFields: Array.isArray((value as any)?.dataFields) ? (value as any).dataFields : [],
  textElements: Array.isArray((value as any)?.textElements) ? (value as any).textElements : [],
  logos: Array.isArray((value as any)?.logos) ? (value as any).logos : [],
  terms: Array.isArray((value as any)?.terms) ? (value as any).terms : [],
});

export const KtaCardCustomizerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [settings, setSettings] = useState<KtaCardSettings>(() => normalizeKtaSettings(DEFAULT_KTA_SETTINGS));
  const [side, setSide] = useState<KtaCardSide>('FRONT');
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [message, setMessage] = useState('');
  const [regionProvinceId, setRegionProvinceId] = useState('');
  const [regionRegencyId, setRegionRegencyId] = useState('');
  const [regionDistrictId, setRegionDistrictId] = useState('');
  const [regionBusy, setRegionBusy] = useState(false);

  const provinces = storage.getProvinces();
  const regencies = regionProvinceId ? storage.getRegencies(regionProvinceId) : [];
  const districts = regionRegencyId ? storage.getDistricts(regionRegencyId) : [];
  const members = storage.getMembers();
  const activeMembers = members.filter(m => String(m.status || '').toUpperCase() === 'ACTIVE');
  const signerMember = activeMembers.find(m => m.id === (settings as any).signerMemberId);

  const previewMember: Member = members[0] || ({
    id:'SPW-000001', userId:'user-01', nationalMemberNumber:'00.00.00.000001', fullName:'Rohadi Wijaya', nikMasked:'',
    avatarUrl:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', gender:'LAKI_LAKI', birthPlace:'Jakarta', birthDate:'2000-08-14', phone:'081234567890', email:'admin@sakapariwisata.id', address:'',
    provinceId:'00', provinceName:'Kwartir Nasional', regencyId:'00.00', regencyName:'Kwartir Nasional (Pusat)', districtId:'00.00.00', districtName:'Nasional', branchId:'branch-nasional', branchName:'PANDU NUSANTARA', gugusDepan:'PANDU NUSANTARA', joinYear:2024, currentPosition:'Andalan Nasional', krida:'Krida Mice & Event', status:'ACTIVE', educationLevel:'S1', occupation:'Pimpinan Saka', bio:'', skills:[], certifications:[], locationHistory:[], registeredAt:new Date().toISOString(), verificationToken:'preview'
  } as Member);

  useEffect(() => {
    if (!isOpen) return;
    setSettings(normalizeKtaSettings(storage.getKtaSettings()));
    setMessage('');
    setLoadingRemote(true);
    spreadsheetService.refreshKtaSettings().then(remote => {
      if (remote) setSettings(normalizeKtaSettings(remote));
    }).finally(() => setLoadingRemote(false));
  }, [isOpen]);

  const safeDataFields = Array.isArray(settings?.dataFields) ? settings.dataFields : [];
  const safeTextElements = Array.isArray(settings?.textElements) ? settings.textElements : [];
  const safeLogos = Array.isArray(settings?.logos) ? settings.logos : [];

  const sideFields = useMemo(() => safeDataFields.filter(f => f.side === side), [safeDataFields, side]);
  const sideTexts = useMemo(() => safeTextElements.filter(t => t.side === side), [safeTextElements, side]);
  const sideLogos = useMemo(() => safeLogos.filter(l => l.side === side), [safeLogos, side]);

  if (!isOpen) return null;

  const updateField = (id:string, patch:Partial<KtaDataFieldConfig>) => setSettings(s => ({ ...s, dataFields:s.dataFields.map(f => f.id===id ? {...f,...patch} : f) }));
  const updateText = (id:string, patch:Partial<KtaTextElement>) => setSettings(s => ({ ...s, textElements:s.textElements.map(t => t.id===id ? {...t,...patch} : t) }));
  const updateLogo = (id:string, patch:Partial<KtaLogoElement>) => setSettings(s => ({ ...s, logos:s.logos.map(l => l.id===id ? {...l,...patch} : l) }));

  const addField = () => setSettings(s => ({ ...s, dataFields:[...s.dataFields, { id:`field-${Date.now()}`, field:'fullName', label:'NAMA', side, visible:true, x:35, y:50 + s.dataFields.filter(f=>f.side===side).length*8, width:50, fontSize:11, fontWeight:'bold', color:'#ffffff', textTransform:'none', align:'left' }] }));
  const addText = () => setSettings(s => ({ ...s, textElements:[...s.textElements, { id:`text-${Date.now()}`, text:'TEKS KUSTOM', side, x:5, y:88, width:90, fontSize:8, fontWeight:'bold', color:'#ffffff', align:'left', textTransform:'none' }] }));
  const addLogo = () => setSettings(s => ({ ...s, logos:[...s.logos, { id:`logo-${Date.now()}`, name:'Logo Baru', url:'', side, x:70, y:6, width:22, height:22, opacity:1, objectFit:'contain' }] }));

  const fileToDataUrl = (file:File) => new Promise<string>((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=reject; r.readAsDataURL(file); });
  const uploadAsset = async (file:File, kind:'logo'|'background') => {
    setMessage('Mengunggah aset ke Google Drive...');
    try {
      const data = await fileToDataUrl(file);
      const result = await spreadsheetService.uploadImageToDrive(data, `KTA_${kind}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`, 'KTA_CARD');
      if (!result.success || !result.directUrl) throw new Error(result.message || 'Upload gagal');
      return result.directUrl;
    } catch (e:any) { setMessage(e?.message || 'Upload aset gagal.'); return ''; }
  };

  const handleAssetUpload = async (e:React.ChangeEvent<HTMLInputElement>, kind:'logo'|'background', id?:string) => {
    const file=e.target.files?.[0]; if(!file) return;
    const url=await uploadAsset(file,kind); e.target.value=''; if(!url) return;
    if(kind==='logo' && id) updateLogo(id,{url});
    if(kind==='background') setSettings(s=>({...s,...(side==='FRONT'?{frontBackgroundUrl:url}:{backBackgroundUrl:url})}));
    setMessage('Aset berhasil diunggah.');
  };

  const applyPreset = (preset:KtaCardPreset) => {
    const p=PRESETS[preset]; setSettings(s=>({...s,preset,widthMm:p.width,heightMm:p.height,cornerRadiusMm:p.radius}));
  };

  const handleSave = async () => {
    setIsSaving(true); setMessage('Menyimpan pengaturan KTA pusat...');
    const next={...settings,lastUpdated:new Date().toISOString()};
    const result=await spreadsheetService.saveKtaSettings(next);
    if(result.success){ setSettings(next); setMessage('Pengaturan KTA berhasil disimpan ke Google Spreadsheet.'); setTimeout(()=>{onSuccess?.(); onClose();},900); }
    else setMessage(result.message);
    setIsSaving(false);
  };

  const handleReset = () => { if(confirm('Reset seluruh desain KTA ke standar nasional?')) setSettings(normalizeKtaSettings(DEFAULT_KTA_SETTINGS)); };
  const handleGenerateByRegion = () => {
    if(!regionProvinceId) return alert('Pilih provinsi terlebih dahulu.');
    if(!confirm('Generate NTA untuk anggota yang belum memiliki nomor? Nomor yang sudah ada tidak diubah.')) return;
    setRegionBusy(true); try { const r=storage.generateNationalMemberNumbersByRegion(regionProvinceId,regionRegencyId||undefined,regionDistrictId||undefined); alert(`Selesai. ${r.updated} anggota diberi NTA baru, ${r.skipped} dilewati.`); } finally { setRegionBusy(false); }
  };

  const input='w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500';
  const numberInput=(value:number,onChange:(v:number)=>void)=><input type="number" min={0} max={100} value={value} onChange={e=>onChange(Number(e.target.value))} className={input}/>;

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-white w-full max-w-7xl max-h-[96vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      <div className="p-5 bg-gradient-to-r from-slate-950 via-purple-950 to-emerald-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><LayoutTemplate/></div><div><h3 className="font-bold">KTA Designer — Pengaturan Super Admin</h3><p className="text-xs text-slate-300">Atur ukuran, data anggota, logo, latar depan/belakang, dan teks kartu secara visual.</p></div></div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><X/></button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 flex-1 min-h-0">
        <div className="xl:col-span-8 p-5 overflow-y-auto space-y-5">
          <section className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800"><CreditCardIcon/><span>1. Ukuran Kartu</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{(Object.keys(PRESETS) as KtaCardPreset[]).map(k=><button key={k} onClick={()=>applyPreset(k)} className={`p-3 rounded-xl border text-left ${settings.preset===k?'border-purple-600 bg-purple-50':'border-slate-200 bg-white'}`}><b className="text-xs">{PRESETS[k].label}</b><div className="text-[10px] text-slate-500 mt-1">{PRESETS[k].width} × {PRESETS[k].height} mm</div></button>)}</div>
            <div className="grid grid-cols-3 gap-2"><label className="text-[10px] font-bold">Lebar (mm){numberInput(settings.widthMm,v=>setSettings(s=>({...s,widthMm:v,preset:'CUSTOM'})))}</label><label className="text-[10px] font-bold">Tinggi (mm){numberInput(settings.heightMm,v=>setSettings(s=>({...s,heightMm:v,preset:'CUSTOM'})))}</label><label className="text-[10px] font-bold">Radius (mm){numberInput(settings.cornerRadiusMm,v=>setSettings(s=>({...s,cornerRadiusMm:v})))}</label></div>
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Eye/><span>2. Sisi yang diedit</span></div><div className="flex p-1 bg-slate-100 rounded-xl"><button onClick={()=>setSide('FRONT')} className={`px-4 py-2 rounded-lg text-xs font-bold ${side==='FRONT'?'bg-white shadow':''}`}>Depan</button><button onClick={()=>setSide('BACK')} className={`px-4 py-2 rounded-lg text-xs font-bold ${side==='BACK'?'bg-white shadow':''}`}>Belakang</button></div></div>
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><ImageIcon/><span>3. Latar Belakang {side==='FRONT'?'Depan':'Belakang'}</span></div><label className="px-3 py-2 rounded-lg bg-purple-900 text-white text-xs font-bold cursor-pointer"><Upload className="inline w-3.5 h-3.5 mr-1"/> Upload Gambar<input type="file" accept="image/*" className="hidden" onChange={e=>handleAssetUpload(e,'background')}/></label></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2"><label className="text-[10px] font-bold">URL Gambar<input value={side==='FRONT'?(settings.frontBackgroundUrl||''):(settings.backBackgroundUrl||'')} onChange={e=>setSettings(s=>({...s,...(side==='FRONT'?{frontBackgroundUrl:e.target.value}:{backBackgroundUrl:e.target.value})}))} className={input}/></label><label className="text-[10px] font-bold">Warna<input type="text" value={side==='FRONT'?(settings.customBackgroundColorFront||'#24105b'):(settings.customBackgroundColorBack||'#111827')} onChange={e=>setSettings(s=>({...s,...(side==='FRONT'?{customBackgroundColorFront:e.target.value}:{customBackgroundColorBack:e.target.value})}))} className={input}/></label><label className="text-[10px] font-bold">Opasitas gambar<input type="range" min="0" max="1" step="0.05" value={settings.bgOpacity??.1} onChange={e=>setSettings(s=>({...s,bgOpacity:Number(e.target.value)}))} className="w-full"/></label></div>
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><ImageIcon/><span>4. Logo / Lambang</span></div><button onClick={addLogo} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Logo</button></div>
            {sideLogos.length===0 && <p className="text-xs text-slate-400">Belum ada logo tambahan. Anda dapat menambahkan beberapa logo dan mengatur posisi serta ukurannya.</p>}
            {sideLogos.map(l=><div key={l.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border"><div className="col-span-4"><input value={l.name} onChange={e=>updateLogo(l.id,{name:e.target.value})} className={input} placeholder="Nama logo"/><label className="block mt-2 text-[10px] text-purple-800 font-bold cursor-pointer"><Upload className="inline w-3 h-3 mr-1"/>Upload<input type="file" accept="image/*" className="hidden" onChange={e=>handleAssetUpload(e,'logo',l.id)}/></label><input value={l.url} onChange={e=>updateLogo(l.id,{url:e.target.value})} className={input+' mt-2'} placeholder="URL logo"/></div><div className="col-span-7 grid grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput(l.x,v=>updateLogo(l.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(l.y,v=>updateLogo(l.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(l.width,v=>updateLogo(l.id,{width:v}))}</label><label className="text-[9px] font-bold">Tinggi{numberInput(l.height,v=>updateLogo(l.id,{height:v}))}</label></div><button onClick={()=>setSettings(s=>({...s,logos:s.logos.filter(x=>x.id!==l.id)}))} className="col-span-1 self-start p-2 text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}
          </section>

          {side==='FRONT' && <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold"><Type/><span>5. Header Organisasi</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border space-y-2"><div className="text-[10px] font-black uppercase">SAKA PARIWISATA</div><input value={settings.frontOrganizationTitle} onChange={e=>setSettings(s=>({...s,frontOrganizationTitle:e.target.value}))} className={input} placeholder="Judul"/><div className="grid grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput(settings.frontOrganizationTitleX??15,v=>setSettings(s=>({...s,frontOrganizationTitleX:v})))}</label><label className="text-[9px] font-bold">Y{numberInput(settings.frontOrganizationTitleY??6,v=>setSettings(s=>({...s,frontOrganizationTitleY:v})))}</label><label className="text-[9px] font-bold">Lebar{numberInput(settings.frontOrganizationTitleWidth??65,v=>setSettings(s=>({...s,frontOrganizationTitleWidth:v})))}</label><label className="text-[9px] font-bold">Font{numberInput(settings.frontOrganizationTitleFontSize??11,v=>setSettings(s=>({...s,frontOrganizationTitleFontSize:v})))}</label></div><div className="grid grid-cols-3 gap-2"><select value={settings.frontOrganizationTitleFontWeight??'bold'} onChange={e=>setSettings(s=>({...s,frontOrganizationTitleFontWeight:e.target.value as any}))} className={input}><option value="normal">Normal</option><option value="medium">Medium</option><option value="bold">Bold</option><option value="black">Black</option></select><select value={settings.frontOrganizationTitleAlign??'left'} onChange={e=>setSettings(s=>({...s,frontOrganizationTitleAlign:e.target.value as any}))} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select><input type="color" value={settings.frontOrganizationTitleColor??'#ffffff'} onChange={e=>setSettings(s=>({...s,frontOrganizationTitleColor:e.target.value}))} className="h-9 w-full rounded"/></div></div>
              <div className="p-3 rounded-xl bg-slate-50 border space-y-2"><div className="text-[10px] font-black uppercase">GERAKAN PRAMUKA INDONESIA</div><input value={settings.frontOrganizationSubtitle} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitle:e.target.value}))} className={input} placeholder="Subjudul"/><div className="grid grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput(settings.frontOrganizationSubtitleX??15,v=>setSettings(s=>({...s,frontOrganizationSubtitleX:v})))}</label><label className="text-[9px] font-bold">Y{numberInput(settings.frontOrganizationSubtitleY??12,v=>setSettings(s=>({...s,frontOrganizationSubtitleY:v})))}</label><label className="text-[9px] font-bold">Lebar{numberInput(settings.frontOrganizationSubtitleWidth??70,v=>setSettings(s=>({...s,frontOrganizationSubtitleWidth:v})))}</label><label className="text-[9px] font-bold">Font{numberInput(settings.frontOrganizationSubtitleFontSize??8,v=>setSettings(s=>({...s,frontOrganizationSubtitleFontSize:v})))}</label></div><div className="grid grid-cols-3 gap-2"><select value={settings.frontOrganizationSubtitleFontWeight??'normal'} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitleFontWeight:e.target.value as any}))} className={input}><option value="normal">Normal</option><option value="medium">Medium</option><option value="bold">Bold</option><option value="black">Black</option></select><select value={settings.frontOrganizationSubtitleAlign??'left'} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitleAlign:e.target.value as any}))} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select><input type="color" value={settings.frontOrganizationSubtitleColor??'#e5e7eb'} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitleColor:e.target.value}))} className="h-9 w-full rounded"/></div></div>
            </div>
          </section>}

          {side==='FRONT' && <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Eye/><span>6. QR / Barcode Depan</span></div><label className="text-xs font-bold flex items-center gap-2"><input type="checkbox" checked={settings.showQrCode} onChange={e=>setSettings(s=>({...s,showQrCode:e.target.checked}))}/> Tampilkan QR</label></div>
            <div className="grid grid-cols-3 gap-2"><label className="text-[9px] font-bold">X{numberInput(settings.qrX??78,v=>setSettings(s=>({...s,qrX:v})))}</label><label className="text-[9px] font-bold">Y{numberInput(settings.qrY??30,v=>setSettings(s=>({...s,qrY:v})))}</label><label className="text-[9px] font-bold">Ukuran{numberInput(settings.qrSize??22,v=>setSettings(s=>({...s,qrSize:v})))}</label></div>
          </section>}

          {side==='BACK' && <section className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60 space-y-3">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-bold text-purple-950"><Eye/><span>5. QR Penandatangan Digital</span></div><label className="text-xs font-bold flex items-center gap-2 text-purple-950"><input type="checkbox" checked={settings.showBarcode!==false} onChange={e=>setSettings(s=>({...s,showBarcode:e.target.checked}))}/> Tampilkan QR</label></div>
            <p className="text-[10px] text-purple-900/70">QR belakang khusus untuk pejabat yang ditunjuk SuperAdmin. QR membuka profil verifikasi pejabat tersebut.</p>
            <label className="block text-[10px] font-bold text-purple-950">Penandatangan
              <select value={(settings as any).signerMemberId || ''} onChange={e=>{const id=e.target.value; const m=activeMembers.find(x=>x.id===id); setSettings(s=>({...s,signerMemberId:id,signerName:m?.fullName || s.signerName,signerTitle:m?.currentPosition || s.signerTitle,signerSubtitle:m ? `${m.provinceName || ''}${m.provinceName && m.regencyName ? ' · ' : ''}${m.regencyName || ''}` : s.signerSubtitle}));}} className={input}>
                <option value="">Pilih anggota yang berwenang</option>
                {activeMembers.map(m=><option key={m.id} value={m.id}>{m.fullName} — {m.currentPosition || 'Tanpa jabatan'}{m.provinceName ? ` · ${m.provinceName}` : ''}</option>)}
              </select>
            </label>
            <div className="p-3 rounded-xl bg-white border border-purple-100 text-[10px] text-slate-600">{signerMember ? <><strong>{signerMember.fullName}</strong> · {signerMember.currentPosition || 'Tanpa jabatan'}<br/>{signerMember.nationalMemberNumber || signerMember.id}</> : 'Belum ada penandatangan yang dipilih.'}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="text-[9px] font-bold">X{numberInput((settings as any).signerQrX??68,v=>setSettings(s=>({...s,signerQrX:v})))}</label>
              <label className="text-[9px] font-bold">Y{numberInput((settings as any).signerQrY??62,v=>setSettings(s=>({...s,signerQrY:v})))}</label>
              <label className="text-[9px] font-bold">Ukuran{numberInput((settings as any).signerQrSize??18,v=>setSettings(s=>({...s,signerQrSize:v})))}</label>
              <label className="text-[9px] font-bold">Margin{numberInput((settings as any).signerQrPadding??2,v=>setSettings(s=>({...s,signerQrPadding:v})))}</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="text-[9px] font-bold">Latar QR<input type="color" value={(settings as any).signerQrBackgroundColor??'#ffffff'} onChange={e=>setSettings(s=>({...s,signerQrBackgroundColor:e.target.value}))} className="h-9 w-full rounded"/></label>
              <label className="text-[9px] font-bold">Border{numberInput((settings as any).signerQrBorderWidth??0,v=>setSettings(s=>({...s,signerQrBorderWidth:v})))}</label>
              <label className="text-[9px] font-bold">Radius{numberInput((settings as any).signerQrBorderRadius??4,v=>setSettings(s=>({...s,signerQrBorderRadius:v})))}</label>
            </div>
            <p className="text-[9px] text-purple-900/60">Pengaturan Barcode lama tetap tersimpan untuk kompatibilitas, tetapi tidak lagi ditampilkan sebagai kontrol utama.</p>
          </section>}

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Type/><span>7. Data Anggota yang Ditampilkan</span></div><button onClick={addField} className="px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Data</button></div>
            {sideFields.map(f=><div key={f.id} className="p-3 bg-slate-50 rounded-xl border space-y-2"><div className="grid grid-cols-2 md:grid-cols-5 gap-2"><select value={f.field} onChange={e=>updateField(f.id,{field:e.target.value as KtaMemberFieldKey,label:FIELD_OPTIONS.find(x=>x.value===e.target.value)?.label||f.label})} className={input}>{FIELD_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><input value={f.label} onChange={e=>updateField(f.id,{label:e.target.value})} className={input}/><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={f.visible} onChange={e=>updateField(f.id,{visible:e.target.checked})}/> Tampilkan</label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={f.showLabel??false} onChange={e=>updateField(f.id,{showLabel:e.target.checked})}/> Label</label><select value={f.fontWeight} onChange={e=>updateField(f.id,{fontWeight:e.target.value as any})} className={input}><option>normal</option><option>medium</option><option>bold</option><option>black</option></select><input type="color" value={f.color} onChange={e=>updateField(f.id,{color:e.target.value})} className="h-9 w-full rounded"/></div><div className="grid grid-cols-2 md:grid-cols-6 gap-2"><label className="text-[9px] font-bold">X{numberInput(f.x,v=>updateField(f.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(f.y,v=>updateField(f.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(f.width,v=>updateField(f.id,{width:v}))}</label><label className="text-[9px] font-bold">Font{numberInput(f.fontSize,v=>updateField(f.id,{fontSize:v}))}</label><select value={f.align||'left'} onChange={e=>updateField(f.id,{align:e.target.value as any})} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select><button onClick={()=>setSettings(s=>({...s,dataFields:s.dataFields.filter(x=>x.id!==f.id)}))} className="text-red-600 text-xs font-bold"><Trash2 className="inline w-4 h-4 mr-1"/>Hapus</button></div></div>)}
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Type/><span>8. Teks Kustom</span></div><button onClick={addText} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Teks</button></div>
            {sideTexts.map(t=><div key={t.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border"><input value={t.text} onChange={e=>updateText(t.id,{text:e.target.value})} className={input+' col-span-5'} placeholder="Teks pada kartu"/><label className="text-[9px] font-bold">X{numberInput(t.x,v=>updateText(t.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(t.y,v=>updateText(t.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(t.width,v=>updateText(t.id,{width:v}))}</label><label className="text-[9px] font-bold">Font{numberInput(t.fontSize,v=>updateText(t.id,{fontSize:v}))}</label><input type="color" value={t.color} onChange={e=>updateText(t.id,{color:e.target.value})} className="h-9 rounded"/><button onClick={()=>setSettings(s=>({...s,textElements:s.textElements.filter(x=>x.id!==t.id)}))} className="text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold"><Type/><span>9. Teks Sistem Kartu</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><label className="text-[10px] font-bold">Judul Organisasi<input value={settings.frontOrganizationTitle} onChange={e=>setSettings(s=>({...s,frontOrganizationTitle:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Subjudul<input value={settings.frontOrganizationSubtitle} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitle:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Masa Berlaku<input value={settings.frontValidityText} onChange={e=>setSettings(s=>({...s,frontValidityText:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Header Belakang<input value={settings.backHeaderTitle} onChange={e=>setSettings(s=>({...s,backHeaderTitle:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Nama Penandatangan<input value={settings.signerName} onChange={e=>setSettings(s=>({...s,signerName:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Jabatan Penandatangan<input value={settings.signerTitle} onChange={e=>setSettings(s=>({...s,signerTitle:e.target.value}))} className={input}/></label></div>
            <label className="text-[10px] font-bold">Ketentuan Belakang<textarea value={settings.terms.join('\n')} onChange={e=>setSettings(s=>({...s,terms:e.target.value.split('\n')}))} className={input+' min-h-24'}/></label>
          </section>

          <section className="p-4 rounded-2xl border border-purple-200 bg-purple-50 space-y-3"><div className="flex items-center gap-2 font-bold text-purple-950"><MapPin/><span>Penerbitan NTA berdasarkan wilayah</span></div><div className="grid grid-cols-3 gap-2"><select value={regionProvinceId} onChange={e=>{setRegionProvinceId(e.target.value);setRegionRegencyId('');setRegionDistrictId('')}} className={input}><option value="">Provinsi</option>{provinces.filter(p=>p.id!=='00').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><select value={regionRegencyId} disabled={!regionProvinceId} onChange={e=>{setRegionRegencyId(e.target.value);setRegionDistrictId('')}} className={input}><option value="">Kabupaten/Kota</option>{regencies.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select><select value={regionDistrictId} disabled={!regionRegencyId} onChange={e=>setRegionDistrictId(e.target.value)} className={input}><option value="">Kecamatan</option>{districts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div><button disabled={!regionProvinceId||regionBusy} onClick={handleGenerateByRegion} className="px-4 py-2 rounded-lg bg-purple-900 text-white text-xs font-bold"><RefreshCw className={`inline w-3.5 h-3.5 mr-1 ${regionBusy?'animate-spin':''}`}/>Generate NTA</button></section>
        </div>

        <div className="xl:col-span-4 bg-slate-950 p-5 flex flex-col items-center justify-center gap-4 min-h-[500px]">
          <div className="text-center"><p className="text-xs font-bold text-emerald-400">LIVE PREVIEW</p><p className="text-[10px] text-slate-400">{settings.widthMm} × {settings.heightMm} mm • {side==='FRONT'?'Bagian Depan':'Bagian Belakang'}</p></div>
          <DigitalMemberCard member={previewMember} previewSettings={settings} showControls={false}/>
          <div className="w-full max-w-sm p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300">{loadingRemote?'Memuat konfigurasi pusat...':'Perubahan di panel ini belum dipublikasikan sampai tombol Simpan ditekan.'}</div>
        </div>
      </div>

      <div className="p-4 border-t bg-slate-50 flex items-center justify-between gap-3"><div className="text-xs font-semibold text-slate-600">{message}</div><div className="flex gap-2"><button onClick={handleReset} className="px-4 py-2 text-xs font-bold"><RotateCcw className="inline w-3.5 h-3.5 mr-1"/>Reset</button><button onClick={onClose} className="px-4 py-2 rounded-xl border text-xs font-bold">Batal</button><button disabled={isSaving} onClick={handleSave} className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"><Save className="inline w-3.5 h-3.5 mr-1"/>{isSaving?'Menyimpan...':'Simpan Pengaturan KTA'}</button></div></div>
    </div>
  </div>;
};

const CreditCardIcon = () => <LayoutTemplate className="w-4 h-4"/>;
