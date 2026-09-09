import React, { useState } from 'react';
import { 
  Users, 
  Compass, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  UserPlus, 
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  FolderOpen,
  Sliders
} from 'lucide-react';
import { Member, TourPackage, CurrentUser, Province, CulinarySouvenirItem } from '../types';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';
import { NationalMapVisual } from '../components/dashboard/NationalMapVisual';
import { CulinarySouvenirGallerySection } from '../components/dashboard/CulinarySouvenirGallerySection';
import { IntegratedTourismShowcaseGallery } from '../components/dashboard/IntegratedTourismShowcaseGallery';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { SakaLogo } from '../components/common/SakaLogo';
import { storage } from '../services/storage';
import { DEFAULT_PUBLIC_USER } from '../data/initialData';

interface DashboardViewProps {
  currentUser: CurrentUser;
  members: Member[];
  tours: TourPackage[];
  provinces: Province[];
  culinaryItems?: CulinarySouvenirItem[];
  onSelectTab: (tab: string) => void;
  onOpenRegisterModal: () => void;
  onVerifyMember: (member: Member) => void;
  onApproveMemberQuick: (memberId: string) => void;
  onViewTourDetail: (tour: TourPackage) => void;
  onOpenEditCardModal?: () => void;
  onOpenEditPhotoModal?: (member: Member) => void;
  onOpenEditMemberModal?: (member: Member) => void;
  onOpenPrintPdfModal?: (member: Member) => void;
  onOpenCulinaryFormModal?: (item?: CulinarySouvenirItem) => void;
  onSelectCulinaryDetail?: (item: CulinarySouvenirItem) => void;
  onOpenSpreadsheetModal?: () => void;
  onOpenDriveModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  members = [],
  tours = [],
  provinces = [],
  culinaryItems,
  onSelectTab,
  onOpenRegisterModal,
  onVerifyMember,
  onApproveMemberQuick,
  onViewTourDetail,
  onOpenEditCardModal,
  onOpenEditPhotoModal,
  onOpenEditMemberModal,
  onOpenPrintPdfModal,
  onOpenCulinaryFormModal,
  onSelectCulinaryDetail,
  onOpenSpreadsheetModal,
  onOpenDriveModal
}) => {
  const safeCurrentUser: CurrentUser = (currentUser && currentUser.role) 
    ? currentUser 
    : DEFAULT_PUBLIC_USER;

  // Dashboard harus tahan terhadap state null/undefined saat live-sync berjalan.
  const safeMembers = Array.isArray(members) ? members : [];
  const safeTours = Array.isArray(tours) ? tours : [];
  const safeProvinces = Array.isArray(provinces) ? provinces : [];
  const safeCulinaryItems = Array.isArray(culinaryItems) ? culinaryItems : [];

  const isPublic = safeCurrentUser.role === 'PUBLIC';
  const isSuperAdmin = safeCurrentUser.role === 'SUPER_ADMIN';
  const isOperator = safeCurrentUser.role === 'ADMIN_PROVINCE' || safeCurrentUser.role === 'ADMIN_REGENCY' || safeCurrentUser.role === 'ADMIN_BRANCH';
  const isAdmin = isSuperAdmin || isOperator;

  const ktaSettings = storage.getKtaSettings();
  const currentOpacityPct = Math.round((ktaSettings?.bgOpacity ?? 0.10) * 100);
  const liveCulinaryItems = safeCulinaryItems.length > 0 ? safeCulinaryItems : storage.getCulinarySouvenirs();
  const normalizedCulinaryItems = Array.isArray(liveCulinaryItems) ? liveCulinaryItems : [];

  const scopedMembers = isSuperAdmin 
    ? safeMembers
    : safeCurrentUser.role === 'ADMIN_PROVINCE' 
      ? safeMembers.filter(m => m.provinceId === safeCurrentUser.jurisdictionId)
      : safeCurrentUser.role === 'ADMIN_REGENCY' 
        ? safeMembers.filter(m => m.regencyId === safeCurrentUser.jurisdictionId)
        : safeCurrentUser.role === 'ADMIN_BRANCH' 
          ? safeMembers.filter(m => m.branchId === safeCurrentUser.jurisdictionId)
          : [];

  const scopedTours = isSuperAdmin
    ? safeTours
    : safeCurrentUser.role === 'ADMIN_PROVINCE'
      ? safeTours.filter(t => t.provinceId === safeCurrentUser.jurisdictionId)
      : safeCurrentUser.role === 'ADMIN_REGENCY'
        ? safeTours.filter(t => t.regencyId === safeCurrentUser.jurisdictionId)
        : safeTours;

  const activeMembersCount = isSuperAdmin 
    ? safeMembers.filter(m => m?.status === 'ACTIVE').length 
    : scopedMembers.filter(m => m?.status === 'ACTIVE').length;

  const pendingMembers = isSuperAdmin 
    ? safeMembers.filter(m => m?.status === 'PENDING') 
    : scopedMembers.filter(m => m?.status === 'PENDING');

  const publishedTours = isSuperAdmin 
    ? safeTours.filter(t => t?.status === 'APPROVED_PUBLISHED' || (t as any)?.status === 'PUBLISHED') 
    : scopedTours.filter(t => t?.status === 'APPROVED_PUBLISHED' || (t as any)?.status === 'PUBLISHED');

  const activeMemberForCard = 
    scopedMembers.find(m => m.id === safeCurrentUser.memberId) ||
    scopedMembers.find(m => m.status === 'ACTIVE') || 
    safeMembers.find(m => m.status === 'ACTIVE') || 
    safeMembers[0];

  // 1. TAMPILAN DASHBOARD PUBLIK
  if (isPublic) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-16">
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white shadow-xl border border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center gap-4 z-10 max-w-2xl">
            <SakaLogo size={60} id="public-dashboard-logo" className="hidden sm:inline-flex flex-shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-purple-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Portal Eksplorasi Saka Pariwisata Indonesia</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Jelajahi Pesona Nusantara Bersama Saka Pariwisata
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 z-10">
            <button
              onClick={onOpenRegisterModal}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Anggota Baru</span>
            </button>
          </div>
        </div>

        <IntegratedTourismShowcaseGallery
          tours={safeTours}
          products={normalizedCulinaryItems}
          members={safeMembers}
          currentUser={safeCurrentUser}
          onViewTourDetail={onViewTourDetail}
          onSelectCulinaryDetail={onSelectCulinaryDetail}
          onSelectTab={onSelectTab}
        />

        <NationalMapVisual
          provinces={safeProvinces}
          members={safeMembers}
          onSelectProvince={() => onSelectTab('members')}
        />
      </div>
    );
  }

  // 2. TAMPILAN DASHBOARD ADMIN & SUPER ADMIN (RESPONSIF & FLEKSIBEL)
  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? 'Kwartir Nasional Super Admin' : isOperator ? safeCurrentUser.jurisdictionName : 'Dashboard Anggota'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {safeCurrentUser.fullName || safeCurrentUser.name || 'Kader Saka'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sistem Informasi Registrasi & Manajemen Saka Pariwisata Nasional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 w-full sm:w-auto">
          {isSuperAdmin && onOpenSpreadsheetModal && (
            <button
              onClick={onOpenSpreadsheetModal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Database Spreadsheet</span>
            </button>
          )}
          {isSuperAdmin && onOpenDriveModal && (
            <button
              onClick={onOpenDriveModal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <FolderOpen className="w-4 h-4 text-purple-300" />
              <span>Media Drive</span>
            </button>
          )}
          {isSuperAdmin && onOpenEditCardModal && (
            <button
              onClick={onOpenEditCardModal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Desain KTA ({currentOpacityPct}%)</span>
            </button>
          )}
          <button
            onClick={onOpenRegisterModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pendaftaran Baru</span>
          </button>
        </div>
      </div>

      {/* 4 KARTU STATISTIK RINGKAS (FLEKSIBEL: 1 Kolom di HP Kecil, 2 di Tablet, 4 di Laptop/PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Kartu 1: Anggota Aktif */}
        <div 
          onClick={() => onSelectTab('members')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isSuperAdmin ? 'Total Anggota' : 'Anggota Wilayah'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {activeMembersCount.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Aktif
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Kader Terverifikasi Resmi</p>
        </div>

        {/* Kartu 2: Menunggu Validasi */}
        <div 
          onClick={() => onSelectTab('members')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Validasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingMembers.length.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
              Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Perlu Tindakan Persetujuan</p>
        </div>

        {/* Kartu 3: Paket Wisata */}
        <div 
          onClick={() => onSelectTab('tours')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paket Wisata</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {publishedTours.length.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-teal-600">Terbit</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Destinasi & Edukasi Saka</p>
        </div>

        {/* Kartu 4: Produk & Kuliner */}
        <div 
          onClick={() => onSelectTab('culinary-souvenirs')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produk & Kuliner</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {normalizedCulinaryItems.length.toLocaleString('id-ID')}
            </span>
            <span className="text-xs font-bold text-purple-600">UMKM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Karya Krida Kader Saka</p>
        </div>
      </div>

      {/* SATU PANEL PENUH: Visualisasi Pertumbuhan Anggota Dinamis (Tidak lagi bertumpuk atau terhimpit) */}
      <div className="w-full overflow-hidden">
        <DashboardWidget 
          members={scopedMembers}
          title={isSuperAdmin ? "Visualisasi Pertumbuhan Anggota Nasional" : `Statistik Anggota Wilayah ${safeCurrentUser.jurisdictionName}`}
          subtitle="Analisis dinamika registrasi, kader aktif terverifikasi, dan tren penambahan berkala"
        />
      </div>

      {/* Grid: Antrean Pendaftaran & Preview KTA Digital */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Antrean Pendaftaran */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Pendaftaran Anggota Terbaru {isOperator && `(${safeCurrentUser.jurisdictionName})`}
              </h3>
              <p className="text-xs text-slate-500">Daftar calon anggota yang masuk dan menunggu verifikasi</p>
            </div>
            <button
              onClick={() => onSelectTab('members')}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingMembers.slice(0, 5).map(m => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={m.avatarUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200" />
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-900 truncate">{m.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{m.krida} • {m.regencyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => onApproveMemberQuick(m.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex-shrink-0 cursor-pointer transition-colors"
                >
                  Setujui
                </button>
              </div>
            ))}
            {pendingMembers.length === 0 && (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs">Semua calon anggota telah diverifikasi.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Preview KTA Digital */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Preview KTA Digital Resmi</h3>
            {isSuperAdmin && onOpenEditCardModal && (
              <button
                onClick={onOpenEditCardModal}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Ubah Desain</span>
              </button>
            )}
          </div>

          {activeMemberForCard ? (
            <div className="flex justify-center overflow-x-auto py-2">
              <DigitalMemberCard
                member={activeMemberForCard}
                onPrint={() => onOpenPrintPdfModal && onOpenPrintPdfModal(activeMemberForCard)}
                onEditPhoto={() => onOpenEditPhotoModal && onOpenEditPhotoModal(activeMemberForCard)}
              />
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">Belum ada anggota terdaftar untuk dipratinjau.</p>
          )}
        </div>
      </div>

      {/* Galeri Terpadu */}
      <IntegratedTourismShowcaseGallery
        tours={safeTours}
        products={normalizedCulinaryItems}
        members={safeMembers}
        currentUser={safeCurrentUser}
        onViewTourDetail={onViewTourDetail}
        onSelectCulinaryDetail={onSelectCulinaryDetail}
        onSelectTab={onSelectTab}
      />

      {/* Peta Wilayah */}
      <NationalMapVisual
        provinces={safeProvinces}
        members={safeMembers}
        onSelectProvince={() => onSelectTab('members')}
      />
    </div>
  );
};
