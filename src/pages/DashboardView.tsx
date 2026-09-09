import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  Calendar,
  Compass,
  Search,
  CheckCircle2,
  ChevronRight,
  Activity as ActivityIcon,
  Sparkles,
  Map,
  FileText,
  Check,
  ArrowUpRight,
  UtensilsCrossed,
  ShoppingBag
} from 'lucide-react';

import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { NationalMapVisual } from '../components/dashboard/NationalMapVisual';
import { TourPackageCarouselSection } from '../components/dashboard/TourPackageCarouselSection';
import { CulinarySouvenirGallerySection } from '../components/dashboard/CulinarySouvenirGallerySection';
import { IntegratedTourismShowcaseGallery } from '../components/dashboard/IntegratedTourismShowcaseGallery';
import { CompactKridaPortal } from '../components/krida/CompactKridaPortal';

export interface DashboardViewProps {
  currentUser?: any;
  members?: any[];
  activities?: any[];
  tourPackages?: any[];
  culinaryItems?: any[];
  auditLogs?: any[];
  onNavigate?: (view: string) => void;
  onVerifyMember?: (id: string) => void;
  [key: string]: any;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser = null,
  members = [],
  activities = [],
  tourPackages = [],
  culinaryItems = [],
  auditLogs = [],
  onNavigate,
  onVerifyMember,
}) => {
  const [searchPending, setSearchPending] = useState('');
  const [selectedKwardaFilter, setSelectedKwardaFilter] = useState('ALL');

  // Normalisasi data dengan array fallback mutlak
  const safeMembers = useMemo(() => (Array.isArray(members) ? members : []), [members]);
  const safeActivities = useMemo(() => (Array.isArray(activities) ? activities : []), [activities]);
  const safeTourPackages = useMemo(() => (Array.isArray(tourPackages) ? tourPackages : []), [tourPackages]);
  const safeCulinaryItems = useMemo(() => (Array.isArray(culinaryItems) ? culinaryItems : []), [culinaryItems]);
  const safeAuditLogs = useMemo(() => (Array.isArray(auditLogs) ? auditLogs : []), [auditLogs]);

  // Evaluasi peran akun
  const isSuperAdmin = useMemo(() => {
    const role = (currentUser?.role || '').toLowerCase();
    return (
      role === 'superadmin' ||
      role === 'super_admin' ||
      role === 'kwarnas' ||
      currentUser?.isSuperAdmin === true
    );
  }, [currentUser]);

  // Cakupan data anggota (Super admin membaca seluruh data nasional)
  const scopedMembers = useMemo(() => {
    if (isSuperAdmin) {
      return safeMembers;
    }

    if (currentUser?.kwarda && !currentUser?.kwarcab) {
      const userKwarda = currentUser.kwarda.toLowerCase();
      return safeMembers.filter((m) => {
        return m?.kwarda && m.kwarda.toLowerCase() === userKwarda;
      });
    }

    if (currentUser?.kwarcab) {
      const userKwarcab = currentUser.kwarcab.toLowerCase();
      return safeMembers.filter((m) => {
        return m?.kwarcab && m.kwarcab.toLowerCase() === userKwarcab;
      });
    }

    return safeMembers;
  }, [safeMembers, isSuperAdmin, currentUser]);

  // Statistik anggota
  const verifiedMembers = useMemo(() => {
    return (scopedMembers || []).filter((m) => {
      if (!m) return false;
      const status = (m.status || '').toLowerCase();
      const verificationStatus = (m.verificationStatus || '').toLowerCase();
      return (
        verificationStatus === 'verified' ||
        verificationStatus === 'terverifikasi' ||
        status === 'aktif' ||
        status === 'active'
      );
    });
  }, [scopedMembers]);

  const pendingMembers = useMemo(() => {
    return (scopedMembers || []).filter((m) => {
      if (!m) return false;
      const status = (m.status || '').toLowerCase();
      const verificationStatus = (m.verificationStatus || '').toLowerCase();
      return (
        verificationStatus === 'pending' ||
        verificationStatus === 'menunggu verifikasi' ||
        status === 'pending' ||
        status === 'menunggu verifikasi'
      );
    });
  }, [scopedMembers]);

  // Antrean verifikasi yang difilter oleh input pencarian
  const filteredPendingList = useMemo(() => {
    const query = (searchPending || '').trim().toLowerCase();
    return (pendingMembers || []).filter((m) => {
      if (!m) return false;
      const name = (m.name || m.fullName || '').toLowerCase();
      const nta = (m.ktaNumber || m.ktaId || '').toLowerCase();
      const kwarcab = (m.kwarcab || '').toLowerCase();
      const kwarda = m.kwarda || '';

      const matchesQuery = !query || name.includes(query) || nta.includes(query) || kwarcab.includes(query);
      const matchesKwarda = selectedKwardaFilter === 'ALL' || kwarda === selectedKwardaFilter;

      return matchesQuery && matchesKwarda;
    });
  }, [pendingMembers, searchPending, selectedKwardaFilter]);

  // Riwayat audit terkini
  const recentAuditLogs = useMemo(() => {
    return [...safeAuditLogs]
      .filter((log) => Boolean(log))
      .sort((a, b) => {
        const timeA = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [safeAuditLogs]);

  const handleNavigate = (view: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(view);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-4 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Banner Utama */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                {isSuperAdmin
                  ? 'SUPER ADMIN — TINGKAT NASIONAL'
                  : `ADMINISTRATOR — ${currentUser?.kwarcab || currentUser?.kwarda || 'REGIONAL'}`}
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
              Monitoring pendaftaran anggota Saka Pariwisata, verifikasi KTA digital, persebaran krida, dan agenda kegiatan nasional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('audit-logs')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition backdrop-blur-sm border border-white/10"
            >
              <FileText className="w-4 h-4" />
              Log Audit
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('members')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
            >
              <Users className="w-4 h-4" />
              Kelola Anggota
            </button>
          </div>
        </div>
      </div>

      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardWidget
          title="Total Anggota"
          value={scopedMembers.length.toLocaleString('id-ID')}
          subtitle={isSuperAdmin ? 'Cakupan Seluruh Indonesia' : 'Wilayah Terdaftar'}
          icon={<Users className="w-6 h-6 text-emerald-600" />}
          color="emerald"
          onClick={() => handleNavigate('members')}
        />
        <DashboardWidget
          title="Anggota Terverifikasi"
          value={verifiedMembers.length.toLocaleString('id-ID')}
          subtitle={`${scopedMembers.length > 0 ? Math.round((verifiedMembers.length / scopedMembers.length) * 100) : 0}% KTA Aktif`}
          icon={<UserCheck className="w-6 h-6 text-teal-600" />}
          color="teal"
          onClick={() => handleNavigate('members')}
        />
        <DashboardWidget
          title="Menunggu Verifikasi"
          value={pendingMembers.length.toLocaleString('id-ID')}
          subtitle="Menunggu Validasi Admin"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="amber"
          badge={pendingMembers.length > 0 ? `${pendingMembers.length} Antrean` : undefined}
          onClick={() => {
            const el = document.getElementById('pending-verification-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
        <DashboardWidget
          title="Kegiatan & Bhakti"
          value={safeActivities.length.toLocaleString('id-ID')}
          subtitle="Pelatihan & Agenda Saka"
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
          color="indigo"
          onClick={() => handleNavigate('activities')}
        />
      </div>

      {/* Tabel Antrean Verifikasi */}
      <div id="pending-verification-section" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-800">
                Antrean Verifikasi Anggota Baru
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Calon anggota yang telah mendaftar dan menunggu pengesahan KTA digital
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NTA, atau Kwarcab..."
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-52 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('members')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
                  <th className="py-3 px-4 rounded-l-xl">Nama & NTA</th>
                  <th className="py-3 px-4">Kwarda / Kwarcab</th>
                  <th className="py-3 px-4">Pilihan Krida</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPendingList.slice(0, 5).map((m, idx) => (
                  <tr key={m?.id || idx} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {m?.name || m?.fullName || 'Anggota Tanpa Nama'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {m?.ktaNumber || m?.ktaId || 'NTA Belum Diterbitkan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium text-slate-700">{m?.kwarcab || '—'}</div>
                      <div className="text-slate-400">{m?.kwarda || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                        {m?.krida || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {typeof onVerifyMember === 'function' && (
                          <button
                            type="button"
                            onClick={() => onVerifyMember(m.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verifikasi
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleNavigate('members')}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs transition"
                        >
                          Detail
                        </button>
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
                Seluruh data anggota telah terverifikasi dengan lengkap.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bagian Peta Nasional & Log Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Map className="w-4 h-4 text-emerald-600" />
                Persebaran Saka Pariwisata Nasional
              </h2>
              <p className="text-xs text-slate-400">
                Distribusi anggota berdasarkan wilayah Kwartir Daerah se-Indonesia
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('territory')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Detail Wilayah
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="min-h-[260px]">
            <NationalMapVisual members={safeMembers} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
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
              recentAuditLogs.map((log, idx) => (
                <div
                  key={log?.id || idx}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition flex items-start gap-3 border border-slate-100"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800 line-clamp-1">
                      {log?.action || 'Aktivitas Sistem'}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {log?.userName || log?.performedBy || 'Operator Sistem'}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {log?.timestamp ? new Date(log.timestamp).toLocaleString('id-ID') : '—'}
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
      </div>

      {/* Portal Krida Saka Pariwisata */}
      <div className="space-y-3">
        <CompactKridaPortal onSelectKrida={() => handleNavigate('krida')} />
      </div>

      {/* Galeri Showcase Potensi Wisata & Kuliner */}
      <div className="space-y-6">
        <IntegratedTourismShowcaseGallery />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <TourPackageCarouselSection packages={safeTourPackages} />
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <CulinarySouvenirGallerySection items={safeCulinaryItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
