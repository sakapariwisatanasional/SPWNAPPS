import React, { useState, useEffect, useRef } from 'react';
import {
  X, LogIn, UserPlus, Lock, User, Shield, MapPin,
  CheckCircle, AlertCircle, ArrowRight, Compass,
  Eye, EyeOff, Camera, Upload, Link as LinkIcon,
  Globe2, Building, Sparkles
} from 'lucide-react';
import { CurrentUser, KridaType, Regency, District } from '../../types';
import { storage } from '../../services/storage';
import { PROVINCES_DATA } from '../../data/indonesiaTerritories';
import { formatGoogleDriveUrl } from '../../services/driveRepository';
import { spreadsheetService } from '../../services/spreadsheetService';
import { SakaLogo } from '../common/SakaLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
  onLoginSuccess: (user: CurrentUser) => void;
  currentUser?: CurrentUser;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onLoginSuccess,
  currentUser
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================================
  // LOGIN
  // ============================================================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // ============================================================
  // REGISTER
  // ============================================================
  const [regFullName, setRegFullName] = useState('');
  const [regGender, setRegGender] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI');
  const [regBirthPlace, setRegBirthPlace] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('2002-05-15');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // ============================================================
  // WILAYAH
  // ============================================================
  // Pendaftaran publik selalu berada pada tingkat daerah.
  // Tingkat NASIONAL hanya boleh ditetapkan oleh Super Admin/Admin Nasional.
  const [kwartirLevel] = useState<'DAERAH'>('DAERAH');
  const [regProvinceId, setRegProvinceId] = useState('32');
  const [regRegencyId, setRegRegencyId] = useState('32.04');
  const [regDistrictId, setRegDistrictId] = useState('');
  const [regenciesList, setRegenciesList] = useState<Regency[]>([]);
  const [districtsList, setDistrictsList] = useState<District[]>([]);

  // ============================================================
  // KRIDA
  // ============================================================
  const [regKrida, setRegKrida] = useState<KridaType>('Krida Pemandu');
  const [regEducationLevel, setRegEducationLevel] = useState('SMA / SMK / Sederajat');
  const [regOccupation, setRegOccupation] = useState('Pelajar / Mahasiswa');
  const [regBio, setRegBio] = useState('');

  // ============================================================
  // FOTO
  // ============================================================
  const [regAvatarUrl, setRegAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  );

  const [regPhotoInputUrl, setRegPhotoInputUrl] = useState('');
  const [photoUploadSource, setPhotoUploadSource] = useState<'FILE' | 'URL'>('FILE');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // REGISTER MESSAGE
  // ============================================================
  const [regError, setRegError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset' | 'done'>('request');
  const [forgotError, setForgotError] = useState('');

  // ============================================================
  // RESET FORM
  // ============================================================
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setLoginError('');
      setRegError('');
      setRegSuccessMsg('');
      setForgotError('');
    }
  }, [isOpen, initialTab]);

  // ============================================================
  // LOAD REGENCY
  // ============================================================
  useEffect(() => {
    if (!regProvinceId) return;

    const regs = storage.getRegencies(regProvinceId) || [];
    setRegenciesList(regs);

    if (regs.length > 0 && !regs.some(r => r.id === regRegencyId)) {
      setRegRegencyId(regs[0].id);
    }
  }, [regProvinceId, regRegencyId]);

  // ============================================================
  // LOAD DISTRICT
  // ============================================================
  useEffect(() => {
    if (!regRegencyId) return;

    const dists = storage.getDistricts(regRegencyId) || [];
    setDistrictsList(dists);

    if (dists.length === 0) {
      setRegDistrictId('');
    } else if (!dists.some(d => d.id === regDistrictId)) {
      setRegDistrictId(dists[0].id);
    }
  }, [regRegencyId, regDistrictId]);

  if (!isOpen) return null;

  const provinces = PROVINCES_DATA;

  // ============================================================
  // IMAGE COMPRESSION
  // ============================================================
  const processAndCompressFile = (file: File) => {
    const mime = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    const isImage = mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name);

    if (!isImage) {
      setRegError('Mohon pilih foto yang valid (JPG, PNG, WEBP, HEIC/HEIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setRegError('Ukuran foto terlalu besar. Maksimal 15 MB.');
      return;
    }

    setRegError('');
    setIsUploadingPhoto(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const source = String(event.target?.result || '');
      if (!source) {
        setRegError('Foto tidak dapat dibaca.');
        setIsUploadingPhoto(false);
        return;
      }

      const finishWithSource = (value: string) => {
        setRegAvatarUrl(value);
        setRegPhotoInputUrl('');
        setIsUploadingPhoto(false);
      };

      // HEIC/HEIF tidak selalu dapat didecode oleh canvas browser.
      // Bila browser tidak dapat membuka file tersebut, beri pesan yang jelas
      // daripada mengirim file rusak ke server.
      const img = new Image();
      let finished = false;
      const fail = () => {
        if (finished) return;
        finished = true;
        setRegError('Foto HEIC/HEIF ini tidak dapat diproses oleh browser. Silakan pilih JPG/PNG dari galeri atau kamera.');
        setIsUploadingPhoto(false);
      };

      img.onload = () => {
        if (finished) return;
        try {
          const canvas = document.createElement('canvas');
          const maxBytes = 1200 * 1024;
          let maxDim = 900;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          if (!width || !height) throw new Error('Dimensi foto tidak terbaca.');

          let compressed = '';
          for (let pass = 0; pass < 5; pass++) {
            const scale = Math.min(1, maxDim / Math.max(width, height));
            const targetWidth = Math.max(1, Math.round(width * scale));
            const targetHeight = Math.max(1, Math.round(height * scale));
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d', { alpha: false });
            if (!ctx) throw new Error('Canvas tidak tersedia.');
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const quality = pass === 0 ? 0.72 : pass === 1 ? 0.64 : pass === 2 ? 0.56 : pass === 3 ? 0.50 : 0.44;
            compressed = canvas.toDataURL('image/jpeg', quality);
            const estimatedBytes = Math.ceil((compressed.length - compressed.indexOf(',') - 1) * 0.75);
            if (estimatedBytes <= maxBytes) break;
            maxDim = Math.max(640, Math.round(maxDim * 0.82));
          }

          if (!/^data:image\/jpeg;base64,/i.test(compressed)) {
            throw new Error('Hasil kompresi foto tidak valid.');
          }
          finished = true;
          finishWithSource(compressed);
        } catch (error) {
          console.error('[Auth] Gagal melakukan kompresi foto:', error);
          fail();
        }
      };

      img.onerror = fail;
      img.src = source;
    };

    reader.onerror = () => {
      setRegError('Gagal membaca berkas foto.');
      setIsUploadingPhoto(false);
    };

    reader.readAsDataURL(file);
  };
  // ============================================================
  // FILE SELECT
  // ============================================================
  const handlePhotoFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      processAndCompressFile(file);
    }

    e.target.value = '';
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================
  const handlePhotoDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDraggingPhoto(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      processAndCompressFile(file);
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================
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
      const result =
        await spreadsheetService.loginUser(
          ident,
          pass
        );

      const loginUser =
        result?.user ||
        result?.data?.user ||
        result?.data;

      if (
        result &&
        result.success &&
        loginUser
      ) {
        if (result.token) {
          storage.setAuthToken(result.token);
        }

        storage.setCurrentUser(loginUser);

        onLoginSuccess(loginUser);

        storage.syncWithServer().catch(() => {});

        setIsLoading(false);
        onClose();

        return;
      }

      const message =
        result?.message ||
        'Kombinasi akun dan kata sandi tidak sesuai.';

      setLoginError(message);
    } catch (apiErr) {
      console.error('[Auth Login] API error:', apiErr);

      setLoginError(
        'Tidak dapat terhubung ke server pendaftaran. Pastikan koneksi Google Spreadsheet aktif.'
      );
    }

    setIsLoading(false);
  };

  // ============================================================
  // REGISTER
  //
  // PENTING:
  // Tidak ada storage.registerMember() di sini.
  //
  // Data hanya dimasukkan ke Local Storage setelah:
  //
  // Browser
  //   ↓
  // /api/auth/register
  //   ↓
  // Server
  //   ↓
  // Google Apps Script
  //   ↓
  // Spreadsheet
  //   ↓
  // success
  //
  // ============================================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setRegError('');
    setRegSuccessMsg('');

    // ----------------------------------------------------------
    // VALIDASI DASAR
    // ----------------------------------------------------------
    const fullName = regFullName.trim();
    const email = regEmail.trim().toLowerCase();
    const phone = regPhone.trim();

    if (!fullName || !email || !phone || !regPassword) {
      setRegError(
        'Harap lengkapi semua kolom yang wajib diisi (*).'
      );
      return;
    }

    if (regPassword.length < 6) {
      setRegError(
        'Kata sandi minimal harus 6 karakter.'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(
        'Konfirmasi kata sandi tidak cocok.'
      );
      return;
    }

    if (!regBirthDate) {
      setRegError(
        'Tanggal lahir wajib diisi.'
      );
      return;
    }

    // SECURITY: endpoint registrasi publik tidak boleh membuat anggota Nasional.
    // Wilayah Nasional hanya ditetapkan melalui dashboard admin.
    if (kwartirLevel !== 'DAERAH') {
      setRegError('Pendaftaran tingkat Kwartir Nasional hanya dapat ditetapkan oleh Super Admin.');
      return;
    }

    if (!regProvinceId || !regRegencyId || !regDistrictId) {
      setRegError('Kwarda, Kwarcab, dan Kecamatan wajib dipilih.');
      return;
    }

    if (isUploadingPhoto) {
      setRegError(
        'Mohon tunggu sampai proses foto selesai.'
      );
      return;
    }

    setIsLoading(true);

    try {
      // --------------------------------------------------------
      // ENDPOINT GOOGLE APPS SCRIPT
      // --------------------------------------------------------
      // Registrasi publik tidak boleh bergantung pada localStorage HP/tablet.
      // SpreadsheetService mempunyai fallback endpoint produksi dan API server
      // juga akan mencoba endpoint cadangan jika URL lama menghasilkan HTTP 404.
      const scriptUrl =
        spreadsheetService.getConfig().scriptUrl || '';

      // --------------------------------------------------------
      // DATA WILAYAH
      // --------------------------------------------------------
      // Public registration is ALWAYS DAERAH.
      const isNasional = false;

      const provObj =
        provinces.find(
          p => p.id === regProvinceId
        );

      const regObj =
        regenciesList.find(
          r => r.id === regRegencyId
        );

      const distObj =
        districtsList.find(
          d => d.id === regDistrictId
        );

      const provName = isNasional
        ? 'KWARTIR NASIONAL'
        : (provObj?.name || 'Jawa Barat');

      const regName = isNasional
        ? 'TINGKAT NASIONAL'
        : (regObj?.name || 'Kabupaten Bandung');

      const distName = isNasional
        ? 'Nasional'
        : (distObj?.name || 'Kecamatan');

      // --------------------------------------------------------
      // NOMOR IDENTITAS SEMENTARA
      // --------------------------------------------------------
      const cleanPhone =
        phone.replace(/\D/g, '');

      const generatedNikMasked =
        '3200******' +
        (
          cleanPhone.slice(-4) ||
          Math.floor(
            1000 +
            Math.random() * 9000
          )
        );

      // --------------------------------------------------------
      // ID UNIK
      // --------------------------------------------------------
      const timestamp = Date.now();

      const newMemberId =
        `SPW-${timestamp
          .toString()
          .slice(-6)
          .padStart(6, '0')}`;

      const newUserId =
        `USER-${timestamp
          .toString()
          .slice(-10)}`;

      // --------------------------------------------------------
      // FOTO - MOBILE SAFE FLOW
      //
      // Jangan kirim Base64 foto bersama payload REGISTER_MEMBER.
      // Foto diunggah terlebih dahulu melalui /api/upload-image -> GAS -> Drive,
      // lalu pendaftaran hanya mengirim URL Drive. Ini mencegah request registrasi
      // menjadi terlalu besar pada HP/tablet dan menghindari kegagalan serverless.
      // --------------------------------------------------------
      let photoData = /^data:image\//i.test(regAvatarUrl) ? regAvatarUrl : '';
      let photoUrl = photoData ? '' : String(regAvatarUrl || '').trim();

      if (!photoData && !photoUrl) {
        throw new Error('Pas foto wajib dipilih atau diberikan melalui URL gambar.');
      }

      if (photoData) {
        const cleanName = fullName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'Anggota';
        setIsUploadingPhoto(true);
        try {
          const uploadResult = await spreadsheetService.uploadImageToDrive(
            photoData,
            `KTA_${newMemberId}_${cleanName}.jpg`,
            'MEMBER_AVATAR'
          );

          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(uploadResult.message || 'Foto gagal disimpan ke Google Drive.');
          }

          photoUrl = uploadResult.url;
          photoData = '';
          setRegAvatarUrl(photoUrl);
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      // --------------------------------------------------------
      // DATA MEMBER
      // --------------------------------------------------------
      const memberData = {
        id: newMemberId,

        userId: newUserId,

        fullName,

        nikMasked:
          generatedNikMasked,

        avatarUrl:
          photoUrl,

        gender:
          regGender,

        birthPlace:
          regBirthPlace.trim() ||
          regName,

        birthDate:
          regBirthDate,

        phone,

        email,

        address:
          `${distName}, ${regName}`,

        provinceId:
          isNasional
            ? '00'
            : regProvinceId,

        provinceName:
          provName,

        regencyId:
          isNasional
            ? '00.00'
            : regRegencyId,

        regencyName:
          regName,

        districtId:
          isNasional
            ? '00.00.00'
            : (
              regDistrictId
            ),

        districtName:
          distName,

        joinYear:
          new Date().getFullYear(),

        currentPosition:
          `Calon Anggota ${regKrida}`,

        krida:
          regKrida,

        educationLevel:
          regEducationLevel,

        occupation:
          regOccupation,

        bio:
          regBio.trim() ||
          'Calon anggota Saka Pariwisata yang siap memajukan pariwisata nusantara.',

        skills: [],

        certifications: []
      };

      console.log(
        '[Auth Register] Mengirim pendaftaran ke server:',
        {
          memberId: memberData.id,
          userId: memberData.userId,
          name: memberData.fullName,
          email: memberData.email,
          scriptUrlConfigured: Boolean(scriptUrl),
          hasDrivePhoto:
            Boolean(photoData || photoUrl)
        }
      );

      // --------------------------------------------------------
      // KIRIM KE SERVER
      //
      // JANGAN simpan ke Local Storage sebelum bagian ini
      // berhasil.
      // --------------------------------------------------------
      const result = await spreadsheetService.registerMember({
        memberData,
        password: regPassword,
        photoData,
        photoUrl,
        photoFileName: `KTA_${newMemberId}_${fullName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'Anggota'}.jpg`
      });

      console.log('[Auth Register] Registrasi server berhasil:', {
        memberId: result?.memberId,
        userId: result?.userId,
        hasDrive: Boolean(result?.drive),
        requestId: result?.requestId
      });
      // --------------------------------------------------------
      // SIMPAN DATA ANGGOTA KE CACHE LOKAL
      // --------------------------------------------------------
      // Data anggota tetap boleh dicache setelah server berhasil.
      // Tetapi ketika pendaftaran dilakukan oleh SuperAdmin, JANGAN
      // mengganti sesi SuperAdmin dengan akun anggota baru.
      const registeredMember = result.member;
      const registeredUser = result.user as CurrentUser;
      const isAdminRegistration = currentUser?.role === 'SUPER_ADMIN';

      if (registeredMember) {
        const existingMembers = storage.getMembers();
        storage.setMembers([
          registeredMember,
          ...existingMembers.filter(m => m.id !== registeredMember.id)
        ]);
      }

      if (registeredUser) {
        const existingUsers = storage.getUsers();
        storage.setUsers([
          registeredUser,
          ...existingUsers.filter(u => u.id !== registeredUser.id)
        ]);
      }

      // --------------------------------------------------------
      // JANGAN MENGAMBIL ALIH SESI SUPERADMIN
      // --------------------------------------------------------
      // Pendaftaran publik tetap menggunakan perilaku lama: akun baru
      // langsung menjadi sesi pengguna tersebut.
      // Pendaftaran dari dashboard SuperAdmin hanya membuat akun anggota;
      // sesi yang sedang aktif tetap SuperAdmin.
      if (!isAdminRegistration) {
        if (result.token) {
          storage.setAuthToken(result.token);
        }

        if (registeredUser) {
          storage.setCurrentUser(registeredUser);
        }
      }

      // --------------------------------------------------------
      // SUKSES
      // --------------------------------------------------------
      setRegSuccessMsg(
        isAdminRegistration
          ? `Anggota ${fullName} berhasil didaftarkan. Sesi SuperAdmin tetap aktif.`
          : `Pendaftaran berhasil dan data telah dikirim ke sistem. Selamat datang, ${fullName}.`
      );

      setRegError('');
      setIsLoading(false);

      // --------------------------------------------------------
      // AUTO LOGIN HANYA UNTUK PENDAFTARAN PUBLIK
      // --------------------------------------------------------
      if (!isAdminRegistration) {
        setTimeout(() => {
          if (registeredUser) {
            onLoginSuccess(registeredUser);
          }
          onClose();
        }, 1200);
      } else {
        // SuperAdmin tetap berada di dashboard setelah membuat anggota.
        setTimeout(() => {
          onClose();
        }, 1200);
      }

    } catch (err: any) {
      console.error(
        '[Auth Register] Pendaftaran gagal:',
        err
      );

      setIsUploadingPhoto(false);
      setIsLoading(false);

      const message =
        err?.message ||
        'Gagal mendaftar. Data belum dianggap tersimpan. Silakan coba kembali.';

      setRegError(
        message
      );

      setRegSuccessMsg('');
    }
  };

  // ============================================================
  // PASSWORD RECOVERY
  // ============================================================
  // Recovery tidak lagi mencari akun dari localStorage.
  // Identitas diverifikasi oleh Google Apps Script dan kode OTP
  // dikirim ke email yang tersimpan pada akun.
  const handleFindAccount = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setForgotError('');

    const ident = forgotIdentifier.trim().toLowerCase();

    if (!ident) {
      setForgotError(
        'Masukkan email, username, atau nomor KTA Anda.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/auth/request-password-reset',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({
            identifier: ident
          })
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
          `Permintaan pemulihan gagal (HTTP ${response.status}).`
        );
      }

      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotStep('reset');
    } catch (error: any) {
      setForgotError(
        error?.message ||
        'Kode pemulihan gagal dikirim. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setForgotError('');

    if (!forgotOtp.trim()) {
      setForgotError(
        'Masukkan kode pemulihan yang dikirim ke email.'
      );
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotError(
        'Kata sandi baru minimal 6 karakter.'
      );
      return;
    }

    if (
      forgotNewPassword !==
      forgotConfirmPassword
    ) {
      setForgotError(
        'Konfirmasi kata sandi tidak cocok.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({
            identifier:
              forgotIdentifier.trim().toLowerCase(),
            code: forgotOtp.trim(),
            newPassword:
              forgotNewPassword
          })
        }
      );

      const result =
        await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message ||
          `Reset password gagal (HTTP ${response.status}).`
        );
      }

      setForgotStep('done');

      setTimeout(() => {
        setTab('login');
        setForgotStep('request');
        setLoginIdentifier(
          forgotIdentifier.trim()
        );
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      }, 1500);
    } catch (error: any) {
      setForgotError(
        error?.message ||
        'Password gagal diperbarui. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // SAMPLE AVATARS
  // ============================================================
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] flex flex-col">

        {/* ======================================================
            HEADER
        ====================================================== */}
        <div className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 p-6 text-white shrink-0">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">

            <div className="p-1 bg-white rounded-xl shadow-md">
              <SakaLogo size={42} variant="full" />
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {tab === 'login' &&
                  'Masuk ke Akun'}

                {tab === 'register' &&
                  'Pendaftaran Anggota Baru'}

                {tab === 'forgot' &&
                  'Reset Kata Sandi'}
              </h2>

              <p className="text-xs text-emerald-100/90">
                Sistem Terintegrasi Kader & Pimpinan Saka Pariwisata
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4 border border-white/10">

            <button
              type="button"
              onClick={() => {
                setTab('login');
                setLoginError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setRegError('');
                setRegSuccessMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-emerald-900 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Anggota Baru
            </button>
          </div>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-xs">

          {/* ====================================================
              LOGIN
          ==================================================== */}
          {tab === 'login' && (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email, Username, atau Nomor KTA
                </label>

                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e =>
                      setLoginIdentifier(
                        e.target.value
                      )
                    }
                    placeholder="Contoh: 32.04... atau email@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>

                <div className="flex justify-between items-center mb-1.5">

                  <label className="text-xs font-semibold text-slate-700">
                    Kata Sandi
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setForgotStep('request');
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    Lupa sandi?
                  </button>
                </div>

                <div className="relative">

                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    required
                    value={loginPassword}
                    onChange={e =>
                      setLoginPassword(
                        e.target.value
                      )
                    }
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      Masuk ke Sistem
                    </span>

                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* ====================================================
              REGISTER
          ==================================================== */}
          {tab === 'register' && (
            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >

              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              {/* IDENTITAS */}
              <div className="space-y-3">

                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    1. Identitas Anggota
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap & Gelar *
                  </label>

                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={e =>
                      setRegFullName(
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Muhammad Farhan, S.Par."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Jenis Kelamin *
                    </label>

                    <select
                      value={regGender}
                      onChange={e =>
                        setRegGender(
                          e.target.value as
                            | 'LAKI_LAKI'
                            | 'PEREMPUAN'
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    >
                      <option value="LAKI_LAKI">
                        Laki-laki
                      </option>

                      <option value="PEREMPUAN">
                        Perempuan
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tempat Lahir
                    </label>

                    <input
                      type="text"
                      value={regBirthPlace}
                      onChange={e =>
                        setRegBirthPlace(
                          e.target.value
                        )
                      }
                      placeholder="Kota Lahir"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tanggal Lahir *
                    </label>

                    <input
                      type="date"
                      required
                      value={regBirthDate}
                      onChange={e =>
                        setRegBirthDate(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alamat Email *
                    </label>

                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e =>
                        setRegEmail(
                          e.target.value
                        )
                      }
                      placeholder="nama@email.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp / HP *
                    </label>

                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e =>
                        setRegPhone(
                          e.target.value
                        )
                      }
                      placeholder="0812-3456-7890"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />
                  </div>

                </div>

                {/* FOTO */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">

                  <div className="flex items-center justify-between">

                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        Pas Foto Resmi Anggota
                      </label>

                      <p className="text-[10px] text-slate-500">
                        Upload berkas atau paste link Google Drive / URL gambar
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoUploadSource(
                            'FILE'
                          )
                        }
                        className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                          photoUploadSource ===
                          'FILE'
                            ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Upload Foto
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPhotoUploadSource(
                            'URL'
                          )
                        }
                        className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                          photoUploadSource ===
                          'URL'
                            ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Link URL
                      </button>

                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 pt-1">

                    <div className="w-20 h-26 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900 relative flex-shrink-0">

                      <img
                        src={regAvatarUrl}
                        alt="Preview Foto"
                        className="w-full h-full object-cover"
                      />

                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-[9px] font-bold gap-1">

                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />

                          <span>
                            Proses...
                          </span>

                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold"
                      >
                        <Camera className="w-4 h-4 mb-0.5 text-emerald-300" />
                        <span>
                          Ganti
                        </span>
                      </button>

                    </div>

                    <div className="flex-1 w-full space-y-2">

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/heic,image/heif"
                        onChange={
                          handlePhotoFileUpload
                        }
                        className="hidden"
                      />

                      {photoUploadSource ===
                      'FILE' ? (
                        <div
                          onDragOver={e => {
                            e.preventDefault();
                            setIsDraggingPhoto(
                              true
                            );
                          }}
                          onDragLeave={() =>
                            setIsDraggingPhoto(
                              false
                            )
                          }
                          onDrop={
                            handlePhotoDrop
                          }
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className={`border-2 border-dashed rounded-xl p-3 transition-all text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                            isDraggingPhoto
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-slate-300 hover:border-emerald-500 bg-white'
                          }`}
                        >
                          <Upload className="w-4 h-4 text-emerald-700" />

                          <p className="text-[11px] font-bold text-slate-800">
                            Pilih foto dari galeri / kamera
                          </p>

                          <p className="text-[9px] text-slate-400">
                            Mendukung JPG, PNG, WEBP, HEIC/HEIF (kompresi otomatis)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">

                          <div className="relative">

                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                            <input
                              type="url"
                              value={
                                regPhotoInputUrl
                              }
                              onChange={e => {
                                const val =
                                  e.target.value;

                                setRegPhotoInputUrl(
                                  val
                                );

                                if (
                                  val.trim()
                                ) {
                                  setRegAvatarUrl(
                                    formatGoogleDriveUrl(
                                      val.trim()
                                    )
                                  );
                                }
                              }}
                              placeholder="https://drive.google.com/... atau URL foto"
                              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                          </div>

                        </div>
                      )}

                      <div className="flex items-center gap-1.5 pt-1">

                        <span className="text-[10px] text-slate-400">
                          Contoh:
                        </span>

                        {sampleAvatars.map(
                          (url, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                setRegAvatarUrl(
                                  url
                                );

                                setRegPhotoInputUrl(
                                  ''
                                );
                              }}
                              className={`w-6 h-6 rounded-md overflow-hidden border transition-all ${
                                regAvatarUrl ===
                                url
                                  ? 'border-emerald-600 scale-105 shadow-xs'
                                  : 'border-transparent opacity-60'
                              }`}
                            >
                              <img
                                src={url}
                                alt="Option"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )
                        )}

                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* WILAYAH */}
              <div className="space-y-3 pt-1">

                <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-slate-900 font-bold text-xs">

                  <div className="flex items-center gap-2">

                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />

                    <span>
                      2. Struktur Wilayah Kwartir Gerakan Pramuka
                    </span>

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        1. Kwarda (Provinsi) *
                      </label>

                      <select
                        value={
                          regProvinceId
                        }
                        onChange={e =>
                          setRegProvinceId(
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800"
                      >
                        {provinces.map(
                          p => (
                            <option
                              key={p.id}
                              value={p.id}
                            >
                              {p.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        2. Kwarcab (Kab/Kota) *
                      </label>

                      <select
                        value={
                          regRegencyId
                        }
                        onChange={e =>
                          setRegRegencyId(
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800"
                      >
                        {regenciesList.map(
                          r => (
                            <option
                              key={r.id}
                              value={r.id}
                            >
                              {r.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        3. Kecamatan *
                      </label>

                      <select
                        value={
                          regDistrictId
                        }
                        onChange={e =>
                          setRegDistrictId(
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800"
                      >
                        {districtsList.map(
                          d => (
                            <option
                              key={d.id}
                              value={d.id}
                            >
                              {d.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                  </div>

              </div>

              {/* KRIDA */}
              <div className="space-y-3 pt-1">

                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-xs">

                  <Building className="w-3.5 h-3.5 text-emerald-600" />

                  <span>
                    3. Kepramukaan & Krida Saka Pariwisata
                  </span>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                  <div>

                    <label className="block font-semibold text-slate-700 mb-1">
                      Pilihan Krida *
                    </label>

                    <select
                      value={regKrida}
                      onChange={e =>
                        setRegKrida(
                          e.target
                            .value as KridaType
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-semibold"
                    >
                      <option value="Krida Pemandu">
                        Krida Pemandu
                      </option>

                      <option value="Krida Penyuluh">
                        Krida Penyuluh
                      </option>

                      <option value="Krida Mice & Event">
                        Krida Mice & Event
                      </option>

                      <option value="Krida Kuliner & Cinderamata">
                        Krida Kuliner & Cinderamata
                      </option>
                    </select>

                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                  <div>

                    <label className="block font-semibold text-slate-700 mb-1">
                      Pendidikan Terakhir
                    </label>

                    <input
                      type="text"
                      value={
                        regEducationLevel
                      }
                      onChange={e =>
                        setRegEducationLevel(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
                    />

                  </div>

                  <div>

                    <label className="block font-semibold text-slate-700 mb-1">
                      Pekerjaan / Aktivitas
                    </label>

                    <input
                      type="text"
                      value={
                        regOccupation
                      }
                      onChange={e =>
                        setRegOccupation(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
                    />

                  </div>

                </div>

                <div>

                  <label className="block font-semibold text-slate-700 mb-1">
                    Bio & Motivasi Bergabung
                  </label>

                  <textarea
                    rows={2}
                    value={regBio}
                    onChange={e =>
                      setRegBio(
                        e.target.value
                      )
                    }
                    placeholder="Ceritakan motivasi Anda memajukan pariwisata nusantara..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div className="space-y-3 pt-1">

                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-xs">

                  <Lock className="w-3.5 h-3.5 text-emerald-600" />

                  <span>
                    4. Keamanan & Kata Sandi Akun
                  </span>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

                  <div>

                    <label className="block font-semibold text-slate-700 mb-1">
                      Kata Sandi *
                    </label>

                    <input
                      type="password"
                      required
                      value={
                        regPassword
                      }
                      onChange={e =>
                        setRegPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />

                  </div>

                  <div>

                    <label className="block font-semibold text-slate-700 mb-1">
                      Konfirmasi Kata Sandi *
                    </label>

                    <input
                      type="password"
                      required
                      value={
                        regConfirmPassword
                      }
                      onChange={e =>
                        setRegConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Ketik ulang sandi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                    />

                  </div>

                </div>

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isUploadingPhoto
                }
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50 mt-4 cursor-pointer"
              >

                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>
                      {isUploadingPhoto
                        ? 'Mengunggah foto...'
                        : 'Menyimpan pendaftaran...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />

                    <span>
                      Daftarkan Anggota Baru Sekarang
                    </span>
                  </>
                )}

              </button>

              <p className="text-[10px] text-center text-slate-400 pt-1">
                Data pendaftaran tidak dianggap berhasil sebelum server mengonfirmasi penyimpanan ke sistem.
              </p>

            </form>
          )}

          {/* ====================================================
              FORGOT PASSWORD
          ==================================================== */}
          {tab === 'forgot' && (
            <div className="space-y-4">

              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotStep === 'request' && (
                <form
                  onSubmit={handleFindAccount}
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-600">
                    Masukkan email, username, atau nomor KTA.
                    Jika akun memiliki email terdaftar, kode
                    pemulihan akan dikirim ke email tersebut.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Identitas Akun
                    </label>

                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={forgotIdentifier}
                      onChange={e =>
                        setForgotIdentifier(e.target.value)
                      }
                      placeholder="Email, Username, atau No. KTA"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold"
                  >
                    {isLoading
                      ? 'Mengirim Kode...'
                      : 'Kirim Kode Pemulihan'}
                  </button>
                </form>
              )}

              {forgotStep === 'reset' && (
                <form
                  onSubmit={handleResetPassword}
                  className="space-y-3.5"
                >
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    Kode pemulihan telah diminta. Periksa
                    email yang terdaftar pada akun Anda.
                    Kode berlaku selama 10 menit.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kode Pemulihan
                    </label>

                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={e =>
                        setForgotOtp(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                      placeholder="6 digit kode dari email"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm tracking-[0.35em] text-center focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kata Sandi Baru
                    </label>

                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={forgotNewPassword}
                      onChange={e =>
                        setForgotNewPassword(e.target.value)
                      }
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Konfirmasi Kata Sandi
                    </label>

                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={forgotConfirmPassword}
                      onChange={e =>
                        setForgotConfirmPassword(e.target.value)
                      }
                      placeholder="Ketik ulang sandi"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold"
                  >
                    {isLoading
                      ? 'Menyimpan...'
                      : 'Verifikasi & Simpan Password'}
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setForgotStep('request');
                      setForgotOtp('');
                      setForgotError('');
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-emerald-700"
                  >
                    Kirim kode baru
                  </button>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />

                  <p className="text-xs font-semibold text-emerald-800">
                    Kata sandi berhasil diperbarui!
                  </p>

                  <p className="text-[11px] text-emerald-600">
                    Mengalihkan ke halaman login...
                  </p>
                </div>
              )}

            </div>
          )}


        </div>
      </div>
    </div>
  );
};

