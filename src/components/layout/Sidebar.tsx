import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Compass, 
  Award, 
  CalendarDays, 
  MapPin, 
  ShieldCheck, 
  History, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  CreditCard,
  Utensils,
  X,
  Home,
  FileSpreadsheet,
  FolderOpen,
  BookOpen,
  ShoppingBag
} from 'lucide-react';
import { CurrentUser } from '../../types';
import { SakaLogo } from '../common/SakaLogo';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: CurrentUser;
  onOpenRegisterModal: () => void;
  onOpenPublicPortal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSpreadsheetModal?: () => void;
  onOpenDriveModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenRegisterModal,
  onOpenPublicPortal,
  isOpenMobile = false,
  onCloseMobile,
  onOpenSpreadsheetModal,
  onOpenDriveModal
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN_NATIONAL', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);
  const isMember = currentUser.role === 'MEMBER';

  const handleItemClick = (tab: string) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="app-sidebar w-72 sm:w-80 lg:w-64 h-full bg-slate-950 text-white flex flex-col flex-shrink-0 border-r border-slate-800/80 select-none shadow-2xl z-20 relative">
      {/* Subtle Purple Glow Overlay */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-purple-900/25 via-fuchsia-900/10 to-transparent pointer-events-none" />

      {/* Brand Header with SakaLogo & Mobile Close Button */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SakaLogo size={40} id="sidebar-saka-logo" />
          <div className="leading-none">
            <h1 className="font-extrabold text-sm tracking-wide uppercase font-heading text-white">
              Saka <span className="text-purple-400">Pariwisata</span>
            </h1>
            <p className="text-[10px] text-purple-200/60 uppercase tracking-widest font-medium mt-1">
              Kwartir Nasional
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-10 h-10 rounded-2xl bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center border border-slate-800 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:ring-offset-2 focus:ring-offset-slate-950"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
        {/* Main Section */}
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1 flex items-center justify-between">
          <span>Menu Utama</span>
          <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded font-mono">
            {currentUser.role.replace('_', ' ')}
          </span>
        </div>

        {/* Landing Page */}
        <button
          onClick={() => handleItemClick('landing')}
          aria-current={currentTab === 'landing' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'landing'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <Home className={`w-4 h-4 ${currentTab === 'landing' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Halaman Utama (Landing)</span>
        </button>

        {/* Dashboard Menu Item - Adapted to Role */}
        {isAdmin && (
          <button
            onClick={() => handleItemClick('dashboard')}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              currentTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="flex-1 truncate">
              {isSuperAdmin ? 'Dashboard Super Admin' : 
               currentUser.role === 'ADMIN_NATIONAL' ? 'Dashboard Admin Nasional' :
               currentUser.role === 'ADMIN_PROVINCE' ? 'Dashboard Kwarda' :
               currentUser.role === 'ADMIN_REGENCY' ? 'Dashboard Kwarcab' : 'Dashboard Kecamatan'}
            </span>
            {currentTab === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
          </button>
        )}

        {/* Member Personal KTA */}
        {isMember && (
          <button
            onClick={() => handleItemClick('my-card')}
            aria-current={currentTab === 'my-card' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              currentTab === 'my-card'
                ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${currentTab === 'my-card' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="flex-1">Kartu Anggota (KTA)</span>
            {currentTab === 'my-card' && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
          </button>
        )}

        {/* Member Management (Admin & Operator Only) */}
        {isAdmin && (
          <button
            onClick={() => handleItemClick('members')}
            aria-current={currentTab === 'members' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
              currentTab === 'members'
                ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
            }`}
          >
            <Users className={`w-4 h-4 ${currentTab === 'members' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="flex-1">Manajemen Anggota</span>
          </button>
        )}

        {/* Tourism Directory */}
        <button
          onClick={() => handleItemClick('tours')}
          aria-current={currentTab === 'tours' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'tours'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <Compass className={`w-4 h-4 ${currentTab === 'tours' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Paket Wisata</span>
        </button>

        {/* Kuliner & Cinderamata Daerah */}
        <button
          onClick={() => handleItemClick('culinary-souvenirs')}
          aria-current={currentTab === 'culinary-souvenirs' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'culinary-souvenirs'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <Utensils className={`w-4 h-4 ${currentTab === 'culinary-souvenirs' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Kuliner & Cinderamata</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-bold">4 Krida</span>
        </button>

        {/* Official Store */}
        <button
          onClick={() => handleItemClick('official-store')}
          aria-current={currentTab === 'official-store' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'official-store'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <ShoppingBag className={`w-4 h-4 ${currentTab === 'official-store' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Official Merchandise</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-bold">Soon</span>
        </button>

        {/* Skills & Certification */}
        <button
          onClick={() => handleItemClick('skills')}
          aria-current={currentTab === 'skills' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'skills'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <Award className={`w-4 h-4 ${currentTab === 'skills' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Direktori Keahlian</span>
        </button>

        {/* Modul SKK & Silabus 4 Krida */}
        <button
          onClick={() => handleItemClick('krida-modules')}
          aria-current={currentTab === 'krida-modules' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'krida-modules'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${currentTab === 'krida-modules' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Modul & SKK 4 Krida</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-bold">23 SKK</span>
        </button>

        {/* Activities / Agenda */}
        <button
          onClick={() => handleItemClick('activities')}
          aria-current={currentTab === 'activities' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'activities'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <CalendarDays className={`w-4 h-4 ${currentTab === 'activities' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Agenda & Kegiatan</span>
        </button>

        {/* Public Portal (Wisata, Talenta, Verifikasi) */}
        <button
          onClick={() => handleItemClick('verify-portal')}
          aria-current={currentTab === 'verify-portal' ? 'page' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            currentTab === 'verify-portal'
              ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
              : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
          }`}
        >
          <Compass className={`w-4 h-4 ${currentTab === 'verify-portal' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Portal Publik & Wisata</span>
        </button>

        {/* Administration Section (Only for Admins) */}
        {isAdmin && (
          <div className="pt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">
              {isSuperAdmin || currentUser.role === 'ADMIN_NATIONAL' ? 'Administrasi Nasional' : 'Administrasi Wilayah'}
            </div>

            {/* Master Wilayah: Super Admin & Province Admins */}
            {(isSuperAdmin || currentUser.role === 'ADMIN_NATIONAL' || currentUser.role === 'ADMIN_PROVINCE') && (
              <button
                onClick={() => handleItemClick('territories')}
                aria-current={currentTab === 'territories' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  currentTab === 'territories'
                    ? 'bg-gradient-to-r from-purple-600/20 via-fuchsia-600/15 to-transparent text-purple-200 font-semibold border border-purple-400/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-100 hover:border-slate-800'
                }`}
              >
                <MapPin className={`w-4 h-4 ${currentTab === 'territories' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span className="flex-1">Master Wilayah</span>
              </button>
            )}

            {/* Audit Trail & Log: SUPER ADMIN ONLY */}
            {isSuperAdmin && (
              <button
                onClick={() => handleItemClick('audit-logs')}
                aria-current={currentTab === 'audit-logs' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  currentTab === 'audit-logs'
                    ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <History className={`w-4 h-4 ${currentTab === 'audit-logs' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="flex-1">Audit Trail & Log</span>
              </button>
            )}

            {/* Google Spreadsheet & Google Drive: SUPER ADMIN KWARTIR NASIONAL ONLY */}
            {isSuperAdmin && onOpenSpreadsheetModal && (
              <button
                onClick={() => {
                  onOpenSpreadsheetModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 border border-emerald-800/40 mt-1"
                title="Akses Database Google Spreadsheet (Super Admin Kwarnas)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="flex-1">Database Spreadsheet</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-emerald-900 text-emerald-200 rounded font-mono">Kwarnas</span>
              </button>
            )}

            {isSuperAdmin && onOpenDriveModal && (
              <button
                onClick={() => {
                  onOpenDriveModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3.5 rounded-2xl font-medium text-sm transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-purple-950/40 text-purple-300 hover:bg-purple-950/70 border border-purple-800/40 mt-1"
                title="Akses Media Google Drive Repository (Super Admin Kwarnas)"
              >
                <FolderOpen className="w-4 h-4 text-purple-400" />
                <span className="flex-1">Media Google Drive</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-900 text-purple-200 rounded font-mono">Cloud</span>
              </button>
            )}
          </div>
        )}

        {/* Quick Action Button */}
        <div className="pt-4 px-1 pb-6">
          <button
            onClick={() => {
              onOpenRegisterModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs min-h-11 py-3 px-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-950/60 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>Daftar Anggota Baru</span>
          </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/50 rounded-2xl p-3 flex items-center gap-3 border border-slate-700/70 shadow-sm">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-9 h-9 rounded-lg object-cover border border-slate-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-400 font-medium truncate">
              {currentUser.jurisdictionName || 'Nasional'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex h-full flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
          />

          {/* Drawer Slide-in */}
          <div className="relative z-10 flex h-full max-w-xs w-full animate-in slide-in-from-left duration-200 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
