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

export const KtaCardCustomizerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [settings, setSettings] = useState<KtaCardSettings>(clone(DEFAULT_KTA_SETTINGS));
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

  const previewMember: Member = members[0] || ({
    id:'SPW-000001', userId:'user-01', nationalMemberNumber:'00.00.00.000001', fullName:'Rohadi Wijaya', nikMasked:'',
    avatarUrl:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', gender:'LAKI_LAKI', birthPlace:'Jakarta', birthDate:'2000-08-14', phone:'081234567890', email:'admin@sakapariwisata.id', address:'',
    provinceId:'00', provinceName:'Kwartir Nasional', regencyId:'00.00', regencyName:'Kwartir Nasional (Pusat)', districtId:'00.00.00', districtName:'Nasional', branchId:'branch-nasional', branchName:'PANDU NUSANTARA', gugusDepan:'PANDU NUSANTARA', joinYear:2024, currentPosition:'Andalan Nasional', krida:'Krida Mice & Event', status:'ACTIVE', educationLevel:'S1', occupation:'Pimpinan Saka', bio:'', skills:[], certifications:[], locationHistory:[], registeredAt:new Date().toISOString(), verificationToken:'preview'
  } as Member);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setSettings(clone(storage.getKtaSettings()));
    setMessage('');
    setLoadingRemote(true);

    spreadsheetService.refreshKtaSettings()
      .then(remote => {
        if (!cancelled && remote) setSettings(clone(remote));
      })
      .finally(() => {
        if (!cancelled) setLoadingRemote(false);
      });

    return () => { cancelled = true; };
  }, [isOpen]);

  const dataFields = Array.isArray(settings?.dataFields) ? settings.dataFields : [];
  const textElements = Array.isArray(settings?.textElements) ? settings.textElements : [];
  const logos = Array.isArray(settings?.logos) ? settings.logos : [];
  const sideFields = useMemo(() => dataFields.filter(f => f.side === side), [dataFields, side]);
  const sideTexts = useMemo(() => textElements.filter(t => t.side === side), [textElements, side]);
  const sideLogos = useMemo(() => logos.filter(l => l.side === side), [logos, side]);

  if (!isOpen) return null;

  const updateField = (id:string, patch:Partial<KtaDataFieldConfig>) => setSettings(s => ({ ...s, dataFields:s.dataFields.map(f => f.id===id ? {...f,...patch} : f) }));
  const updateText = (id:string, patch:Partial<KtaTextElement>) => setSettings(s => ({ ...s, textElements:s.textElements.map(t => t.id===id ? {...t,...patch} : t) }));
  const updateLogo = (id:string, patch:Partial<KtaLogoElement>) => setSettings(s => ({ ...s, logos:s.logos.map(l => l.id===id ? {...l,...patch} : l) }));

  const addField = () => setSettings(s => ({ ...s, dataFields:[... (Array.isArray(s.dataFields) ? s.dataFields : []), { id:`field-${Date.now()}`, field:'fullName', label:'', showLabel:false, side, visible:true, x:35, y:50 + (Array.isArray(s.dataFields) ? s.dataFields : []).filter(f=>f.side===side).length*8, width:50, fontSize:11, fontWeight:'bold', color:'#ffffff', textTransform:'none', align:'left' }] }));
  const addText = () => setSettings(s => ({ ...s, textElements:[... (Array.isArray(s.textElements) ? s.textElements : []), { id:`text-${Date.now()}`, text:'TEKS KUSTOM', side, x:5, y:88, width:90, fontSize:8, fontWeight:'bold', color:'#ffffff', align:'left', textTransform:'none' }] }));
  const addLogo = () => setSettings(s => ({ ...s, logos:[... (Array.isArray(s.logos) ? s.logos : []), { id:`logo-${Date.now()}`, name:'Logo Baru', url:'', side, x:70, y:6, width:22, height:22, opacity:1, objectFit:'contain' }] }));

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
    const next = { ...settings, lastUpdated: new Date().toISOString() } as KtaCardSettings;
    try {
      const result = await spreadsheetService.saveKtaSettings(next);
      if (!result.success) throw new Error(result.message);

      setSettings(clone(result.settings || next));
      setMessage('Pengaturan KTA berhasil dipublikasikan ke Google Spreadsheet.');
      setTimeout(()=>{onSuccess?.(); onClose();},900);
    } catch (error:any) {
      setMessage(error?.message || 'Gagal menyimpan pengaturan KTA.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => { if(confirm('Reset seluruh desain KTA ke standar nasional?')) setSettings(clone(DEFAULT_KTA_SETTINGS)); };
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

          {side==='FRONT' && <>
          <section className="p-4 rounded-2xl border border-violet-200 bg-violet-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-violet-950"><Sparkles/><span>4. QR Code Verifikasi</span></div>
              <label className="text-xs font-bold flex items-center gap-2">
                <input type="checkbox" checked={settings.showQrCode!==false} onChange={e=>setSettings(s=>({...s,showQrCode:e.target.checked}))}/> Tampilkan QR Code
              </label>
            </div>
            <p className="text-[10px] text-slate-600">Atur posisi QR Code langsung melalui koordinat X/Y dan ukurannya. Nilai X/Y adalah persentase dari sisi kiri dan atas kartu. Pengaturan ini dipakai bersama oleh preview KTA, KTA digital, dan PDF.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="text-[9px] font-bold">Posisi X (%)
                {numberInput(settings.qrX??78,v=>setSettings(s=>({...s,qrX:Math.max(0,Math.min(100,v))})))}
              </label>
              <label className="text-[9px] font-bold">Posisi Y (%)
                {numberInput(settings.qrY??30,v=>setSettings(s=>({...s,qrY:Math.max(0,Math.min(100,v))})))}
              </label>
              <label className="text-[9px] font-bold">Ukuran QR (%)
                {numberInput(settings.qrSize??22,v=>setSettings(s=>({...s,qrSize:Math.max(5,Math.min(60,v))})))}
              </label>
            </div>
            <div className="flex flex-wrap gap-2 text-[9px] text-violet-900">
              <span className="px-2 py-1 rounded-full bg-white border border-violet-200">X lebih besar → QR ke kanan</span>
              <span className="px-2 py-1 rounded-full bg-white border border-violet-200">Y lebih besar → QR ke bawah</span>
              <span className="px-2 py-1 rounded-full bg-white border border-violet-200">Ukuran → besar/kecil QR</span>
            </div>
          </section>
          <section className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold text-blue-950"><Eye/><span>5. Barcode Sisi Depan</span></div><label className="text-xs font-bold flex items-center gap-2"><input type="checkbox" checked={(settings as any).showBarcodeFront!==false} onChange={e=>setSettings(s=>({...s,showBarcodeFront:e.target.checked}))}/> Tampilkan Barcode</label></div>
            <p className="text-[10px] text-slate-600">X/Y mengatur posisi pada kartu. Lebar/Tinggi mengatur area Barcode secara langsung.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput((settings as any).barcodeFrontX??4,v=>setSettings(s=>({...s,barcodeFrontX:v})))} </label><label className="text-[9px] font-bold">Y{numberInput((settings as any).barcodeFrontY??77,v=>setSettings(s=>({...s,barcodeFrontY:v})))} </label><label className="text-[9px] font-bold">Lebar{numberInput((settings as any).barcodeFrontWidth??32,v=>setSettings(s=>({...s,barcodeFrontWidth:v})))} </label><label className="text-[9px] font-bold">Tinggi{numberInput((settings as any).barcodeFrontHeight??9,v=>setSettings(s=>({...s,barcodeFrontHeight:v})))} </label></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><label className="text-[10px] font-bold">Nilai Barcode<input value={(settings as any).barcodeFrontCustomValue||''} onChange={e=>setSettings(s=>({...s,barcodeFrontCustomValue:e.target.value}))} className={input} placeholder="Kosong = NTA / No. Anggota"/></label><label className="text-[10px] font-bold">Caption Barcode<input value={(settings as any).barcodeFrontCaption||''} onChange={e=>setSettings(s=>({...s,barcodeFrontCaption:e.target.value}))} className={input} placeholder="Opsional"/></label></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2"><label className="text-xs font-bold flex items-center gap-2"><input type="checkbox" checked={(settings as any).barcodeFrontShowText===true} onChange={e=>setSettings(s=>({...s,barcodeFrontShowText:e.target.checked}))}/> Tampilkan angka</label><label className="text-[9px] font-bold">Font Caption{numberInput((settings as any).barcodeFrontCaptionFontSize??6,v=>setSettings(s=>({...s,barcodeFrontCaptionFontSize:v})))} </label><label className="text-[9px] font-bold">Spasi Baris{numberInput((settings as any).barcodeFrontCaptionLineHeight??1.1,v=>setSettings(s=>({...s,barcodeFrontCaptionLineHeight:v})))} </label><label className="text-[9px] font-bold">Jarak Huruf{numberInput((settings as any).barcodeFrontCaptionLetterSpacing??0,v=>setSettings(s=>({...s,barcodeFrontCaptionLetterSpacing:v})))} </label></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2"><select value={(settings as any).barcodeFrontCaptionFontWeight??'normal'} onChange={e=>setSettings(s=>({...s,barcodeFrontCaptionFontWeight:e.target.value}))} className={input}><option value="normal">Caption Normal</option><option value="medium">Caption Medium</option><option value="bold">Caption Bold</option><option value="black">Caption Black</option></select><input type="color" value={(settings as any).barcodeFrontCaptionColor||'#ffffff'} onChange={e=>setSettings(s=>({...s,barcodeFrontCaptionColor:e.target.value}))} className="h-9 rounded"/><select value={(settings as any).barcodeFrontCaptionAlign??'center'} onChange={e=>setSettings(s=>({...s,barcodeFrontCaptionAlign:e.target.value}))} className={input}><option value="left">Caption Kiri</option><option value="center">Caption Tengah</option><option value="right">Caption Kanan</option></select></div>
          </section>
          <section className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-950"><ImageIcon/><span>6. Foto Anggota Sisi Depan</span></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={settings.showPhoto!==false} onChange={e=>setSettings(s=>({...s,showPhoto:e.target.checked}))}/><span className="text-xs font-bold">Tampilkan Foto Anggota</span></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput((settings as any).photoX??4,v=>setSettings(s=>({...s,photoX:v})))} </label><label className="text-[9px] font-bold">Y{numberInput((settings as any).photoY??27,v=>setSettings(s=>({...s,photoY:v})))} </label><label className="text-[9px] font-bold">Lebar{numberInput((settings as any).photoWidth??22,v=>setSettings(s=>({...s,photoWidth:v})))} </label><label className="text-[9px] font-bold">Tinggi{numberInput((settings as any).photoHeight??48,v=>setSettings(s=>({...s,photoHeight:v})))} </label></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2"><label className="text-[9px] font-bold">Radius{numberInput((settings as any).photoRadius??12,v=>setSettings(s=>({...s,photoRadius:v})))} </label><label className="text-[9px] font-bold">Border{numberInput((settings as any).photoBorderWidth??2,v=>setSettings(s=>({...s,photoBorderWidth:v})))} </label><select value={(settings as any).photoObjectFit??'cover'} onChange={e=>setSettings(s=>({...s,photoObjectFit:e.target.value}))} className={input}><option value="cover">Foto memenuhi area</option><option value="contain">Foto utuh</option><option value="fill">Regangkan foto</option></select></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><input type="color" value={(settings as any).photoBorderColor||'#fcd34d'} onChange={e=>setSettings(s=>({...s,photoBorderColor:e.target.value}))} className="h-9 rounded"/><p className="text-[10px] text-slate-500 flex items-center">Perubahan X/Y, lebar dan tinggi langsung terlihat pada LIVE PREVIEW.</p></div>
          </section>
          </>}
          {side==='BACK' && <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Eye/><span>5. Barcode Sisi Belakang</span></div><label className="text-xs font-bold flex items-center gap-2"><input type="checkbox" checked={settings.showBarcode!==false} onChange={e=>setSettings(s=>({...s,showBarcode:e.target.checked}))}/> Tampilkan Barcode</label></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <label className="text-[9px] font-bold">X{numberInput(settings.barcodeX??68,v=>setSettings(s=>({...s,barcodeX:v})))}</label>
              <label className="text-[9px] font-bold">Y{numberInput(settings.barcodeY??70,v=>setSettings(s=>({...s,barcodeY:v})))}</label>
              <label className="text-[9px] font-bold">Lebar{numberInput(settings.barcodeWidth??27,v=>setSettings(s=>({...s,barcodeWidth:v})))}</label>
              <label className="text-[9px] font-bold">Tinggi{numberInput(settings.barcodeHeight??9,v=>setSettings(s=>({...s,barcodeHeight:v})))}</label>
              <label className="text-xs font-bold flex items-center gap-2"><input type="checkbox" checked={settings.barcodeShowText===true} onChange={e=>setSettings(s=>({...s,barcodeShowText:e.target.checked}))}/> Tampilkan angka</label>
            </div>
            <label className="text-[10px] font-bold">Nilai Barcode<input value={settings.barcodeCustomValue||''} onChange={e=>setSettings(s=>({...s,barcodeCustomValue:e.target.value}))} className={input} placeholder="Kosong = NTA / No. Anggota"/></label>
          </section>}

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><ImageIcon/><span>5. Logo / Lambang</span></div><button onClick={addLogo} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Logo</button></div>
            {sideLogos.length===0 && <p className="text-xs text-slate-400">Belum ada logo tambahan. Anda dapat menambahkan beberapa logo dan mengatur posisi serta ukurannya.</p>}
            {sideLogos.map(l=><div key={l.id} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border"><div className="col-span-4"><input value={l.name} onChange={e=>updateLogo(l.id,{name:e.target.value})} className={input} placeholder="Nama logo"/><label className="block mt-2 text-[10px] text-purple-800 font-bold cursor-pointer"><Upload className="inline w-3 h-3 mr-1"/>Upload<input type="file" accept="image/*" className="hidden" onChange={e=>handleAssetUpload(e,'logo',l.id)}/></label><input value={l.url} onChange={e=>updateLogo(l.id,{url:e.target.value})} className={input+' mt-2'} placeholder="URL logo"/></div><div className="col-span-7 grid grid-cols-4 gap-2"><label className="text-[9px] font-bold">X{numberInput(l.x,v=>updateLogo(l.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(l.y,v=>updateLogo(l.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(l.width,v=>updateLogo(l.id,{width:v}))}</label><label className="text-[9px] font-bold">Tinggi{numberInput(l.height,v=>updateLogo(l.id,{height:v}))}</label></div><button onClick={()=>setSettings(s=>({...s,logos:s.logos.filter(x=>x.id!==l.id)}))} className="col-span-1 self-start p-2 text-red-600"><Trash2 className="w-4 h-4"/></button></div>)}
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Type/><span>5. Data Anggota yang Ditampilkan</span></div><button onClick={addField} className="px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Data</button></div>
            {sideFields.map(f=><div key={f.id} className="p-3 bg-slate-50 rounded-xl border space-y-2"><div className="grid grid-cols-2 md:grid-cols-5 gap-2"><select value={f.field} onChange={e=>updateField(f.id,{field:e.target.value as KtaMemberFieldKey,label:FIELD_OPTIONS.find(x=>x.value===e.target.value)?.label||f.label})} className={input}>{FIELD_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select><input value={f.label||''} onChange={e=>updateField(f.id,{label:e.target.value})} className={input} placeholder="Label opsional"/><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={f.visible} onChange={e=>updateField(f.id,{visible:e.target.checked})}/> Tampilkan</label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={f.showLabel===true} onChange={e=>updateField(f.id,{showLabel:e.target.checked})}/> Label</label><select value={f.fontWeight} onChange={e=>updateField(f.id,{fontWeight:e.target.value as any})} className={input}><option>normal</option><option>medium</option><option>bold</option><option>black</option></select><input type="color" value={f.color} onChange={e=>updateField(f.id,{color:e.target.value})} className="h-9 w-full rounded"/></div><div className="grid grid-cols-2 md:grid-cols-6 gap-2"><label className="text-[9px] font-bold">X{numberInput(f.x,v=>updateField(f.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(f.y,v=>updateField(f.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(f.width,v=>updateField(f.id,{width:v}))}</label><label className="text-[9px] font-bold">Font{numberInput(f.fontSize,v=>updateField(f.id,{fontSize:v}))}</label><label className="text-[9px] font-bold">Spasi Baris{numberInput((f as any).lineHeight??1.15,v=>updateField(f.id,{lineHeight:v} as any))}</label><label className="text-[9px] font-bold">Jarak Huruf{numberInput((f as any).letterSpacing??0,v=>updateField(f.id,{letterSpacing:v} as any))}</label><select value={f.align||'left'} onChange={e=>updateField(f.id,{align:e.target.value as any})} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select><button onClick={()=>setSettings(s=>({...s,dataFields:s.dataFields.filter(x=>x.id!==f.id)}))} className="text-red-600 text-xs font-bold"><Trash2 className="inline w-4 h-4 mr-1"/>Hapus</button></div></div>)}
          </section>

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 font-bold"><Type/><span>6. Teks Kustom</span></div><button onClick={addText} className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"><Plus className="inline w-3.5 h-3.5 mr-1"/> Tambah Teks</button></div>
            {sideTexts.map(t=><div key={t.id} className="p-3 bg-slate-50 rounded-xl border space-y-2"><div className="grid grid-cols-1 md:grid-cols-4 gap-2"><input value={t.text} onChange={e=>updateText(t.id,{text:e.target.value})} className={input+' md:col-span-2'} placeholder="Teks pada kartu"/><select value={t.fontWeight||'normal'} onChange={e=>updateText(t.id,{fontWeight:e.target.value as any})} className={input}><option value="normal">Normal</option><option value="medium">Medium</option><option value="bold">Bold</option><option value="black">Black</option></select><input type="color" value={t.color||'#ffffff'} onChange={e=>updateText(t.id,{color:e.target.value})} className="h-9 rounded"/></div><div className="grid grid-cols-2 md:grid-cols-8 gap-2"><label className="text-[9px] font-bold">X{numberInput(t.x,v=>updateText(t.id,{x:v}))}</label><label className="text-[9px] font-bold">Y{numberInput(t.y,v=>updateText(t.id,{y:v}))}</label><label className="text-[9px] font-bold">Lebar{numberInput(t.width,v=>updateText(t.id,{width:v}))}</label><label className="text-[9px] font-bold">Font{numberInput(t.fontSize,v=>updateText(t.id,{fontSize:v}))}</label><label className="text-[9px] font-bold">Spasi Baris{numberInput((t as any).lineHeight??1.2,v=>updateText(t.id,{lineHeight:v} as any))}</label><label className="text-[9px] font-bold">Jarak Huruf{numberInput((t as any).letterSpacing??0,v=>updateText(t.id,{letterSpacing:v} as any))}</label><select value={t.align||'left'} onChange={e=>updateText(t.id,{align:e.target.value as any})} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select><button onClick={()=>setSettings(s=>({...s,textElements:s.textElements.filter(x=>x.id!==t.id)}))} className="text-red-600"><Trash2 className="w-4 h-4"/></button></div></div>)}
          </section>

          {side==='BACK' && <section className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-950"><Type/><span>7. Semua Teks Sisi Belakang</span></div>
            <p className="text-[10px] text-slate-600">Semua teks belakang dapat diubah langsung. Posisi, ukuran, warna, dan perataan juga dapat diatur.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-[10px] font-bold">Judul Belakang<input value={settings.backHeaderTitle||''} onChange={e=>setSettings(s=>({...s,backHeaderTitle:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold">Subjudul Belakang<input value={settings.backHeaderSubtitle||''} onChange={e=>setSettings(s=>({...s,backHeaderSubtitle:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold md:col-span-2">Ketentuan / Informasi<textarea value={(settings.terms||[]).join('\n')} onChange={e=>setSettings(s=>({...s,terms:e.target.value.split('\n')}))} className={input+' min-h-24'} placeholder="Satu baris untuk setiap ketentuan"/></label>
              <label className="text-[10px] font-bold">Lokasi & Tanggal<input value={settings.issueLocationDate||''} onChange={e=>setSettings(s=>({...s,issueLocationDate:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold">Nama Penandatangan<input value={settings.signerName||''} onChange={e=>setSettings(s=>({...s,signerName:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold">Jabatan Penandatangan<input value={settings.signerTitle||''} onChange={e=>setSettings(s=>({...s,signerTitle:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold">Subteks Penandatangan<input value={settings.signerSubtitle||''} onChange={e=>setSettings(s=>({...s,signerSubtitle:e.target.value}))} className={input}/></label>
              <label className="text-[10px] font-bold">Caption Barcode<input value={(settings as any).barcodeCaption||'VERIFIKASI'} onChange={e=>setSettings(s=>({...s,barcodeCaption:e.target.value}))} className={input}/></label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="text-[9px] font-bold">Judul X{numberInput((settings as any).backHeaderTitleX??5,v=>setSettings(s=>({...s,backHeaderTitleX:v})))} </label>
              <label className="text-[9px] font-bold">Judul Y{numberInput((settings as any).backHeaderTitleY??6,v=>setSettings(s=>({...s,backHeaderTitleY:v})))} </label>
              <label className="text-[9px] font-bold">Judul Font{numberInput((settings as any).backHeaderTitleFontSize??11,v=>setSettings(s=>({...s,backHeaderTitleFontSize:v})))} </label>
              <label className="text-[9px] font-bold">Subjudul Font{numberInput((settings as any).backHeaderSubtitleFontSize??8,v=>setSettings(s=>({...s,backHeaderSubtitleFontSize:v})))} </label>
              <label className="text-[9px] font-bold">Teks X{numberInput((settings as any).termsX??5,v=>setSettings(s=>({...s,termsX:v})))} </label>
              <label className="text-[9px] font-bold">Teks Y{numberInput((settings as any).termsY??25,v=>setSettings(s=>({...s,termsY:v})))} </label>
              <label className="text-[9px] font-bold">Teks Font{numberInput((settings as any).termsFontSize??7,v=>setSettings(s=>({...s,termsFontSize:v})))} </label>
              <label className="text-[9px] font-bold">Penandatangan Y{numberInput((settings as any).signerY??78,v=>setSettings(s=>({...s,signerY:v})))} </label>
            </div>
          </section>}

          {side==='FRONT' && <section className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-950"><Type/><span>7. Semua Teks Sistem Sisi Depan</span></div>
            <p className="text-[10px] text-slate-600">Judul organisasi, subjudul, dan masa berlaku dapat diatur lengkap: ukuran huruf, posisi, lebar paragraf, perataan, ketebalan, warna, spasi baris, dan jarak huruf.</p>
            <div className="space-y-3">
              {[['Judul Organisasi','frontOrganizationTitle','frontOrganizationTitleX','frontOrganizationTitleY','frontOrganizationTitleWidth','frontOrganizationTitleFontSize','frontOrganizationTitleFontWeight','frontOrganizationTitleColor','frontOrganizationTitleAlign','frontOrganizationTitleLineHeight','frontOrganizationTitleLetterSpacing'],['Subjudul','frontOrganizationSubtitle','frontOrganizationSubtitleX','frontOrganizationSubtitleY','frontOrganizationSubtitleWidth','frontOrganizationSubtitleFontSize','frontOrganizationSubtitleFontWeight','frontOrganizationSubtitleColor','frontOrganizationSubtitleAlign','frontOrganizationSubtitleLineHeight','frontOrganizationSubtitleLetterSpacing'],['Masa Berlaku','frontValidityText','frontValidityTextX','frontValidityTextY','frontValidityTextWidth','frontValidityTextFontSize','frontValidityTextFontWeight','frontValidityTextColor','frontValidityTextAlign','frontValidityTextLineHeight','frontValidityTextLetterSpacing']].map((cfg:any[],idx)=><div key={cfg[1]} className="p-3 bg-white rounded-xl border space-y-2"><input value={(settings as any)[cfg[1]]||''} onChange={e=>setSettings(s=>({...s,[cfg[1]]:e.target.value}))} className={input} placeholder={cfg[0]}/><div className="grid grid-cols-2 md:grid-cols-6 gap-2"><label className="text-[9px] font-bold">X{numberInput((settings as any)[cfg[2]]??(idx===2?4:15),v=>setSettings(s=>({...s,[cfg[2]]:v})))} </label><label className="text-[9px] font-bold">Y{numberInput((settings as any)[cfg[3]]??(idx===0?6:idx===1?12:92),v=>setSettings(s=>({...s,[cfg[3]]:v})))} </label><label className="text-[9px] font-bold">Lebar{numberInput((settings as any)[cfg[4]]??(idx===2?92:idx===0?65:70),v=>setSettings(s=>({...s,[cfg[4]]:v})))} </label><label className="text-[9px] font-bold">Font{numberInput((settings as any)[cfg[5]]??(idx===0?11:idx===1?8:7),v=>setSettings(s=>({...s,[cfg[5]]:v})))} </label><label className="text-[9px] font-bold">Spasi Baris{numberInput((settings as any)[cfg[9]]??(idx===0?1.15:1.2),v=>setSettings(s=>({...s,[cfg[9]]:v})))} </label><label className="text-[9px] font-bold">Jarak Huruf{numberInput((settings as any)[cfg[10]]??0,v=>setSettings(s=>({...s,[cfg[10]]:v})))} </label></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><select value={(settings as any)[cfg[6]]??(idx===0?'bold':'normal')} onChange={e=>setSettings(s=>({...s,[cfg[6]]:e.target.value}))} className={input}><option value="normal">Normal</option><option value="medium">Medium</option><option value="bold">Bold</option><option value="black">Black</option></select><input type="color" value={(settings as any)[cfg[7]]||'#ffffff'} onChange={e=>setSettings(s=>({...s,[cfg[7]]:e.target.value}))} className="h-9 rounded"/><select value={(settings as any)[cfg[8]]??'left'} onChange={e=>setSettings(s=>({...s,[cfg[8]]:e.target.value}))} className={input}><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></div></div>) }
            </div>
          </section>}

          <section className="p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold"><Type/><span>8. Teks Sistem Tambahan</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><label className="text-[10px] font-bold">Judul Organisasi<input value={settings.frontOrganizationTitle} onChange={e=>setSettings(s=>({...s,frontOrganizationTitle:e.target.value}))} className={input}/></label><label className="text-[10px] font-bold">Subjudul<input value={settings.frontOrganizationSubtitle} onChange={e=>setSettings(s=>({...s,frontOrganizationSubtitle:e.target.value}))} className={input}/></label></div>
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
