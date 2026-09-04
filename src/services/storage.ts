import { 
  Member, 
  TourPackage, 
  Activity, 
  AuditLog, 
  CurrentUser, 
  UserRole,
  Province, 
  Regency, 
  District, 
  Branch, 
  Skill,
  MemberSkill,
  Certification,
  NotificationItem,
  MemberStatus,
  TourStatus,
  SkillProficiency,
  KtaCardSettings,
  CulinarySouvenirItem,
  ProductModerationStatus,
  KridaId,
  KridaModuleItem
} from '../types';
import { PROVINCES_DATA, REGENCIES_DATA, DISTRICTS_DATA, BRANCHES_DATA, getDistrictsForRegency } from '../data/indonesiaTerritories';
import { 
  INITIAL_MEMBERS, 
  INITIAL_TOUR_PACKAGES, 
  INITIAL_ACTIVITIES, 
  INITIAL_AUDIT_LOGS, 
  MASTER_SKILLS, 
  DEMO_USERS,
  DEFAULT_PUBLIC_USER,
  INITIAL_CULINARY_SOUVENIRS
} from '../data/initialData';
import { INITIAL_KRIDA_MODULES } from '../data/kridaData';
import { SAKA_CARD_BG_DRIVE_DIRECT_URL } from '../components/common/SakaLogo';

export const DEFAULT_KTA_SETTINGS: KtaCardSettings = {
  cardTheme: 'purple_saka',
  bgImageUrl: SAKA_CARD_BG_DRIVE_DIRECT_URL,
  bgOpacity: 0.10,
  frontOrganizationTitle: 'SAKA PARIWISATA',
  frontOrganizationSubtitle: 'GERAKAN PRAMUKA INDONESIA',
  frontValidityText: 'Masa Berlaku: Selama Menjadi Anggota',
  watermarkOpacity: 0.0,
  showKridaBadge: true,
  backHeaderTitle: 'KETENTUAN KTA DIGITAL SAKA PARIWISATA',
  backHeaderSubtitle: 'Kwartir Nasional Gerakan Pramuka',
  terms: [
    '1. Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata tingkat Nasional.',
    '2. Keaslian data kartu dapat diverifikasi kapan pun secara publik melalui pemindaian QR Code di bagian depan.',
    '3. Anggota wajib menjunjung tinggi Tri Satya, Dasa Darma Pramuka, serta Sapta Pesona Pariwisata Indonesia.',
    '4. Apabila menemukan kartu ini tercecer, harap diserahkan ke Sekretariat Kwartir terdekat.'
  ],
  issueLocationDate: 'Jakarta, 14 Agustus 2026',
  barcodeType: 'CODE128',
  signerName: 'Rohadi Wijaya',
  signerTitle: 'Ketua Pimpinan Saka Pariwisata Nasional',
  showStamp: true
};

export type StorageMutationEvent = {
  type: 'MEMBER' | 'TOUR' | 'CULINARY' | 'ACTIVITY' | 'KRIDA_MODULE' | 'SYSTEM';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PHOTO_UPDATE' | 'SYNC';
  id?: string;
  payload?: any;
};

export type MutationListener = (event: StorageMutationEvent) => void;

const AUTH_TOKEN_KEY = 'saka_auth_token';
const SESSION_CURRENT_USER_KEY = 'saka_current_user_session_v2';

const STORAGE_KEYS = {
  IS_INITIALIZED: 'saka_initialized_v2',
  MEMBERS: 'saka_members_v2',
  TOURS: 'saka_tours_v2',
  ACTIVITIES: 'saka_activities_v2',
  AUDIT_LOGS: 'saka_audit_logs_v2',
  NOTIFICATIONS: 'saka_notifications_v2',
  CURRENT_USER: 'saka_current_user_v2',
  USERS: 'saka_users_v2',
  CUSTOM_BRANCHES: 'saka_custom_branches_v2',
  KTA_SETTINGS: 'saka_kta_settings_v2',
  CULINARY_SOUVENIRS: 'saka_culinary_souvenirs_v2',
  KRIDA_MODULES: 'saka_krida_modules_2026'
};

class StorageService {
  private listeners: (() => void)[] = [];
  private mutationListeners: MutationListener[] = [];
  private isSyncing: boolean = false;
  private autoSyncInterval: any = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.init();
    this.initCrossTabListener();
    this.syncWithServer().catch(() => {});
    this.startAutoSyncInterval();
  }

  private initCrossTabListener() {
    if (typeof window !== 'undefined') {
      // 1. Storage event listener for other tabs
      window.addEventListener('storage', (e) => {
        if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
          this.notify();
        }
      });

      // 2. BroadcastChannel for instant cross-tab communication
      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('saka_sync_channel');
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && event.data.type === 'SYNC_MUTATION') {
              this.notify();
            }
          };
        } catch (e) {
          console.warn('[Storage] BroadcastChannel not supported:', e);
        }
      }

      // 3. Auto-sync on window focus (when user switches back to browser/tab)
      window.addEventListener('focus', () => {
        this.syncWithServer().catch(() => {});
      });

      // 4. Auto-sync on visibility change (mobile browsers, tab switching)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.syncWithServer().catch(() => {});
        }
      });
    }
  }

  private startAutoSyncInterval() {
    if (typeof window === 'undefined') return;
    if (this.autoSyncInterval) clearInterval(this.autoSyncInterval);
    // Poll central server every 5 seconds for cross-device consistency
    this.autoSyncInterval = setInterval(() => {
      this.syncWithServer().catch(() => {});
    }, 5000);
  }

  private init() {
    // Bersihkan data lama jika ada
    const legacyKeys = [
      'saka_members_v1',
      'saka_tours_v1',
      'saka_activities_v1',
      'saka_audit_logs_v1',
      'saka_notifications_v1',
      'saka_current_user_v1',
      'saka_users_v1',
      'saka_custom_branches_v1',
      'saka_kta_settings_v1',
      'saka_culinary_souvenirs_v1'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));

    // Bersihkan semua data dummy/showcase bawaan sistem dari storage agar murni hanya menampilkan data spreadsheet
    try {
      const dummyMemberPrefixes = ['mem-nasional-', 'mem-jabar-', 'mem-diy-', 'mem-jatim-', 'mem-bali-', 'mem-sumbar-', 'mem-sulsel-', 'mem-ntb-', 'mem-ntt-', 'showcase-'];
      const dummyUserIds = ['user-kwarda-jabar', 'user-kwarcab-bandung', 'user-kwarran-ciwidey', 'user-nasional-rahmat', 'user-mem-rizky', 'user-mem-siti'];
      
      const rawMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (rawMembers) {
        const mems: Member[] = JSON.parse(rawMembers);
        const filteredMems = mems.filter(m => !dummyMemberPrefixes.some(prefix => m.id.startsWith(prefix)));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMems));
      } else {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
      }

      const rawTours = localStorage.getItem(STORAGE_KEYS.TOURS);
      if (rawTours) {
        const tours: TourPackage[] = JSON.parse(rawTours);
        const filteredTours = tours.filter(t => !t.id.startsWith('tour-showcase-') && !t.id.startsWith('tour-ekowisata-') && !t.id.startsWith('tour-budaya-') && !t.id.startsWith('tour-kuliner-') && !t.id.startsWith('tour-bahari-'));
        localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(filteredTours));
      } else {
        localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify([]));
      }

      const rawActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (rawActivities) {
        const acts: Activity[] = JSON.parse(rawActivities);
        const filteredActs = acts.filter(a => !a.id.startsWith('act-showcase-') && !a.id.startsWith('act-dummy-'));
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filteredActs));
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
      }

      const rawCulinary = localStorage.getItem(STORAGE_KEYS.CULINARY_SOUVENIRS);
      if (rawCulinary) {
        const items: CulinarySouvenirItem[] = JSON.parse(rawCulinary);
        const filteredItems = items.filter(c => !c.id.startsWith('prod-showcase-') && !c.id.startsWith('prod-kul-') && !c.id.startsWith('prod-cin-'));
        localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(filteredItems));
      } else {
        localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify([]));
      }

      const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (rawUsers) {
        const usrs: CurrentUser[] = JSON.parse(rawUsers);
        const filteredUsrs = usrs.filter(u => !dummyUserIds.includes(u.id) && !dummyMemberPrefixes.some(prefix => (u.memberId || '').startsWith(prefix)));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsrs));
      }
    } catch (e) {
      console.warn('Dummy cleanup error:', e);
    }

    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');

    // Jangan menghapus session aktif hanya karena token API tidak tersedia.
    // Token bisa hilang/expired tanpa berarti user memilih logout.
    try {
      const hasLocalUser = !!localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const hasSessionUser = !!sessionStorage.getItem(SESSION_CURRENT_USER_KEY);
      if (!hasLocalUser && !hasSessionUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_PUBLIC_USER));
      }
    } catch (e) {
      console.warn('Auth session initialization warning:', e);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_PUBLIC_USER]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotifs: NotificationItem[] = [
        {
          id: 'notif-welcome',
          userId: 'user-public-guest',
          title: 'Selamat Datang di Portal Saka Pariwisata',
          message: 'Sistem Informasi Manajemen Satuan Karya Pramuka Pariwisata Tingkat Nasional siap digunakan.',
          type: 'INFO',
          createdAt: new Date().toISOString(),
          isRead: false,
          actionUrl: '/'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
    }

    // Jalankan deduplikasi database untuk menjamin integritas data
    this.deduplicateDatabase();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public onMutation(listener: MutationListener): () => void {
    this.mutationListeners.push(listener);
    return () => {
      this.mutationListeners = this.mutationListeners.filter(l => l !== listener);
    };
  }

  public subscribeMutation(listener: MutationListener): () => void {
    return this.onMutation(listener);
  }

  private emitMutation(mutationType: string, payload?: any) {
    let type: StorageMutationEvent['type'] = 'SYSTEM';
    let action: StorageMutationEvent['action'] = 'UPDATE';
    let id = payload?.id || payload?.memberId || payload?.tourId || payload?.activityId;

    if (mutationType.includes('MEMBER')) {
      type = 'MEMBER';
      if (mutationType.includes('DELETE')) action = 'DELETE';
      else if (mutationType.includes('REGISTER') || mutationType.includes('CREATE')) action = 'CREATE';
      else if (mutationType.includes('PHOTO')) action = 'PHOTO_UPDATE';
      else if (mutationType.includes('STATUS')) action = 'UPDATE';
      else action = 'UPDATE';
    } else if (mutationType.includes('TOUR')) {
      type = 'TOUR';
      if (mutationType.includes('DELETE')) action = 'DELETE';
      else if (mutationType.includes('CREATE') || mutationType.includes('ADD')) action = 'CREATE';
      else action = 'UPDATE';
    } else if (mutationType.includes('CULINARY')) {
      type = 'CULINARY';
      if (mutationType.includes('DELETE')) action = 'DELETE';
      else if (mutationType.includes('CREATE') || mutationType.includes('ADD')) action = 'CREATE';
      else action = 'UPDATE';
    } else if (mutationType.includes('ACTIVITY')) {
      type = 'ACTIVITY';
      if (mutationType.includes('DELETE')) action = 'DELETE';
      else if (mutationType.includes('CREATE') || mutationType.includes('ADD')) action = 'CREATE';
      else action = 'UPDATE';
    } else if (mutationType.includes('KRIDA_MODULE')) {
      type = 'KRIDA_MODULE';
      if (mutationType.includes('DELETE')) action = 'DELETE';
      else if (mutationType.includes('CREATE')) action = 'CREATE';
      else action = 'UPDATE';
    }

    const event: StorageMutationEvent = {
      type,
      action,
      payload,
      id
    };

    this.mutationListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.warn('Storage mutation listener error:', err);
      }
    });

    // Broadcast instantly to other tabs on same device
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'SYNC_MUTATION', mutationType, payload });
      } catch (e) {
        // ignore
      }
    }

    // Forward to central full-stack server for cross-device synchronization
    if (typeof window !== 'undefined' && type !== 'SYSTEM') {
      try {
        const token = this.getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        fetch('/api/mutate', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type, action, payload })
        }).catch(err => console.warn('[Storage] Server mutation notice:', err));
      } catch (err) {
        console.warn('[Storage] Send server mutation error:', err);
      }
    }
  }

  public getAuthToken(): string | null {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setAuthToken(token: string | null, rememberMe: boolean = true) {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      if (token) {
        (rememberMe ? localStorage : sessionStorage).setItem(AUTH_TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Set auth token error:', e);
    }
  }

  public setCurrentUser(user: CurrentUser, rememberMe: boolean = true) {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.removeItem(SESSION_CURRENT_USER_KEY);
      const target = rememberMe ? localStorage : sessionStorage;
      target.setItem(rememberMe ? STORAGE_KEYS.CURRENT_USER : SESSION_CURRENT_USER_KEY, JSON.stringify(user));
      this.addAuditLog(
        user.id,
        user.name,
        user.role,
        'AUTH_SESSION_SET',
        'SYSTEM',
        user.id,
        `Sesi autentikasi ditetapkan (rememberMe=${rememberMe}).`
      );
      this.notify();
    } catch (e) {
      console.warn('Set current user error:', e);
    }
  }

  public logout() {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      sessionStorage.removeItem(SESSION_CURRENT_USER_KEY);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_PUBLIC_USER));
      this.notify();
    } catch (e) {
      console.warn('Logout error:', e);
    }
  }

  public async syncWithServer(): Promise<boolean> {
    if (typeof window === 'undefined' || this.isSyncing) return false;
    this.isSyncing = true;
    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/data', { headers, cache: 'no-store' });
      if (!res.ok) return false;
      const data = await res.json();

      let hasChanges = false;

      const syncCollection = (key: string, incoming: any[] | undefined) => {
        if (!Array.isArray(incoming)) return false;
        const currentStr = localStorage.getItem(key);
        const incomingStr = JSON.stringify(incoming);
        if (currentStr !== incomingStr) {
          localStorage.setItem(key, incomingStr);
          return true;
        }
        return false;
      };

      if (syncCollection(STORAGE_KEYS.MEMBERS, data.members)) hasChanges = true;
      if (syncCollection(STORAGE_KEYS.TOURS, data.tours)) hasChanges = true;
      if (syncCollection(STORAGE_KEYS.ACTIVITIES, data.activities)) hasChanges = true;
      if (syncCollection(STORAGE_KEYS.CULINARY_SOUVENIRS, data.culinaryItems)) hasChanges = true;
      if (syncCollection(STORAGE_KEYS.KRIDA_MODULES, data.kridaModules)) hasChanges = true;

      if (hasChanges) {
        this.listeners.forEach(cb => cb());
      }
      return true;
    } catch (e) {
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  private notify(mutationType?: string, payload?: any) {
    this.listeners.forEach(cb => cb());
    if (mutationType) {
      this.emitMutation(mutationType, payload);
    }
  }

  // --- Current User & Roles ---
  public getCurrentUser(): CurrentUser {
    try {
      // Session tab-only diprioritaskan jika ada.
      const rawSession = sessionStorage.getItem(SESSION_CURRENT_USER_KEY);
      const rawLocal = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const data = rawSession || rawLocal;
      if (!data) return DEFAULT_PUBLIC_USER;
      const user: CurrentUser = JSON.parse(data);
      if (!user || !user.id || !user.role) return DEFAULT_PUBLIC_USER;
      return user;
    } catch {
      return DEFAULT_PUBLIC_USER;
    }
  }

  public getUsers(): CurrentUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      if (!raw) return Array.isArray(DEMO_USERS) ? [...DEMO_USERS] : [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (Array.isArray(DEMO_USERS) ? [...DEMO_USERS] : []);
    } catch (error) {
      console.warn('[Storage] getUsers error:', error);
      return Array.isArray(DEMO_USERS) ? [...DEMO_USERS] : [];
    }
  }

  public setUsers(users: CurrentUser[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  public setMembers(members: Member[]) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
  }

  public setTourPackages(tours: TourPackage[]) {
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
    this.notify();
  }

  public setCulinarySouvenirs(items: CulinarySouvenirItem[]) {
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));
    this.notify();
  }

  public setActivities(activities: Activity[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    this.notify();
  }

  // --- Krida Learning Modules & SKK Curriculum ---
  public getKridaModules(): KridaModuleItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KRIDA_MODULES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(INITIAL_KRIDA_MODULES));
        return INITIAL_KRIDA_MODULES;
      }
      const stored: KridaModuleItem[] = JSON.parse(data);
      if (!Array.isArray(stored) || stored.length === 0) {
        localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(INITIAL_KRIDA_MODULES));
        return INITIAL_KRIDA_MODULES;
      }
      // Merge with initial if any new modules are missing
      const mergedMap = new Map<string, KridaModuleItem>();
      INITIAL_KRIDA_MODULES.forEach(m => mergedMap.set(m.id, m));
      stored.forEach(m => mergedMap.set(m.id, { ...mergedMap.get(m.id), ...m }));
      return Array.from(mergedMap.values());
    } catch {
      return INITIAL_KRIDA_MODULES;
    }
  }

  public getKridaModuleById(id: string): KridaModuleItem | undefined {
    return this.getKridaModules().find(m => m.id === id);
  }

  public getKridaModulesByKrida(kridaId: KridaId): KridaModuleItem[] {
    return this.getKridaModules().filter(m => m.kridaId === kridaId);
  }

  public updateKridaModule(updatedModule: KridaModuleItem, updatedBy?: string): KridaModuleItem {
    const modules = this.getKridaModules();
    const idx = modules.findIndex(m => m.id === updatedModule.id);
    const now = new Date().toISOString();
    const finalItem: KridaModuleItem = {
      ...updatedModule,
      updatedAt: now,
      updatedBy: updatedBy || 'Super Admin Kwartir Nasional'
    };

    if (idx !== -1) {
      modules[idx] = finalItem;
    } else {
      modules.push(finalItem);
    }

    localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(modules));
    this.notify('UPDATE_KRIDA_MODULE', finalItem);
    return finalItem;
  }

  public setKridaModules(modules: KridaModuleItem[]) {
    localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(modules));
    this.notify('BATCH_UPDATE_KRIDA_MODULE', modules);
  }

  public resetKridaModules(): KridaModuleItem[] {
    localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(INITIAL_KRIDA_MODULES));
    this.notify('BATCH_UPDATE_KRIDA_MODULE', INITIAL_KRIDA_MODULES);
    return INITIAL_KRIDA_MODULES;
  }

  public assignMemberAsOperator(
    memberId: string,
    role: UserRole,
    jurisdictionId: string,
    jurisdictionName: string,
    notes: string | undefined,
    adminUser: CurrentUser
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const roleLabel = role === 'ADMIN_REGENCY' ? 'Operator Kwarcab' : role === 'ADMIN_PROVINCE' ? 'Operator Kwarda' : role === 'ADMIN_BRANCH' ? 'Operator Kwarran' : 'Operator';
    
    // Update Member Data
    member.isOperator = true;
    member.operatorRole = role;
    member.operatorJurisdictionId = jurisdictionId;
    member.operatorJurisdictionName = jurisdictionName;
    member.operatorAssignedAt = new Date().toISOString();
    member.operatorAssignedBy = `${adminUser.name} (${adminUser.role})`;
    member.operatorNotes = notes || 'Penetapan Operator Resmi oleh Super Admin';

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Update Users System for Demo / Login Switcher
    const users = this.getUsers();
    const existingUserIdx = users.findIndex(u => u.memberId === member.id || u.id === member.userId || u.email === member.email);
    const updatedUserObj: CurrentUser = {
      id: existingUserIdx !== -1 ? users[existingUserIdx].id : `user-op-${member.id}`,
      email: member.email,
      name: `Kak ${member.fullName} (${roleLabel} ${jurisdictionName})`,
      role: role,
      jurisdictionName: `${roleLabel} ${jurisdictionName} (${jurisdictionId})`,
      jurisdictionId: jurisdictionId,
      avatarUrl: member.avatarUrl,
      memberId: member.id
    };

    if (existingUserIdx !== -1) {
      users[existingUserIdx] = updatedUserObj;
    } else {
      users.push(updatedUserObj);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // If current logged-in user is this member, update current user as well
    const currentUser = this.getCurrentUser();
    if (currentUser.memberId === member.id || currentUser.id === member.userId) {
      this.setCurrentUser(updatedUserObj);
    }

    // Add Audit Log
    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'ASSIGN_OPERATOR_ROLE',
      'MEMBER',
      member.id,
      `Super Admin menetapkan anggota ${member.fullName} sebagai ${roleLabel} wilayah ${jurisdictionName} (${jurisdictionId}). Catatan/SK: ${notes || '-'}`
    );

    // Send in-app notification to member
    this.addNotification(
      member.userId,
      'Penetapan Wewenang Operator Kwartir',
      `Selamat! Anda telah resmi ditetapkan oleh Super Admin (${adminUser.name}) sebagai ${roleLabel} wilayah ${jurisdictionName}. Anda kini berwenang menginput, mendaftarkan, dan mengelola data anggota di wilayah tersebut.`,
      'SUCCESS',
      '/members'
    );

    this.notify();
    return member;
  }

  public revokeMemberOperator(
    memberId: string,
    adminUser: CurrentUser,
    reason: string = 'Penyelesaian masa bakti / pembatalan wewenang oleh Super Admin'
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const prevRole = member.operatorRole || 'ADMIN_REGENCY';
    const prevJurisdiction = member.operatorJurisdictionName || member.regencyName;

    // Reset operator privileges on Member
    member.isOperator = false;
    member.operatorRole = undefined;
    member.operatorJurisdictionId = undefined;
    member.operatorJurisdictionName = undefined;
    member.operatorAssignedAt = undefined;
    member.operatorAssignedBy = undefined;
    member.operatorNotes = undefined;

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Update Users System
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.memberId === member.id || u.id === member.userId || u.email === member.email);
    if (userIdx !== -1) {
      users[userIdx].role = 'MEMBER';
      users[userIdx].name = `Kak ${member.fullName}`;
      users[userIdx].jurisdictionName = `Anggota Saka Aktif (${member.regencyName})`;
      users[userIdx].jurisdictionId = undefined;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // If currently active user was this operator, demote to Member
      const currentUser = this.getCurrentUser();
      if (currentUser.id === users[userIdx].id || currentUser.memberId === member.id) {
        this.setCurrentUser(users[userIdx]);
      }
    }

    // Add Audit Log
    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'REVOKE_OPERATOR_ROLE',
      'MEMBER',
      member.id,
      `Super Admin membatalkan/mencabut hak Operator dari anggota ${member.fullName} (sebelumnya ${prevRole} di ${prevJurisdiction}). Alasan: ${reason}`
    );

    // Send in-app notification to member
    this.addNotification(
      member.userId,
      'Wewenang Operator Dinonaktifkan',
      `Wewenang Operator Kwartir Anda telah dinonaktifkan/dibatalkan oleh Super Admin (${adminUser.name}). Alasan: ${reason}. Status akun Anda kembali sebagai Anggota Reguler.`,
      'INFO',
      '/profile'
    );

    this.notify();
    return member;
  }

  // --- Territories ---
  public getProvinces(): Province[] {
    return PROVINCES_DATA;
  }

  public getRegencies(provinceId?: string): Regency[] {
    if (!provinceId) return REGENCIES_DATA;
    return REGENCIES_DATA.filter(r => r.provinceId === provinceId);
  }

  public getDistricts(regencyId?: string): District[] {
    if (!regencyId) return DISTRICTS_DATA;
    const regency = REGENCIES_DATA.find(r => r.id === regencyId);
    return getDistrictsForRegency(regencyId, regency?.name);
  }

  public getBranches(districtId?: string): Branch[] {
    const custom = this.getCustomBranches();
    
    if (districtId) {
      const customMatches = custom.filter(b => b.districtId === districtId);
      const staticMatches = BRANCHES_DATA.filter(b => b.districtId === districtId);
      
      if (customMatches.length > 0 || staticMatches.length > 0) {
        return [...staticMatches, ...customMatches];
      }

      // Automatically construct Kwartir Ranting following the exact Kecamatan name
      const parts = districtId.split('.');
      const provinceId = parts[0] || '32';
      const regencyId = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '32.06';
      const districtCode = parts[2] || '01';
      
      const regency = REGENCIES_DATA.find(r => r.id === regencyId);
      const districts = getDistrictsForRegency(regencyId, regency?.name);
      const district = districts.find(d => d.id === districtId);
      const distName = district ? district.name : 'Kecamatan';

      return [{
        id: `branch-${districtId.replace(/\./g, '-')}`,
        districtId,
        regencyId,
        provinceId,
        code: districtCode,
        name: `Kwarran ${distName}`,
        address: `Pangkalan Saka Pariwisata Kwarran ${distName}`,
        contactPerson: `Pengurus Kwarran ${distName}`,
        phone: '0812-3456-7890'
      }];
    }

    const all = [...BRANCHES_DATA, ...custom];
    return all;
  }

  public getCustomBranches(): Branch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_BRANCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addBranch(branch: Omit<Branch, 'id'>): Branch {
    const newBranch: Branch = {
      ...branch,
      id: `branch-${Date.now()}`
    };
    const current = this.getCustomBranches();
    current.push(newBranch);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BRANCHES, JSON.stringify(current));
    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, 'CREATE_BRANCH', 'TERRITORY', newBranch.id, `Menambahkan Ranting Baru: ${newBranch.name}`);
    this.notify();
    return newBranch;
  }

  // --- Skills ---
  public getSkills(): Skill[] {
    return MASTER_SKILLS;
  }

  public updateMemberSkills(
    memberId: string,
    skills: MemberSkill[],
    certifications?: Certification[],
    user?: CurrentUser,
    reason: string = 'Pembaruan data keahlian & sertifikasi kompetensi anggota'
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    member.skills = skills;
    if (certifications) {
      member.certifications = certifications;
    }

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    if (user) {
      this.addAuditLog(
        user.id,
        user.name,
        user.role,
        'UPDATE_MEMBER_SKILLS',
        'MEMBER',
        member.id,
        `${user.name} (${user.role}) memperbarui data keahlian & kompetensi ${member.fullName}: ${skills.length} keahlian terdaftar (${skills.filter(s => s.isVerified).length} disetujui/terverifikasi). Alasan: ${reason}`
      );
    }

    this.notify('UPDATE_MEMBER_SKILLS', member);
    return member;
  }

  public approveMemberSkill(
    memberId: string,
    skillId: string,
    user: CurrentUser,
    notes?: string
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const skillIdx = (member.skills || []).findIndex(s => s.id === skillId);
    if (skillIdx === -1) return null;

    member.skills[skillIdx].isVerified = true;
    member.skills[skillIdx].verifiedBy = user.name;
    member.skills[skillIdx].verifiedAt = new Date().toISOString();
    if (notes) {
      member.skills[skillIdx].notes = notes;
    }

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    this.addAuditLog(
      user.id,
      user.name,
      user.role,
      'APPROVE_MEMBER_SKILL',
      'MEMBER',
      member.id,
      `${user.name} (${user.role}) menyetujui dan memverifikasi keahlian "${member.skills[skillIdx].skillName}" untuk ${member.fullName} (${member.regencyName})`
    );

    // Send notification to the member
    this.addNotification(
      member.userId,
      'Keahlian Telah Disetujui & Masuk Talent Pool',
      `Selamat! Keahlian "${member.skills[skillIdx].skillName}" Anda telah disetujui dan diverifikasi oleh ${user.name} (${user.role}). Profil Anda kini tampil resmi di Direktori Keahlian & Talent Pool Pariwisata.`,
      'SUCCESS',
      '/skills'
    );

    this.notify('UPDATE_MEMBER_SKILLS', member);
    return member;
  }

  public rejectOrDeleteMemberSkill(
    memberId: string,
    skillId: string,
    user: CurrentUser,
    reason: string = 'Keahlian belum memenuhi kriteria portofolio atau dihapus'
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const removedSkill = (member.skills || []).find(s => s.id === skillId);
    member.skills = (member.skills || []).filter(s => s.id !== skillId);

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    this.addAuditLog(
      user.id,
      user.name,
      user.role,
      'DELETE_MEMBER_SKILL',
      'MEMBER',
      member.id,
      `${user.name} (${user.role}) menghapus/menolak keahlian "${removedSkill?.skillName || skillId}" milik ${member.fullName}. Catatan: ${reason}`
    );

    this.notify('UPDATE_MEMBER_SKILLS', member);
    return member;
  }

  public addMemberSkill(
    memberId: string,
    skillData: Omit<MemberSkill, 'id'>,
    user: CurrentUser,
    autoApprove?: boolean
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const newSkill: MemberSkill = {
      ...skillData,
      id: `skill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isVerified: autoApprove !== undefined ? autoApprove : (user.role !== 'MEMBER' && user.role !== 'PUBLIC'),
      verifiedBy: autoApprove || (user.role !== 'MEMBER' && user.role !== 'PUBLIC') ? user.name : undefined,
      verifiedAt: autoApprove || (user.role !== 'MEMBER' && user.role !== 'PUBLIC') ? new Date().toISOString() : undefined
    };

    if (!member.skills) {
      member.skills = [];
    }
    member.skills.push(newSkill);

    // If certification is provided, also sync to certifications array
    if (newSkill.certificateNumber) {
      if (!member.certifications) member.certifications = [];
      member.certifications.push({
        id: `cert-${Date.now()}`,
        memberId: member.id,
        name: newSkill.certificateIssuer ? `${newSkill.skillName} (${newSkill.certificateIssuer})` : newSkill.skillName,
        certNumber: newSkill.certificateNumber,
        issuer: newSkill.certificateIssuer || 'BNSP / Lembaga Sertifikasi Profesi',
        issueDate: new Date().toISOString().split('T')[0],
        fileUrl: newSkill.certificateFileUrl,
        isVerified: newSkill.isVerified
      });
    }

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    this.addAuditLog(
      user.id,
      user.name,
      user.role,
      'ADD_MEMBER_SKILL',
      'MEMBER',
      member.id,
      `${user.name} (${user.role}) menambahkan keahlian "${newSkill.skillName}" (${newSkill.proficiency}) untuk ${member.fullName}`
    );

    this.notify('UPDATE_MEMBER_SKILLS', member);
    return member;
  }

  // --- Members & Generator ---
  public getMembers(): Member[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    } catch {
      return [];
    }
  }

  public addOrUpdateMember(member: Member): Member {
    const members = this.getMembers();
    const idx = members.findIndex(m => 
      m.id === member.id || 
      (m.nationalMemberNumber && member.nationalMemberNumber && m.nationalMemberNumber === member.nationalMemberNumber)
    );

    if (idx !== -1) {
      members[idx] = { ...members[idx], ...member };
    } else {
      members.unshift(member);
    }

    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify('UPDATE_MEMBER', member);
    return member;
  }

  public getMemberById(id: string): Member | undefined {
    return this.getMembers().find(m => m.id === id);
  }

  public getMemberByVerificationToken(token: string): Member | undefined {
    return this.getMembers().find(m => m.verificationToken === token || m.nationalMemberNumber === token);
  }

  public generateNationalMemberNumber(provinceCode: string, regencyCode: string, districtCode: string): string {
    const members = this.getMembers();
    // Prefix: PP.KK.KC
    // Find highest sequence for this prefix
    const p = provinceCode.padStart(2, '0');
    const k = regencyCode.split('.').pop()?.padStart(2, '0') || '01';
    const d = districtCode.split('.').pop()?.padStart(2, '0') || '01';
    const prefix = `${p}.${k}.${d}`;
    
    let maxSeq = 0;
    members.forEach(m => {
      if (m.nationalMemberNumber && m.nationalMemberNumber.startsWith(prefix)) {
        const parts = m.nationalMemberNumber.split('.');
        if (parts.length === 4) {
          const seq = parseInt(parts[3], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });

    const nextSeq = (maxSeq + 1).toString().padStart(6, '0');
    return `${prefix}.${nextSeq}`;
  }

  public deleteMember(memberId: string, adminUser: CurrentUser, reason: string = 'Penghapusan data anggota oleh Super Admin'): boolean {
    const members = this.getMembers();
    const target = members.find(m => m.id === memberId);
    if (!target) return false;

    // Filter out the member
    const updatedMembers = members.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updatedMembers));

    // Also remove from USERS list if tied to this member
    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.memberId !== memberId && u.id !== target.userId && u.email !== target.email);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Add Audit Log
    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'DELETE_MEMBER',
      'MEMBER',
      memberId,
      `Super Admin menghapus data keanggotaan ${target.fullName} (${target.nationalMemberNumber || 'Belum ada NTA'}). Alasan: ${reason}`
    );

    this.notify('DELETE_MEMBER', { memberId, member: target });
    return true;
  }

  public deleteAllDummyMembers(adminUser: CurrentUser): number {
    const members = this.getMembers();
    const initialCount = members.length;
    
    // Clear all members or keep only user-created ones
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));

    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'DELETE_ALL_MEMBERS',
      'MEMBER',
      'ALL',
      `Super Admin membersihkan ${initialCount} data anggota dummy dari database.`
    );

    this.notify();
    return initialCount;
  }

  public registerMember(payload: Omit<Member, 'id' | 'status' | 'registeredAt' | 'verificationToken' | 'locationHistory'>): Member {
    const members = this.getMembers();

    // Pencegahan Data Ganda: Cek apakah data anggota dengan NIK / Email / Nama+No.Telp yang sama sudah ada
    const existingIdx = members.findIndex(m => {
      const emailMatch = payload.email && m.email && m.email.toLowerCase().trim() === payload.email.toLowerCase().trim();
      const nikMatch = payload.nikMasked && !payload.nikMasked.includes('********') && m.nikMasked === payload.nikMasked;
      const namePhoneMatch = payload.fullName && payload.phone && 
        m.fullName.toLowerCase().trim() === payload.fullName.toLowerCase().trim() && 
        m.phone.replace(/[^0-9]/g, '') === payload.phone.replace(/[^0-9]/g, '');
      return emailMatch || nikMatch || namePhoneMatch;
    });

    if (existingIdx !== -1) {
      // Jika sudah ada, perbarui data yang ada tanpa menduplikasi baris database
      const existing = members[existingIdx];
      const updated: Member = {
        ...existing,
        ...payload,
        id: existing.id,
        status: existing.status,
        registeredAt: existing.registeredAt,
        verificationToken: existing.verificationToken,
        locationHistory: existing.locationHistory || []
      };
      members[existingIdx] = updated;
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      this.notify();
      return updated;
    }

    const newId = `member-${Date.now()}`;
    const token = `VERIFY-SP-${payload.provinceId}${payload.regencyId.replace('.', '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const newMember: Member = {
      ...payload,
      id: newId,
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
      verificationToken: token,
      locationHistory: [],
      skills: payload.skills || [],
      certifications: payload.certifications || []
    };

    members.unshift(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, 'REGISTER_MEMBER', 'MEMBER', newId, `Pendaftaran anggota baru: ${newMember.fullName}`);
    
    this.addNotification(
      'user-admin-nasional',
      'Pendaftaran Anggota Baru',
      `${newMember.fullName} telah mendaftar di ${newMember.branchName} dan menunggu verifikasi.`,
      'INFO',
      '/members'
    );

    this.notify('REGISTER_MEMBER', newMember);
    return newMember;
  }

  public updateMemberStatus(
    memberId: string, 
    status: MemberStatus, 
    verifierName: string, 
    rejectionReason?: string
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    member.status = status;
    
    if (status === 'ACTIVE') {
      if (!member.nationalMemberNumber) {
        // Generate permanent National Member Number
        member.nationalMemberNumber = this.generateNationalMemberNumber(
          member.provinceId,
          member.regencyId,
          member.districtId
        );
      }
      member.verifiedAt = new Date().toISOString();
      member.verifiedBy = verifierName;
      member.rejectionReason = undefined;
      
      this.addNotification(
        member.userId,
        'Selamat! Keanggotaan Disetujui',
        `Selamat, pendaftaran Anda di Saka Pariwisata telah disetujui dengan No. Anggota: ${member.nationalMemberNumber}. KTA Digital Anda sudah aktif!`,
        'SUCCESS',
        '/my-card'
      );
    } else if (status === 'REVISION_REQUIRED' || status === 'SUSPENDED') {
      member.rejectionReason = rejectionReason || 'Memerlukan perbaikan dokumen/data.';
      this.addNotification(
        member.userId,
        'Status Keanggotaan Diperbarui',
        `Status pendaftaran Anda memerlukan perhatian: ${member.rejectionReason}`,
        'WARNING',
        '/profile'
      );
    }

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, `MEMBER_STATUS_${status}`, 'MEMBER', memberId, `Mengubah status anggota ${member.fullName} menjadi ${status}`);

    this.notify('UPDATE_MEMBER_STATUS', member);
    return member;
  }

  public approveMember(memberId: string, verifierName?: string): Member | null {
    return this.updateMemberStatus(memberId, 'ACTIVE', verifierName || 'Admin Saka Pariwisata');
  }

  public transferMemberLocation(
    memberId: string,
    newBranch: Branch,
    newDistrict: District,
    newRegency: Regency,
    newProvince: Province,
    reason: string,
    authorizedBy: string
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    const prevBranch = member.branchName;
    const prevNum = member.nationalMemberNumber || '-';

    // Update location
    member.provinceId = newProvince.id;
    member.provinceName = newProvince.name;
    member.regencyId = newRegency.id;
    member.regencyName = newRegency.name;
    member.districtId = newDistrict.id;
    member.districtName = newDistrict.name;
    member.branchId = newBranch.id;
    member.branchName = newBranch.name;

    // Generate new formatted number if active
    const newNum = this.generateNationalMemberNumber(newProvince.code, newRegency.code, newDistrict.code);
    member.nationalMemberNumber = newNum;

    // Append to location history
    member.locationHistory.unshift({
      id: `loc-${Date.now()}`,
      memberId: member.id,
      prevBranchName: prevBranch,
      newBranchName: newBranch.name,
      prevMemberNumber: prevNum,
      newMemberNumber: newNum,
      transferDate: new Date().toISOString().split('T')[0],
      reason,
      authorizedByName: authorizedBy
    });

    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, 'MEMBER_LOCATION_TRANSFER', 'MEMBER', memberId, `Memindahkan anggota ${member.fullName} dari ${prevBranch} ke ${newBranch.name}`);

    this.notify('TRANSFER_MEMBER', member);
    return member;
  }

  public updateMemberProfile(member: Member) {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      members[idx] = member;
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

      // Synchronize current logged in user if it matches this member
      const currentUser = this.getCurrentUser();
      if (
        currentUser.memberId === member.id ||
        currentUser.id === member.userId ||
        currentUser.name.toLowerCase().trim() === member.fullName.toLowerCase().trim() ||
        (currentUser.email && member.email && currentUser.email.toLowerCase().trim() === member.email.toLowerCase().trim())
      ) {
        currentUser.name = member.fullName;
        if (member.avatarUrl) currentUser.avatarUrl = member.avatarUrl;
        currentUser.memberId = member.id;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }

      this.notify('UPDATE_MEMBER_PROFILE', member);
    }
  }

  public adminUpdateMember(
    memberId: string, 
    updatedData: Partial<Member>, 
    adminUser: CurrentUser, 
    reason: string = 'Koreksi data profil dan domisili oleh Administrator'
  ): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const prevMember = members[idx];
    const prevBranch = prevMember.branchName;
    const prevProvince = prevMember.provinceName;
    const prevRegency = prevMember.regencyName;
    const prevFullName = prevMember.fullName;
    const prevNta = prevMember.nationalMemberNumber;

    // Detect if location / domicile changed
    const isDomicileChanged = 
      (updatedData.provinceId && updatedData.provinceId !== prevMember.provinceId) ||
      (updatedData.regencyId && updatedData.regencyId !== prevMember.regencyId) ||
      (updatedData.districtId && updatedData.districtId !== prevMember.districtId) ||
      (updatedData.branchId && updatedData.branchId !== prevMember.branchId);

    const locationHistory = [...(prevMember.locationHistory || [])];

    if (isDomicileChanged) {
      locationHistory.unshift({
        id: `loc-${Date.now()}`,
        memberId: prevMember.id,
        prevBranchName: `${prevProvince} / ${prevRegency} / ${prevBranch}`,
        newBranchName: `${updatedData.provinceName || prevMember.provinceName} / ${updatedData.regencyName || prevMember.regencyName} / ${updatedData.branchName || prevMember.branchName}`,
        prevMemberNumber: prevNta || '-',
        newMemberNumber: updatedData.nationalMemberNumber || prevNta || '-',
        transferDate: new Date().toISOString().split('T')[0],
        reason: reason || 'Perubahan dan pembaruan domisili oleh Admin',
        authorizedByName: `${adminUser.name} (${adminUser.role})`
      });
    }

    const updatedMember: Member = {
      ...prevMember,
      ...updatedData,
      locationHistory
    };

    members[idx] = updatedMember;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Synchronize current logged in user if it matches this member
    const currentUser = this.getCurrentUser();
    if (currentUser.memberId === memberId || currentUser.id === prevMember.userId) {
      currentUser.name = updatedMember.fullName;
      if (updatedMember.avatarUrl) currentUser.avatarUrl = updatedMember.avatarUrl;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    }

    // Detail audit changes
    const changes: string[] = [];
    if (updatedMember.fullName !== prevFullName) {
      changes.push(`Nama/Gelar: "${prevFullName}" -> "${updatedMember.fullName}"`);
    }
    if (isDomicileChanged) {
      changes.push(`Domisili/Kwartir: "${prevBranch}" -> "${updatedMember.branchName}"`);
    }
    if (updatedMember.krida !== prevMember.krida) {
      changes.push(`Krida: "${prevMember.krida}" -> "${updatedMember.krida}"`);
    }
    if (updatedMember.status !== prevMember.status) {
      changes.push(`Status: "${prevMember.status}" -> "${updatedMember.status}"`);
    }
    if (updatedMember.gugusDepan !== prevMember.gugusDepan) {
      changes.push(`Gudep: "${prevMember.gugusDepan}" -> "${updatedMember.gugusDepan}"`);
    }

    const auditDetail = changes.length > 0 
      ? `Perbaikan data anggota ${updatedMember.fullName}: ${changes.join('; ')}. Catatan: ${reason}`
      : `Pembaruan data profil anggota ${updatedMember.fullName}. Catatan: ${reason}`;

    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'ADMIN_EDIT_MEMBER',
      'MEMBER',
      memberId,
      auditDetail
    );

    // Send in-app notification to the member
    this.addNotification(
      updatedMember.userId,
      'Profil & Data Anggota Diperbarui',
      `Data profil & KTA Anda telah diperbaiki/disesuaikan oleh Admin (${adminUser.name}). Catatan: ${reason}`,
      'INFO',
      '/my-card'
    );

    this.notify('ADMIN_UPDATE_MEMBER', updatedMember);
    return updatedMember;
  }

  public updateMemberPhoto(memberId: string, photoUrl: string, adminUser: CurrentUser): Member | null {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return null;

    const member = members[idx];
    member.avatarUrl = photoUrl;
    members[idx] = member;
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    // Synchronize current logged in user avatar if it matches this member
    const currentUser = this.getCurrentUser();
    if (
      currentUser.memberId === memberId || 
      currentUser.id === member.userId || 
      currentUser.name.toLowerCase().trim() === member.fullName.toLowerCase().trim() ||
      (currentUser.email && member.email && currentUser.email.toLowerCase().trim() === member.email.toLowerCase().trim())
    ) {
      currentUser.avatarUrl = photoUrl;
      currentUser.memberId = member.id;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    }

    // Add Audit Log entry
    this.addAuditLog(
      adminUser.id,
      adminUser.name,
      adminUser.role,
      'UPDATE_MEMBER_PHOTO',
      'MEMBER',
      memberId,
      `Memperbaiki dan memperbarui pas foto resmi KTA & profil anggota: ${member.fullName}`
    );

    // Send in-app notification to the member
    const isSelf = adminUser.id === member.userId || adminUser.memberId === memberId;
    this.addNotification(
      member.userId,
      'Pas Foto KTA Diperbarui',
      isSelf 
        ? 'Pas foto resmi KTA dan profil Anda berhasil diperbarui.' 
        : `Pas foto resmi profil dan KTA Digital Anda telah diperbarui oleh Administrator (${adminUser.name}).`,
      'INFO',
      '/my-card'
    );

    this.notify('UPDATE_MEMBER_PHOTO', member);
    return member;
  }

  // --- Tour Packages ---
  public getTourPackages(): TourPackage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(INITIAL_TOUR_PACKAGES));
      return INITIAL_TOUR_PACKAGES;
    } catch {
      return [];
    }
  }

  public getTourPackageBySlug(slug: string): TourPackage | undefined {
    return this.getTourPackages().find(t => t.slug === slug);
  }

  public createTourPackage(payload: Omit<TourPackage, 'id' | 'slug' | 'submittedAt' | 'viewsCount' | 'status'>): TourPackage {
    const tours = this.getTourPackages();

    // Pencegahan Data Ganda: Cek jika paket yang sama baru diajukan oleh pemilik yang sama
    const recentDup = tours.find(t => 
      t.title.toLowerCase().trim() === payload.title.toLowerCase().trim() &&
      t.ownerName.toLowerCase().trim() === payload.ownerName.toLowerCase().trim() &&
      (Date.now() - new Date(t.submittedAt).getTime() < 15000)
    );
    if (recentDup) {
      return recentDup;
    }

    const newId = `tour-${Date.now()}`;
    const slug = (payload.title || 'paket-wisata')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Math.random().toString(36).substring(2, 6)}`;

    const newTour: TourPackage = {
      ...payload,
      id: newId,
      slug,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      viewsCount: 1,
      featured: false
    };

    tours.unshift(newTour);
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, 'CREATE_TOUR_PACKAGE', 'TOUR_PACKAGE', newId, `Membuat & mengajukan paket wisata: ${newTour.title}`);

    this.addNotification(
      'user-admin-nasional',
      'Paket Wisata Baru Diajukan',
      `Paket wisata "${newTour.title}" oleh ${newTour.ownerName} menunggu moderasi.`,
      'ALERT',
      '/tours'
    );

    this.notify('CREATE_TOUR', newTour);
    return newTour;
  }

  public updateTourPackage(tourId: string, payload: Partial<TourPackage>, user?: CurrentUser): TourPackage | null {
    const tours = this.getTourPackages();
    const idx = tours.findIndex(t => t.id === tourId);
    if (idx === -1) return null;

    const existing = tours[idx];
    const updated: TourPackage = {
      ...existing,
      ...payload,
      id: existing.id // protect ID
    };

    tours[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE_TOUR_PACKAGE',
      'TOUR_PACKAGE',
      tourId,
      `Pembaruan data paket wisata "${updated.title}" oleh ${currentUser.name}`
    );

    this.notify('UPDATE_TOUR', updated);
    return updated;
  }

  public moderateTourPackage(tourId: string, status: TourStatus, reviewerName: string, rejectionReason?: string) {
    const tours = this.getTourPackages();
    const idx = tours.findIndex(t => t.id === tourId);
    if (idx === -1) return;

    tours[idx].status = status;
    tours[idx].reviewedBy = reviewerName;
    if (status === 'APPROVED_PUBLISHED') {
      tours[idx].publishedAt = new Date().toISOString();
      tours[idx].rejectionReason = undefined;
    } else if (status === 'REJECTED') {
      tours[idx].rejectionReason = rejectionReason;
    }

    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, `TOUR_MODERATED_${status}`, 'TOUR_PACKAGE', tourId, `Moderasi paket wisata "${tours[idx].title}" menjadi ${status}`);

    this.notify('UPDATE_TOUR', tours[idx]);
  }

  public updateTourStatus(tourId: string, status: TourStatus, reviewerName?: string, rejectionReason?: string) {
    const reviewer = reviewerName || this.getCurrentUser().name;
    this.moderateTourPackage(tourId, status, reviewer, rejectionReason);
  }

  public deleteTourPackage(tourId: string, user?: CurrentUser): boolean {
    const tours = this.getTourPackages();
    const target = tours.find(t => t.id === tourId);
    if (!target) return false;

    const filtered = tours.filter(t => t.id !== tourId);
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(filtered));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_TOUR_PACKAGE',
      'TOUR_PACKAGE',
      tourId,
      `Menghapus paket wisata: "${target.title}"`
    );

    this.notify('DELETE_TOUR', { tourId, tour: target });
    return true;
  }

  public deleteAllDummyTours(user?: CurrentUser): number {
    const tours = this.getTourPackages();
    const count = tours.length;
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify([]));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_ALL_TOURS',
      'TOUR_PACKAGE',
      'ALL',
      `Super Admin membersihkan ${count} paket wisata dummy dari database.`
    );

    this.notify();
    return count;
  }

  // --- Activities ---
  public getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
      return INITIAL_ACTIVITIES;
    } catch {
      return [];
    }
  }

  public addActivity(activityData: Partial<Activity>): Activity {
    const activities = this.getActivities();
    const currentUser = this.getCurrentUser();
    
    // Pencegahan Data Ganda: Cek jika agenda kegiatan identik baru dibuat dalam 15 detik terakhir
    const recentDup = activities.find(a => 
      a.title.toLowerCase().trim() === (activityData.title || '').toLowerCase().trim() &&
      a.startDate === activityData.startDate &&
      (Date.now() - new Date(a.uploadedAt).getTime() < 15000)
    );
    if (recentDup) {
      return recentDup;
    }
    
    // Strict Scope & Territorial Validation Rules:
    // 1. Only SUPER_ADMIN can create INTERNASIONAL or NASIONAL scale events
    // 2. Operators can only register events within their territory and permitted scale
    let allowedLevel: 'INTERNASIONAL' | 'NASIONAL' | 'PROVINSI' | 'KABUPATEN' | 'RANTING' = 
      activityData.organizerLevel || 'PROVINSI';

    let enforcedProvinceId = activityData.provinceId || '32';
    let enforcedProvinceName = activityData.provinceName || 'Jawa Barat';
    let enforcedRegencyId = activityData.regencyId || '';
    let enforcedRegencyName = activityData.regencyName || '';
    let enforcedScope = activityData.scope || 'Terbuka untuk Kader Saka Pariwisata';

    if (currentUser.role === 'SUPER_ADMIN') {
      allowedLevel = activityData.organizerLevel || 'NASIONAL';
      enforcedProvinceId = activityData.provinceId || '32';
      enforcedProvinceName = activityData.provinceName || 'Jawa Barat';
      enforcedRegencyId = activityData.regencyId || '';
      enforcedRegencyName = activityData.regencyName || '';
      enforcedScope = activityData.scope || (allowedLevel === 'INTERNASIONAL' ? 'Skala Internasional' : 'Skala Nasional');
    } else if (currentUser.role === 'ADMIN_PROVINCE') {
      // Province Operator: Cannot make NASIONAL / INTERNASIONAL
      if (allowedLevel === 'NASIONAL' || allowedLevel === 'INTERNASIONAL') {
        allowedLevel = 'PROVINSI';
      }
      // Lock province to operator's territory
      const opProvId = currentUser.jurisdictionId || '32';
      enforcedProvinceId = opProvId;
      const provObj = this.getProvinces().find(p => p.id === opProvId);
      enforcedProvinceName = provObj ? provObj.name : (currentUser.jurisdictionName?.replace('Kwarda ', '') || 'Jawa Barat');
      enforcedScope = `Wilayah Kwarda ${enforcedProvinceName}`;
    } else if (currentUser.role === 'ADMIN_REGENCY') {
      // Regency Operator: Cannot make NASIONAL / INTERNASIONAL / PROVINSI
      if (allowedLevel === 'NASIONAL' || allowedLevel === 'INTERNASIONAL' || allowedLevel === 'PROVINSI') {
        allowedLevel = 'KABUPATEN';
      }
      const opRegId = currentUser.jurisdictionId || '32.04';
      enforcedRegencyId = opRegId;
      // Derive province from regency code
      const provCode = opRegId.split('.')[0] || '32';
      enforcedProvinceId = provCode;
      const provObj = this.getProvinces().find(p => p.id === provCode);
      enforcedProvinceName = provObj ? provObj.name : 'Jawa Barat';
      enforcedRegencyName = currentUser.jurisdictionName?.replace('Kwarcab ', '') || 'Kabupaten Bandung';
      enforcedScope = `Wilayah Kwarcab ${enforcedRegencyName}`;
    } else if (currentUser.role === 'ADMIN_BRANCH') {
      allowedLevel = 'RANTING';
      enforcedProvinceId = '32';
      enforcedProvinceName = 'Jawa Barat';
      enforcedRegencyId = '32.04';
      enforcedRegencyName = 'Kabupaten Bandung';
      enforcedScope = `Wilayah ${currentUser.jurisdictionName || 'Kwarran Ciwidey'}`;
    }

    const newActivity: Activity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: activityData.title || 'Agenda Saka Pariwisata',
      slug: (activityData.title || 'agenda').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: activityData.description || '',
      bannerUrl: activityData.bannerUrl || activityData.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      coverImage: activityData.coverImage || activityData.bannerUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      category: activityData.category || 'Perkemahan & Kemah Bakti',
      organizerLevel: allowedLevel,
      organizerName: activityData.organizerName || (currentUser.role === 'SUPER_ADMIN' ? 'Kwartir Nasional Gerakan Pramuka' : `Pimpinan Saka Pariwisata ${currentUser.jurisdictionName || ''}`),
      locationName: activityData.locationName || 'Lokasi Kegiatan',
      locationAddress: activityData.locationAddress || '',
      provinceId: enforcedProvinceId,
      provinceName: enforcedProvinceName,
      regencyId: enforcedRegencyId,
      regencyName: enforcedRegencyName,
      scope: enforcedScope,
      startDate: activityData.startDate || new Date().toISOString().split('T')[0],
      endDate: activityData.endDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeString: activityData.timeString || '08:00 WIB - Selesai',
      capacity: activityData.capacity || 100,
      maxParticipants: activityData.capacity || 100,
      registeredCount: 0,
      isPublic: activityData.isPublic ?? true,
      status: activityData.status || 'OPEN_REGISTRATION',
      requirements: activityData.requirements || [
        'Anggota Aktif Saka Pariwisata atau Pramuka Penegak/Pandega',
        'Memiliki KTA Digital Terverifikasi',
        'Membawa perlengkapan kegiatan ramah lingkungan'
      ],
      contactPerson: activityData.contactPerson || currentUser.name,
      contactPhone: activityData.contactPhone || '081299881122',
      contactEmail: activityData.contactEmail || currentUser.email,
      feeType: activityData.feeType || 'GRATIS',
      feeAmount: activityData.feeAmount || 0,
      uploadedByRole: currentUser.role as any,
      uploadedByName: `${currentUser.name} (${currentUser.role === 'SUPER_ADMIN' ? 'Super Admin Kwarnas' : 'Operator ' + (currentUser.jurisdictionName || 'Kwartir')})`,
      uploadedAt: new Date().toISOString(),
      registrationLink: activityData.registrationLink || '',
      featured: activityData.featured ?? (allowedLevel === 'NASIONAL' || allowedLevel === 'INTERNASIONAL')
    };

    activities.unshift(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));

    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'CREATE_ACTIVITY',
      'ACTIVITY',
      newActivity.id,
      `Mengunggah agenda kegiatan baru: "${newActivity.title}" (Skala: ${newActivity.organizerLevel} - ${newActivity.provinceName})`
    );

    this.notify('CREATE_ACTIVITY', newActivity);
    return newActivity;
  }

  public updateActivity(activityId: string, updates: Partial<Activity>): Activity | null {
    const activities = this.getActivities();
    const idx = activities.findIndex(a => a.id === activityId);
    if (idx === -1) return null;

    const currentUser = this.getCurrentUser();

    // Prevent non-superadmin from escalating level to NASIONAL or INTERNASIONAL
    let updatedLevel = updates.organizerLevel || activities[idx].organizerLevel;
    if (currentUser.role !== 'SUPER_ADMIN' && (updatedLevel === 'NASIONAL' || updatedLevel === 'INTERNASIONAL')) {
      updatedLevel = activities[idx].organizerLevel === 'NASIONAL' || activities[idx].organizerLevel === 'INTERNASIONAL' 
        ? 'PROVINSI' 
        : activities[idx].organizerLevel;
    }

    activities[idx] = {
      ...activities[idx],
      ...updates,
      organizerLevel: updatedLevel
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));

    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE_ACTIVITY',
      'ACTIVITY',
      activityId,
      `Memperbarui agenda kegiatan: "${activities[idx].title}"`
    );

    this.notify('UPDATE_ACTIVITY', activities[idx]);
    return activities[idx];
  }

  public deleteActivity(activityId: string, user?: CurrentUser): boolean {
    const activities = this.getActivities();
    const act = activities.find(a => a.id === activityId);
    if (!act) return false;

    const filtered = activities.filter(a => a.id !== activityId);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(filtered));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_ACTIVITY',
      'ACTIVITY',
      activityId,
      `Menghapus agenda kegiatan: "${act.title}"`
    );

    this.notify('DELETE_ACTIVITY', { activityId, activity: act });
    return true;
  }

  public registerForActivity(activityId: string, member: Member): boolean {
    const activities = this.getActivities();
    const act = activities.find(a => a.id === activityId);
    if (!act) return false;

    act.registeredCount += 1;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));

    this.addNotification(
      member.userId,
      'Pendaftaran Kegiatan Berhasil',
      `Anda telah terdaftar pada "${act.title}". Simpan barcode kehadiran di aplikasi.`,
      'SUCCESS',
      '/activities'
    );

    const user = this.getCurrentUser();
    this.addAuditLog(user.id, user.name, user.role, 'REGISTER_ACTIVITY', 'ACTIVITY', activityId, `Mendaftar kegiatan: ${act.title}`);

    this.notify();
    return true;
  }

  // --- Notifications & Audit ---
  public getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public markNotificationAsRead(id: string) {
    const notifs = this.getNotifications();
    const n = notifs.find(item => item.id === id);
    if (n) {
      n.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify();
    }
  }

  public addNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT', actionUrl?: string) {
    const notifs = this.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      isRead: false,
      actionUrl
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  public getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  public addAuditLog(userId: string, userName: string, userRole: any, action: string, entityType: any, entityId: string, description: string) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      description,
      timestamp: new Date().toISOString(),
      ipAddress: '180.252.164.12'
    });
    // Keep max 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  public getKtaSettings(): KtaCardSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KTA_SETTINGS);
      if (!data) return DEFAULT_KTA_SETTINGS;
      const parsed = JSON.parse(data);
      if (parsed.bgOpacity === 0.90 || parsed.bgOpacity === undefined) {
        parsed.bgOpacity = 0.10;
      }
      return { ...DEFAULT_KTA_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_KTA_SETTINGS;
    }
  }

  public updateKtaSettings(settings: Partial<KtaCardSettings>, updatedBy?: string): KtaCardSettings {
    const current = this.getKtaSettings();
    const updated: KtaCardSettings = {
      ...current,
      ...settings,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'Administrator'
    };
    localStorage.setItem(STORAGE_KEYS.KTA_SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public resetKtaSettings(updatedBy?: string): KtaCardSettings {
    const reset = {
      ...DEFAULT_KTA_SETTINGS,
      lastUpdated: new Date().toISOString(),
      updatedBy: updatedBy || 'Administrator'
    };
    localStorage.setItem(STORAGE_KEYS.KTA_SETTINGS, JSON.stringify(reset));
    this.notify();
    return reset;
  }

  // --- Kuliner & Cinderamata Khas Daerah (Kwarran Input) ---
  public getCulinarySouvenirs(): CulinarySouvenirItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CULINARY_SOUVENIRS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(INITIAL_CULINARY_SOUVENIRS));
      return INITIAL_CULINARY_SOUVENIRS;
    } catch {
      return [];
    }
  }

  public addCulinarySouvenir(
    item: Omit<CulinarySouvenirItem, 'id' | 'createdAt' | 'likesCount'>,
    currentUser: CurrentUser
  ): CulinarySouvenirItem {
    const items = this.getCulinarySouvenirs();

    // Pencegahan Data Ganda: Cek jika produk identik dari kreator yang sama baru ditambahkan dalam 15 detik terakhir
    const recentDup = items.find(i => 
      i.name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
      i.authorMemberId === item.authorMemberId &&
      (Date.now() - new Date(i.createdAt).getTime() < 15000)
    );
    if (recentDup) {
      return recentDup;
    }

    // Jika Super Admin atau Admin yang membuat, bisa langsung APPROVED, jika Member atau publik, PENDING_APPROVAL
    const isAutoApprove = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);
    const status: ProductModerationStatus = item.status || (isAutoApprove ? 'APPROVED' : 'PENDING_APPROVAL');

    const newItem: CulinarySouvenirItem = {
      ...item,
      id: `cs-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      status,
      submittedAt: new Date().toISOString(),
      approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined,
      approvedBy: status === 'APPROVED' ? currentUser.name : undefined,
      approverRole: status === 'APPROVED' ? currentUser.role : undefined
    };

    items.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));

    // Add Audit Log
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'CREATE_CULINARY_SOUVENIR',
      'CULINARY_SOUVENIR',
      newItem.id,
      `Pengajuan produk/jasa 4 Krida "${newItem.name}" (${newItem.krida}) di ${newItem.districtName || 'Kwarran'}, ${newItem.regencyName || 'Kwarcab'} (Status: ${status})`
    );

    // Add Notification untuk Operator Wilayah / Super Admin
    this.addNotification(
      'user-superadmin-rohadi',
      `Pengajuan Produk Krida Baru: ${newItem.name}`,
      `Anggota ${currentUser.name} mengajukan produk/karya (${newItem.krida}) dari ${newItem.districtName || 'Kwarran'}. Memerlukan peninjauan operator.`,
      status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
      '/dashboard'
    );

    this.notify('CREATE_CULINARY', newItem);
    return newItem;
  }

  public approveCulinarySouvenir(id: string, approver: CurrentUser): CulinarySouvenirItem | null {
    const items = this.getCulinarySouvenirs();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const item = items[idx];
    item.status = 'APPROVED';
    item.approvedAt = new Date().toISOString();
    item.approvedBy = approver.name;
    item.approverRole = approver.role;
    item.rejectionReason = undefined;

    items[idx] = item;
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));

    this.addAuditLog(
      approver.id,
      approver.name,
      approver.role,
      'APPROVE_CULINARY_SOUVENIR',
      'CULINARY_SOUVENIR',
      id,
      `Operator ${approver.name} (${approver.jurisdictionName || approver.role}) menyetujui tayang produk "${item.name}" di galeri publik.`
    );

    this.addNotification(
      item.authorMemberId,
      `Produk Anda Disetujui: ${item.name}`,
      `Karya/produk "${item.name}" Anda telah diverifikasi dan disetujui oleh Operator Wilayah (${approver.name}). Kini tampil di galeri publik.`,
      'SUCCESS',
      '/dashboard'
    );

    this.notify('UPDATE_CULINARY', item);
    return item;
  }

  public rejectCulinarySouvenir(id: string, reason: string, approver: CurrentUser): CulinarySouvenirItem | null {
    const items = this.getCulinarySouvenirs();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const item = items[idx];
    item.status = 'REJECTED';
    item.rejectionReason = reason;
    item.approvedAt = undefined;
    item.approvedBy = approver.name;
    item.approverRole = approver.role;

    items[idx] = item;
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));

    this.addAuditLog(
      approver.id,
      approver.name,
      approver.role,
      'REJECT_CULINARY_SOUVENIR',
      'CULINARY_SOUVENIR',
      id,
      `Operator ${approver.name} menolak produk "${item.name}". Alasan: ${reason}`
    );

    this.addNotification(
      item.authorMemberId,
      `Pengajuan Produk Perlu Perbaikan: ${item.name}`,
      `Pengajuan produk "${item.name}" ditolak dengan catatan: "${reason}". Silakan perbaiki dan ajukan kembali.`,
      'ALERT',
      '/dashboard'
    );

    this.notify('UPDATE_CULINARY', item);
    return item;
  }

  public updateCulinarySouvenir(
    id: string,
    updates: Partial<CulinarySouvenirItem>,
    currentUser: CurrentUser
  ): CulinarySouvenirItem | null {
    const items = this.getCulinarySouvenirs();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const existing = items[idx];
    const updated: CulinarySouvenirItem = {
      ...existing,
      ...updates
    };

    items[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));

    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE_CULINARY_SOUVENIR',
      'CULINARY_SOUVENIR',
      id,
      `Pembaruan data produk "${updated.name}" oleh ${currentUser.name}`
    );

    this.notify('UPDATE_CULINARY', updated);
    return updated;
  }

  public deleteCulinarySouvenir(id: string, currentUser: CurrentUser): boolean {
    const items = this.getCulinarySouvenirs();
    const target = items.find(i => i.id === id);
    if (!target) return false;

    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(filtered));

    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_CULINARY_SOUVENIR',
      'CULINARY_SOUVENIR',
      id,
      `Penghapusan data ${target.kind} "${target.name}" oleh ${currentUser.name}`
    );

    this.notify('DELETE_CULINARY', { id, item: target });
    return true;
  }

  public likeCulinarySouvenir(id: string): number {
    const items = this.getCulinarySouvenirs();
    const target = items.find(i => i.id === id);
    if (!target) return 0;

    target.likesCount = (target.likesCount || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));
    this.notify();
    return target.likesCount;
  }

  public deleteAllDummyCulinary(user?: CurrentUser): number {
    const items = this.getCulinarySouvenirs();
    const count = items.length;
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify([]));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_ALL_CULINARY',
      'CULINARY_SOUVENIR',
      'ALL',
      `Super Admin membersihkan ${count} produk kuliner/cinderamata dummy dari database.`
    );

    this.notify();
    return count;
  }

  public deleteAllDummyActivities(user?: CurrentUser): number {
    const acts = this.getActivities();
    const count = acts.length;
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));

    const currentUser = user || this.getCurrentUser();
    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'DELETE_ALL_ACTIVITIES',
      'ACTIVITY',
      'ALL',
      `Super Admin membersihkan ${count} agenda kegiatan dummy dari database.`
    );

    this.notify();
    return count;
  }

  public clearAllDummyData(user?: CurrentUser) {
    const currentUser = user || this.getCurrentUser();
    const memCount = this.getMembers().length;
    const tourCount = this.getTourPackages().length;
    const actCount = this.getActivities().length;
    const culCount = this.getCulinarySouvenirs().length;

    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');

    this.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'CLEAR_ALL_DUMMY_DATA',
      'SYSTEM',
      'ALL',
      `Super Admin membersihkan seluruh data peraga/dummy sistem (${memCount} Anggota, ${tourCount} Paket Wisata, ${actCount} Agenda, ${culCount} Produk Krida).`
    );

    this.notify();
    return {
      members: memCount,
      tours: tourCount,
      activities: actCount,
      culinary: culCount
    };
  }

  public deduplicateDatabase(): { members: number; tours: number; culinary: number; activities: number } {
    let removedMembers = 0;
    let removedTours = 0;
    let removedCulinary = 0;
    let removedActivities = 0;

    // 1. Deduplicate Members by ID, KTA, or Email
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (raw) {
        const members: Member[] = JSON.parse(raw);
        if (Array.isArray(members)) {
          const seenIds = new Set<string>();
          const seenKta = new Set<string>();
          const seenEmails = new Set<string>();
          const cleanMembers: Member[] = [];

          for (const m of members) {
            if (!m || !m.id) continue;
            const kta = m.nationalMemberNumber ? m.nationalMemberNumber.trim() : '';
            const email = m.email ? m.email.toLowerCase().trim() : '';

            if (seenIds.has(m.id)) {
              removedMembers++;
              continue;
            }
            if (kta && kta.length > 5 && seenKta.has(kta)) {
              removedMembers++;
              continue;
            }
            if (email && seenEmails.has(email)) {
              removedMembers++;
              continue;
            }

            seenIds.add(m.id);
            if (kta && kta.length > 5) seenKta.add(kta);
            if (email) seenEmails.add(email);
            cleanMembers.push(m);
          }

          if (cleanMembers.length !== members.length) {
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(cleanMembers));
          }
        }
      }
    } catch (e) {
      console.error('Error deduplicating members:', e);
    }

    // 2. Deduplicate Tour Packages by ID or slug
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOURS);
      if (raw) {
        const tours: TourPackage[] = JSON.parse(raw);
        if (Array.isArray(tours)) {
          const seenIds = new Set<string>();
          const cleanTours: TourPackage[] = [];

          for (const t of tours) {
            if (!t || !t.id) continue;
            if (seenIds.has(t.id)) {
              removedTours++;
              continue;
            }
            seenIds.add(t.id);
            cleanTours.push(t);
          }

          if (cleanTours.length !== tours.length) {
            localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(cleanTours));
          }
        }
      }
    } catch (e) {
      console.error('Error deduplicating tours:', e);
    }

    // 3. Deduplicate Culinary Souvenirs by ID
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CULINARY_SOUVENIRS);
      if (raw) {
        const cul: CulinarySouvenirItem[] = JSON.parse(raw);
        if (Array.isArray(cul)) {
          const seenIds = new Set<string>();
          const cleanCul: CulinarySouvenirItem[] = [];

          for (const c of cul) {
            if (!c || !c.id) continue;
            if (seenIds.has(c.id)) {
              removedCulinary++;
              continue;
            }
            seenIds.add(c.id);
            cleanCul.push(c);
          }

          if (cleanCul.length !== cul.length) {
            localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(cleanCul));
          }
        }
      }
    } catch (e) {
      console.error('Error deduplicating culinary:', e);
    }

    // 4. Deduplicate Activities by ID
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (raw) {
        const acts: Activity[] = JSON.parse(raw);
        if (Array.isArray(acts)) {
          const seenIds = new Set<string>();
          const cleanActs: Activity[] = [];

          for (const a of acts) {
            if (!a || !a.id) continue;
            if (seenIds.has(a.id)) {
              removedActivities++;
              continue;
            }
            seenIds.add(a.id);
            cleanActs.push(a);
          }

          if (cleanActs.length !== acts.length) {
            localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(cleanActs));
          }
        }
      }
    } catch (e) {
      console.error('Error deduplicating activities:', e);
    }

    return {
      members: removedMembers,
      tours: removedTours,
      culinary: removedCulinary,
      activities: removedActivities
    };
  }

  public resetToDefault() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const storage = new StorageService();
