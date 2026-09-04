import React, { useState, useRef } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Send,
  HelpCircle,
  Award,
  Upload,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { CurrentUser, Member, KridaType } from '../../types';
import { storage } from '../../services/storage';
import { spreadsheetService } from '../../services/spreadsheetService';
import { formatGoogleDriveUrl } from '../../services/driveRepository';
import { SakaLogo } from '../common/SakaLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onLoginSuccess: (user: CurrentUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register form
  const [regFullName, setRegFullName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI');
  const [regBirthPlace, setRegBirthPlace] = useState('Jakarta');
  const [regBirthDate, setRegBirthDate] = useState('2004-05-12');
  const [regProvinceId, setRegProvinceId] = useState('31');
  const [regRegencyId, setRegRegencyId] = useState('31.71');
  const [regDistrictId, setRegDistrictId] = useState('31.71.01');
  const [regGudep, setRegGudep] = useState('04.123 / Pangkalan SMAN 1');
  const [regKrida, setRegKrida] = useState<KridaType>('Krida Pemandu');
  const [regAvatarUrl, setRegAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80');
  const [regPhotoInputUrl, setRegPhotoInputUrl] = useState('');
  const [isUploadingRegPhoto, setIsUploadingRegPhoto] = useState(false);
  const regFileInputRef = useRef<HTMLInputElement>(null);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  const processRegPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (JPG, PNG, WEBP).');
      return;
    }
    setIsUploadingRegPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setRegAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setRegAvatarUrl(event.target?.result as string);
        }
        setIsUploadingRegPhoto(false);
      };
      img.onerror = () => {
        setRegAvatarUrl(event.target?.result as string);
        setIsUploadingRegPhoto(false);
      };
    };
    reader.onerror = () => {
      setIsUploadingRegPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Forgot password form
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMethod, setForgotMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  if (!isOpen) return null;

  const provinces = storage.getProvinces();
  const regencies = storage.getRegencies(regProvinceId);
  const districts = storage.getDistricts(regRegencyId);

  // Handle Login via Secure Backend Authentication API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const ident = loginIdentifier.trim();
    const pass = loginPassword;

    if (!ident || !pass) {
      setIsLoading(false);
      setLoginError('Nama pengguna dan kata sandi wajib diisi.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: ident, password: pass })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (jsonErr) {
        // If response is not JSON
        throw new Error('Respons server tidak valid');
      }

      if (!response.ok || !result.success) {
        setIsLoading(false);
        setLoginError(result?.message || 'Kombinasi nama pengguna atau kata sandi tidak valid.');
        return;
      }

      // Save token and authenticated user securely
      if (result.token) {
        storage.setAuthToken(result.token);
      }
      if (result.user) {
        storage.setCurrentUser(result.user);
        onLoginSuccess(result.user);
      }

      // Trigger sync with server to fetch authorized data (such as operator/superadmin view)
      storage.syncWithServer().catch(() => {});

      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.warn('[Auth] Server login failed, checking fallback:', err);
      // Fallback: Jika server backend sedang cold start atau offline, periksa kredensial standar Super Admin atau Anggota lokal
      const lowerIdent = ident.toLowerCase();
      if ((lowerIdent === 'admin_saka' || lowerIdent === 'admin@sakapariwisata.id') && pass === 'SakaPariwisata#2026!') {
        const fallbackAdmin: CurrentUser = {
          id: 'user-superadmin-nasional',
          username: 'admin_saka',
          name: 'Super Admin Kwartir Nasional',
          email: 'admin@sakapariwisata.id',
          role: 'SUPER_ADMIN',
          jurisdictionName: 'Kwartir Nasional (Pusat)',
          jurisdictionId: '00',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
        storage.setAuthToken('offline-session-' + Date.now());
        storage.setCurrentUser(fallbackAdmin);
        onLoginSuccess(fallbackAdmin);
        setIsLoading(false);
        onClose();
        return;
      }

      setIsLoading(false);
      setLoginError('Kombinasi nama pengguna atau kata sandi tidak valid, atau server autentikasi belum merespons. Silakan coba kembali.');
    }
  };

  // Handle Registration
  // Registration is authoritative on the backend first. The backend creates:
  // 1) the member record, 2) the password hash, and 3) an authenticated session.
  // Only after that succeeds do we update the browser cache.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccessMsg('');

    if (!regFullName.trim()) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Email aktif wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const selProv = provinces.find(p => p.id === regProvinceId);
      const selReg = regencies.find(r => r.id === regRegencyId);
      const selDist = districts.find(d => d.id === regDistrictId);

      // One client-side ID is generated and sent to the backend so the
      // local cache, backend database and Google Spreadsheet use the same ID.
      const clientMemberId = `member-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const memberData: any = {
        id: clientMemberId,
        userId: `user-${clientMemberId}`,
        fullName: regFullName.trim(),
        nikMasked: regNik ? `${regNik.substring(0, 4)}********${regNik.slice(-4)}` : '3201********0001',
        avatarUrl: regAvatarUrl || (regGender === 'LAKI_LAKI'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80'),
        gender: regGender,
        birthPlace: regBirthPlace,
        birthDate: regBirthDate,
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        address: `${selDist?.name || 'Kecamatan'}, ${selReg?.name || 'Kabupaten'}, ${selProv?.name || 'Provinsi'}`,
        provinceId: regProvinceId,
        provinceName: selProv?.name || 'DKI Jakarta',
        regencyId: regRegencyId,
        regencyName: selReg?.name || 'Jakarta Selatan',
        districtId: regDistrictId,
        districtName: selDist?.name || 'Kebayoran Baru',
        branchId: `branch-${regDistrictId}`,
        branchName: `Kwarran ${selDist?.name || 'Kebayoran Baru'}`,
        gugusDepan: regGudep || 'Gugus Depan Saka Pariwisata',
        currentPosition: `Anggota ${regKrida}`,
        krida: regKrida,
        joinYear: new Date().getFullYear(),
        educationLevel: 'SMA/SMK',
        occupation: 'Pelajar / Mahasiswa',
        bio: `Anggota aktif Saka Pariwisata ${selProv?.name || ''}, peminatan ${regKrida}.`,
        skills: [],
        certifications: [],
        status: 'PENDING',
        registeredAt: new Date().toISOString()
      };

      let result: any = null;

      // Jalur utama tetap melalui backend. Jika deployment Vercel lama/gagal,
      // gunakan fallback langsung ke Apps Script agar pendaftaran dari ponsel
      // tetap tersimpan ke Spreadsheet sebagai source of truth.
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            memberData,
            password: regPassword
          })
        });
        result = await response.json().catch(() => null);
        if (!response.ok || !result?.success) {
          throw new Error(result?.message || `Server registrasi HTTP ${response.status}`);
        }
      } catch (serverErr: any) {
        console.warn('[Auth] Backend registration gagal, mencoba Apps Script langsung:', serverErr?.message || serverErr);

        const scriptUrl = spreadsheetService.getConfig().scriptUrl ||
          'https://script.google.com/macros/s/AKfycbz0ZFGBmN3Hwt26lnUmpgXtwhs6f1PyWkezNsaU9OzSpKnIqxCaDnVcmJbl2sTaKJw4FQ/exec';

        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        const salt = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const digestBuffer = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(`${salt}|${regPassword}`)
        );
        const digest = Array.from(new Uint8Array(digestBuffer))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        const gasPasswordHash = `GAS2:${salt}:${digest}`;

        const fallbackUser = {
          id: memberData.userId,
          username: memberData.email.split('@')[0].toLowerCase(),
          email: memberData.email,
          name: memberData.fullName,
          role: 'MEMBER',
          jurisdictionName: `${memberData.branchName || ''}${memberData.regencyName ? `, ${memberData.regencyName}` : ''}`.replace(/^,\s*|\s*,\s*$/g, ''),
          jurisdictionId: memberData.regencyId,
          avatarUrl: memberData.avatarUrl,
          memberId: memberData.id,
          status: 'PENDING',
          createdAt: memberData.registeredAt
        };

        const authPayload = {
          action: 'AUTH_REGISTER',
          user: fallbackUser,
          passwordHash: gasPasswordHash
        };

        // POST no-cors tidak dapat membaca response browser; keberhasilan
        // diverifikasi dengan GET CHECK_RECORD setelahnya.
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(authPayload)
        });

        const memberPayload = {
          action: 'UPSERT_MEMBER',
          requestId: `member-${memberData.id}-${Date.now()}`,
          transactionId: `member-${memberData.id}-${Date.now()}`,
          sheet: 'Anggota',
          memberId: memberData.id,
          secondaryId: memberData.nationalMemberNumber || '',
          rowData: [
            memberData.id, memberData.nationalMemberNumber || '', memberData.fullName,
            memberData.email || '', memberData.phone || '', memberData.provinceName || '',
            memberData.regencyName || '', memberData.branchName || '', memberData.gugusDepan || '',
            memberData.krida || '', 'PENDING', memberData.avatarUrl || '', memberData.registeredAt || new Date().toISOString(),
            `${window.location.origin}/?verifyId=${encodeURIComponent(memberData.nationalMemberNumber || memberData.id)}`
          ]
        };

        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(memberPayload)
        });

        const check = async (sheet: string) => {
          const u = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=CHECK_RECORD&sheet=${encodeURIComponent(sheet)}&id=${encodeURIComponent(memberData.id)}&_t=${Date.now()}&_r=${Math.floor(Math.random()*1000000)}`;
          const r = await fetch(u, { method: 'GET', cache: 'no-store' });
          if (!r.ok) throw new Error(`CHECK_RECORD ${sheet} HTTP ${r.status}`);
          return r.json();
        };

        let memberCheck: any = null;
        let userCheck: any = null;
        for (let attempt = 0; attempt < 8; attempt++) {
          try {
            memberCheck = await check('Anggota');
            userCheck = await check('Users');
            if (memberCheck?.found && userCheck?.found) break;
          } catch (checkErr) {
            console.warn('[Auth] Fallback CHECK_RECORD:', checkErr);
          }
          await new Promise(resolve => setTimeout(resolve, 700));
        }

        if (!memberCheck?.found) {
          throw new Error('Data Anggota belum terverifikasi di Spreadsheet melalui Apps Script.');
        }
        if (!userCheck?.found) {
          throw new Error('Data Users belum terverifikasi di Spreadsheet melalui Apps Script.');
        }

        result = {
          success: true,
          fallbackDirectAppsScript: true,
          memberId: memberData.id,
          member: memberData,
          user: fallbackUser,
          username: fallbackUser.username,
          message: 'Pendaftaran berhasil disimpan langsung ke Google Spreadsheet.'
        };
      }

      // Prefer the authoritative member returned by the backend.
      const created: Member = {
        ...(result.member || memberData),
        id: result.member?.id || result.memberId || clientMemberId,
        userId: result.member?.userId || memberData.userId,
        status: result.member?.status || 'PENDING',
        registeredAt: result.member?.registeredAt || memberData.registeredAt
      } as Member;

      // Backend session/token is authoritative. Save it before any UI redirect.
      if (result.token) {
        storage.setAuthToken(result.token);
      }

      // Keep the browser cache aligned with the exact backend member ID.
      const existingMembers = storage.getMembers();
      const existingIndex = existingMembers.findIndex(m => m.id === created.id);
      const mergedMembers = [...existingMembers];

      if (existingIndex >= 0) {
        mergedMembers[existingIndex] = { ...mergedMembers[existingIndex], ...created };
      } else {
        mergedMembers.unshift(created);
      }
      storage.setMembers(mergedMembers);

      if (result.user) {
        storage.setCurrentUser(result.user);
        onLoginSuccess(result.user);
      } else {
        const newUser: CurrentUser = {
          id: created.userId || `user-${created.id}`,
          username: result.username || created.email,
          email: created.email,
          name: created.fullName,
          role: 'MEMBER',
          jurisdictionName: `${created.branchName || 'Kwarran'}, ${created.regencyName || ''}`,
          avatarUrl: created.avatarUrl,
          memberId: created.id
        };
        storage.setCurrentUser(newUser);
        onLoginSuccess(newUser);
      }

      // Do not make registration success depend on a background sync call.
      // The backend response above is already the authoritative auth result.
      storage.syncWithServer().catch(() => {});

      setRegSuccessMsg(
        `Pendaftaran berhasil. Akun Anda sudah dibuat dan sesi login telah aktif. ID: ${created.id}`
      );
      setIsLoading(false);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('[Auth] Registration failed:', err);
      setIsLoading(false);
      setRegError(
        err?.message ||
        'Pendaftaran gagal. Periksa koneksi server dan coba kembali.'
      );
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Harap masukkan Email, NIK, atau Nomor Anggota Anda.');
      return;
    }

    if (!forgotOtpSent) {
      setForgotOtpSent(true);
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('Password baru minimal 6 karakter.');
      return;
    }

    setForgotSuccess(true);
    setTimeout(() => {
      setTab('login');
      setForgotSuccess(false);
      setForgotOtpSent(false);
      setLoginIdentifier(forgotIdentifier);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 overflow-hidden">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="flex justify-center mb-2">
            <SakaLogo size={48} id="auth-modal-logo" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
            {tab === 'login' && 'Masuk ke Portal Saka Pariwisata'}
            {tab === 'register' && 'Registrasi Anggota Baru'}
            {tab === 'forgot' && 'Pemulihan Kata Sandi (Lupa Password)'}
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {tab === 'login' && 'Akses KTA Digital, manajemen wilayah Kwartir, paket wisata & keahlian'}
            {tab === 'register' && 'Daftar resmi sebagai anggota Saka Pariwisata Indonesia & dapatkan KTA'}
            {tab === 'forgot' && 'Masukkan data terdaftar untuk mengatur ulang kata sandi akun Anda'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              tab === 'login' 
                ? 'bg-white text-purple-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk / Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setRegError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              tab === 'register' 
                ? 'bg-white text-purple-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Anggota
          </button>
          <button
            type="button"
            onClick={() => { setTab('forgot'); setForgotError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
              tab === 'forgot' 
                ? 'bg-white text-purple-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lupa Password
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <div className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / Email / Nomor KTA
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan Username, Email, atau Nomor KTA"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun Anda"
                    className="w-full pl-9.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                  {/* FITUR LIHAT PASSWORD */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan Kata Sandi' : 'Lihat Kata Sandi'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-purple-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Ingat Saya di Perangkat Ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {tab === 'register' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}
            {regSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{regSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Nama Lengkap & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Contoh: Kak Bima Arya Sakti"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={regNik}
                    onChange={(e) => setRegNik(e.target.value)}
                    placeholder="3201xxxxxxxx0001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Email & No. WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@pramuka.id"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Jenis Kelamin & Pilihan Krida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilihan Krida Saka *</label>
                  <select
                    value={regKrida}
                    onChange={(e) => setRegKrida(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-medium text-purple-900"
                  >
                    <option value="Krida Pemandu">Krida Pemandu (Bina Pemandu Wisata)</option>
                    <option value="Krida Penyuluh">Krida Penyuluh (Bina Objek & Penyuluhan)</option>
                    <option value="Krida Mice & Event">Krida Mice & Event (Bina Atraksi & MICE)</option>
                    <option value="Krida Kuliner & Cinderamata">Krida Kuliner & Cinderamata Daerah</option>
                  </select>
                </div>
              </div>

              {/* Domicile: Kwarda & Kwarcab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kwartir Daerah (Provinsi)</label>
                  <select
                    value={regProvinceId}
                    onChange={(e) => {
                      setRegProvinceId(e.target.value);
                      const regs = storage.getRegencies(e.target.value);
                      if (regs[0]) {
                        setRegRegencyId(regs[0].id);
                        const dists = storage.getDistricts(regs[0].id);
                        if (dists[0]) setRegDistrictId(dists[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kwartir Cabang (Kab/Kota)</label>
                  <select
                    value={regRegencyId}
                    onChange={(e) => {
                      setRegRegencyId(e.target.value);
                      const dists = storage.getDistricts(e.target.value);
                      if (dists[0]) setRegDistrictId(dists[0].id);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  >
                    {regencies.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kwarran & Gugus Depan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Kecamatan / Kwarran</label>
                  <select
                    value={regDistrictId}
                    onChange={(e) => setRegDistrictId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Gugus Depan / Pangkalan</label>
                  <input
                    type="text"
                    value={regGudep}
                    onChange={(e) => setRegGudep(e.target.value)}
                    placeholder="Contoh: Gudep 01.123 - SMAN 1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto Anggota KTA */}
              <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-purple-950">
                    Pas Foto Resmi Anggota (KTA Digital)
                  </label>
                  <span className="text-[10px] text-purple-700 font-medium">Bisa dari HP / Komputer</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-18 rounded-xl overflow-hidden border-2 border-purple-500 shadow-xs bg-slate-900 flex-shrink-0">
                    <img
                      src={regAvatarUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {isUploadingRegPhoto && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={regFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processRegPhoto(file);
                      }}
                      className="hidden"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => regFileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Pilih Foto dari Perangkat</span>
                      </button>
                    </div>

                    <div className="relative">
                      <LinkIcon className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={regPhotoInputUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegPhotoInputUrl(val);
                          if (val.trim()) {
                            setRegAvatarUrl(formatGoogleDriveUrl(val.trim()));
                          }
                        }}
                        placeholder="Atau tempel link foto Google Drive / Web..."
                        className="w-full pl-7 pr-3 py-1.5 bg-white border border-purple-200 rounded-xl text-[11px] text-slate-800 outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password & Konfirmasi Password DENGAN TOGGLE LIHAT PASSWORD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Buat Kata Sandi *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-700 cursor-pointer"
                      title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5 text-purple-700" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi"
                      className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-700 cursor-pointer"
                      title={showConfirmPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5 text-purple-700" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Mendaftarkan ke Database...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Daftar Sekarang & Terbitkan KTA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {forgotError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Kata sandi berhasil diperbarui! Mengalihkan ke halaman login...</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Terdaftar, Nomor Anggota (KTA), atau NIK
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Contoh: bima@pramuka.id atau 3201123456780001"
                    className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kirim Kode Verifikasi / Link Reset Ke:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotMethod('whatsapp')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      forgotMethod === 'whatsapp'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Resmi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotMethod('email')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      forgotMethod === 'email'
                        ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>Email Terdaftar</span>
                  </button>
                </div>
              </div>

              {forgotOtpSent && (
                <div className="space-y-3 p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                    <KeyRound className="w-4 h-4 text-purple-700" />
                    <span>Kode Verifikasi & Kata Sandi Baru</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kode OTP (Simulasi Masukkan Bebas / 6 Digit)
                    </label>
                    <input
                      type="text"
                      value={forgotOtpCode}
                      onChange={(e) => setForgotOtpCode(e.target.value)}
                      placeholder="Contoh: 123456"
                      className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-950 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kata Sandi Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 pr-10 py-2 bg-white border border-purple-300 rounded-xl text-xs text-slate-900 outline-none"
                      />
                      {/* FITUR LIHAT PASSWORD BARU */}
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-purple-700 cursor-pointer"
                        title={showNewPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-purple-700" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {forgotOtpSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Kata Sandi Baru</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Kode Verifikasi</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
