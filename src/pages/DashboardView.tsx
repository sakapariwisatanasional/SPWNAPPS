import React, { useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  Calendar,
  Search,
  CheckCircle2,
  ChevronRight,
  Activity as ActivityIcon,
  Sparkles,
  Map,
  FileText,
  Check,
  BookOpen,
  Edit3,
  MoreHorizontal,
  FileCheck,
  ChevronDown
} from 'lucide-react';

import { NationalMapVisual } from '../components/dashboard/NationalMapVisual';
import { TourPackageCarouselSection } from '../components/dashboard/TourPackageCarouselSection';
import { CulinarySouvenirGallerySection } from '../components/dashboard/CulinarySouvenirGallerySection';
import { IntegratedTourismShowcaseGallery } from '../components/dashboard/IntegratedTourismShowcaseGallery';
import { CompactKridaPortal } from '../components/krida/CompactKridaPortal';
import { OFFICIAL_2026_KRIDA_MODULES } from '../data/kridaModules2026';

export interface DashboardViewProps {
  currentUser?: any;
  members?: any[];
  activities?: any[];
  tourPackages?: any[];
  culinaryItems?: any[];
  auditLogs?: any[];

  // App.tsx menggunakan nama prop ini.
  onSelectTab?: (view: string) => void;

  // Membuka modal pemeriksaan/verifikasi anggota.
  onVerifyMember?: (member: any) => void;

  // Mengaktifkan anggota secara langsung.
  onApproveMemberQuick?: (id: string) => void;

  onOpenKridaEditor?: () => void;
  onOpenCulinaryFormModal?: (item?: any, kind?: any) => void;

  [key: string]: any;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'emerald' | 'teal' | 'amber' | 'indigo';
  badge?: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  badge,
  onClick
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 border border-emerald-100',
      value: 'text-emerald-700',
      border: 'hover:border-emerald-300',
      ring: 'group-hover:bg-emerald-100'
    },
    teal: {
      iconBg: 'bg-teal-50 border border-teal-100',
      value: 'text-teal-700',
      border: 'hover:border-teal-300',
      ring: 'group-hover:bg-teal-100'
    },
    amber: {
      iconBg: 'bg-amber-50 border border-amber-100',
      value: 'text-amber-700',
      border: 'hover:border-amber-300',
      ring: 'group-hover:bg-amber-100'
    },
    indigo: {
      iconBg: 'bg-sky-50 border border-sky-100',
      value: 'text-sky-700',
      border: 'hover:border-sky-300',
      ring: 'group-hover:bg-sky-100'
    }
  }[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left w-full bg-white rounded-[1.5rem] p-5 border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${colorMap.border}`}
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold">
          {badge}
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-11 h-11 rounded-2xl ${colorMap.iconBg} ${colorMap.ring} flex items-center justify-center shrink-0 transition-colors`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          {onClick && (
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
          )}
        </div>
        <p
          className={`mt-1 text-2xl font-extrabold tracking-tight ${colorMap.value}`}
        >
          {value}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      </div>
    </button>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser = null,
  members = [],
  activities = [],
  tourPackages = [],
  culinaryItems = [],
  auditLogs = [],
  onSelectTab,
  onVerifyMember,
  onApproveMemberQuick,
  onOpenKridaEditor,
  onOpenCulinaryFormModal
}) => {
  const [searchPending, setSearchPending] = useState('');

  const safeMembers = useMemo(
    () => (Array.isArray(members) ? members : []),
    [members]
  );

  const safeActivities = useMemo(
    () => (Array.isArray(activities) ? activities : []),
    [activities]
  );

  const safeTourPackages = useMemo(
    () => (Array.isArray(tourPackages) ? tourPackages : []),
    [tourPackages]
  );

  const safeCulinaryItems = useMemo(
    () => (Array.isArray(culinaryItems) ? culinaryItems : []),
    [culinaryItems]
  );

  const safeAuditLogs = useMemo(
    () => (Array.isArray(auditLogs) ? auditLogs : []),
    [auditLogs]
  );

  // Evaluasi peran akun.
  const role = String(currentUser?.role || '').toUpperCase();

  const isNationalScopeAdmin = useMemo(() => {
    return (
      role === 'SUPER_ADMIN' ||
      role === 'ADMIN_NATIONAL' ||
      role === 'KWARNAS' ||
      role === 'ADMIN_NATIONAL' ||
      currentUser?.isSuperAdmin === true
    );
  }, [role, currentUser?.isSuperAdmin]);

  const canManageKrida = useMemo(() => {
    return [
      'SUPER_ADMIN',
      'ADMIN_NATIONAL',
      'ADMIN_PROVINCE',
      'ADMIN_REGENCY',
      'ADMIN_BRANCH'
    ].includes(role);
  }, [role]);

  const canOpenAuditLogs = role === 'SUPER_ADMIN' || currentUser?.isSuperAdmin === true;

  const canOpenTerritories = [
    'SUPER_ADMIN',
    'ADMIN_NATIONAL',
    'ADMIN_PROVINCE'
  ].includes(role) || currentUser?.isSuperAdmin === true;

  /*
   * Navigasi Dashboard.
   *
   * App.tsx menggunakan prop onSelectTab, bukan onNavigate.
   * Semua tombol Dashboard sekarang melewati fungsi ini.
   */
  const handleNavigate = (view: string) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(view);
    }
  };

  /*
   * Cakupan data anggota.
   *
   * SuperAdmin/Admin Nasional melihat seluruh data.
   * Untuk admin wilayah, gunakan struktur wilayah terbaru apabila tersedia.
   * Fallback ke kwarda/kwarcab lama tetap dipertahankan agar kompatibel
   * dengan data lama.
   */
  const scopedMembers = useMemo(() => {
    if (isNationalScopeAdmin) {
      return safeMembers;
    }

    const jurisdictionId = String(
      currentUser?.operatorJurisdictionId ||
      currentUser?.jurisdictionId ||
      ''
    ).trim();

    if (jurisdictionId) {
      const byJurisdiction = safeMembers.filter((member) => {
        if (!member) return false;

        return (
          String(member.operatorJurisdictionId || '') === jurisdictionId ||
          String(member.provinceId || '') === jurisdictionId ||
          String(member.regencyId || '') === jurisdictionId ||
          String(member.districtId || '') === jurisdictionId
        );
      });

      if (byJurisdiction.length > 0) {
        return byJurisdiction;
      }
    }

    const currentProvince = String(
      currentUser?.provinceName ||
      currentUser?.kwarda ||
      ''
    )
      .trim()
      .toLowerCase();

    const currentRegency = String(
      currentUser?.regencyName ||
      currentUser?.kwarcab ||
      ''
    )
      .trim()
      .toLowerCase();

    const currentDistrict = String(
      currentUser?.districtName ||
      ''
    )
      .trim()
      .toLowerCase();

    if (currentDistrict) {
      return safeMembers.filter((member) => {
        return (
          String(member?.districtName || '').trim().toLowerCase() ===
          currentDistrict
        );
      });
    }

    if (currentRegency) {
      return safeMembers.filter((member) => {
        return (
          String(member?.regencyName || '').trim().toLowerCase() ===
          currentRegency
        );
      });
    }

    if (currentProvince) {
      return safeMembers.filter((member) => {
        return (
          String(member?.provinceName || '').trim().toLowerCase() ===
          currentProvince
        );
      });
    }

    return safeMembers;
  }, [
    safeMembers,
    isNationalScopeAdmin,
    currentUser
  ]);

  // Statistik anggota.
  const verifiedMembers = useMemo(() => {
    return scopedMembers.filter((member) => {
      if (!member) return false;

      const status = String(member.status || '').toLowerCase();
      const verificationStatus = String(
        member.verificationStatus || ''
      ).toLowerCase();

      return (
        verificationStatus === 'verified' ||
        verificationStatus === 'terverifikasi' ||
        status === 'aktif' ||
        status === 'active'
      );
    });
  }, [scopedMembers]);

  const pendingMembers = useMemo(() => {
    return scopedMembers.filter((member) => {
      if (!member) return false;

      const status = String(member.status || '').toLowerCase();
      const verificationStatus = String(
        member.verificationStatus || ''
      ).toLowerCase();

      return (
        verificationStatus === 'pending' ||
        verificationStatus === 'menunggu verifikasi' ||
        status === 'pending' ||
        status === 'menunggu verifikasi'
      );
    });
  }, [scopedMembers]);

  /*
   * Antrean verifikasi menggunakan struktur Member terbaru:
   * fullName
   * nationalMemberNumber
   * provinceName
   * regencyName
   * districtName
   */
  const filteredPendingList = useMemo(() => {
    const query = searchPending.trim().toLowerCase();

    if (!query) {
      return pendingMembers;
    }

    return pendingMembers.filter((member) => {
      const name = String(member?.fullName || '').toLowerCase();
      const nationalMemberNumber = String(
        member?.nationalMemberNumber || ''
      ).toLowerCase();
      const provinceName = String(
        member?.provinceName || ''
      ).toLowerCase();
      const regencyName = String(
        member?.regencyName || ''
      ).toLowerCase();
      const districtName = String(
        member?.districtName || ''
      ).toLowerCase();

      return (
        name.includes(query) ||
        nationalMemberNumber.includes(query) ||
        provinceName.includes(query) ||
        regencyName.includes(query) ||
        districtName.includes(query)
      );
    });
  }, [pendingMembers, searchPending]);

  // Riwayat audit terkini.
  const recentAuditLogs = useMemo(() => {
    return [...safeAuditLogs]
      .filter((log) => Boolean(log))
      .sort((a, b) => {
        const timeA = a?.timestamp
          ? new Date(a.timestamp).getTime()
          : 0;

        const timeB = b?.timestamp
          ? new Date(b.timestamp).getTime()
          : 0;

        return timeB - timeA;
      })
      .slice(0, 6);
  }, [safeAuditLogs]);

  const handleVerify = (member: any) => {
    if (typeof onVerifyMember === 'function') {
      onVerifyMember(member);
    }
  };

  const handleActivate = (member: any) => {
    if (
      member?.id &&
      typeof onApproveMemberQuick === 'function'
    ) {
      void onApproveMemberQuick(member.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-4 px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Banner Utama */}
      <div className="bg-gradient-to-r from-purple-950 via-violet-900 to-slate-950 rounded-[1.75rem] p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />

                {role === 'ADMIN_NATIONAL'
                  ? 'ADMIN NASIONAL — TINGKAT NASIONAL'
                  : isNationalScopeAdmin
                    ? 'SUPER ADMIN — TINGKAT NASIONAL'
                    : `ADMINISTRATOR — ${
                        currentUser?.regencyName ||
                        currentUser?.provinceName ||
                        currentUser?.kwarcab ||
                        currentUser?.kwarda ||
                        'REGIONAL'
                      }`}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-emerald-100">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Saka Pariwisata
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pusat Kendali & Informasi Nasional
            </h1>

            <p className="text-emerald-100/80 text-sm max-w-2xl">
              Monitoring pendaftaran anggota Saka Pariwisata,
              verifikasi KTA digital, persebaran krida, dan agenda
              kegiatan nasional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canOpenAuditLogs && (
              <button
                type="button"
                onClick={() => handleNavigate('audit-logs')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition backdrop-blur-sm border border-white/15 min-h-[42px]"
                title="Buka riwayat audit sistem"
              >
                <FileText className="w-4 h-4" />
                Log Audit
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigate('members')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-extrabold transition shadow-lg shadow-emerald-500/20 min-h-[42px]"
              title="Buka manajemen anggota"
            >
              <Users className="w-4 h-4" />
              Kelola Anggota
            </button>
          </div>
        </div>
      </div>

      {/* Akses cepat CMS Materi Krida */}
      {canManageKrida && (
        <section className="rounded-[1.6rem] border border-fuchsia-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Kelola Materi Krida & SKK
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-fuchsia-700">
                    <Edit3 className="w-3 h-3" />
                    Admin Pengelola
                  </span>
                </div>

                <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
                  Buka pusat Krida untuk memilih SKK dan mengedit
                  naskah, kompetensi, silabus, referensi, serta
                  berkas materi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenKridaEditor
                  ? onOpenKridaEditor()
                  : handleNavigate('krida-modules')
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer shrink-0"
              title="Buka pengelolaan materi Krida"
            >
              <Edit3 className="w-4 h-4" />
              Kelola Materi Krida
            </button>
          </div>
        </section>
      )}

      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Anggota"
          value={scopedMembers.length.toLocaleString('id-ID')}
          subtitle={
            isNationalScopeAdmin
              ? 'Cakupan Seluruh Indonesia'
              : 'Wilayah Terdaftar'
          }
          icon={<Users className="w-6 h-6 text-emerald-600" />}
          color="emerald"
          onClick={() => handleNavigate('members')}
        />

        <MetricCard
          title="Anggota Terverifikasi"
          value={verifiedMembers.length.toLocaleString('id-ID')}
          subtitle={`${
            scopedMembers.length > 0
              ? Math.round(
                  (verifiedMembers.length / scopedMembers.length) * 100
                )
              : 0
          }% KTA Aktif`}
          icon={<UserCheck className="w-6 h-6 text-teal-600" />}
          color="teal"
          onClick={() => handleNavigate('members')}
        />

        <MetricCard
          title="Menunggu Verifikasi"
          value={pendingMembers.length.toLocaleString('id-ID')}
          subtitle="Menunggu Validasi Admin"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="amber"
          badge={
            pendingMembers.length > 0
              ? `${pendingMembers.length} Antrean`
              : undefined
          }
          onClick={() => {
            const element = document.getElementById(
              'pending-verification-section'
            );

            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}
        />

        <MetricCard
          title="Kegiatan & Bhakti"
          value={safeActivities.length.toLocaleString('id-ID')}
          subtitle="Pelatihan & Agenda Saka"
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
          color="indigo"
          onClick={() => handleNavigate('activities')}
        />
      </div>

      {/* Tabel Antrean Verifikasi */}
      <div
        id="pending-verification-section"
        className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-slate-200/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />

              <h2 className="text-lg font-bold text-slate-800">
                Antrean Verifikasi Anggota Baru
              </h2>
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Calon anggota yang telah mendaftar dan menunggu
              pengesahan KTA digital
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

              <input
                type="text"
                placeholder="Cari nama, NTA, atau wilayah..."
                value={searchPending}
                onChange={(event) =>
                  setSearchPending(event.target.value)
                }
                className="pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-64 min-h-[40px]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('members')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-extrabold text-slate-700 hover:text-emerald-700 transition cursor-pointer min-h-[38px]"
              title="Buka seluruh daftar anggota"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filteredPendingList.length > 0 ? (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">
                    Nama & NTA
                  </th>
                  <th className="py-3 px-4">
                    Kwarda / Kwarcab
                  </th>
                  <th className="py-3 px-4">
                    Pilihan Krida
                  </th>
                  <th className="py-3 px-4 text-right rounded-r-xl">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPendingList
                  .slice(0, 5)
                  .map((member, index) => (
                    <tr
                      key={member?.id || index}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {member?.fullName ||
                            'Anggota Tanpa Nama'}
                        </div>

                        <div className="text-xs text-slate-400">
                          {member?.nationalMemberNumber ||
                            'NTA Belum Diterbitkan'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="font-medium text-slate-700">
                          {member?.regencyName || '—'}
                        </div>

                        <div className="text-slate-400">
                          {member?.provinceName || '—'}
                        </div>

                        {member?.districtName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {member.districtName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                          {member?.krida || 'Umum'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {typeof onVerifyMember === 'function' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleVerify(member)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-extrabold transition min-h-[38px]"
                              title="Periksa data anggota"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Periksa
                            </button>
                          )}

                          {typeof onApproveMemberQuick ===
                            'function' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleActivate(member)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-sm min-h-[38px]"
                              title="Aktifkan anggota"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Aktifkan
                            </button>
                          )}

                          <details className="relative">
                            <summary
                              className="list-none inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold transition cursor-pointer min-h-[38px]"
                              title="Aksi lainnya"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="hidden xl:inline">Aksi</span>
                              <ChevronDown className="w-3 h-3" />
                            </summary>

                            <div className="absolute right-0 top-full mt-2 z-30 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  handleNavigate('members')
                                }
                                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <Users className="w-4 h-4 text-purple-600" />
                                Detail Anggota
                              </button>
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="py-10 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />

              <p className="text-sm font-semibold text-slate-700">
                Tidak ada antrean verifikasi saat ini
              </p>

              <p className="text-xs text-slate-400">
                Seluruh data anggota telah terverifikasi dengan
                lengkap.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Peta Nasional & Log Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[1.75rem] p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-600" />
                Persebaran Saka Pariwisata Nasional
              </h2>

              <p className="text-xs text-slate-400">
                Distribusi anggota berdasarkan wilayah Kwartir
                Daerah se-Indonesia
              </p>
            </div>

            {canOpenTerritories && (
              <button
                type="button"
                onClick={() => handleNavigate('territories')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Detail Wilayah
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="min-h-[260px]">
            <NationalMapVisual members={safeMembers} />
          </div>
        </div>

        {canOpenAuditLogs && (
          <div className="bg-white rounded-[1.75rem] p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-teal-600" />
                Aktivitas Sistem
              </h2>

              <button
                type="button"
                onClick={() => handleNavigate('audit-logs')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Semua Log
              </button>
            </div>

            <div className="space-y-3">
              {recentAuditLogs.length > 0 ? (
                recentAuditLogs.map((log, index) => (
                  <div
                    key={log?.id || index}
                    className="p-3 rounded-[1.35rem] bg-slate-50 hover:bg-slate-100/80 transition flex items-start gap-3 border border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">
                        {log?.action ||
                          'Aktivitas Sistem'}
                      </p>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {log?.userName ||
                          log?.performedBy ||
                          'Operator Sistem'}
                      </p>

                      <span className="text-[10px] text-slate-400">
                        {log?.timestamp
                          ? new Date(
                              log.timestamp
                            ).toLocaleString('id-ID')
                          : '—'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada aktivitas audit yang tercatat.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Portal Krida Saka Pariwisata */}
      <div className="space-y-3">
        <CompactKridaPortal
          modules={OFFICIAL_2026_KRIDA_MODULES}
          currentUser={currentUser}
          onOpenFullExplorer={() =>
            handleNavigate('krida-modules')
          }
        />
      </div>

      {/* Galeri Showcase Potensi Wisata & Kuliner */}
      <div className="space-y-6">
        <IntegratedTourismShowcaseGallery
          tours={safeTourPackages}
          products={safeCulinaryItems}
          members={safeMembers}
          activities={safeActivities}
          currentUser={currentUser || ({} as any)}
          onSelectTab={handleNavigate}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

          <div className="min-w-0 bg-white rounded-[1.75rem] p-6 shadow-sm border border-slate-200/80 overflow-hidden">
            <TourPackageCarouselSection
              packages={safeTourPackages}
            />
          </div>

          <div className="min-w-0 w-full bg-white rounded-[1.75rem] p-6 shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="w-full max-w-full">
              <CulinarySouvenirGallerySection
                items={safeCulinaryItems}
                currentUser={currentUser}
                members={safeMembers}
                onOpenFormModal={onOpenCulinaryFormModal}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardView;
