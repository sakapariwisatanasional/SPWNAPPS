import React from 'react';
import {
  LayoutDashboard,
  Users,
  Compass,
  Award,
  CalendarDays,
  MapPin,
  History,
  Sparkles,
  CreditCard,
  Utensils,
  X,
  Home,
  FileSpreadsheet,
  FolderOpen,
  BookOpen,
  ShoppingBag,
  Globe2,
  type LucideIcon,
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

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  currentTab: string;
  onClick: () => void;
  badge?: string;
  badgeTone?: 'purple' | 'amber' | 'emerald' | 'slate';
  disabled?: boolean;
}

const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN_NATIONAL',
  'ADMIN_PROVINCE',
  'ADMIN_REGENCY',
  'ADMIN_BRANCH',
] as const;

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'SUPER ADMIN',
  ADMIN_NATIONAL: 'ADMIN NASIONAL',
  ADMIN_PROVINCE: 'ADMIN PROVINSI',
  ADMIN_REGENCY: 'ADMIN KABUPATEN',
  ADMIN_BRANCH: 'ADMIN KECAMATAN',
  MEMBER: 'ANGGOTA',
};

const BADGE_TONE_CLASSES: Record<
  NonNullable<SidebarItemProps['badgeTone']>,
  string
> = {
  purple:
    'bg-purple-500/10 text-purple-300 border border-purple-400/15',
  amber:
    'bg-amber-500/10 text-amber-300 border border-amber-400/15',
  emerald:
    'bg-emerald-500/10 text-emerald-300 border border-emerald-400/15',
  slate:
    'bg-slate-800/80 text-slate-300 border border-slate-700/70',
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  id,
  label,
  icon: Icon,
  currentTab,
  onClick,
  badge,
  badgeTone = 'slate',
  disabled = false,
}) => {
  const isActive = currentTab === id;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'group relative w-full min-h-10 flex items-center gap-3',
        'px-3 py-2.5 rounded-xl',
        'text-left text-sm font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-purple-400/70',
        'focus-visible:ring-offset-2',
        'focus-visible:ring-offset-slate-950',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-purple-500/10 text-white'
          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100',
      ].join(' ')}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-purple-400"
        />
      )}

      <Icon
        aria-hidden="true"
        className={[
          'w-[18px] h-[18px] shrink-0 transition-colors',
          isActive
            ? 'text-purple-400'
            : 'text-slate-500 group-hover:text-slate-300',
        ].join(' ')}
      />

      <span className="flex-1 min-w-0 truncate">{label}</span>

      {badge && (
        <span
          className={[
            'shrink-0 inline-flex items-center',
            'px-1.5 py-0.5 rounded-md',
            'text-[9px] leading-none font-semibold',
            'tracking-wide',
            BADGE_TONE_CLASSES[badgeTone],
          ].join(' ')}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

interface SidebarSectionLabelProps {
  children: React.ReactNode;
}

const SidebarSectionLabel: React.FC<SidebarSectionLabelProps> = ({
  children,
}) => {
  return (
    <div className="px-3 pt-4 pb-1.5 first:pt-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {children}
      </p>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenRegisterModal,
  onOpenPublicPortal,
  isOpenMobile = false,
  onCloseMobile,
  onOpenSpreadsheetModal,
  onOpenDriveModal,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const isAdmin = ADMIN_ROLES.includes(
    currentUser.role as (typeof ADMIN_ROLES)[number],
  );

  const isMember = currentUser.role === 'MEMBER';

  const roleLabel =
    ROLE_LABELS[currentUser.role] ||
    currentUser.role.replace(/_/g, ' ');

  const handleItemClick = (tab: string) => {
    onSelectTab(tab);
    onCloseMobile?.();
  };

  const handleActionClick = (action: () => void) => {
    action();
    onCloseMobile?.();
  };

  const dashboardLabel = isSuperAdmin
    ? 'Dashboard Super Admin'
    : currentUser.role === 'ADMIN_NATIONAL'
      ? 'Dashboard Admin Nasional'
      : currentUser.role === 'ADMIN_PROVINCE'
        ? 'Dashboard Kwarda'
        : currentUser.role === 'ADMIN_REGENCY'
          ? 'Dashboard Kwarcab'
          : 'Dashboard Kecamatan';

  const administrationLabel =
    isSuperAdmin || currentUser.role === 'ADMIN_NATIONAL'
      ? 'Administrasi Nasional'
      : 'Administrasi Wilayah';

  const content = (
    <div
      className={[
        'app-sidebar relative z-20 flex h-full w-72 sm:w-80 lg:w-64',
        'flex-shrink-0 flex-col',
        'bg-slate-950 text-white',
        'border-r border-slate-800/80',
        'shadow-2xl',
        'select-none',
      ].join(' ')}
    >
      {/* =========================================================
          BACKGROUND DECORATION
          ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-purple-950/30 via-purple-950/10 to-transparent"
      />

      {/* =========================================================
          BRAND HEADER
          ========================================================= */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-800/80 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <SakaLogo
            size={40}
            id="sidebar-saka-logo"
          />

          <div className="min-w-0 leading-none">
            <h1 className="truncate font-heading text-sm font-extrabold uppercase tracking-wide text-white">
              Saka{' '}
              <span className="text-purple-400">
                Pariwisata
              </span>
            </h1>

            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Kwartir Nasional
            </p>
          </div>
        </div>

        {/* Mobile close */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu navigasi"
            className={[
              'lg:hidden flex h-9 w-9 shrink-0 items-center justify-center',
              'rounded-xl border border-slate-800',
              'bg-slate-900/80 text-slate-400',
              'transition-colors',
              'hover:bg-slate-800 hover:text-white',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-purple-400/70',
              'focus-visible:ring-offset-2',
              'focus-visible:ring-offset-slate-950',
            ].join(' ')}
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        )}
      </header>

      {/* =========================================================
          NAVIGATION
          ========================================================= */}
      <nav
        aria-label="Navigasi utama"
        className="relative z-10 flex-1 overflow-y-auto px-2.5 pb-5 custom-scrollbar"
      >
        {/* -------------------------------------------------------
            CONTEXT / ROLE
            ------------------------------------------------------- */}
        <div className="mx-1 mb-1 flex items-center justify-between gap-2 border-b border-slate-800/70 px-2 pb-3 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Navigasi
          </span>

          <span
            title={`Peran: ${roleLabel}`}
            className="max-w-[120px] truncate rounded-md border border-slate-800 bg-slate-900/70 px-2 py-1 font-mono text-[8px] font-medium uppercase tracking-wide text-slate-500"
          >
            {roleLabel}
          </span>
        </div>

        {/* =======================================================
            UTAMA
            ======================================================= */}
        <SidebarSectionLabel>
          Utama
        </SidebarSectionLabel>

        <SidebarItem
          id="landing"
          label="Beranda"
          icon={Home}
          currentTab={currentTab}
          onClick={() => handleItemClick('landing')}
        />

        {isAdmin && (
          <SidebarItem
            id="dashboard"
            label={dashboardLabel}
            icon={LayoutDashboard}
            currentTab={currentTab}
            onClick={() => handleItemClick('dashboard')}
          />
        )}

        {isMember && (
          <SidebarItem
            id="my-card"
            label="Kartu Anggota"
            icon={CreditCard}
            currentTab={currentTab}
            onClick={() => handleItemClick('my-card')}
          />
        )}

        {isAdmin && (
          <SidebarItem
            id="members"
            label="Manajemen Anggota"
            icon={Users}
            currentTab={currentTab}
            onClick={() => handleItemClick('members')}
          />
        )}

        {/* =======================================================
            EKSPLORASI
            ======================================================= */}
        <SidebarSectionLabel>
          Eksplorasi
        </SidebarSectionLabel>

        <SidebarItem
          id="tours"
          label="Paket Wisata"
          icon={Compass}
          currentTab={currentTab}
          onClick={() => handleItemClick('tours')}
        />

        <SidebarItem
          id="culinary-souvenirs"
          label="Kuliner & Cinderamata"
          icon={Utensils}
          currentTab={currentTab}
          badge="4 Krida"
          badgeTone="amber"
          onClick={() => handleItemClick('culinary-souvenirs')}
        />

        <SidebarItem
          id="skills"
          label="Direktori Keahlian"
          icon={Award}
          currentTab={currentTab}
          onClick={() => handleItemClick('skills')}
        />

        <SidebarItem
          id="activities"
          label="Agenda & Kegiatan"
          icon={CalendarDays}
          currentTab={currentTab}
          onClick={() => handleItemClick('activities')}
        />

        {/* =======================================================
            PEMBELAJARAN
            ======================================================= */}
        <SidebarSectionLabel>
          Pembelajaran
        </SidebarSectionLabel>

        <SidebarItem
          id="krida-modules"
          label="Modul & SKK"
          icon={BookOpen}
          currentTab={currentTab}
          badge="23 SKK"
          badgeTone="purple"
          onClick={() => handleItemClick('krida-modules')}
        />

        {/* =======================================================
            PORTAL
            ======================================================= */}
        <SidebarSectionLabel>
          Portal
        </SidebarSectionLabel>

        <SidebarItem
          id="verify-portal"
          label="Portal Publik"
          icon={Globe2}
          currentTab={currentTab}
          onClick={() => handleItemClick('verify-portal')}
        />

        <SidebarItem
          id="official-store"
          label="Official Merchandise"
          icon={ShoppingBag}
          currentTab={currentTab}
          badge="Soon"
          badgeTone="amber"
          onClick={() => handleItemClick('official-store')}
        />

        {/* =======================================================
            ADMINISTRASI
            ======================================================= */}
        {isAdmin && (
          <>
            <SidebarSectionLabel>
              {administrationLabel}
            </SidebarSectionLabel>

            {(isSuperAdmin ||
              currentUser.role === 'ADMIN_NATIONAL' ||
              currentUser.role === 'ADMIN_PROVINCE') && (
              <SidebarItem
                id="territories"
                label="Master Wilayah"
                icon={MapPin}
                currentTab={currentTab}
                onClick={() => handleItemClick('territories')}
              />
            )}

            {isSuperAdmin && (
              <SidebarItem
                id="audit-logs"
                label="Audit Trail & Log"
                icon={History}
                currentTab={currentTab}
                onClick={() => handleItemClick('audit-logs')}
              />
            )}

            {/* Google Spreadsheet */}
            {isSuperAdmin && onOpenSpreadsheetModal && (
              <button
                type="button"
                onClick={() =>
                  handleActionClick(onOpenSpreadsheetModal)
                }
                title="Akses Database Google Spreadsheet"
                className={[
                  'group mt-1 flex min-h-10 w-full items-center gap-3',
                  'rounded-xl px-3 py-2.5',
                  'text-left text-sm font-medium',
                  'text-emerald-300',
                  'bg-emerald-500/[0.06]',
                  'border border-emerald-500/10',
                  'transition-colors',
                  'hover:bg-emerald-500/[0.10]',
                  'hover:border-emerald-500/20',
                  'focus:outline-none focus-visible:ring-2',
                  'focus-visible:ring-emerald-400/60',
                  'focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-slate-950',
                ].join(' ')}
              >
                <FileSpreadsheet
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0 text-emerald-400"
                />

                <span className="min-w-0 flex-1 truncate">
                  Database Spreadsheet
                </span>

                <span className="shrink-0 rounded-md border border-emerald-400/10 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wide text-emerald-300">
                  Kwarnas
                </span>
              </button>
            )}

            {/* Google Drive */}
            {isSuperAdmin && onOpenDriveModal && (
              <button
                type="button"
                onClick={() =>
                  handleActionClick(onOpenDriveModal)
                }
                title="Akses Media Google Drive Repository"
                className={[
                  'group mt-1 flex min-h-10 w-full items-center gap-3',
                  'rounded-xl px-3 py-2.5',
                  'text-left text-sm font-medium',
                  'text-purple-300',
                  'bg-purple-500/[0.06]',
                  'border border-purple-500/10',
                  'transition-colors',
                  'hover:bg-purple-500/[0.10]',
                  'hover:border-purple-500/20',
                  'focus:outline-none focus-visible:ring-2',
                  'focus-visible:ring-purple-400/60',
                  'focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-slate-950',
                ].join(' ')}
              >
                <FolderOpen
                  aria-hidden="true"
                  className="h-[18px] w-[18px] shrink-0 text-purple-400"
                />

                <span className="min-w-0 flex-1 truncate">
                  Media Google Drive
                </span>

                <span className="shrink-0 rounded-md border border-purple-400/10 bg-purple-400/10 px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-wide text-purple-300">
                  Cloud
                </span>
              </button>
            )}
          </>
        )}

        {/* =======================================================
            QUICK ACTION
            ======================================================= */}
        <div className="px-1 pb-2 pt-5">
          <div className="mb-2 px-2">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
              Aksi Cepat
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleActionClick(onOpenRegisterModal)
            }
            className={[
              'group flex min-h-10 w-full items-center justify-center gap-2',
              'rounded-xl px-3 py-2.5',
              'bg-gradient-to-r from-emerald-500 to-teal-500',
              'text-xs font-bold text-slate-950',
              'shadow-lg shadow-emerald-950/20',
              'transition-all duration-150',
              'hover:-translate-y-0.5',
              'hover:from-emerald-400 hover:to-teal-400',
              'active:translate-y-0 active:scale-[0.98]',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-emerald-300/80',
              'focus-visible:ring-offset-2',
              'focus-visible:ring-offset-slate-950',
            ].join(' ')}
          >
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:rotate-6"
            />

            <span>Daftar Anggota Baru</span>
          </button>
        </div>
      </nav>

      {/* =========================================================
          USER FOOTER
          ========================================================= */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 p-2.5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2.5">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 rounded-lg border border-slate-700 object-cover"
            />

            {/* Online indicator */}
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-200">
              {currentUser.name}
            </p>

            <p
              className="mt-0.5 truncate text-[10px] font-medium text-slate-500"
              title={currentUser.jurisdictionName || 'Nasional'}
            >
              {currentUser.jurisdictionName || 'Nasional'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR
          ========================================================= */}
      <aside className="hidden h-full flex-shrink-0 lg:flex">
        {content}
      </aside>

      {/* =========================================================
          MOBILE DRAWER
          ========================================================= */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            onClick={onCloseMobile}
            className="fixed inset-0 cursor-default bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          />

          {/* Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-xs animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
