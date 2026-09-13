```tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Eye,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import {
  KtaCardSettings,
  KtaCardPreset,
  KtaCardSide,
  KtaDataFieldConfig,
  KtaMemberFieldKey,
  KtaLogoElement,
  KtaTextElement,
  Member,
} from '../../types';

import {
  storage,
  DEFAULT_KTA_SETTINGS,
} from '../../services/storage';

import { spreadsheetService } from '../../services/spreadsheetService';
import { DigitalMemberCard } from './DigitalMemberCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* =========================================================
   FIELD OPTIONS
========================================================= */

const FIELD_OPTIONS: Array<{
  value: KtaMemberFieldKey;
  label: string;
}> = [
  { value: 'fullName', label: 'Nama Lengkap' },
  { value: 'id', label: 'No. Anggota (SPW)' },
  { value: 'nationalMemberNumber', label: 'Nomor KTA / NTA' },
  { value: 'currentPosition', label: 'Jabatan' },
  { value: 'provinceName', label: 'Kwartir / Provinsi' },
  { value: 'regencyName', label: 'Kwarcab / Kabupaten' },
  { value: 'districtName', label: 'Kwarran / Kecamatan' },
  { value: 'branchName', label: 'Gugus / Pangkalan' },
  { value: 'gugusDepan', label: 'Gugus Depan' },
  { value: 'krida', label: 'Krida' },
  { value: 'phone', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'joinYear', label: 'Tahun Bergabung' },
  { value: 'status', label: 'Status' },
];

/* =========================================================
   CARD PRESETS
========================================================= */

const PRESETS: Record<
  KtaCardPreset,
  {
    label: string;
    width: number;
    height: number;
    radius: number;
  }
> = {
  CR80_KTA: {
    label: 'KTA / CR80 (ISO ID-1)',
    width: 85.6,
    height: 53.98,
    radius: 3.18,
  },

  KTP: {
    label: 'KTP / ID-1',
    width: 85.6,
    height: 53.98,
    radius: 3.18,
  },

  SIM: {
    label: 'SIM',
    width: 85.6,
    height: 53.98,
    radius: 3.18,
  },

  CUSTOM: {
    label: 'Ukuran Custom',
    width: 85.6,
    height: 53.98,
    radius: 3.18,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const clone = <T,>(value: T): T => {
  return JSON.parse(JSON.stringify(value));
};

const normalizeKtaSettings = (
  value?: Partial<KtaCardSettings> | null,
): KtaCardSettings => {
  const base = clone(DEFAULT_KTA_SETTINGS);

  const merged = {
    ...base,
    ...(value && typeof value === 'object' ? value : {}),
  } as KtaCardSettings;

  return {
    ...merged,

    dataFields: Array.isArray(merged.dataFields)
      ? merged.dataFields
      : [],

    textElements: Array.isArray(merged.textElements)
      ? merged.textElements
      : [],

    logos: Array.isArray(merged.logos)
      ? merged.logos
      : [],

    terms: Array.isArray(merged.terms)
      ? merged.terms
      : [],
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export const KtaCardCustomizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [settings, setSettings] = useState<KtaCardSettings>(() =>
    normalizeKtaSettings(DEFAULT_KTA_SETTINGS),
  );

  const [side, setSide] = useState<KtaCardSide>('FRONT');

  const [isSaving, setIsSaving] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [message, setMessage] = useState('');

  const [regionProvinceId, setRegionProvinceId] = useState('');
  const [regionRegencyId, setRegionRegencyId] = useState('');
  const [regionDistrictId, setRegionDistrictId] = useState('');
  const [regionBusy, setRegionBusy] = useState(false);

  /* =======================================================
     DATA
  ======================================================= */

  const provinces = storage.getProvinces();

  const regencies = regionProvinceId
    ? storage.getRegencies(regionProvinceId)
    : [];

  const districts = regionRegencyId
    ? storage.getDistricts(regionRegencyId)
    : [];

  const members = storage.getMembers();

  const safeMembers = Array.isArray(members)
    ? members
    : [];

  const activeMembers = safeMembers.filter(
    member =>
      String(member.status || '').toUpperCase() === 'ACTIVE',
  );

  const signerMember = activeMembers.find(
    member =>
      member.id === (settings as any).signerMemberId,
  );

  /* =======================================================
     PREVIEW MEMBER
  ======================================================= */

  const previewMember: Member =
    safeMembers[0] ||
    ({
      id: 'SPW-000001',
      userId: 'user-01',
      nationalMemberNumber: '00.00.00.000001',
      fullName: 'Rohadi Wijaya',
      nikMasked: '',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',

      gender: 'LAKI_LAKI',
      birthPlace: 'Jakarta',
      birthDate: '2000-08-14',

      phone: '081234567890',
      email: 'admin@sakapariwisata.id',

      address: '',

      provinceId: '00',
      provinceName: 'Kwartir Nasional',

      regencyId: '00.00',
      regencyName: 'Kwartir Nasional (Pusat)',

      districtId: '00.00.00',
      districtName: 'Nasional',

      branchId: 'branch-nasional',
      branchName: 'PANDU NUSANTARA',

      gugusDepan: 'PANDU NUSANTARA',

      joinYear: 2024,

      currentPosition: 'Andalan Nasional',

      krida: 'Krida Mice & Event',

      status: 'ACTIVE',

      educationLevel: 'S1',
      occupation: 'Pimpinan Saka',

      bio: '',
      skills: [],
      certifications: [],
      locationHistory: [],

      registeredAt: new Date().toISOString(),

      verificationToken: 'preview',
    } as Member);

  /* =======================================================
     LOAD SETTINGS
  ======================================================= */

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    setMessage('');

    const loadSettings = async () => {
      setLoadingRemote(true);

      try {
        const localSettings = storage.getKtaSettings();

        if (mounted) {
          setSettings(
            normalizeKtaSettings(localSettings),
          );
        }

        const remote =
          await spreadsheetService.refreshKtaSettings();

        if (mounted && remote) {
          setSettings(
            normalizeKtaSettings(remote),
          );
        }
      } catch (error) {
        console.warn(
          '[KTA Customizer] Gagal memuat konfigurasi:',
          error,
        );
      } finally {
        if (mounted) {
          setLoadingRemote(false);
        }
      }
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  /* =======================================================
     SAFE COLLECTIONS
  ======================================================= */

  const safeDataFields = Array.isArray(settings?.dataFields)
    ? settings.dataFields
    : [];

  const safeTextElements = Array.isArray(settings?.textElements)
    ? settings.textElements
    : [];

  const safeLogos = Array.isArray(settings?.logos)
    ? settings.logos
    : [];

  /* =======================================================
     CURRENT SIDE
  ======================================================= */

  const sideFields = useMemo(
    () =>
      safeDataFields.filter(
        field => field.side === side,
      ),
    [safeDataFields, side],
  );

  const sideTexts = useMemo(
    () =>
      safeTextElements.filter(
        text => text.side === side,
      ),
    [safeTextElements, side],
  );

  const sideLogos = useMemo(
    () =>
      safeLogos.filter(
        logo => logo.side === side,
      ),
    [safeLogos, side],
  );

  /* =======================================================
     DO NOT RENDER WHEN CLOSED
  ======================================================= */

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     UPDATE HELPERS
  ======================================================= */

  const updateField = (
    id: string,
    patch: Partial<KtaDataFieldConfig>,
  ) => {
    setSettings(current => ({
      ...current,

      dataFields: current.dataFields.map(
        field =>
          field.id === id
            ? {
                ...field,
                ...patch,
              }
            : field,
      ),
    }));
  };

  const updateText = (
    id: string,
    patch: Partial<KtaTextElement>,
  ) => {
    setSettings(current => ({
      ...current,

      textElements: current.textElements.map(
        text =>
          text.id === id
            ? {
                ...text,
                ...patch,
              }
            : text,
      ),
    }));
  };

  const updateLogo = (
    id: string,
    patch: Partial<KtaLogoElement>,
  ) => {
    setSettings(current => ({
      ...current,

      logos: current.logos.map(
        logo =>
          logo.id === id
            ? {
                ...logo,
                ...patch,
              }
            : logo,
      ),
    }));
  };

  /* =======================================================
     ADD FIELD
  ======================================================= */

  const addField = () => {
    const currentSideCount =
      settings.dataFields.filter(
        field => field.side === side,
      ).length;

    const newField: KtaDataFieldConfig = {
      id: `field-${Date.now()}`,
      field: 'fullName',
      label: 'NAMA',
      side,
      visible: true,

      x: 35,
      y: 50 + currentSideCount * 8,

      width: 50,

      fontSize: 11,
      fontWeight: 'bold',

      color: '#ffffff',

      textTransform: 'none',
      align: 'left',
    };

    setSettings(current => ({
      ...current,
      dataFields: [
        ...current.dataFields,
        newField,
      ],
    }));
  };

  /* =======================================================
     ADD TEXT
  ======================================================= */

  const addText = () => {
    const newText: KtaTextElement = {
      id: `text-${Date.now()}`,
      text: 'TEKS KUSTOM',
      side,

      x: 5,
      y: 88,

      width: 90,

      fontSize: 8,
      fontWeight: 'bold',

      color: '#ffffff',

      align: 'left',
      textTransform: 'none',
    };

    setSettings(current => ({
      ...current,

      textElements: [
        ...current.textElements,
        newText,
      ],
    }));
  };

  /* =======================================================
     ADD LOGO
  ======================================================= */

  const addLogo = () => {
    const newLogo: KtaLogoElement = {
      id: `logo-${Date.now()}`,
      name: 'Logo Baru',
      url: '',
      side,

      x: 70,
      y: 6,

      width: 22,
      height: 22,

      opacity: 1,
      objectFit: 'contain',
    };

    setSettings(current => ({
      ...current,

      logos: [
        ...current.logos,
        newLogo,
      ],
    }));
  };

  /* =======================================================
     FILE → DATA URL
  ======================================================= */

  const fileToDataUrl = (
    file: File,
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () =>
        resolve(String(reader.result));

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  /* =======================================================
     UPLOAD ASSET
  ======================================================= */

  const uploadAsset = async (
    file: File,
    kind: 'logo' | 'background',
  ) => {
    setMessage(
      'Mengunggah aset ke Google Drive...',
    );

    try {
      const data = await fileToDataUrl(file);

      const result =
        await spreadsheetService.uploadImageToDrive(
          data,
          `KTA_${kind}_${Date.now()}_${file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            '_',
          )}`,
          'KTA_CARD',
        );

      if (
        !result.success ||
        !result.directUrl
      ) {
        throw new Error(
          result.message ||
            'Upload gambar gagal.',
        );
      }

      return result.directUrl;
    } catch (error: any) {
      setMessage(
        error?.message ||
          'Upload aset gagal.',
      );

      return '';
    }
  };

  /* =======================================================
     HANDLE ASSET UPLOAD
  ======================================================= */

  const handleAssetUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'logo' | 'background',
    id?: string,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const url =
      await uploadAsset(file, kind);

    event.target.value = '';

    if (!url) return;

    if (kind === 'logo' && id) {
      updateLogo(id, {
        url,
      });
    }

    if (kind === 'background') {
      setSettings(current => ({
        ...current,

        ...(side === 'FRONT'
          ? {
              frontBackgroundUrl: url,
            }
          : {
              backBackgroundUrl: url,
            }),
      }));
    }

    setMessage(
      'Aset berhasil diunggah.',
    );
  };

  /* =======================================================
     APPLY PRESET
  ======================================================= */

  const applyPreset = (
    preset: KtaCardPreset,
  ) => {
    const selected =
      PRESETS[preset];

    setSettings(current => ({
      ...current,

      preset,

      widthMm:
        selected.width,

      heightMm:
        selected.height,

      cornerRadiusMm:
        selected.radius,
    }));
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    setIsSaving(true);

    setMessage(
      'Menyimpan pengaturan KTA pusat...',
    );

    try {
      const nextSettings = {
        ...settings,

        /*
         * Konfigurasi baru bagian belakang:
         *
         * Tempat & tanggal
         *       ↓
         * QR Penandatangan
         *       ↓
         * Nama
         * Jabatan
         *
         * Nilai default hanya digunakan jika
         * konfigurasi lama belum mempunyai posisi.
         */

        issueLocationDateY:
          (settings as any)
            .issueLocationDateY ?? 60,

        signerQrY:
          (settings as any)
            .signerQrY ?? 70,

        signerY:
          (settings as any)
            .signerY ?? 84,

        /*
         * Tanda "PENANDATANGAN TERVERIFIKASI"
         * sengaja dimatikan.
         */
        showSignerVerified: false,

        lastUpdated:
          new Date().toISOString(),
      };

      const result =
        await spreadsheetService.saveKtaSettings(
          nextSettings,
        );

      if (!result.success) {
        setMessage(
          result.message ||
            'Pengaturan KTA gagal disimpan.',
        );

        return;
      }

      setSettings(
        normalizeKtaSettings(
          nextSettings,
        ),
      );

      setMessage(
        'Pengaturan KTA berhasil disimpan ke Google Spreadsheet.',
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (error: any) {
      setMessage(
        error?.message ||
          'Terjadi kesalahan saat menyimpan pengaturan KTA.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    if (
      !confirm(
        'Reset seluruh desain KTA ke standar nasional?',
      )
    ) {
      return;
    }

    setSettings(
      normalizeKtaSettings(
        DEFAULT_KTA_SETTINGS,
      ),
    );
  };

  /* =======================================================
     GENERATE NTA
  ======================================================= */

  const handleGenerateByRegion = () => {
    if (!regionProvinceId) {
      alert(
        'Pilih provinsi terlebih dahulu.',
      );

      return;
    }

    if (
      !confirm(
        'Generate NTA untuk anggota yang belum memiliki nomor? Nomor yang sudah ada tidak akan diubah.',
      )
    ) {
      return;
    }

    setRegionBusy(true);

    try {
      const result =
        storage.generateNationalMemberNumbersByRegion(
          regionProvinceId,
          regionRegencyId ||
            undefined,
          regionDistrictId ||
            undefined,
        );

      alert(
        `Selesai. ${result.updated} anggota diberi NTA baru, ${result.skipped} dilewati.`,
      );
    } finally {
      setRegionBusy(false);
    }
  };

  /* =======================================================
     UI HELPERS
  ======================================================= */

  const input =
    'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500';

  const numberInput = (
    value: number,
    onChange: (value: number) => void,
  ) => (
    <input
      type="number"
      min={0}
      max={100}
      value={value}
      onChange={event =>
        onChange(
          Number(event.target.value),
        )
      }
      className={input}
    />
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl max-h-[96vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="p-5 bg-gradient-to-r from-slate-950 via-purple-950 to-emerald-950 text-white flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <LayoutTemplate />
            </div>

            <div>
              <h3 className="font-bold">
                KTA Designer — Pengaturan Super Admin
              </h3>

              <p className="text-xs text-slate-300">
                Atur ukuran, data anggota, logo,
                latar depan/belakang, QR,
                serta teks kartu secara visual.
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X />
          </button>

        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-12 flex-1 min-h-0">

          {/* =================================================
              LEFT PANEL
          ================================================= */}

          <div className="xl:col-span-8 p-5 overflow-y-auto space-y-5">

            {/* ===============================================
                1. SIZE
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">

              <div className="flex items-center gap-2 font-bold text-slate-800">
                <LayoutTemplate className="w-4 h-4" />
                <span>1. Ukuran Kartu</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                {(Object.keys(PRESETS) as KtaCardPreset[]).map(
                  preset => (
                    <button
                      key={preset}
                      onClick={() =>
                        applyPreset(preset)
                      }
                      className={`p-3 rounded-xl border text-left ${
                        settings.preset ===
                        preset
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <b className="text-xs">
                        {
                          PRESETS[preset]
                            .label
                        }
                      </b>

                      <div className="text-[10px] text-slate-500 mt-1">
                        {
                          PRESETS[preset]
                            .width
                        }{' '}
                        ×{' '}
                        {
                          PRESETS[preset]
                            .height
                        }{' '}
                        mm
                      </div>
                    </button>
                  ),
                )}

              </div>

              <div className="grid grid-cols-3 gap-2">

                <label className="text-[10px] font-bold">
                  Lebar (mm)

                  {numberInput(
                    settings.widthMm,
                    value =>
                      setSettings(
                        current => ({
                          ...current,
                          widthMm:
                            value,
                          preset:
                            'CUSTOM',
                        }),
                      ),
                  )}
                </label>

                <label className="text-[10px] font-bold">
                  Tinggi (mm)

                  {numberInput(
                    settings.heightMm,
                    value =>
                      setSettings(
                        current => ({
                          ...current,
                          heightMm:
                            value,
                          preset:
                            'CUSTOM',
                        }),
                      ),
                  )}
                </label>

                <label className="text-[10px] font-bold">
                  Radius (mm)

                  {numberInput(
                    settings.cornerRadiusMm,
                    value =>
                      setSettings(
                        current => ({
                          ...current,
                          cornerRadiusMm:
                            value,
                        }),
                      ),
                  )}
                </label>

              </div>

            </section>

            {/* ===============================================
                2. SIDE
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold">
                  <Eye />
                  <span>
                    2. Sisi yang diedit
                  </span>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl">

                  <button
                    onClick={() =>
                      setSide('FRONT')
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      side === 'FRONT'
                        ? 'bg-white shadow'
                        : ''
                    }`}
                  >
                    Depan
                  </button>

                  <button
                    onClick={() =>
                      setSide('BACK')
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold ${
                      side === 'BACK'
                        ? 'bg-white shadow'
                        : ''
                    }`}
                  >
                    Belakang
                  </button>

                </div>

              </div>

            </section>

            {/* ===============================================
                3. BACKGROUND
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold">
                  <ImageIcon />
                  <span>
                    3. Latar Belakang{' '}
                    {side === 'FRONT'
                      ? 'Depan'
                      : 'Belakang'}
                  </span>
                </div>

                <label className="px-3 py-2 rounded-lg bg-purple-900 text-white text-xs font-bold cursor-pointer">

                  <Upload className="inline w-3.5 h-3.5 mr-1" />

                  Upload Gambar

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={event =>
                      handleAssetUpload(
                        event,
                        'background',
                      )
                    }
                  />

                </label>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

                <label className="text-[10px] font-bold">
                  URL Gambar

                  <input
                    value={
                      side === 'FRONT'
                        ? settings.frontBackgroundUrl ||
                          ''
                        : settings.backBackgroundUrl ||
                          ''
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,

                          ...(side ===
                          'FRONT'
                            ? {
                                frontBackgroundUrl:
                                  event
                                    .target
                                    .value,
                              }
                            : {
                                backBackgroundUrl:
                                  event
                                    .target
                                    .value,
                              }),
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

                <label className="text-[10px] font-bold">
                  Warna

                  <input
                    type="text"
                    value={
                      side === 'FRONT'
                        ? settings.customBackgroundColorFront ||
                          '#24105b'
                        : settings.customBackgroundColorBack ||
                          '#111827'
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,

                          ...(side ===
                          'FRONT'
                            ? {
                                customBackgroundColorFront:
                                  event
                                    .target
                                    .value,
                              }
                            : {
                                customBackgroundColorBack:
                                  event
                                    .target
                                    .value,
                              }),
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

                <label className="text-[10px] font-bold">
                  Opasitas gambar

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={
                      settings.bgOpacity ??
                      0.1
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          bgOpacity:
                            Number(
                              event
                                .target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="w-full"
                  />
                </label>

              </div>

            </section>

            {/* ===============================================
                4. LOGOS
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold">
                  <ImageIcon />
                  <span>
                    4. Logo / Lambang
                  </span>
                </div>

                <button
                  onClick={addLogo}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
                >
                  <Plus className="inline w-3.5 h-3.5 mr-1" />
                  Tambah Logo
                </button>

              </div>

              {sideLogos.length === 0 && (
                <p className="text-xs text-slate-400">
                  Belum ada logo tambahan.
                </p>
              )}

              {sideLogos.map(logo => (
                <div
                  key={logo.id}
                  className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border"
                >

                  <div className="col-span-4">

                    <input
                      value={logo.name}
                      onChange={event =>
                        updateLogo(
                          logo.id,
                          {
                            name:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      className={input}
                      placeholder="Nama logo"
                    />

                    <label className="block mt-2 text-[10px] text-purple-800 font-bold cursor-pointer">

                      <Upload className="inline w-3 h-3 mr-1" />

                      Upload

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={event =>
                          handleAssetUpload(
                            event,
                            'logo',
                            logo.id,
                          )
                        }
                      />

                    </label>

                    <input
                      value={logo.url}
                      onChange={event =>
                        updateLogo(
                          logo.id,
                          {
                            url:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      className={
                        input + ' mt-2'
                      }
                      placeholder="URL logo"
                    />

                  </div>

                  <div className="col-span-7 grid grid-cols-4 gap-2">

                    <label className="text-[9px] font-bold">
                      X
                      {numberInput(
                        logo.x,
                        value =>
                          updateLogo(
                            logo.id,
                            {
                              x: value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y
                      {numberInput(
                        logo.y,
                        value =>
                          updateLogo(
                            logo.id,
                            {
                              y: value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Lebar
                      {numberInput(
                        logo.width,
                        value =>
                          updateLogo(
                            logo.id,
                            {
                              width:
                                value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Tinggi
                      {numberInput(
                        logo.height,
                        value =>
                          updateLogo(
                            logo.id,
                            {
                              height:
                                value,
                            },
                          ),
                      )}
                    </label>

                  </div>

                  <button
                    onClick={() =>
                      setSettings(
                        current => ({
                          ...current,

                          logos:
                            current.logos.filter(
                              item =>
                                item.id !==
                                logo.id,
                            ),
                        }),
                      )
                    }
                    className="col-span-1 self-start p-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))}

            </section>

            {/* ===============================================
                5. FRONT HEADER
            =============================================== */}

            {side === 'FRONT' && (
              <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

                <div className="flex items-center gap-2 font-bold">
                  <Type />
                  <span>
                    5. Header Organisasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* TITLE */}

                  <div className="p-3 rounded-xl bg-slate-50 border space-y-2">

                    <div className="text-[10px] font-black uppercase">
                      SAKA PARIWISATA
                    </div>

                    <input
                      value={
                        settings.frontOrganizationTitle
                      }
                      onChange={event =>
                        setSettings(
                          current => ({
                            ...current,
                            frontOrganizationTitle:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={input}
                      placeholder="Judul"
                    />

                    <div className="grid grid-cols-4 gap-2">

                      <label className="text-[9px] font-bold">
                        X
                        {numberInput(
                          (settings as any)
                            .frontOrganizationTitleX ??
                            15,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationTitleX:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Y
                        {numberInput(
                          (settings as any)
                            .frontOrganizationTitleY ??
                            6,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationTitleY:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Lebar
                        {numberInput(
                          (settings as any)
                            .frontOrganizationTitleWidth ??
                            65,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationTitleWidth:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Font
                        {numberInput(
                          (settings as any)
                            .frontOrganizationTitleFontSize ??
                            11,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationTitleFontSize:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                    </div>

                    <div className="grid grid-cols-3 gap-2">

                      <select
                        value={
                          (settings as any)
                            .frontOrganizationTitleFontWeight ??
                          'bold'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationTitleFontWeight:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className={input}
                      >
                        <option value="normal">
                          Normal
                        </option>
                        <option value="medium">
                          Medium
                        </option>
                        <option value="bold">
                          Bold
                        </option>
                        <option value="black">
                          Black
                        </option>
                      </select>

                      <select
                        value={
                          (settings as any)
                            .frontOrganizationTitleAlign ??
                          'left'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationTitleAlign:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className={input}
                      >
                        <option value="left">
                          Kiri
                        </option>
                        <option value="center">
                          Tengah
                        </option>
                        <option value="right">
                          Kanan
                        </option>
                      </select>

                      <input
                        type="color"
                        value={
                          (settings as any)
                            .frontOrganizationTitleColor ??
                          '#ffffff'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationTitleColor:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="h-9 w-full rounded"
                      />

                    </div>

                  </div>

                  {/* SUBTITLE */}

                  <div className="p-3 rounded-xl bg-slate-50 border space-y-2">

                    <div className="text-[10px] font-black uppercase">
                      GERAKAN PRAMUKA INDONESIA
                    </div>

                    <input
                      value={
                        settings.frontOrganizationSubtitle
                      }
                      onChange={event =>
                        setSettings(
                          current => ({
                            ...current,
                            frontOrganizationSubtitle:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className={input}
                      placeholder="Subjudul"
                    />

                    <div className="grid grid-cols-4 gap-2">

                      <label className="text-[9px] font-bold">
                        X
                        {numberInput(
                          (settings as any)
                            .frontOrganizationSubtitleX ??
                            15,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationSubtitleX:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Y
                        {numberInput(
                          (settings as any)
                            .frontOrganizationSubtitleY ??
                            12,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationSubtitleY:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Lebar
                        {numberInput(
                          (settings as any)
                            .frontOrganizationSubtitleWidth ??
                            70,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationSubtitleWidth:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                      <label className="text-[9px] font-bold">
                        Font
                        {numberInput(
                          (settings as any)
                            .frontOrganizationSubtitleFontSize ??
                            8,
                          value =>
                            setSettings(
                              current => ({
                                ...current,
                                frontOrganizationSubtitleFontSize:
                                  value,
                              }),
                            ),
                        )}
                      </label>

                    </div>

                    <div className="grid grid-cols-3 gap-2">

                      <select
                        value={
                          (settings as any)
                            .frontOrganizationSubtitleFontWeight ??
                          'normal'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationSubtitleFontWeight:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className={input}
                      >
                        <option value="normal">
                          Normal
                        </option>
                        <option value="medium">
                          Medium
                        </option>
                        <option value="bold">
                          Bold
                        </option>
                        <option value="black">
                          Black
                        </option>
                      </select>

                      <select
                        value={
                          (settings as any)
                            .frontOrganizationSubtitleAlign ??
                          'left'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationSubtitleAlign:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className={input}
                      >
                        <option value="left">
                          Kiri
                        </option>
                        <option value="center">
                          Tengah
                        </option>
                        <option value="right">
                          Kanan
                        </option>
                      </select>

                      <input
                        type="color"
                        value={
                          (settings as any)
                            .frontOrganizationSubtitleColor ??
                          '#e5e7eb'
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              frontOrganizationSubtitleColor:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        className="h-9 w-full rounded"
                      />

                    </div>

                  </div>

                </div>

              </section>
            )}

            {/* ===============================================
                6. FRONT QR
            =============================================== */}

            {side === 'FRONT' && (
              <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2 font-bold">
                    <Eye />
                    <span>
                      6. QR Code Depan
                    </span>
                  </div>

                  <label className="text-xs font-bold flex items-center gap-2">

                    <input
                      type="checkbox"
                      checked={
                        settings.showQrCode
                      }
                      onChange={event =>
                        setSettings(
                          current => ({
                            ...current,
                            showQrCode:
                              event.target
                                .checked,
                          }),
                        )
                      }
                    />

                    Tampilkan QR

                  </label>

                </div>

                <div className="grid grid-cols-3 gap-2">

                  <label className="text-[9px] font-bold">
                    X

                    {numberInput(
                      (settings as any)
                        .qrX ?? 78,
                      value =>
                        setSettings(
                          current => ({
                            ...current,
                            qrX: value,
                          }),
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Y

                    {numberInput(
                      (settings as any)
                        .qrY ?? 30,
                      value =>
                        setSettings(
                          current => ({
                            ...current,
                            qrY: value,
                          }),
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Ukuran

                    {numberInput(
                      (settings as any)
                        .qrSize ?? 22,
                      value =>
                        setSettings(
                          current => ({
                            ...current,
                            qrSize: value,
                          }),
                        ),
                    )}
                  </label>

                </div>

              </section>
            )}

            {/* ===============================================
                7. BACK SIGNER / QR
            =============================================== */}

            {side === 'BACK' && (
              <section className="p-4 rounded-2xl border border-purple-200 bg-purple-50/60 space-y-4">

                <div className="flex items-center gap-2 font-bold text-purple-950">
                  <Eye />
                  <span>
                    5. QR Penandatangan KTA
                  </span>
                </div>

                <p className="text-[10px] text-purple-900/70">
                  Bagian belakang KTA disusun
                  otomatis dengan urutan:
                  <strong>
                    {' '}
                    Tempat & tanggal → QR →
                    Nama → Jabatan
                  </strong>.
                </p>

                {/* SIGNER */}

                <label className="block text-[10px] font-bold text-purple-950">

                  Penandatangan

                  <select
                    value={
                      (settings as any)
                        .signerMemberId ||
                      ''
                    }
                    onChange={event => {
                      const id =
                        event.target
                          .value;

                      const member =
                        activeMembers.find(
                          item =>
                            item.id ===
                            id,
                        );

                      setSettings(
                        current => ({
                          ...current,

                          signerMemberId:
                            id,

                          signerName:
                            member?.fullName ||
                            current.signerName,

                          signerTitle:
                            member?.currentPosition ||
                            current.signerTitle,

                          signerSubtitle:
                            '',
                        }),
                      );
                    }}
                    className={input}
                  >

                    <option value="">
                      Pilih anggota yang berwenang
                    </option>

                    {activeMembers.map(
                      member => (
                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >
                          {
                            member.fullName
                          }{' '}
                          —{' '}
                          {member.currentPosition ||
                            'Tanpa jabatan'}
                          {member.provinceName
                            ? ` · ${member.provinceName}`
                            : ''}
                        </option>
                      ),
                    )}

                  </select>

                </label>

                <div className="p-3 rounded-xl bg-white border border-purple-100 text-[10px] text-slate-600">

                  {signerMember ? (
                    <>
                      <strong>
                        {
                          signerMember.fullName
                        }
                      </strong>

                      <br />

                      {
                        signerMember.currentPosition ||
                        'Tanpa jabatan'
                      }
                    </>
                  ) : (
                    'Belum ada penandatangan yang dipilih.'
                  )}

                </div>

                {/* DATE POSITION */}

                <div className="p-3 rounded-xl bg-white border border-purple-100 space-y-2">

                  <div className="text-[10px] font-black text-purple-950">
                    1. Tempat & Tanggal
                  </div>

                  <input
                    value={
                      settings.issueLocationDate ||
                      ''
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          issueLocationDate:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={input}
                    placeholder="Contoh: Jakarta, 14 Agustus 2026"
                  />

                  <div className="grid grid-cols-2 gap-2">

                    <label className="text-[9px] font-bold">
                      X

                      {numberInput(
                        (settings as any)
                          .issueLocationDateX ??
                          5,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              issueLocationDateX:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y

                      {numberInput(
                        (settings as any)
                          .issueLocationDateY ??
                          60,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              issueLocationDateY:
                                value,
                            }),
                          ),
                      )}
                    </label>

                  </div>

                </div>

                {/* QR POSITION */}

                <div className="p-3 rounded-xl bg-white border border-purple-100 space-y-3">

                  <div className="flex items-center justify-between">

                    <div className="text-[10px] font-black text-purple-950">
                      2. QR Penandatangan
                    </div>

                    <label className="text-[9px] font-bold flex items-center gap-2">

                      <input
                        type="checkbox"
                        checked={
                          (settings as any)
                            .showSignerQrCode !==
                          false
                        }
                        onChange={event =>
                          setSettings(
                            current => ({
                              ...current,
                              showSignerQrCode:
                                event
                                  .target
                                  .checked,
                            }),
                          )
                        }
                      />

                      Tampilkan QR

                    </label>

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                    <label className="text-[9px] font-bold">
                      X QR

                      {numberInput(
                        (settings as any)
                          .signerQrX ??
                          68,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerQrX:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y QR

                      {numberInput(
                        (settings as any)
                          .signerQrY ??
                          70,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerQrY:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Ukuran QR

                      {numberInput(
                        (settings as any)
                          .signerQrSize ??
                          18,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerQrSize:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Margin

                      {numberInput(
                        (settings as any)
                          .signerQrPadding ??
                          2,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerQrPadding:
                                value,
                            }),
                          ),
                      )}
                    </label>

                  </div>

                </div>

                {/* SIGNER NAME & POSITION */}

                <div className="p-3 rounded-xl bg-white border border-purple-100 space-y-3">

                  <div className="text-[10px] font-black text-purple-950">
                    3. Nama & Jabatan
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <label className="text-[9px] font-bold">
                      X Nama

                      {numberInput(
                        (settings as any)
                          .signerX ??
                          5,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerX:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y Nama

                      {numberInput(
                        (settings as any)
                          .signerY ??
                          84,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerY:
                                value,
                            }),
                          ),
                      )}
                    </label>

                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <label className="text-[9px] font-bold">
                      X Offset Nama

                      {numberInput(
                        (settings as any)
                          .signerNameXOffset ??
                          0,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerNameXOffset:
                                value,
                            }),
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y Offset Nama

                      {numberInput(
                        (settings as any)
                          .signerNameYOffset ??
                          0,
                        value =>
                          setSettings(
                            current => ({
                              ...current,
                              signerNameYOffset:
                                value,
                            }),
                          ),
                      )}
                    </label>

                  </div>

                  <p className="text-[9px] text-slate-500">
                    Nama dan jabatan berada
                    setelah QR Code.
                    Jabatan mengikuti data
                    anggota yang dipilih.
                  </p>

                </div>

                {/* QR COLOR */}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

                  <label className="text-[9px] font-bold">
                    Latar QR

                    <input
                      type="color"
                      value={
                        (settings as any)
                          .signerQrBackgroundColor ??
                        '#ffffff'
                      }
                      onChange={event =>
                        setSettings(
                          current => ({
                            ...current,
                            signerQrBackgroundColor:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className="h-9 w-full rounded"
                    />
                  </label>

                  <label className="text-[9px] font-bold">
                    Border

                    {numberInput(
                      (settings as any)
                        .signerQrBorderWidth ??
                        0,
                      value =>
                        setSettings(
                          current => ({
                            ...current,
                            signerQrBorderWidth:
                              value,
                          }),
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Radius

                    {numberInput(
                      (settings as any)
                        .signerQrBorderRadius ??
                        4,
                      value =>
                        setSettings(
                          current => ({
                            ...current,
                            signerQrBorderRadius:
                              value,
                          }),
                        ),
                    )}
                  </label>

                </div>

              </section>
            )}

            {/* ===============================================
                DATA FIELDS
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold">
                  <Type />
                  <span>
                    7. Data Anggota yang Ditampilkan
                  </span>
                </div>

                <button
                  onClick={addField}
                  className="px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  <Plus className="inline w-3.5 h-3.5 mr-1" />
                  Tambah Data
                </button>

              </div>

              {sideFields.map(field => (
                <div
                  key={field.id}
                  className="p-3 bg-slate-50 rounded-xl border space-y-2"
                >

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">

                    <select
                      value={
                        field.field
                      }
                      onChange={event => {
                        const selected =
                          event
                            .target
                            .value as KtaMemberFieldKey;

                        updateField(
                          field.id,
                          {
                            field:
                              selected,

                            label:
                              FIELD_OPTIONS.find(
                                option =>
                                  option.value ===
                                  selected,
                              )?.label ||
                              field.label,
                          },
                        );
                      }}
                      className={input}
                    >
                      {FIELD_OPTIONS.map(
                        option => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        ),
                      )}
                    </select>

                    <input
                      value={
                        field.label
                      }
                      onChange={event =>
                        updateField(
                          field.id,
                          {
                            label:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      className={input}
                    />

                    <label className="flex items-center gap-2 text-xs font-bold">

                      <input
                        type="checkbox"
                        checked={
                          field.visible
                        }
                        onChange={event =>
                          updateField(
                            field.id,
                            {
                              visible:
                                event
                                  .target
                                  .checked,
                            },
                          )
                        }
                      />

                      Tampilkan

                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold">

                      <input
                        type="checkbox"
                        checked={
                          field.showLabel ??
                          false
                        }
                        onChange={event =>
                          updateField(
                            field.id,
                            {
                              showLabel:
                                event
                                  .target
                                  .checked,
                            },
                          )
                        }
                      />

                      Label

                    </label>

                    <select
                      value={
                        field.fontWeight
                      }
                      onChange={event =>
                        updateField(
                          field.id,
                          {
                            fontWeight:
                              event
                                .target
                                .value as any,
                          },
                        )
                      }
                      className={input}
                    >
                      <option>
                        normal
                      </option>
                      <option>
                        medium
                      </option>
                      <option>
                        bold
                      </option>
                      <option>
                        black
                      </option>
                    </select>

                    <input
                      type="color"
                      value={
                        field.color
                      }
                      onChange={event =>
                        updateField(
                          field.id,
                          {
                            color:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      className="h-9 w-full rounded"
                    />

                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">

                    <label className="text-[9px] font-bold">
                      X
                      {numberInput(
                        field.x,
                        value =>
                          updateField(
                            field.id,
                            {
                              x: value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Y
                      {numberInput(
                        field.y,
                        value =>
                          updateField(
                            field.id,
                            {
                              y: value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Lebar
                      {numberInput(
                        field.width,
                        value =>
                          updateField(
                            field.id,
                            {
                              width:
                                value,
                            },
                          ),
                      )}
                    </label>

                    <label className="text-[9px] font-bold">
                      Font
                      {numberInput(
                        field.fontSize,
                        value =>
                          updateField(
                            field.id,
                            {
                              fontSize:
                                value,
                            },
                          ),
                      )}
                    </label>

                    <select
                      value={
                        field.align ||
                        'left'
                      }
                      onChange={event =>
                        updateField(
                          field.id,
                          {
                            align:
                              event
                                .target
                                .value as any,
                          },
                        )
                      }
                      className={input}
                    >
                      <option value="left">
                        Kiri
                      </option>
                      <option value="center">
                        Tengah
                      </option>
                      <option value="right">
                        Kanan
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        setSettings(
                          current => ({
                            ...current,

                            dataFields:
                              current.dataFields.filter(
                                item =>
                                  item.id !==
                                  field.id,
                              ),
                          }),
                        )
                      }
                      className="text-red-600 text-xs font-bold"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" />
                      Hapus
                    </button>

                  </div>

                </div>
              ))}

            </section>

            {/* ===============================================
                CUSTOM TEXT
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold">
                  <Type />
                  <span>
                    8. Teks Kustom
                  </span>
                </div>

                <button
                  onClick={addText}
                  className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold"
                >
                  <Plus className="inline w-3.5 h-3.5 mr-1" />
                  Tambah Teks
                </button>

              </div>

              {sideTexts.map(text => (
                <div
                  key={text.id}
                  className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border"
                >

                  <input
                    value={
                      text.text
                    }
                    onChange={event =>
                      updateText(
                        text.id,
                        {
                          text:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className={
                      input +
                      ' col-span-5'
                    }
                    placeholder="Teks pada kartu"
                  />

                  <label className="text-[9px] font-bold">
                    X
                    {numberInput(
                      text.x,
                      value =>
                        updateText(
                          text.id,
                          {
                            x: value,
                          },
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Y
                    {numberInput(
                      text.y,
                      value =>
                        updateText(
                          text.id,
                          {
                            y: value,
                          },
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Lebar
                    {numberInput(
                      text.width,
                      value =>
                        updateText(
                          text.id,
                          {
                            width:
                              value,
                          },
                        ),
                    )}
                  </label>

                  <label className="text-[9px] font-bold">
                    Font
                    {numberInput(
                      text.fontSize,
                      value =>
                        updateText(
                          text.id,
                          {
                            fontSize:
                              value,
                          },
                        ),
                    )}
                  </label>

                  <input
                    type="color"
                    value={
                      text.color
                    }
                    onChange={event =>
                      updateText(
                        text.id,
                        {
                          color:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="h-9 rounded"
                  />

                  <button
                    onClick={() =>
                      setSettings(
                        current => ({
                          ...current,

                          textElements:
                            current.textElements.filter(
                              item =>
                                item.id !==
                                text.id,
                            ),
                        }),
                      )
                    }
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              ))}

            </section>

            {/* ===============================================
                SYSTEM TEXT
            =============================================== */}

            <section className="p-4 rounded-2xl border border-slate-200 space-y-3">

              <div className="flex items-center gap-2 font-bold">
                <Type />
                <span>
                  9. Teks Sistem Kartu
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                <label className="text-[10px] font-bold">
                  Judul Organisasi

                  <input
                    value={
                      settings.frontOrganizationTitle
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          frontOrganizationTitle:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

                <label className="text-[10px] font-bold">
                  Subjudul

                  <input
                    value={
                      settings.frontOrganizationSubtitle
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          frontOrganizationSubtitle:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

                <label className="text-[10px] font-bold">
                  Masa Berlaku

                  <input
                    value={
                      settings.frontValidityText
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          frontValidityText:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

                <label className="text-[10px] font-bold">
                  Header Belakang

                  <input
                    value={
                      settings.backHeaderTitle
                    }
                    onChange={event =>
                      setSettings(
                        current => ({
                          ...current,
                          backHeaderTitle:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className={input}
                  />
                </label>

              </div>

              <label className="text-[10px] font-bold">

                Ketentuan Belakang

                <textarea
                  value={
                    settings.terms.join(
                      '\n',
                    )
                  }
                  onChange={event =>
                    setSettings(
                      current => ({
                        ...current,

                        terms:
                          event.target.value.split(
                            '\n',
                          ),
                      }),
                    )
                  }
                  className={
                    input +
                    ' min-h-24'
                  }
                />

              </label>

            </section>

            {/* ===============================================
                NTA REGION
            =============================================== */}

            <section className="p-4 rounded-2xl border border-purple-200 bg-purple-50 space-y-3">

              <div className="flex items-center gap-2 font-bold text-purple-950">

                <MapPin />

                <span>
                  Penerbitan NTA berdasarkan wilayah
                </span>

              </div>

              <div className="grid grid-cols-3 gap-2">

                <select
                  value={
                    regionProvinceId
                  }
                  onChange={event => {
                    setRegionProvinceId(
                      event.target
                        .value,
                    );

                    setRegionRegencyId(
                      '',
                    );

                    setRegionDistrictId(
                      '',
                    );
                  }}
                  className={input}
                >
                  <option value="">
                    Provinsi
                  </option>

                  {provinces
                    .filter(
                      province =>
                        province.id !==
                        '00',
                    )
                    .map(province => (
                      <option
                        key={
                          province.id
                        }
                        value={
                          province.id
                        }
                      >
                        {
                          province.name
                        }
                      </option>
                    ))}
                </select>

                <select
                  value={
                    regionRegencyId
                  }
                  disabled={
                    !regionProvinceId
                  }
                  onChange={event => {
                    setRegionRegencyId(
                      event.target
                        .value,
                    );

                    setRegionDistrictId(
                      '',
                    );
                  }}
                  className={input}
                >
                  <option value="">
                    Kabupaten/Kota
                  </option>

                  {regencies.map(
                    regency => (
                      <option
                        key={
                          regency.id
                        }
                        value={
                          regency.id
                        }
                      >
                        {
                          regency.name
                        }
                      </option>
                    ),
                  )}
                </select>

                <select
                  value={
                    regionDistrictId
                  }
                  disabled={
                    !regionRegencyId
                  }
                  onChange={event =>
                    setRegionDistrictId(
                      event.target
                        .value,
                    )
                  }
                  className={input}
                >
                  <option value="">
                    Kecamatan
                  </option>

                  {districts.map(
                    district => (
                      <option
                        key={
                          district.id
                        }
                        value={
                          district.id
                        }
                      >
                        {
                          district.name
                        }
                      </option>
                    ),
                  )}
                </select>

              </div>

              <button
                disabled={
                  !regionProvinceId ||
                  regionBusy
                }
                onClick={
                  handleGenerateByRegion
                }
                className="px-4 py-2 rounded-lg bg-purple-900 text-white text-xs font-bold disabled:opacity-50"
              >
                <RefreshCw
                  className={`inline w-3.5 h-3.5 mr-1 ${
                    regionBusy
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                Generate NTA
              </button>

            </section>

          </div>

          {/* =================================================
              LIVE PREVIEW
          ================================================= */}

          <div className="xl:col-span-4 bg-slate-950 p-5 flex flex-col items-center justify-center gap-4 min-h-[500px]">

            <div className="text-center">

              <p className="text-xs font-bold text-emerald-400">
                LIVE PREVIEW
              </p>

              <p className="text-[10px] text-slate-400">
                {settings.widthMm} ×{' '}
                {settings.heightMm} mm •{' '}
                {side === 'FRONT'
                  ? 'Bagian Depan'
                  : 'Bagian Belakang'}
              </p>

            </div>

            <DigitalMemberCard
              member={previewMember}
              previewSettings={
                settings
              }
              showControls={false}
            />

            <div className="w-full max-w-sm p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300">

              {loadingRemote
                ? 'Memuat konfigurasi pusat...'
                : 'Perubahan di panel ini belum dipublikasikan sampai tombol Simpan ditekan.'}

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="p-4 border-t bg-slate-50 flex items-center justify-between gap-3">

          <div className="text-xs font-semibold text-slate-600">
            {message}
          </div>

          <div className="flex gap-2">

            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold"
            >
              <RotateCcw className="inline w-3.5 h-3.5 mr-1" />
              Reset
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-bold"
            >
              Batal
            </button>

            <button
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold disabled:opacity-50"
            >
              <Save className="inline w-3.5 h-3.5 mr-1" />

              {isSaving
                ? 'Menyimpan...'
                : 'Simpan Pengaturan KTA'}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
```
