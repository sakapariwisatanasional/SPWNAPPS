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
  BookOpen
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
  const isAdmin = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);
  const isMember = currentUser.role === 'MEMBER';

  const handleItemClick = (tab: string) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="w-72 sm:w-80 lg:w-64 h-full bg-slate-950 text-white flex flex-col flex-shrink-0 border-r border-slate-800 select-none shadow-2xl z-20 relative">
      {/* Subtle Purple Glow Overlay */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

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
            className="lg:hidden w-8 h-8 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
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
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'landing'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Home className={`w-4 h-4 ${currentTab === 'landing' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Halaman Utama (Landing)</span>
        </button>

        {/* Dashboard Menu Item - Adapted to Role */}
        {isAdmin && (
          <button
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="flex-1 truncate">
              {isSuperAdmin ? 'Dashboard Super Admin' : 
               currentUser.role === 'ADMIN_PROVINCE' ? 'Dashboard Kwarda' :
               currentUser.role === 'ADMIN_REGENCY' ? 'Dashboard Kwarcab' : 'Dashboard Kwarran'}
            </span>
            {currentTab === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
          </button>
        )}

        {/* Member Personal KTA */}
        {isMember && (
          <button
            onClick={() => handleItemClick('my-card')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
              currentTab === 'my-card'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
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
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
              currentTab === 'members'
                ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Users className={`w-4 h-4 ${currentTab === 'members' ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="flex-1">Manajemen Anggota</span>
          </button>
        )}

        {/* Tourism Directory */}
        <button
          onClick={() => handleItemClick('tours')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'tours'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Compass className={`w-4 h-4 ${currentTab === 'tours' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Paket Wisata</span>
        </button>

        {/* Kuliner & Cinderamata Daerah */}
        <button
          onClick={() => handleItemClick('culinary-souvenirs')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'culinary-souvenirs'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Utensils className={`w-4 h-4 ${currentTab === 'culinary-souvenirs' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Kuliner & Cinderamata</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md font-bold">4 Krida</span>
        </button>

        {/* Skills & Certification */}
        <button
          onClick={() => handleItemClick('skills')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'skills'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Award className={`w-4 h-4 ${currentTab === 'skills' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Direktori Keahlian</span>
        </button>

        {/* Modul SKK & Silabus 4 Krida */}
        <button
          onClick={() => handleItemClick('krida-modules')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'krida-modules'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-4 h-4 ${currentTab === 'krida-modules' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Modul & SKK 4 Krida</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md font-bold">23 SKK</span>
        </button>

        {/* Activities / Agenda */}
        <button
          onClick={() => handleItemClick('activities')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'activities'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <CalendarDays className={`w-4 h-4 ${currentTab === 'activities' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Agenda & Kegiatan</span>
        </button>

        {/* Public Portal (Wisata, Talenta, Verifikasi) */}
        <button
          onClick={() => handleItemClick('verify-portal')}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
            currentTab === 'verify-portal'
              ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Compass className={`w-4 h-4 ${currentTab === 'verify-portal' ? 'text-purple-400' : 'text-slate-400'}`} />
          <span className="flex-1">Portal Publik & Wisata</span>
        </button>

        {/* Administration Section (Only for Admins) */}
        {isAdmin && (
          <div className="pt-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1">
              {isSuperAdmin ? 'Administrasi Nasional' : 'Administrasi Wilayah'}
            </div>

            {/* Master Wilayah: Super Admin & Province Admins */}
            {(isSuperAdmin || currentUser.role === 'ADMIN_PROVINCE') && (
              <button
                onClick={() => handleItemClick('territories')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
                  currentTab === 'territories'
                    ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
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
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer ${
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
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70 border border-emerald-800/40 mt-1"
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
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all text-left cursor-pointer bg-purple-950/40 text-purple-300 hover:bg-purple-950/70 border border-purple-800/40 mt-1"
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Daftar Anggota Baru</span>
          </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800">
        <div className="bg-slate-800/70 rounded-xl p-3 flex items-center gap-3 border border-slate-700/60">
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in"
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

