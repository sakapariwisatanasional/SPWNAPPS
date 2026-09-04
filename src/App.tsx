import React, { useState, useEffect } from 'react';
import { 
  Member, 
  TourPackage, 
  Activity, 
  Province, 
  Skill, 
  AuditLog, 
  CurrentUser,
  CulinarySouvenirItem
} from './types';
import { storage } from './services/storage';
import { DEFAULT_PUBLIC_USER } from './data/initialData';
import { spreadsheetService } from './services/spreadsheetService';
import { verifyMemberUniversal } from './services/ktaVerificationService';

// Route Mappings for Full SPA Navigation
const TAB_ROUTES: Record<string, string> = {
  landing: '/',
  dashboard: '/dashboard',
  'my-card': '/profile',
  members: '/members',
  tours: '/tours',
  'culinary-souvenirs': '/culinary',
  skills: '/skills',
  'krida-modules': '/krida',
  activities: '/activities',
  'verify-portal': '/verify',
  territories: '/territories',
  'audit-logs': '/audit'
};

const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'landing',
  '/landing': 'landing',
  '/dashboard': 'dashboard',
  '/profile': 'my-card',
  '/my-card': 'my-card',
  '/members': 'members',
  '/tours': 'tours',
  '/culinary': 'culinary-souvenirs',
  '/culinary-souvenirs': 'culinary-souvenirs',
  '/skills': 'skills',
  '/krida': 'krida-modules',
  '/krida-modules': 'krida-modules',
  '/activities': 'activities',
  '/verify': 'verify-portal',
  '/verify-portal': 'verify-portal',
  '/territories': 'territories',
  '/audit': 'audit-logs',
  '/audit-logs': 'audit-logs'
};

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Page Views
import { LandingPageView } from './pages/LandingPageView';
import { DashboardView } from './pages/DashboardView';
import { MemberManagementView } from './pages/MemberManagementView';
import { TourismDirectoryView } from './pages/TourismDirectoryView';
import { SkillDirectoryView } from './pages/SkillDirectoryView';
import { ActivitiesView } from './pages/ActivitiesView';
import { TerritoryManagementView } from './pages/TerritoryManagementView';
import { AuditLogsView } from './pages/AuditLogsView';
import { PublicPortalView } from './pages/PublicPortalView';
import { MyCardView } from './pages/MyCardView';
import { KridaModulesView } from './pages/KridaModulesView';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { SpreadsheetSyncModal } from './components/database/SpreadsheetSyncModal';
import { MemberFormModal } from './components/member/MemberFormModal';
import { MemberVerificationModal } from './components/member/MemberVerificationModal';
import { MemberTransferModal } from './components/member/MemberTransferModal';
import { TourPackageFormModal } from './components/tourism/TourPackageFormModal';
import { TourPackageDetailModal } from './components/tourism/TourPackageDetailModal';
import { KtaCardCustomizerModal } from './components/member/KtaCardCustomizerModal';
import { MemberPhotoEditModal } from './components/member/MemberPhotoEditModal';
import { AdminEditMemberModal } from './components/member/AdminEditMemberModal';
import { KtaPrintPdfModal } from './components/member/KtaPrintPdfModal';
import { QuickShareBadgeModal } from './components/member/QuickShareBadgeModal';
import { OperatorRoleModal } from './components/member/OperatorRoleModal';
import { CulinarySouvenirFormModal } from './components/culinary/CulinarySouvenirFormModal';
import { CulinarySouvenirDetailModal } from './components/culinary/CulinarySouvenirDetailModal';
import { CulinarySouvenirGallerySection } from './components/dashboard/CulinarySouvenirGallerySection';
import { DriveMediaRepositoryModal } from './components/common/DriveMediaRepositoryModal';
import { ActivityDetailModal } from './components/activities/ActivityDetailModal';
import { ActivityFormModal } from './components/activities/ActivityFormModal';

export default function App() {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<CurrentUser>(storage.getCurrentUser() || DEFAULT_PUBLIC_USER);
  
  // Resolve initial tab directly from URL pathname so direct links work immediately
  const getInitialTab = (): string => {
    if (typeof window === 'undefined') return 'landing';
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (pathname.startsWith('/verify')) return 'verify-portal';
    return ROUTE_TO_TAB[pathname] || 'landing';
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize URL and History when changing tabs
  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    setSearchQuery('');
    const targetPath = TAB_ROUTES[tab] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Reactive State from storage service
  const [members, setMembers] = useState<Member[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [culinaryItems, setCulinaryItems] = useState<CulinarySouvenirItem[]>([]);

  // Auth & Spreadsheet Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Other Modals State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTourFormModalOpen, setIsTourFormModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);
  const [isEditKtaModalOpen, setIsEditKtaModalOpen] = useState(false);
  const [isCulinaryFormOpen, setIsCulinaryFormOpen] = useState(false);
  const [editingCulinaryItem, setEditingCulinaryItem] = useState<CulinarySouvenirItem | null>(null);
  const [selectedCulinaryDetail, setSelectedCulinaryDetail] = useState<CulinarySouvenirItem | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<Activity | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingPhotoMember, setEditingPhotoMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [printingKtaMember, setPrintingKtaMember] = useState<Member | null>(null);
  const [quickSharingMember, setQuickSharingMember] = useState<Member | null>(null);
  const [managingOperatorMember, setManagingOperatorMember] = useState<Member | null>(null);
  const [verifyingMember, setVerifyingMember] = useState<Member | null>(null);
  const [transferringMember, setTransferringMember] = useState<Member | null>(null);
  const [selectedTourDetail, setSelectedTourDetail] = useState<TourPackage | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveSyncToast, setLiveSyncToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Backend session verification.
  // IMPORTANT: background/network failures must never log the user out.
  // Only an explicit 401/403 from /api/auth/me invalidates the session.
  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      const token = storage.getAuthToken();
      const storedUser = storage.getCurrentUser();

      // No token: keep the locally persisted public/auth state. Do not
      // manufacture a logout merely because the backend is unreachable.
      if (!token) {
        if (!cancelled) setCurrentUser(storedUser || DEFAULT_PUBLIC_USER);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        // A real authentication failure is the ONLY automatic logout case.
        if (res.status === 401 || res.status === 403) {
          if (!cancelled) {
            storage.setAuthToken(null);
            storage.setCurrentUser(DEFAULT_PUBLIC_USER);
            setCurrentUser(DEFAULT_PUBLIC_USER);
          }
          return;
        }

        // 5xx, redirects, proxy errors, etc. are transient. Keep session.
        if (!res.ok) {
          if (!cancelled) setCurrentUser(storedUser || DEFAULT_PUBLIC_USER);
          return;
        }

        const data = await res.json().catch(() => null);
        if (!cancelled && data?.success && data.user) {
          setCurrentUser(data.user);
          storage.setCurrentUser(data.user);
        } else if (!cancelled) {
          setCurrentUser(storedUser || DEFAULT_PUBLIC_USER);
        }
      } catch (error) {
        // Offline/cold-start/network error: preserve the current session.
        console.warn('[Auth] Session verification unavailable; keeping local session.', error);
        if (!cancelled) setCurrentUser(storedUser || DEFAULT_PUBLIC_USER);
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Synchronize state with reactive storage & auto-fetch live spreadsheet data on initial load
  useEffect(() => {
    const syncState = () => {
      setMembers(storage.getMembers());
      setTours(storage.getTourPackages());
      setActivities(storage.getActivities());
      setProvinces(storage.getProvinces());
      setSkills(storage.getSkills());
      setAuditLogs(storage.getAuditLogs());
      setCulinaryItems(storage.getCulinarySouvenirs());
      setCurrentUser(storage.getCurrentUser());
    };

    syncState();
    const unsubscribe = storage.subscribe(syncState);

    // Listen to live cloud data update events
    const handleCloudUpdate = (e: any) => {
      syncState();
      const detail = e?.detail;
      if (detail && !detail.silent) {
        setLiveSyncToast({
          message: `Data terbaru berhasil diperbarui dari Google Spreadsheet (${detail.time || 'Live'})`,
          visible: true
        });
        setTimeout(() => {
          setLiveSyncToast(prev => prev ? { ...prev, visible: false } : null);
        }, 3500);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('saka:cloud-data-updated', handleCloudUpdate);
    }

    // Langsung tarik data terbaru dari Google Spreadsheet secara live tanpa menggunakan cache/history lama
    spreadsheetService.syncFromSpreadsheet().then(res => {
      if (res.success) {
        console.log('Live Google Spreadsheet auto-sync completed:', res.message);
      }
    }).catch(err => {
      console.warn('Initial live spreadsheet sync notice:', err);
    });

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('saka:cloud-data-updated', handleCloudUpdate);
      }
    };
  }, []);

  // Handle URL Query Params, Pathname, and browser Back/Forward (popstate)
  useEffect(() => {
    try {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      let pathVerifyId = '';
      if (pathname.includes('/verify/')) {
        pathVerifyId = decodeURIComponent(window.location.pathname.split('/verify/')[1]?.split('?')[0] || '').trim();
      }

      const urlParams = new URLSearchParams(window.location.search);
      const verifyId = urlParams.get('verifyId') || urlParams.get('nta') || urlParams.get('id') || urlParams.get('kta') || pathVerifyId;
      const tabParam = urlParams.get('tab');

      if (pathname.startsWith('/verify') || tabParam === 'verify-portal') {
        setCurrentTab('verify-portal');
      } else if (ROUTE_TO_TAB[pathname]) {
        setCurrentTab(ROUTE_TO_TAB[pathname]);
      }

      if (verifyId) {
        verifyMemberUniversal(verifyId).then(res => {
          if (res.found && res.member) {
            setVerifyingMember(res.member);
          }
        }).catch(err => {
          console.warn('Auto URL verification failed:', err);
        });
      }
    } catch (e) {
      console.warn('URL param parsing error', e);
    }

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (path.startsWith('/verify')) {
        setCurrentTab('verify-portal');
      } else if (ROUTE_TO_TAB[path]) {
        setCurrentTab(ROUTE_TO_TAB[path]);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handlers for Member Management
  const handleApproveMember = (memberId: string) => {
    storage.approveMember(memberId, `${currentUser.name} (${currentUser.role})`);
    alert('Anggota berhasil diverifikasi & Nomor Anggota Nasional (PP.KK.KC.NNNNNN) telah diterbitkan.');
  };

  const handleRejectMember = (memberId: string) => {
    storage.updateMemberStatus(memberId, 'SUSPENDED', `${currentUser.name} (${currentUser.role})`, 'Penangguhan keanggotaan oleh administrator');
    alert('Status anggota diperbarui menjadi SUSPENDED.');
  };

  // Super Admin Delete Member Handlers
  const handleDeleteMember = (member: Member) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Hanya Super Admin Nasional yang memiliki wewenang menghapus data anggota.');
      return;
    }
    const success = storage.deleteMember(member.id, currentUser);
    if (success) {
      alert(`Data keanggotaan ${member.fullName} telah berhasil dihapus dari database.`);
    }
  };

  const handleDeleteAllDummyMembers = () => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      alert('Hanya Super Admin Nasional yang memiliki wewenang membersihkan data dummy.');
      return;
    }
    const count = storage.deleteAllDummyMembers(currentUser);
    alert(`Berhasil menghapus ${count} data anggota dummy. Database anggota kini bersih.`);
  };

  // Open Auth Modal helper
  const handleOpenAuth = (type: 'login' | 'register' | 'forgot') => {
    setAuthModalTab(type);
    setIsAuthModalOpen(true);
  };

  const handleOpenSpreadsheet = () => {
    if (currentUser.role === 'SUPER_ADMIN') {
      setIsSpreadsheetModalOpen(true);
    }
  };

  const handleOpenDrive = () => {
    if (currentUser.role === 'SUPER_ADMIN') {
      setIsDriveModalOpen(true);
    }
  };

  // IF CURRENT TAB IS LANDING PAGE
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900">
        <LandingPageView
          currentUser={currentUser}
          members={members}
          tours={tours}
          culinaryItems={culinaryItems}
          activities={activities}
          onOpenLoginModal={() => handleOpenAuth('login')}
          onOpenRegisterModal={() => handleOpenAuth('register')}
          onOpenVerifyModal={(m) => setVerifyingMember(m)}
          onViewTourDetail={(t) => setSelectedTourDetail(t)}
          onSelectCulinaryDetail={(item) => setSelectedCulinaryDetail(item)}
          onViewActivityDetail={(a) => setSelectedActivityDetail(a)}
          onOpenActivityForm={() => {
            setEditingActivity(null);
            setIsActivityFormOpen(true);
          }}
          onEnterDashboard={(tab) => handleNavigateTab(tab || 'dashboard')}
        />

        {/* Global Modals for Landing View */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            if (user.role === 'MEMBER') {
              handleNavigateTab('my-card');
            } else {
              handleNavigateTab('dashboard');
            }
          }}
        />

        <MemberVerificationModal
          member={verifyingMember}
          onClose={() => setVerifyingMember(null)}
        />

        <TourPackageDetailModal
          tour={selectedTourDetail}
          currentUser={currentUser}
          onClose={() => setSelectedTourDetail(null)}
          onEdit={(tour) => {
            setEditingTour(tour);
            setIsTourFormModalOpen(true);
          }}
          onDelete={(tourId) => {
            storage.deleteTourPackage(tourId, currentUser);
            setSelectedTourDetail(null);
          }}
        />

        <CulinarySouvenirDetailModal
          item={selectedCulinaryDetail}
          currentUser={currentUser}
          onClose={() => setSelectedCulinaryDetail(null)}
          onEdit={(item) => {
            setEditingCulinaryItem(item);
            setIsCulinaryFormOpen(true);
          }}
          onDelete={(id) => {
            storage.deleteCulinarySouvenir(id, currentUser);
            setSelectedCulinaryDetail(null);
          }}
        />

        {/* Activity Detail Modal for Landing View */}
        <ActivityDetailModal
          activity={selectedActivityDetail}
          currentUser={currentUser}
          onClose={() => setSelectedActivityDetail(null)}
          onEditActivity={(act) => {
            setSelectedActivityDetail(null);
            setEditingActivity(act);
            setIsActivityFormOpen(true);
          }}
          onDeleteActivity={(actId) => {
            storage.deleteActivity(actId, currentUser);
            setSelectedActivityDetail(null);
          }}
        />

        {/* Activity Form Modal for Landing View (Super Admin & Operator) */}
        <ActivityFormModal
          isOpen={isActivityFormOpen}
          currentUser={currentUser}
          initialActivity={editingActivity}
          onClose={() => {
            setIsActivityFormOpen(false);
            setEditingActivity(null);
          }}
          onSuccess={() => {
            setIsActivityFormOpen(false);
            setEditingActivity(null);
            setActivities(storage.getActivities());
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        currentUser={currentUser}
        onOpenRegisterModal={() => handleOpenAuth('register')}
        onOpenPublicPortal={() => handleNavigateTab('verify-portal')}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenSpreadsheetModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
        onOpenDriveModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            storage.setCurrentUser(user);
            if (user.role === 'MEMBER') {
              handleNavigateTab('my-card');
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenRegisterModal={() => handleOpenAuth('register')}
          onSelectTab={handleNavigateTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenSpreadsheetModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
          onOpenDriveModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
          onOpenLoginModal={() => handleOpenAuth('login')}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                members={members}
                tours={tours}
                provinces={provinces}
                culinaryItems={culinaryItems}
                onSelectTab={handleNavigateTab}
                onOpenRegisterModal={() => handleOpenAuth('register')}
                onVerifyMember={(m) => setVerifyingMember(m)}
                onApproveMemberQuick={handleApproveMember}
                onViewTourDetail={(t) => setSelectedTourDetail(t)}
                onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                onOpenEditMemberModal={(m) => setEditingMember(m)}
                onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                onOpenCulinaryFormModal={(item) => {
                  setEditingCulinaryItem(item || null);
                  setIsCulinaryFormOpen(true);
                }}
                onSelectCulinaryDetail={(item) => setSelectedCulinaryDetail(item)}
                onOpenSpreadsheetModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
                onOpenDriveModal={currentUser.role === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
              />
            )}

            {currentTab === 'culinary-souvenirs' && (
              <div className="space-y-6">
                <CulinarySouvenirGallerySection
                  items={culinaryItems}
                  currentUser={currentUser}
                  onOpenFormModal={(item) => {
                    setEditingCulinaryItem(item || null);
                    setIsCulinaryFormOpen(true);
                  }}
                  onSelectItemDetail={(item) => setSelectedCulinaryDetail(item)}
                />
              </div>
            )}

            {currentTab === 'members' && (
              <MemberManagementView
                currentUser={currentUser}
                members={members}
                provinces={provinces}
                onOpenRegisterModal={() => handleOpenAuth('register')}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onOpenTransferModal={(m) => setTransferringMember(m)}
                onApproveMember={handleApproveMember}
                onRejectMember={handleRejectMember}
                onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                onOpenEditMemberModal={(m) => setEditingMember(m)}
                onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                onOpenQuickShareModal={(m) => setQuickSharingMember(m)}
                onOpenOperatorModal={(m) => setManagingOperatorMember(m)}
                onDeleteMember={handleDeleteMember}
                onDeleteAllDummyMembers={handleDeleteAllDummyMembers}
              />
            )}

            {currentTab === 'tours' && (
              <TourismDirectoryView
                currentUser={currentUser}
                tours={tours}
                provinces={provinces}
                members={members}
                onOpenTourFormModal={() => {
                  setEditingTour(null);
                  setIsTourFormModalOpen(true);
                }}
                onViewTourDetail={(t) => setSelectedTourDetail(t)}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onEditTour={(t) => {
                  setEditingTour(t);
                  setIsTourFormModalOpen(true);
                }}
                onDeleteTour={(tId) => {
                  storage.deleteTourPackage(tId, currentUser);
                }}
              />
            )}

            {currentTab === 'skills' && (
              <SkillDirectoryView
                currentUser={currentUser}
                members={members}
                skills={skills}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
              />
            )}

            {currentTab === 'krida-modules' && (
              <KridaModulesView
                currentUser={currentUser}
              />
            )}

            {currentTab === 'activities' && (
              <ActivitiesView
                currentUser={currentUser}
                activities={activities}
              />
            )}

            {currentTab === 'territories' && (
              <TerritoryManagementView
                provinces={provinces}
              />
            )}

            {currentTab === 'audit-logs' && (
              <AuditLogsView
                logs={auditLogs}
              />
            )}

            {currentTab === 'verify-portal' && (
              <PublicPortalView
                members={members}
                tours={tours}
                skills={skills}
                onOpenRegisterModal={() => handleOpenAuth('register')}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onViewTourDetail={(t) => setSelectedTourDetail(t)}
                onSelectTab={handleNavigateTab}
              />
            )}

            {currentTab === 'my-card' && (
              <MyCardView
                currentUser={currentUser}
                members={members}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                onOpenEditMemberModal={(m) => setEditingMember(m)}
                onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                onOpenQuickShareModal={(m) => setQuickSharingMember(m)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Auth Modal (Login / Register / Forgot Password / View Password Toggle) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          if (user.role === 'MEMBER') {
            handleNavigateTab('my-card');
          } else {
            handleNavigateTab('dashboard');
          }
        }}
      />

      {/* 2. Google Spreadsheet Sync & Database Manager (SUPER ADMIN ONLY) */}
      {currentUser.role === 'SUPER_ADMIN' && (
        <SpreadsheetSyncModal
          isOpen={isSpreadsheetModalOpen}
          onClose={() => setIsSpreadsheetModalOpen(false)}
        />
      )}

      {/* 3. Register Member Modal */}
      <MemberFormModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          handleNavigateTab('members');
        }}
      />

      {/* 4. Public Safe Verification Modal */}
      <MemberVerificationModal
        member={verifyingMember}
        onClose={() => setVerifyingMember(null)}
      />

      {/* 5. Member Transfer / Mutasi Modal */}
      <MemberTransferModal
        member={transferringMember}
        currentUser={currentUser}
        onClose={() => setTransferringMember(null)}
        onSuccess={() => setTransferringMember(null)}
      />

      {/* 6. Tour Package Creation & Edit Modal */}
      <TourPackageFormModal
        isOpen={isTourFormModalOpen}
        currentUser={currentUser}
        editTour={editingTour}
        onClose={() => {
          setIsTourFormModalOpen(false);
          setEditingTour(null);
        }}
        onSuccess={() => {
          setIsTourFormModalOpen(false);
          setEditingTour(null);
          handleNavigateTab('tours');
        }}
      />

      {/* 7. Tour Package Details & Itinerary Modal */}
      <TourPackageDetailModal
        tour={selectedTourDetail}
        currentUser={currentUser}
        onClose={() => setSelectedTourDetail(null)}
        onEdit={(tour) => {
          setEditingTour(tour);
          setIsTourFormModalOpen(true);
        }}
        onDelete={(tourId) => {
          storage.deleteTourPackage(tourId, currentUser);
          setSelectedTourDetail(null);
        }}
      />

      {/* 8. Admin KTA Card Customizer Modal */}
      <KtaCardCustomizerModal
        isOpen={isEditKtaModalOpen}
        currentUser={currentUser}
        onClose={() => setIsEditKtaModalOpen(false)}
      />

      {/* 9. Member Photo Correction & Profile Sync Modal */}
      <MemberPhotoEditModal
        isOpen={!!editingPhotoMember}
        member={editingPhotoMember}
        currentUser={currentUser}
        onClose={() => setEditingPhotoMember(null)}
        onSuccess={() => setEditingPhotoMember(null)}
      />

      {/* 10. Admin Manual Profile & Domicile Edit Modal */}
      <AdminEditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        currentUser={currentUser}
        onClose={() => setEditingMember(null)}
        onSuccess={() => setEditingMember(null)}
      />

      {/* 11. KTA Print & PDF Export Modal (ISO/IEC 7810 ID-1 CR80 & A4 Sheet) */}
      <KtaPrintPdfModal
        isOpen={!!printingKtaMember}
        member={printingKtaMember}
        onClose={() => setPrintingKtaMember(null)}
        onOpenEditCard={() => {
          setPrintingKtaMember(null);
          setIsEditKtaModalOpen(true);
        }}
      />

      {/* 12. Quick Share & Event Networking Badge Modal */}
      <QuickShareBadgeModal
        isOpen={!!quickSharingMember}
        member={quickSharingMember}
        onClose={() => setQuickSharingMember(null)}
        onOpenVerifyModal={(m) => {
          setQuickSharingMember(null);
          setVerifyingMember(m);
        }}
      />

      {/* 13. Operator Role Management Modal (Super Admin Only) */}
      <OperatorRoleModal
        isOpen={!!managingOperatorMember}
        member={managingOperatorMember}
        currentUser={currentUser}
        onClose={() => setManagingOperatorMember(null)}
        onSuccess={() => setManagingOperatorMember(null)}
      />

      {/* 13. Culinary & Souvenir Form Modal */}
      <CulinarySouvenirFormModal
        isOpen={isCulinaryFormOpen}
        currentUser={currentUser}
        editItem={editingCulinaryItem}
        onClose={() => {
          setIsCulinaryFormOpen(false);
          setEditingCulinaryItem(null);
        }}
        onSuccess={(savedItem) => {
          setIsCulinaryFormOpen(false);
          setEditingCulinaryItem(null);
          setSelectedCulinaryDetail(savedItem);
        }}
      />

      {/* 14. Culinary & Souvenir Detail Modal */}
      <CulinarySouvenirDetailModal
        item={selectedCulinaryDetail}
        currentUser={currentUser}
        onClose={() => setSelectedCulinaryDetail(null)}
        onEdit={(item) => {
          setEditingCulinaryItem(item);
          setIsCulinaryFormOpen(true);
        }}
        onDelete={(id) => {
          storage.deleteCulinarySouvenir(id, currentUser);
          setSelectedCulinaryDetail(null);
        }}
      />

      {/* 15. Google Drive Media Repository Modal (SUPER ADMIN ONLY) */}
      {currentUser.role === 'SUPER_ADMIN' && (
        <DriveMediaRepositoryModal
          isOpen={isDriveModalOpen}
          onClose={() => setIsDriveModalOpen(false)}
        />
      )}

      {/* 16. Activity Detail Modal (Authenticated Views) */}
      <ActivityDetailModal
        activity={selectedActivityDetail}
        currentUser={currentUser}
        onClose={() => setSelectedActivityDetail(null)}
        onEditActivity={(act) => {
          setSelectedActivityDetail(null);
          setEditingActivity(act);
          setIsActivityFormOpen(true);
        }}
        onDeleteActivity={(actId) => {
          storage.deleteActivity(actId, currentUser);
          setSelectedActivityDetail(null);
        }}
      />

      {/* 17. Activity Form Modal (Super Admin & Operator) */}
      <ActivityFormModal
        isOpen={isActivityFormOpen}
        currentUser={currentUser}
        initialActivity={editingActivity}
        onClose={() => {
          setIsActivityFormOpen(false);
          setEditingActivity(null);
        }}
        onSuccess={() => {
          setIsActivityFormOpen(false);
          setEditingActivity(null);
          setActivities(storage.getActivities());
        }}
      />

      {/* Floating Live Auto-Sync Toast */}
      {liveSyncToast && liveSyncToast.visible && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-500 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="text-xs font-semibold text-slate-100 leading-snug">
            {liveSyncToast.message}
          </p>
        </div>
      )}
    </div>
  );
}

