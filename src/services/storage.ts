import {
  Member,
  TourPackage,
  Activity,
  Province,
  Regency,
  District,
  Branch,
  Skill,
  AuditLog,
  CurrentUser,
  KtaCardSettings,
  CulinarySouvenirItem,
  KridaModuleItem,
  NotificationItem
} from '../types';

import {
  INITIAL_MEMBERS,
  INITIAL_TOUR_PACKAGES,
  INITIAL_ACTIVITIES,
  INITIAL_AUDIT_LOGS,
  DEFAULT_PUBLIC_USER,
  DEMO_USERS,
  MASTER_SKILLS,
  INITIAL_CULINARY_SOUVENIRS
} from '../data/initialData';

import {
  INITIAL_KRIDA_MODULES
} from '../data/kridaData';

import {
  PROVINCES_DATA,
  REGENCIES_DATA,
  getDistrictsForRegency
} from '../data/indonesiaTerritories';

const STORAGE_KEYS = {
  MEMBERS: 'saka_members',
  TOURS: 'saka_tours',
  ACTIVITIES: 'saka_activities',
  AUDIT_LOGS: 'saka_audit_logs',
  USERS: 'saka_users',
  CURRENT_USER: 'saka_current_user',
  KTA_SETTINGS: 'saka_kta_settings_v2',
  CULINARY_SOUVENIRS: 'saka_culinary_souvenirs',
  AUTH_TOKEN: 'saka_auth_token',
  NOTIFICATIONS: 'saka_notifications'
};

/**
 * Pengaturan default KTA Digital.
 *
 * Diekspor karena digunakan oleh:
 * src/components/member/KtaCardCustomizerModal.tsx
 *
 * Jangan ubah nama export ini menjadi:
 * defaultKtaSettings
 *
 * Komponen KtaCardCustomizerModal mengimpor:
 * DEFAULT_KTA_SETTINGS
 */
export const DEFAULT_KTA_SETTINGS: KtaCardSettings = {
  issueLocationDate: 'Jakarta, 14 Agustus 2026',
  signerName: 'Reza Pahlevi',
  signerTitle: 'Ketua Pimpinan Saka Pariwisata Nasional',
  barcodeCustomValue: '',
  frontValidityText: 'Masa Berlaku: Selama Menjadi Anggota',
  bgOpacity: 0.10,
  bgImageUrl: ''
};

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify([])
        );
      }

      if (!localStorage.getItem(STORAGE_KEYS.KTA_SETTINGS)) {
        localStorage.setItem(
          STORAGE_KEYS.KTA_SETTINGS,
          JSON.stringify(DEFAULT_KTA_SETTINGS)
        );
      }
    } catch (error) {
      console.error(
        'Gagal menginisialisasi pengaturan KTA:',
        error
      );
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        listenerItem => listenerItem !== listener
      );
    };
  }

  public subscribeMutation(
    listener: (event: any) => void
  ): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handler = (e: StorageEvent) => {
      if (
        e.key &&
        Object.values(STORAGE_KEYS).includes(e.key)
      ) {
        try {
          listener({
            type: e.key,
            payload: JSON.parse(e.newValue || '{}')
          });
        } catch {
          listener({
            type: e.key,
            payload: null
          });
        }
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }

  public notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.error(
          'Error pada storage listener:',
          error
        );
      }
    });
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  /** Mengambil notifikasi lokal untuk pengguna saat ini. */
  public getNotifications(userId?: string): NotificationItem[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];

      const notifications = JSON.parse(data) as NotificationItem[];
      if (!Array.isArray(notifications)) return [];

      const targetUserId = userId ?? this.getCurrentUser()?.id;
      if (!targetUserId) return notifications;

      return notifications.filter(
        notification =>
          notification.userId === targetUserId ||
          notification.userId === '*'
      );
    } catch (error) {
      console.error('Gagal membaca notifikasi:', error);
      return [];
    }
  }

  /** Menyimpan seluruh notifikasi. */
  public setNotifications(notifications: NotificationItem[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );
      this.notify();
    } catch (error) {
      console.error('Gagal menyimpan notifikasi:', error);
    }
  }

  /** Menambahkan satu notifikasi baru. */
  public addNotification(notification: NotificationItem): void {
    const notifications = this.getAllNotifications();
    this.setNotifications([notification, ...notifications]);
  }

  /** Menandai notifikasi tertentu sebagai sudah dibaca. */
  public markNotificationAsRead(id: string): boolean {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex(notification => notification.id === id);

    if (index === -1) return false;
    if (notifications[index].isRead) return true;

    notifications[index] = { ...notifications[index], isRead: true };
    this.setNotifications(notifications);
    return true;
  }

  private getAllNotifications(): NotificationItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      const notifications = JSON.parse(data);
      return Array.isArray(notifications) ? notifications : [];
    } catch (error) {
      console.error('Gagal membaca seluruh notifikasi:', error);
      return [];
    }
  }

  // =========================================================
  // MEMBERS MANAGEMENT
  // =========================================================

  public getMembers(): Member[] {
    if (typeof window === 'undefined') {
      return INITIAL_MEMBERS;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.MEMBERS
      );

      return data
        ? JSON.parse(data)
        : INITIAL_MEMBERS;
    } catch (error) {
      console.error(
        'Gagal membaca data anggota:',
        error
      );

      return INITIAL_MEMBERS;
    }
  }

  public setMembers(members: Member[]) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.MEMBERS,
        JSON.stringify(members)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan data anggota:',
        error
      );
    }
  }

  public saveMembers(members: Member[]) {
    this.setMembers(members);
  }

  /**
   * Memperbarui foto anggota dan menyinkronkannya ke profil user.
   * Foto dapat berupa data URL hasil upload lokal atau URL/Google Drive.
   */
  public updateMemberPhoto(
    memberId: string,
    avatarUrl: string,
    actor?: CurrentUser
  ): Member | null {
    if (!avatarUrl || !avatarUrl.trim()) {
      return null;
    }

    const members = this.getMembers();
    const index = members.findIndex(member => member.id === memberId);

    if (index === -1) {
      return null;
    }

    const updatedMember: Member = {
      ...members[index],
      avatarUrl: avatarUrl.trim()
    };

    members[index] = updatedMember;
    this.setMembers(members);

    // Sinkronkan foto ke akun user yang terhubung dengan anggota.
    const users = this.getUsers();
    const userIndex = users.findIndex(
      user => user.id === updatedMember.userId
    );

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        avatarUrl: updatedMember.avatarUrl
      };
      this.setUsers(users);
    }

    // Jika current user adalah pemilik akun anggota, perbarui juga sesi aktif.
    const currentUser = this.getCurrentUser();
    if (
      currentUser?.id === updatedMember.userId ||
      currentUser?.id === actor?.id
    ) {
      this.setCurrentUser({
        ...currentUser,
        avatarUrl: updatedMember.avatarUrl
      });
    }

    return updatedMember;
  }


  /**
   * Registrasi anggota baru.
   *
   * ID otomatis:
   * member-01
   * member-02
   * member-03
   * dst.
   */
  public registerMember(
    payload: Omit<
      Member,
      | 'id'
      | 'status'
      | 'registeredAt'
      | 'verificationToken'
      | 'locationHistory'
    >
  ): Member {
    const members = this.getMembers();

    let maxNumber = 0;

    members.forEach(existingMember => {
      if (
        existingMember?.id &&
        typeof existingMember.id === 'string' &&
        existingMember.id.startsWith('member-')
      ) {
        const numPart = parseInt(
          existingMember.id.replace('member-', ''),
          10
        );

        if (
          !isNaN(numPart) &&
          numPart > maxNumber
        ) {
          maxNumber = numPart;
        }
      }
    });

    const nextNumber = maxNumber + 1;

    const formattedId = `member-${String(
      nextNumber
    ).padStart(2, '0')}`;

    const newMember: Member = {
      ...payload,
      id: formattedId,
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
      verificationToken: `VERIFY-${formattedId}-${Date.now()
        .toString(36)
        .toUpperCase()}`,
      locationHistory: [],
      skills: payload.skills || [],
      certifications: payload.certifications || []
    };

    members.unshift(newMember);

    this.setMembers(members);

    return newMember;
  }

  public updateMemberStatus(
    memberId: string,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED',
    actor?: any
  ): boolean {
    const members = this.getMembers();

    const index = members.findIndex(
      member => member.id === memberId
    );

    if (index === -1) {
      return false;
    }

    members[index].status = status;

    this.setMembers(members);

    return true;
  }

  public deleteMember(
    memberId: string,
    actor?: any
  ): boolean {
    const members = this.getMembers();

    const filteredMembers = members.filter(
      member => member.id !== memberId
    );

    if (filteredMembers.length === members.length) {
      return false;
    }

    this.setMembers(filteredMembers);

    return true;
  }

  public deleteAllDummyMembers(
    actor?: any
  ): number {
    const members = this.getMembers();

    const filteredMembers = members.filter(
      member =>
        !member.id.includes('dummy') &&
        !member.id.includes('demo')
    );

    const deletedCount =
      members.length - filteredMembers.length;

    this.setMembers(filteredMembers);

    return deletedCount;
  }

  // =========================================================
  // KTA CARD SETTINGS
  // =========================================================

  public getKtaSettings(): KtaCardSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_KTA_SETTINGS;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.KTA_SETTINGS
      );

      if (data) {
        const parsedData = JSON.parse(data);

        return {
          ...DEFAULT_KTA_SETTINGS,
          ...parsedData
        };
      }
    } catch (error) {
      console.error(
        'Gagal membaca pengaturan KTA:',
        error
      );
    }

    return DEFAULT_KTA_SETTINGS;
  }

  public saveKtaSettings(
    settings: KtaCardSettings
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const updatedSettings: KtaCardSettings = {
        ...DEFAULT_KTA_SETTINGS,
        ...settings
      };

      localStorage.setItem(
        STORAGE_KEYS.KTA_SETTINGS,
        JSON.stringify(updatedSettings)
      );

      this.notify();

      window.dispatchEvent(
        new CustomEvent(
          'saka:kta-settings-updated',
          {
            detail: updatedSettings
          }
        )
      );
    } catch (error) {
      console.error(
        'Gagal menyimpan pengaturan KTA:',
        error
      );
    }
  }

  // =========================================================
  // TOUR PACKAGES
  // =========================================================

  public getTourPackages(): TourPackage[] {
    if (typeof window === 'undefined') {
      return INITIAL_TOUR_PACKAGES;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.TOURS
      );

      return data
        ? JSON.parse(data)
        : INITIAL_TOUR_PACKAGES;
    } catch (error) {
      console.error(
        'Gagal membaca paket wisata:',
        error
      );

      return INITIAL_TOUR_PACKAGES;
    }
  }

  public setTourPackages(
    tours: TourPackage[]
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.TOURS,
        JSON.stringify(tours)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan paket wisata:',
        error
      );
    }
  }

  public deleteTourPackage(
    id: string,
    actor?: any
  ) {
    const filteredTours =
      this.getTourPackages().filter(
        tour => tour.id !== id
      );

    this.setTourPackages(filteredTours);
  }

  // =========================================================
  // ACTIVITIES
  // =========================================================

  public getActivities(): Activity[] {
    if (typeof window === 'undefined') {
      return INITIAL_ACTIVITIES;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.ACTIVITIES
      );

      return data
        ? JSON.parse(data)
        : INITIAL_ACTIVITIES;
    } catch (error) {
      console.error(
        'Gagal membaca kegiatan:',
        error
      );

      return INITIAL_ACTIVITIES;
    }
  }

  public setActivities(
    activities: Activity[]
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.ACTIVITIES,
        JSON.stringify(activities)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan kegiatan:',
        error
      );
    }
  }

  public deleteActivity(
    id: string,
    actor?: any
  ) {
    const filteredActivities =
      this.getActivities().filter(
        activity => activity.id !== id
      );

    this.setActivities(filteredActivities);
  }

  // =========================================================
  // CULINARY & SOUVENIRS
  // =========================================================

  public getCulinarySouvenirs():
    CulinarySouvenirItem[] {
    if (typeof window === 'undefined') {
      return INITIAL_CULINARY_SOUVENIRS;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.CULINARY_SOUVENIRS
      );

      return data
        ? JSON.parse(data)
        : INITIAL_CULINARY_SOUVENIRS;
    } catch (error) {
      console.error(
        'Gagal membaca data kuliner dan cinderamata:',
        error
      );

      return INITIAL_CULINARY_SOUVENIRS;
    }
  }

  public setCulinarySouvenirs(
    items: CulinarySouvenirItem[]
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.CULINARY_SOUVENIRS,
        JSON.stringify(items)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan data kuliner dan cinderamata:',
        error
      );
    }
  }

  // =========================================================
  // KRIDA MODULES
  // =========================================================

  /**
   * Mengambil seluruh modul Krida resmi.
   *
   * Sumber data:
   * src/data/kridaData.ts
   *
   * Data modul bersifat statis dan berasal dari:
   * INITIAL_KRIDA_MODULES
   *
   * Method ini dibutuhkan oleh:
   * src/components/krida/KridaModulesView.tsx
   */
  public getKridaModules(): KridaModuleItem[] {
    return INITIAL_KRIDA_MODULES;
  }

  // =========================================================
  // INDONESIA TERRITORIES
  // =========================================================

  public getProvinces(): Province[] {
    return PROVINCES_DATA;
  }

  public getRegencies(
    provinceId?: string
  ): Regency[] {
    if (!provinceId) {
      return REGENCIES_DATA;
    }

    return REGENCIES_DATA.filter(
      regency =>
        regency.provinceId === provinceId
    );
  }

  public getDistricts(
    regencyId?: string
  ): District[] {
    if (!regencyId) {
      return [];
    }

    return getDistrictsForRegency(regencyId);
  }

  public getBranches(
    districtId?: string
  ): Branch[] {
    return [];
  }

  public getSkills(): Skill[] {
    return MASTER_SKILLS;
  }

  // =========================================================
  // AUDIT LOGS
  // =========================================================

  public getAuditLogs(): AuditLog[] {
    if (typeof window === 'undefined') {
      return INITIAL_AUDIT_LOGS;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.AUDIT_LOGS
      );

      return data
        ? JSON.parse(data)
        : INITIAL_AUDIT_LOGS;
    } catch (error) {
      console.error(
        'Gagal membaca audit logs:',
        error
      );

      return INITIAL_AUDIT_LOGS;
    }
  }

  // =========================================================
  // USERS & AUTH
  // =========================================================

  public getUsers(): CurrentUser[] {
    if (typeof window === 'undefined') {
      return DEMO_USERS;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.USERS
      );

      return data
        ? JSON.parse(data)
        : DEMO_USERS;
    } catch (error) {
      console.error(
        'Gagal membaca data users:',
        error
      );

      return DEMO_USERS;
    }
  }

  public setUsers(
    users: CurrentUser[]
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.USERS,
        JSON.stringify(users)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan users:',
        error
      );
    }
  }

  public saveUsers(
    users: CurrentUser[]
  ) {
    this.setUsers(users);
  }

  public getCurrentUser(): CurrentUser {
    if (typeof window === 'undefined') {
      return DEFAULT_PUBLIC_USER;
    }

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.CURRENT_USER
      );

      return data
        ? JSON.parse(data)
        : DEFAULT_PUBLIC_USER;
    } catch (error) {
      console.error(
        'Gagal membaca current user:',
        error
      );

      return DEFAULT_PUBLIC_USER;
    }
  }

  public setCurrentUser(
    user: CurrentUser
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan current user:',
        error
      );
    }
  }

  public getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(
        STORAGE_KEYS.AUTH_TOKEN
      );
    } catch {
      return null;
    }
  }

  public setAuthToken(
    token: string | null
  ) {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (token) {
        localStorage.setItem(
          STORAGE_KEYS.AUTH_TOKEN,
          token
        );
      } else {
        localStorage.removeItem(
          STORAGE_KEYS.AUTH_TOKEN
        );
      }

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan auth token:',
        error
      );
    }
  }

  // =========================================================
  // SERVER SYNCHRONIZATION
  // =========================================================

  public async syncWithServer(): Promise<boolean> {
    return true;
  }
}

export const storage =
  new StorageService();
