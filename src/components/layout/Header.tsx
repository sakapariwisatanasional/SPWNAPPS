import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  UserCheck, 
  Globe2, 
  CheckCircle2, 
  RotateCcw, 
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  MapPin,
  ExternalLink,
  Menu,
  X,
  FileSpreadsheet,
  FolderOpen,
  Home,
  Lock,
  CloudCheck,
  RefreshCw,
  Check
} from 'lucide-react';
import { CurrentUser, NotificationItem } from '../../types';
import { DEMO_USERS } from '../../data/initialData';
import { storage } from '../../services/storage';
import { spreadsheetService } from '../../services/spreadsheetService';
import { SakaLogo } from '../common/SakaLogo';

interface HeaderProps {
  currentUser: CurrentUser;
  onSwitchUser: (user: CurrentUser) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenRegisterModal: () => void;
  onSelectTab: (tab: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenSpreadsheetModal?: () => void;
  onOpenDriveModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  searchQuery,
  onSearchChange,
  onOpenRegisterModal,
  onSelectTab,
  onToggleMobileMenu,
  onOpenSpreadsheetModal,
  onOpenDriveModal,
  onOpenLoginModal
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [availableUsers, setAvailableUsers] = useState<CurrentUser[]>([]);
  const [syncState, setSyncState] = useState(spreadsheetService.getSyncState());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isManualSyncing) return;
    setIsManualSyncing(true);
    try {
      await spreadsheetService.syncFromSpreadsheet(false);
    } catch (err) {
      console.warn('Manual sync failed:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  useEffect(() => {
    const update = () => {
      setNotifications(storage.getNotifications());
      setAvailableUsers(storage.getUsers());
    };
    update();
    const unsubStorage = storage.subscribe(update);
    const unsubSync = spreadsheetService.subscribeSyncState(() => {
      setSyncState(spreadsheetService.getSyncState());
    });

    return () => {
      unsubStorage();
      unsubSync();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string, actionUrl?: string) => {
    storage.markNotificationAsRead(id);
    if (actionUrl) {
      if (actionUrl.includes('members')) onSelectTab('members');
      else if (actionUrl.includes('tours')) onSelectTab('tours');
      else if (actionUrl.includes('activities')) onSelectTab('activities');
      else if (actionUrl.includes('my-card')) onSelectTab('my-card');
      setShowNotifMenu(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20 shadow-xs">
      
      {/* Left Area: Mobile Hamburger + Logo / Desktop Search */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80 flex-shrink-0"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Mobile Brand Identity */}
        <div className="flex lg:hidden items-center gap-2 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <SakaLogo size={28} />
          <div className="leading-tight">
            <span className="font-extrabold text-xs font-heading text-slate-900 tracking-tight block">
              Saka <span className="text-purple-700">Pariwisata</span>
            </span>
            <span className="text-[9px] text-slate-500 font-medium tracking-wider block">
              Kwarnas
            </span>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-100/90 hover:bg-slate-100 px-3.5 py-2 rounded-xl w-full max-w-md border border-slate-200/80 transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:bg-white">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari anggota, paket wisata, kuliner, agenda..."
            className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        
        {/* Live Auto-Refresh & Real-Time Sync Cloud Status Indicator */}
        <div 
          onClick={isSuperAdmin && onOpenSpreadsheetModal ? onOpenSpreadsheetModal : handleManualRefresh}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none shadow-2xs ${
            syncState.isSaving 
              ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse' 
              : isManualSyncing
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-emerald-50/90 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100 hover:border-emerald-300'
          }`}
          title={
            syncState.isSaving 
              ? syncState.lastSavedAction || 'Menyimpan otomatis perubahan ke Google Spreadsheet & Google Drive...' 
              : `Auto-Refresh Real-Time Aktif (Cek otomatis tiap ${syncState.pollingIntervalSeconds || 6} detik). Terakhir dicek: ${syncState.lastLiveCheck || syncState.lastSavedTime || 'Baru saja'}. Klik untuk menyegarkan data.`
          }
        >
          {syncState.isSaving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin flex-shrink-0" />
              <span className="text-[11px] font-bold hidden sm:inline">Menyimpan...</span>
            </>
          ) : isManualSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin flex-shrink-0" />
              <span className="text-[11px] font-bold hidden sm:inline">Menyinkronkan...</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold hidden sm:inline">
                {syncState.lastLiveCheck ? `Live ${syncState.lastLiveCheck.split(' ')[0]}` : 'Live Sync'}
              </span>
              <button
                type="button"
                onClick={handleManualRefresh}
                className={`p-0.5 hover:bg-emerald-200/70 rounded-md transition-all text-emerald-700 hover:text-emerald-900 ${isManualSyncing ? 'animate-spin' : ''}`}
                title="Segarkan data dari Google Spreadsheet & Drive sekarang"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Tombol Landing Page */}
        <button
          onClick={() => onSelectTab('landing')}
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
          title="Buka Halaman Utama / Landing Page"
        >
          <Home className="w-3.5 h-3.5 text-slate-500" />
          <span>Landing Page</span>
        </button>

        {/* Tombol Google Spreadsheet (HANYA SUPER ADMIN KWARTIR NASIONAL) */}
        {isSuperAdmin && onOpenSpreadsheetModal && (
          <button
            onClick={onOpenSpreadsheetModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Database Google Spreadsheet Terhubung (Super Admin)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline">Google Spreadsheet</span>
            <span className="xl:hidden">Database</span>
          </button>
        )}

        {/* Tombol Google Drive Repository (HANYA SUPER ADMIN KWARTIR NASIONAL) */}
        {isSuperAdmin && onOpenDriveModal && (
          <button
            onClick={onOpenDriveModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Google Drive Repository Aset & Gambar (Super Admin)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden xl:inline">Google Drive</span>
            <span className="xl:hidden">Drive</span>
          </button>
        )}

        {/* Mobile Search Toggle Button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          aria-label="Cari"
        >
          {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        {/* Role Persona Switcher (RBAC) */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-900 border border-purple-200/70 text-xs font-semibold transition-all cursor-pointer shadow-xs min-h-[40px]"
            title="Ganti Peran Akun untuk Menguji Multi-Role"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span className="hidden md:inline text-purple-600">Peran:</span>
            <span className="font-bold text-purple-950 truncate max-w-[85px] sm:max-w-[120px]">
              {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' :
               currentUser.role === 'ADMIN_PROVINCE' ? 'Kwarda' :
               currentUser.role === 'ADMIN_REGENCY' ? 'Kwarcab' :
               currentUser.role === 'ADMIN_BRANCH' ? 'Kwarran' :
               currentUser.role === 'MEMBER' ? 'Anggota' : 'Publik'}
            </span>
            <ChevronDown className="w-3 h-3 text-purple-600 flex-shrink-0" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Ubah Peran Pengguna (Demo RBAC)</p>
                <p className="text-[11px] text-slate-500">Pilih salah satu tingkat wewenang untuk simulasi:</p>
              </div>
              <div className="py-1 space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                {(availableUsers.length > 0 ? availableUsers : DEMO_USERS).map((user) => {
                  const isSelected = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-50 text-purple-950 border border-purple-200' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img 
                        src={user.avatarUrl} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          {user.jurisdictionName}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-100 px-2 pb-1">
                <button
                  onClick={() => {
                    if (confirm('Kembalikan semua data simulasi ke awal?')) {
                      storage.resetToDefault();
                      setShowRoleMenu(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-red-600 py-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Data Demo ke Default</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <h4 className="text-xs font-bold text-slate-900">Notifikasi Sistem</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} Baru
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Tidak ada notifikasi saat ini.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id, n.actionUrl)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.isRead 
                          ? 'bg-slate-50/70 border-slate-100 text-slate-500' 
                          : 'bg-emerald-50/50 border-emerald-100 text-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Divider & Jurisdiction */}
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Wilayah</p>
          <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">
            {currentUser.jurisdictionName || 'Nasional (RI)'}
          </p>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-3 shadow-md z-30 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari anggota, wisata, kuliner..."
              className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
