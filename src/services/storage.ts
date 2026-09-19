import {
  Member,
  MemberLocationHistory,
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
  NotificationItem,
  UserRole
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
  NOTIFICATIONS: 'saka_notifications',
  PENDING_MEMBER_WRITES: 'saka_pending_member_writes_v1'
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
  preset: 'CR80_KTA',
  widthMm: 85.60,
  heightMm: 53.98,
  cornerRadiusMm: 3.18,
  cardTheme: 'purple_saka',
  bgImageUrl: '/assets/kta/KTA_MASTER_DEPAN.png',
  frontBackgroundUrl: '/assets/kta/KTA_MASTER_DEPAN.png',
  backBackgroundUrl: '/assets/kta/KTA_MASTER_BELAKANG.png',
  customBackgroundColorFront: '#32116f',
  customBackgroundColorBack: '#32116f',
  bgOpacity: 0,
  frontLogoUrl: '',
  backLogoUrl: '',
  logos: [],
  dataFields: [],
  textElements: [],
  frontOrganizationTitle: '',
  frontOrganizationSubtitle: '',
  frontOrganizationTitleX: 15,
  frontOrganizationTitleY: 6,
  frontOrganizationTitleWidth: 65,
  frontOrganizationTitleFontSize: 11,
  frontOrganizationTitleFontWeight: 'bold',
  frontOrganizationTitleColor: '#ffffff',
  frontOrganizationTitleAlign: 'left',
  frontOrganizationSubtitleX: 15,
  frontOrganizationSubtitleY: 12,
  frontOrganizationSubtitleWidth: 70,
  frontOrganizationSubtitleFontSize: 8,
  frontOrganizationSubtitleFontWeight: 'normal',
  frontOrganizationSubtitleColor: '#e5e7eb',
  frontOrganizationSubtitleAlign: 'left',
  frontValidityText: 'Masa Berlaku: Selama Menjadi Anggota',
  watermarkOpacity: 0.10,
  showKridaBadge: true,
  showPhoto: true,
  showQrCode: true,
  qrX: 78,
  qrY: 29,
  qrSize: 18,
  qrBorderWidth: 1,
  qrBorderColor: '#e9d5ff',
  qrBorderRadius: 10,
  qrPadding: 6,
  qrBackgroundColor: '#ffffff',
  backHeaderTitle: '',
  backHeaderSubtitle: '',
  terms: [],
  issueLocationDate: 'Jakarta, 14 Agustus 2026',
  issueLocationDateX: 5,
  issueLocationDateY: 60,
  barcodeType: 'CODE128',
  barcodeCustomValue: '',
  showBarcode: false,
  barcodeX: 68,
  barcodeY: 55,
  barcodeWidth: 27,
  barcodeHeight: 9,
  barcodeShowText: false,
  signerMemberId: '',
  showSignerQrCode: true,
  showSignerName: true,
  showSignerTitle: false,
  showSignerVerified: true,
  signerVerifiedX: 5,
  signerVerifiedY: 60,
  signerVerifiedWidth: 55,
  signerVerifiedFontSize: 7,
  signerVerifiedColor: '#ffffff',
  signerName: 'Reza Pahlevi',
  signerNameXOffset: 0,
  signerX: 5,
  signerY: 82,
  signerWidth: 55,
  signerAlign: 'left',
  signerLineHeight: 1.2,
  signerLetterSpacing: 0,
  signerColor: '#ffffff',
  signerNameFontSize: 9,
  signerTitleFontSize: 7,
  signerQrX: 68,
  signerQrY: 68,
  signerQrSize: 18,
  signerQrPadding: 2,
  signerQrBackgroundColor: '#ffffff',
  signerQrBorderColor: 'transparent',
  signerQrBorderWidth: 0,
  signerQrBorderRadius: 0,
  signerNameYOffset: 0,
  signerTitle: 'Ketua Pimpinan Saka Pariwisata Nasional',
  signerSubtitle: '',
  showStamp: false
};

class StorageService {
  private listeners: (() => void)[] = [];
  private mutationListeners: ((event: any) => void)[] = [];

  // Cloud-first domain state.
  // These collections are populated from Google Apps Script / Spreadsheet
  // snapshots and are intentionally NOT hydrated from browser localStorage.
  // localStorage remains reserved for session/configuration-only concerns.
  private cloudMembers: Member[] = [];
  private cloudTours: TourPackage[] = [];
  private cloudActivities: Activity[] = [];
  private cloudCulinarySouvenirs: CulinarySouvenirItem[] = [];
  private cloudUsers: CurrentUser[] = [];
  private cloudAuditLogs: AuditLog[] = [];
  private kridaModules: KridaModuleItem[] = [...INITIAL_KRIDA_MODULES];
  private pendingMemberWrites: Record<string, { status: string; timestamp: number; member: Member }> = {};
  private ktaSettings: KtaCardSettings = { ...DEFAULT_KTA_SETTINGS, logos: [], dataFields: [], textElements: [], terms: [] };

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Hydrate data publik awal hanya jika collection cloud masih kosong.
      // Tidak mengganti cloud sync; hanya menyediakan fallback tampilan awal.
      if (this.cloudTours.length === 0) {
        this.cloudTours = [...INITIAL_TOUR_PACKAGES];
      }

      if (this.cloudActivities.length === 0) {
        this.cloudActivities = [...INITIAL_ACTIVITIES];
      }

      if (this.cloudCulinarySouvenirs.length === 0) {
        this.cloudCulinarySouvenirs = [...INITIAL_CULINARY_SOUVENIRS];
      }

      if (this.cloudMembers.length === 0) {
        this.cloudMembers = [...INITIAL_MEMBERS];
      }

      if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify([])
        );
      }

      // Krida editor is currently a frontend-managed content collection.
      // Restore the last edited module set when available. This does not affect
      // member registration, QR, KTA, or the Google Spreadsheet member data.
      const savedKrida = localStorage.getItem('spwn_krida_modules_v1');
      if (savedKrida) {
        const parsedKrida = JSON.parse(savedKrida);
        if (Array.isArray(parsedKrida)) this.kridaModules = parsedKrida;
      }

      // KTA settings are hydrated from the GAS-backed central endpoint.
      // No browser-local KTA snapshot is created.
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

  public subscribeMutation(listener: (event: any) => void): () => void {
    this.mutationListeners.push(listener);
    if (typeof window === 'undefined') return () => {};

    const storageHandler = (e: StorageEvent) => {
      if (e.key !== 'saka_mutation_event_v2' || !e.newValue) return;

      try {
        listener(JSON.parse(e.newValue));
      } catch {}
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      this.mutationListeners = this.mutationListeners.filter(
        l => l !== listener
      );
      window.removeEventListener('storage', storageHandler);
    };
  }

  public emitMutation(
    type: string,
    action: string,
    payload: any,
    meta: Record<string, any> = {}
  ) {
    if (typeof window === 'undefined') return;

    const event = {
      type,
      action,
      payload,
      timestamp: Date.now(),
      source: 'storage-service',
      ...meta
    };

    this.mutationListeners.forEach(listener => {
      try {
        listener(event);
      } catch (e) {
        console.warn(
          '[Storage] mutation listener error',
          e
        );
      }
    });

    try {
      localStorage.setItem(
        'saka_mutation_event_v2',
        JSON.stringify(event)
      );
      localStorage.removeItem('saka_mutation_event_v2');
    } catch {}

    try {
      window.dispatchEvent(
        new CustomEvent(
          'saka:local-mutation',
          {
            detail: event
          }
        )
      );
    } catch {}
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
      const data = localStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS
      );

      if (!data) return [];

      const notifications = JSON.parse(data) as NotificationItem[];

      if (!Array.isArray(notifications)) {
        return [];
      }

      const targetUserId =
        userId ?? this.getCurrentUser()?.id;

      if (!targetUserId) {
        return notifications;
      }

      return notifications.filter(
        notification =>
          notification.userId === targetUserId ||
          notification.userId === '*'
      );
    } catch (error) {
      console.error(
        'Gagal membaca notifikasi:',
        error
      );

      return [];
    }
  }

  /** Menyimpan seluruh notifikasi. */
  public setNotifications(
    notifications: NotificationItem[]
  ): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS,
        JSON.stringify(notifications)
      );

      this.notify();
    } catch (error) {
      console.error(
        'Gagal menyimpan notifikasi:',
        error
      );
    }
  }

  /** Menambahkan satu notifikasi baru. */
  public addNotification(
    notification: NotificationItem
  ): void {
    const notifications =
      this.getAllNotifications();

    this.setNotifications([
      notification,
      ...notifications
    ]);
  }

  /** Menandai notifikasi tertentu sebagai sudah dibaca. */
  public markNotificationAsRead(
    id: string
  ): boolean {
    const notifications =
      this.getAllNotifications();

    const index = notifications.findIndex(
      notification => notification.id === id
    );

    if (index === -1) return false;

    if (notifications[index].isRead) {
      return true;
    }

    notifications[index] = {
      ...notifications[index],
      isRead: true
    };

    this.setNotifications(notifications);

    return true;
  }

  private getAllNotifications(): NotificationItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS
      );

      if (!data) return [];

      const notifications = JSON.parse(data);

      return Array.isArray(notifications)
        ? notifications
        : [];
    } catch (error) {
      console.error(
        'Gagal membaca seluruh notifikasi:',
        error
      );

      return [];
    }
  }

  // =========================================================
  // MEMBERS MANAGEMENT
  // =========================================================

  public getMembers(): Member[] {
    return this.cloudMembers.length > 0
      ? [...this.cloudMembers]
      : [...INITIAL_MEMBERS];
  }

  /**
   * Members deduplication used by live spreadsheet synchronization.
   * Primary identity is SPW/member ID, then KTA, then email.
   */
  public deduplicateDatabase(): void {
    const members = this.getMembers();

    if (
      !Array.isArray(members) ||
      members.length < 2
    ) {
      return;
    }

    const result: Member[] = [];
    const byKey = new Map<string, number>();

    const norm = (value: any) =>
      String(value ?? '')
        .trim()
        .toLowerCase();

    const keysFor = (member: Member) => {
      const keys: string[] = [];

      const id = norm(member.id);
      const kta = norm(
        (member as any).nationalMemberNumber
      );
      const email = norm(member.email);

      if (id) keys.push(`id:${id}`);
      if (kta) keys.push(`kta:${kta}`);
      if (email) keys.push(`email:${email}`);

      return keys;
    };

    for (const member of members) {
      if (!member || typeof member !== 'object') {
        continue;
      }

      const keys = keysFor(member);

      const existingIndex = keys
        .map(k => byKey.get(k))
        .find(v => v !== undefined);

      if (existingIndex === undefined) {
        const index = result.length;

        result.push(member);

        keys.forEach(k =>
          byKey.set(k, index)
        );

        continue;
      }

      const merged = {
        ...result[existingIndex],
        ...member
      };

      const existingId =
        norm(result[existingIndex].id);

      const incomingId =
        norm(member.id);

      if (
        /^spw-\d+$/i.test(existingId) &&
        !/^spw-\d+$/i.test(incomingId)
      ) {
        merged.id =
          result[existingIndex].id;
      }

      result[existingIndex] = merged;

      keysFor(merged).forEach(k =>
        byKey.set(k, existingIndex)
      );
    }

    if (
      result.length !== members.length
    ) {
      this.setMembers(result);
    }
  }

  public setMembers(members: Member[]) {
    const cleanedMembers = (Array.isArray(members) ? members : []).map((member: any) => {
      if (!member || typeof member !== 'object') return member;
      const cleanMember = { ...member };
      delete cleanMember.gugusDepan;
      return cleanMember;
    });
    this.cloudMembers = cleanedMembers as Member[];
    this.notify();
  }

  public saveMembers(
    members: Member[]
  ) {
    this.setMembers(members);
  }

  /**
   * Snapshot perubahan profil yang belum dikonfirmasi
   * oleh live-sync Spreadsheet.
   */
  public getPendingMemberWrites(): Record<string, { status: string; timestamp: number; member: Member }> {
    return { ...this.pendingMemberWrites };
  }

  public clearPendingMemberWrite(memberId: string) {
    if (!memberId) return;
    delete this.pendingMemberWrites[memberId];
  }

  /**
   * Memperbarui seluruh data profil anggota
   * dari panel administrator.
   *
   * Browser hanya mengirim permintaan ke server.
   * Browser TIDAK menentukan URL Google Apps Script.
   *
   * Server bertanggung jawab memilih satu-satunya
   * endpoint Google Apps Script produksi.
   */
  public async adminUpdateMember(
    memberId: string,
    payload: Partial<Member>,
    actor: CurrentUser,
    reason: string
  ): Promise<Member | null> {
    if (!memberId) return null;

    const members =
      this.getMembers();

    const index =
      members.findIndex(
        member =>
          member.id === memberId
      );

    if (index === -1) {
      return null;
    }

    const current =
      members[index];

    const updatedMember: Member = {
      ...current,
      ...payload,
      id: memberId,
      userId:
        payload.userId ??
        current.userId,
      registeredAt:
        current.registeredAt ||
        new Date().toISOString(),
      verificationToken:
        current.verificationToken ||
        `VERIFY-${memberId}`,
      locationHistory:
        current.locationHistory ||
        [],
      certifications:
        payload.certifications ??
        current.certifications ??
        [],
      skills:
        payload.skills ??
        current.skills ??
        []
    };

    // Validasi isolasi wilayah di sisi client.
    const role =
      actor?.role;

    const jurisdictionId =
      actor?.jurisdictionId;

    if (
      role === 'ADMIN_PROVINCE' &&
      jurisdictionId &&
      updatedMember.provinceId !==
        jurisdictionId
    ) {
      throw new Error(
        'Anda tidak memiliki wewenang untuk memindahkan anggota ke provinsi lain.'
      );
    }

    if (
      role === 'ADMIN_REGENCY' &&
      jurisdictionId &&
      updatedMember.regencyId !==
        jurisdictionId
    ) {
      throw new Error(
        'Anda tidak memiliki wewenang untuk memindahkan anggota ke Kwartir Cabang lain.'
      );
    }

    if (
      role === 'ADMIN_BRANCH' &&
      jurisdictionId &&
      updatedMember.districtId !==
        jurisdictionId
    ) {
      throw new Error(
        'Anda tidak memiliki wewenang untuk memindahkan anggota ke kecamatan lain.'
      );
    }

    const previousMember =
      { ...current };

    members[index] =
      updatedMember;

    this.setMembers(
      members
    );

    this.emitMutation(
      'MEMBER',
      'UPDATE',
      updatedMember,
      {
        pending: true
      }
    );

    const markPendingWrite =
      (pending: boolean) => {
        if (pending) {
          this.pendingMemberWrites[memberId] = {
            status: 'PENDING',
            timestamp: Date.now(),
            member: { ...updatedMember }
          };
        } else {
          delete this.pendingMemberWrites[memberId];
        }
      };

    markPendingWrite(true);

    // Sinkronkan avatar dengan akun user.
    if (updatedMember.userId) {
      const users =
        this.getUsers();

      const userIndex =
        users.findIndex(
          user =>
            user.id ===
            updatedMember.userId
        );

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name:
            updatedMember.fullName,
          email:
            updatedMember.email,
          avatarUrl:
            updatedMember.avatarUrl
        };

        this.setUsers(users);
      }
    }

    // Audit lokal.
    const audit: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`,
      userId:
        actor?.id ||
        'unknown',
      userName:
        actor?.name ||
        'Operator',
      userRole:
        actor?.role ||
        'SUPER_ADMIN',
      action:
        'UPDATE_MEMBER_PROFILE',
      entityType:
        'MEMBER',
      entityId:
        memberId,
      description:
        reason ||
        'Pembaruan profil anggota',
      timestamp:
        new Date().toISOString(),
      ipAddress:
        'client'
    };

    const logs =
      this.getAuditLogs();

    this.cloudAuditLogs = [audit, ...logs].slice(0, 500);


    this.notify();

    // =====================================================
    // SERVER MUTATION
    // =====================================================
    // PENTING:
    // Tidak ada scriptUrl di sini.
    //
    // Browser -> /api/mutate
    //
    // Server -> endpoint GAS yang dikunci.
    // =====================================================

    const token =
      this.getAuthToken();

    if (!token) {
      members[index] =
        previousMember;

      this.setMembers(
        members
      );

      markPendingWrite(false);

      throw new Error(
        'Sesi administrator tidak ditemukan. Silakan login ulang sebelum mengubah status anggota.'
      );
    }

    try {
      const response =
        await fetch(
          '/api/mutate',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              'Authorization':
                `Bearer ${token}`
            },
            credentials:
              'include',
            body: JSON.stringify({
              type:
                'MEMBER',
              action:
                'UPDATE',
              payload:
                updatedMember,
              reason:
                reason ||
                'Pembaruan profil anggota'
            })
          }
        );

      let result: any =
        null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        console.warn(
          '[Storage] /api/mutate gagal; perubahan tetap dipertahankan sementara agar dapat diverifikasi ke Spreadsheet.',
          result?.message ||
            `HTTP ${response.status}`
        );
      }
    } catch (error) {
      console.warn(
        '[Storage] Jalur /api/mutate gagal; perubahan lokal tetap dipertahankan untuk proses verifikasi Spreadsheet:',
        error
      );
    }

    return updatedMember;
  }

  // =========================================================
  // ADMIN WILAYAH — PENETAPAN / PENCABUTAN
  // =========================================================

  /**
   * Menetapkan member sebagai Admin wilayah.
   *
   * Browser hanya mengirim data operasi.
   * URL Apps Script tidak pernah dikirim dari client.
   */
  public assignMemberAsOperator(
    memberId: string,
    role: UserRole,
    jurisdictionId: string,
    jurisdictionName: string,
    notes: string | undefined,
    adminUser: CurrentUser
  ): Member | null {
    const allowedRoles: UserRole[] = [
      'ADMIN_NATIONAL',
      'ADMIN_PROVINCE',
      'ADMIN_REGENCY',
      'ADMIN_BRANCH'
    ];

    if (
      !memberId ||
      !allowedRoles.includes(role)
    ) {
      console.error(
        '[Admin] Tingkat Admin tidak valid.'
      );
      return null;
    }

    if (
      !jurisdictionId &&
      !jurisdictionName
    ) {
      console.error(
        '[Admin] Wilayah kewenangan wajib dipilih.'
      );
      return null;
    }

    if (
      adminUser?.role !==
      'SUPER_ADMIN'
    ) {
      console.error(
        '[Admin] Hanya Super Admin yang dapat menetapkan Admin wilayah.'
      );
      return null;
    }

    const members =
      this.getMembers();

    const idx =
      members.findIndex(
        member =>
          String(member.id) ===
          String(memberId)
      );

    if (idx === -1) {
      return null;
    }

    const previousMember =
      { ...members[idx] };

    const member = {
      ...members[idx],
      isOperator: true,
      operatorRole: role,
      operatorJurisdictionId:
        jurisdictionId,
      operatorJurisdictionName:
        jurisdictionName,
      operatorAssignedAt:
        new Date().toISOString(),
      operatorAssignedBy:
        `${adminUser.name || 'Super Admin'} (${adminUser.role})`,
      operatorNotes:
        notes ||
        'Penetapan Admin wilayah oleh Super Admin'
    } as Member;

    members[idx] =
      member;

    this.setMembers(
      members
    );

    const users =
      this.getUsers();

    const userIndex =
      users.findIndex(
        user =>
          String(
            user.memberId || ''
          ) ===
            String(member.id) ||
          String(
            user.id || ''
          ) ===
            String(
              member.userId || ''
            ) ||
          String(
            user.email || ''
          ).toLowerCase() ===
            String(
              member.email || ''
            ).toLowerCase()
      );

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        name:
          member.fullName,
        email:
          member.email,
        avatarUrl:
          member.avatarUrl,
        memberId:
          member.id,
        role,
        jurisdictionId,
        jurisdictionName
      } as CurrentUser;

      this.setUsers(
        users
      );

      const currentUser =
        this.getCurrentUser();

      if (
        String(
          currentUser?.id || ''
        ) ===
          String(
            users[userIndex].id || ''
          ) ||
        String(
          currentUser?.memberId || ''
        ) ===
          String(member.id)
      ) {
        this.setCurrentUser(
          users[userIndex]
        );
      }
    }

    this.emitMutation(
      'ADMIN',
      'ASSIGN',
      {
        memberId:
          member.id,
        userId:
          member.userId || '',
        role,
        jurisdictionId,
        jurisdictionName,
        assignedBy:
          adminUser.id,
        assignedByName:
          adminUser.name,
        notes:
          notes || ''
      },
      {
        pending: true
      }
    );

    const token =
      this.getAuthToken();

    if (!token) {
      this.setMembers(
        members.map(
          (item, i) =>
            i === idx
              ? previousMember
              : item
        )
      );

      console.error(
        '[Admin] Sesi Super Admin tidak ditemukan.'
      );

      return null;
    }

    void fetch(
      '/api/admin/assign',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        credentials:
          'include',
        body: JSON.stringify({
          memberId:
            member.id,
          userId:
            member.userId || '',
          role,
          jurisdictionId,
          jurisdictionName,
          notes:
            notes || ''
        })
      }
    )
      .then(
        async response => {
          let result: any =
            null;

          try {
            result =
              await response.json();
          } catch {}

          if (
            !response.ok ||
            !result?.success
          ) {
            const latest =
              this.getMembers();

            const latestIndex =
              latest.findIndex(
                item =>
                  String(item.id) ===
                  String(member.id)
              );

            if (
              latestIndex !== -1
            ) {
              latest[
                latestIndex
              ] =
                previousMember;

              this.setMembers(
                latest
              );
            }

            console.error(
              '[Admin] Penetapan Admin gagal:',
              result?.message ||
                `HTTP ${response.status}`
            );

            return;
          }

          this.emitMutation(
            'ADMIN',
            'ASSIGN_CONFIRMED',
            result.user || {
              memberId:
                member.id,
              role,
              jurisdictionId,
              jurisdictionName
            },
            {
              pending:
                false
            }
          );

          this.notify();
        }
      )
      .catch(
        error => {
          const latest =
            this.getMembers();

          const latestIndex =
            latest.findIndex(
              item =>
                String(item.id) ===
                String(member.id)
            );

          if (
            latestIndex !== -1
          ) {
            latest[
              latestIndex
            ] =
              previousMember;

            this.setMembers(
              latest
            );
          }

          console.error(
            '[Admin] Gagal menyimpan penetapan Admin ke server/Spreadsheet:',
            error
          );
        }
      );

    this.notify();

    return member;
  }

  /**
   * Mencabut hak Admin wilayah dan
   * mengembalikan akun menjadi MEMBER.
   */
  public revokeMemberOperator(
    memberId: string,
    adminUser: CurrentUser,
    reason: string =
      'Pencabutan wewenang Admin oleh Super Admin'
  ): Member | null {
    if (
      !memberId ||
      adminUser?.role !==
        'SUPER_ADMIN'
    ) {
      console.error(
        '[Admin] Hanya Super Admin yang dapat mencabut Admin wilayah.'
      );

      return null;
    }

    const members =
      this.getMembers();

    const idx =
      members.findIndex(
        member =>
          String(member.id) ===
          String(memberId)
      );

    if (idx === -1) {
      return null;
    }

    const previousMember =
      { ...members[idx] };

    const member = {
      ...members[idx],
      isOperator: false,
      operatorRole:
        undefined,
      operatorJurisdictionId:
        undefined,
      operatorJurisdictionName:
        undefined,
      operatorAssignedAt:
        undefined,
      operatorAssignedBy:
        undefined,
      operatorNotes:
        undefined
    } as Member;

    members[idx] =
      member;

    this.setMembers(
      members
    );

    const users =
      this.getUsers();

    const userIndex =
      users.findIndex(
        user =>
          String(
            user.memberId || ''
          ) ===
            String(member.id) ||
          String(
            user.id || ''
          ) ===
            String(
              member.userId || ''
            ) ||
          String(
            user.email || ''
          ).toLowerCase() ===
            String(
              member.email || ''
            ).toLowerCase()
      );

    let previousUser:
      CurrentUser | null =
      null;

    if (userIndex !== -1) {
      previousUser =
        {
          ...users[userIndex]
        };

      users[userIndex] = {
        ...users[userIndex],
        name:
          member.fullName,
        email:
          member.email,
        avatarUrl:
          member.avatarUrl,
        memberId:
          member.id,
        role:
          'MEMBER',
        jurisdictionId:
          undefined,
        jurisdictionName:
          undefined
      } as CurrentUser;

      this.setUsers(
        users
      );

      const currentUser =
        this.getCurrentUser();

      if (
        String(
          currentUser?.id || ''
        ) ===
          String(
            users[userIndex].id || ''
          ) ||
        String(
          currentUser?.memberId || ''
        ) ===
          String(member.id)
      ) {
        this.setCurrentUser(
          users[userIndex]
        );
      }
    }

    this.emitMutation(
      'ADMIN',
      'REVOKE',
      {
        memberId:
          member.id,
        userId:
          member.userId || '',
        reason,
        revokedBy:
          adminUser.id,
        revokedByName:
          adminUser.name
      },
      {
        pending: true
      }
    );

    const token =
      this.getAuthToken();

    if (!token) {
      this.setMembers(
        members.map(
          (item, i) =>
            i === idx
              ? previousMember
              : item
        )
      );

      if (
        userIndex !== -1 &&
        previousUser
      ) {
        const rollbackUsers =
          this.getUsers();

        const rollbackIndex =
          rollbackUsers.findIndex(
            user =>
              String(user.id) ===
              String(
                previousUser!.id
              )
          );

        if (
          rollbackIndex !== -1
        ) {
          rollbackUsers[
            rollbackIndex
          ] =
            previousUser;

          this.setUsers(
            rollbackUsers
          );
        }
      }

      console.error(
        '[Admin] Sesi Super Admin tidak ditemukan.'
      );

      return null;
    }

    void fetch(
      '/api/admin/revoke',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        credentials:
          'include',
        body: JSON.stringify({
          memberId:
            member.id,
          userId:
            member.userId || '',
          reason
        })
      }
    )
      .then(
        async response => {
          let result: any =
            null;

          try {
            result =
              await response.json();
          } catch {}

          if (
            !response.ok ||
            !result?.success
          ) {
            const latest =
              this.getMembers();

            const latestIndex =
              latest.findIndex(
                item =>
                  String(item.id) ===
                  String(member.id)
              );

            if (
              latestIndex !== -1
            ) {
              latest[
                latestIndex
              ] =
                previousMember;

              this.setMembers(
                latest
              );
            }

            if (
              userIndex !== -1 &&
              previousUser
            ) {
              const latestUsers =
                this.getUsers();

              const latestUserIndex =
                latestUsers.findIndex(
                  user =>
                    String(
                      user.id
                    ) ===
                    String(
                      previousUser!.id
                    )
                );

              if (
                latestUserIndex !==
                -1
              ) {
                latestUsers[
                  latestUserIndex
                ] =
                  previousUser;

                this.setUsers(
                  latestUsers
                );
              }
            }

            console.error(
              '[Admin] Pencabutan Admin gagal:',
              result?.message ||
                `HTTP ${response.status}`
            );

            return;
          }

          this.emitMutation(
            'ADMIN',
            'REVOKE_CONFIRMED',
            result.user || {
              memberId:
                member.id,
              role:
                'MEMBER'
            },
            {
              pending:
                false
            }
          );

          this.notify();
        }
      )
      .catch(
        error => {
          const latest =
            this.getMembers();

          const latestIndex =
            latest.findIndex(
              item =>
                String(item.id) ===
                String(member.id)
            );

          if (
            latestIndex !== -1
          ) {
            latest[
              latestIndex
            ] =
              previousMember;

            this.setMembers(
              latest
            );
          }

          if (
            userIndex !== -1 &&
            previousUser
          ) {
            const latestUsers =
              this.getUsers();

            const latestUserIndex =
              latestUsers.findIndex(
                user =>
                  String(
                    user.id
                  ) ===
                  String(
                    previousUser!.id
                  )
              );

            if (
              latestUserIndex !==
              -1
            ) {
              latestUsers[
                latestUserIndex
              ] =
                previousUser;

              this.setUsers(
                latestUsers
              );
            }
          }

          console.error(
            '[Admin] Gagal mencabut Admin dari server/Spreadsheet:',
            error
          );
        }
      );

    this.notify();

    return member;
  }

  // =========================================================
  // MEMBER PHOTO
  // =========================================================

  public updateMemberPhoto(
    memberId: string,
    avatarUrl: string,
    actor?: CurrentUser
  ): Member | null {
    if (
      !avatarUrl ||
      !avatarUrl.trim()
    ) {
      return null;
    }

    const members =
      this.getMembers();

    const index =
      members.findIndex(
        member =>
          member.id ===
          memberId
      );

    if (index === -1) {
      return null;
    }

    const updatedMember: Member = {
      ...members[index],
      avatarUrl:
        avatarUrl.trim()
    };

    members[index] =
      updatedMember;

    this.setMembers(
      members
    );

    const users =
      this.getUsers();

    const userIndex =
      users.findIndex(
        user =>
          user.id ===
          updatedMember.userId
      );

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        avatarUrl:
          updatedMember.avatarUrl
      };

      this.setUsers(
        users
      );
    }

    const currentUser =
      this.getCurrentUser();

    if (
      currentUser?.id ===
        updatedMember.userId ||
      currentUser?.id ===
        actor?.id
    ) {
      this.setCurrentUser({
        ...currentUser,
        avatarUrl:
          updatedMember.avatarUrl
      });
    }

    return updatedMember;
  }

  // =========================================================
  // NTA
  // =========================================================

  public generateNationalMemberNumber(
    provinceCode: string,
    regencyCode: string,
    districtCode: string
  ): string {
    // Format final: PP.KK.KKK.NNNNNN
    // Contoh: 11.01.010.000001
    //
    // provinceCode : 2 digit kode provinsi
    // regencyCode  : kode wilayah seperti 11.01 -> ambil 01
    // districtCode : kode wilayah seperti 11.01.010 -> ambil 010

    const pp =
      String(
        provinceCode || '00'
      )
        .replace(/\D/g, '')
        .slice(-2)
        .padStart(2, '0');

    const regencyParts =
      String(
        regencyCode || '00.00'
      )
        .split('.')
        .filter(Boolean);

    const kk =
      (regencyParts[regencyParts.length - 1] || '00')
        .replace(/\D/g, '')
        .slice(-2)
        .padStart(2, '0');

    const districtParts =
      String(
        districtCode || '00.00.000'
      )
        .split('.')
        .filter(Boolean);

    const kc =
      (districtParts[districtParts.length - 1] || '000')
        .replace(/\D/g, '')
        .slice(-3)
        .padStart(3, '0');

    const prefix =
      `${pp}.${kk}.${kc}.`;

    const members =
      this.getMembers();

    let maxSequence = 0;

    members.forEach(
      member => {
        const nta =
          String(
            member?.nationalMemberNumber ||
              ''
          ).trim();

        // Hanya nomor dengan format final yang dihitung.
        if (
          !nta.startsWith(
            prefix
          )
        ) {
          return;
        }

        const sequenceText =
          nta.slice(prefix.length);

        if (!/^\d{6}$/.test(sequenceText)) {
          return;
        }

        const sequence =
          parseInt(
            sequenceText,
            10
          );

        if (
          Number.isFinite(
            sequence
          ) &&
          sequence >
            maxSequence
        ) {
          maxSequence =
            sequence;
        }
      }
    );

    return `${prefix}${String(
      maxSequence + 1
    ).padStart(6, '0')}`;
  }

  public assignNationalMemberNumber(
    memberId: string
  ): Member | null {
    const members =
      this.getMembers();

    const index =
      members.findIndex(
        member =>
          member.id ===
          memberId
      );

    if (index === -1) {
      return null;
    }

    const member =
      members[index];

    const nta =
      member.nationalMemberNumber ||
      this.generateNationalMemberNumber(
        member.provinceId ||
          '00',
        member.regencyId ||
          '00.00',
        member.districtId ||
          '00.00.00'
      );

    members[index] = {
      ...member,
      nationalMemberNumber:
        nta
    };

    this.setMembers(
      members
    );

    return members[index];
  }

  public transferMemberLocation(
    memberId: string,
    district: District,
    regency: Regency,
    province: Province,
    reason: string,
    authorizedByName: string
  ): Member | null {
    const members =
      this.getMembers();

    const index =
      members.findIndex(
        member =>
          member.id ===
          memberId
      );

    if (index === -1) {
      return null;
    }

    const current =
      members[index];

    const history:
      MemberLocationHistory = {
      id: `history-${Date.now()}-${memberId}`,
      memberId,
      prevDistrictName:
        current.districtName,
      newDistrictName:
        district.name,
      prevMemberNumber:
        current.nationalMemberNumber ||
        '',
      newMemberNumber:
        this.generateNationalMemberNumber(
          province.id,
          regency.id,
          district.id
        ),
      transferDate:
        new Date().toISOString(),
      reason,
      authorizedByName
    };

    const updated = {
      ...current,
      provinceId:
        province.id,
      provinceName:
        province.name,
      regencyId:
        regency.id,
      regencyName:
        regency.name,
      districtId:
        district.id,
      districtName:
        district.name,
      nationalMemberNumber:
        history.newMemberNumber,
      locationHistory: [
        ...(current.locationHistory ||
          []),
        history
      ]
    };

    members[index] =
      updated;

    this.setMembers(
      members
    );

    this.notify();

    return updated;
  }

  public generateNationalMemberNumbersByRegion(
    provinceId?: string,
    regencyId?: string,
    districtId?: string
  ): {
    updated: number;
    skipped: number;
    total: number;
  } {
    const members =
      this.getMembers();

    let sequenceByPrefix:
      Record<string, number> =
      {};

    let updated = 0;
    let skipped = 0;

    const selected =
      members.filter(
        member => {
          if (
            provinceId &&
            member.provinceId !==
              provinceId
          ) {
            return false;
          }

          if (
            regencyId &&
            member.regencyId !==
              regencyId
          ) {
            return false;
          }

          if (
            districtId &&
            member.districtId !==
              districtId
          ) {
            return false;
          }

          return true;
        }
      );

    members.forEach(
      member => {
        const nta =
          String(
            member.nationalMemberNumber ||
              ''
          ).trim();

        // Format final: PP.KK.KKK.NNNNNN
        const match =
          nta.match(
            /^(\d{2}\.\d{2}\.\d{3})\.(\d{6})$/
          );

        if (match) {
          const n =
            Number(match[2]);

          sequenceByPrefix[
            match[1]
          ] = Math.max(
            sequenceByPrefix[
              match[1]
            ] || 0,
            n
          );
        }
      }
    );

    selected.forEach(
      member => {
        const existingNta =
          String(
            member.nationalMemberNumber ||
              ''
          ).trim();

        // Nomor final yang sudah benar tidak disentuh.
        // Nomor lama (mis. 00.00.00.000001) atau kosong
        // akan dibuat ulang sesuai wilayah anggota.
        if (
          /^\d{2}\.\d{2}\.\d{3}\.\d{6}$/.test(
            existingNta
          )
        ) {
          skipped++;
          return;
        }

        const pp =
          String(
            member.provinceId ||
              '00'
          )
            .replace(/\D/g, '')
            .slice(-2)
            .padStart(2, '0');

        const kk =
          String(
            member.regencyId ||
              '00.00'
          )
            .split('.')
            .filter(Boolean)
            .pop()
            ?.replace(/\D/g, '')
            .slice(-2)
            .padStart(2, '0') ||
          '00';

        const kcParts =
          String(
            member.districtId ||
              '00.00.000'
          )
            .split('.')
            .filter(Boolean);

        const kc =
          (kcParts[kcParts.length - 1] || '000')
            .replace(/\D/g, '')
            .slice(-3)
            .padStart(3, '0');

        const prefix =
          `${pp}.${kk}.${kc}`;

        const next =
          (sequenceByPrefix[
            prefix
          ] || 0) + 1;

        sequenceByPrefix[
          prefix
        ] = next;

        member.nationalMemberNumber =
          `${prefix}.${String(
            next
          ).padStart(6, '0')}`;

        updated++;
      }
    );

    if (updated > 0) {
      this.setMembers(
        members
      );
    }

    return {
      updated,
      skipped,
      total:
        selected.length
    };
  }

  // =========================================================
  // REGISTER MEMBER
  // =========================================================

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
    const members =
      this.getMembers();

    let maxNumber = 0;

    members.forEach(
      existingMember => {
        const existingId =
          String(
            existingMember?.id ||
              ''
          ).trim();

        const match =
          existingId.match(
            /^SPW-(\d+)$/i
          );

        if (match) {
          const numPart =
            parseInt(
              match[1],
              10
            );

          if (
            !Number.isNaN(
              numPart
            ) &&
            numPart >
              maxNumber
          ) {
            maxNumber =
              numPart;
          }
        }
      }
    );

    const nextNumber =
      maxNumber + 1;

    const formattedId =
      `SPW-${String(
        nextNumber
      ).padStart(6, '0')}`;

    const newMember: Member = {
      ...payload,
      id: formattedId,
      status: 'PENDING',
      registeredAt:
        new Date().toISOString(),
      verificationToken:
        `VERIFY-${formattedId}-${Date.now()
          .toString(36)
          .toUpperCase()}`,
      locationHistory: [],
      nationalMemberNumber:
        payload.nationalMemberNumber ||
        this.generateNationalMemberNumber(
          payload.provinceId,
          payload.regencyId,
          payload.districtId
        ),
      skills:
        payload.skills || [],
      certifications:
        payload.certifications ||
        []
    };

    members.unshift(
      newMember
    );

    this.setMembers(
      members
    );

    return newMember;
  }

  // =========================================================
  // MEMBER STATUS
  // =========================================================

  public async updateMemberStatus(
    memberId: string,
    status:
      | 'ACTIVE'
      | 'PENDING'
      | 'SUSPENDED',
    actor?: CurrentUser
  ): Promise<boolean> {
    const current =
      this.getMembers().find(
        member =>
          member.id ===
          memberId
      );

    if (!current) {
      return false;
    }

    try {
      await this.adminUpdateMember(
        memberId,
        { status },
        actor ||
          this.getCurrentUser() ||
          DEFAULT_PUBLIC_USER as CurrentUser,
        status === 'ACTIVE'
          ? 'Verifikasi anggota oleh administrator'
          : status === 'SUSPENDED'
            ? 'Penolakan/penonaktifan anggota oleh administrator'
            : 'Pengembalian status anggota menjadi pending'
      );

      return true;
    } catch (error) {
      console.error(
        '[Member Status] Gagal menyimpan status:',
        error
      );

      return false;
    }
  }

  // =========================================================
  // DELETE MEMBER
  // =========================================================

  public deleteMember(
    memberId: string,
    actor?: any
  ): boolean {
    const members =
      this.getMembers();

    const filteredMembers =
      members.filter(
        member =>
          member.id !==
          memberId
      );

    if (
      filteredMembers.length ===
      members.length
    ) {
      return false;
    }

    this.setMembers(
      filteredMembers
    );

    this.emitMutation(
      'MEMBER',
      'DELETE',
      {
        id: memberId,
        memberId,
        kta:
          members.find(
            member =>
              member.id ===
              memberId
          )?.nationalMemberNumber ||
          ''
      }
    );

    const token =
      this.getAuthToken();

    if (!token) {
      this.setMembers(
        members
      );

      console.error(
        '[Delete Member] Sesi administrator tidak tersedia.'
      );

      return false;
    }

    void fetch(
      '/api/mutate',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        credentials:
          'include',
        body: JSON.stringify({
          type:
            'MEMBER',
          action:
            'DELETE',
          payload: {
            id:
              memberId,
            memberId,
            kta:
              members.find(
                member =>
                  member.id ===
                  memberId
              )?.nationalMemberNumber ||
              ''
          },
          reason:
            'Penghapusan anggota oleh administrator'
        })
      }
    )
      .then(
        async response => {
          let result: any =
            null;

          try {
            result =
              await response.json();
          } catch {}

          if (
            !response.ok ||
            !result?.success
          ) {
            this.setMembers(
              members
            );

            console.error(
              '[Delete Member] Server/Spreadsheet menolak penghapusan:',
              result?.message ||
                response.status
            );
          }
        }
      )
      .catch(
        error => {
          this.setMembers(
            members
          );

          console.error(
            '[Delete Member] Gagal menyinkronkan penghapusan ke Spreadsheet:',
            error
          );
        }
      );

    return true;
  }

  public deleteAllDummyMembers(
    actor?: any
  ): number {
    const members =
      this.getMembers();

    const filteredMembers =
      members.filter(
        member =>
          !member.id.includes(
            'dummy'
          ) &&
          !member.id.includes(
            'demo'
          )
      );

    const deletedCount =
      members.length -
      filteredMembers.length;

    this.setMembers(
      filteredMembers
    );

    return deletedCount;
  }

  // =========================================================
  // KTA CARD SETTINGS
  // =========================================================

  public getKtaSettings(): KtaCardSettings {
    return {
      ...this.ktaSettings,
      logos: Array.isArray(this.ktaSettings.logos) ? [...this.ktaSettings.logos] : [],
      dataFields: Array.isArray(this.ktaSettings.dataFields) ? [...this.ktaSettings.dataFields] : [],
      textElements: Array.isArray(this.ktaSettings.textElements) ? [...this.ktaSettings.textElements] : [],
      terms: Array.isArray(this.ktaSettings.terms) ? [...this.ktaSettings.terms] : []
    };
  }

  /**
   * Hydrate KTA layout from the GAS-backed central endpoint.
   * localStorage is deliberately not consulted.
   */
  public async hydrateKtaSettings(): Promise<KtaCardSettings> {
    if (typeof window === 'undefined') return this.getKtaSettings();

    try {
      const response = await fetch('/api/kta-settings', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, max-age=0' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result?.success && result?.settings && typeof result.settings === 'object') {
        this.setKtaSettingsInMemory(result.settings);
      }
    } catch (error) {
      console.warn('[Storage] Gagal memuat pengaturan KTA dari GAS:', error);
    }

    return this.getKtaSettings();
  }

  private setKtaSettingsInMemory(settings: KtaCardSettings) {
    const merged = {
      ...DEFAULT_KTA_SETTINGS,
      ...(settings && typeof settings === 'object' ? settings : {})
    } as KtaCardSettings;

    // KTA SPWNAPP menggunakan artwork master tetap untuk kedua sisi.
    const frontBg = String((merged as any).frontBackgroundUrl || '');
    const backBg = String((merged as any).backBackgroundUrl || '');
    if (!frontBg || frontBg.includes('KTA-MASTER.png')) (merged as any).frontBackgroundUrl = '/assets/kta/KTA_MASTER_DEPAN.png';
    if (!backBg || backBg.includes('KTA-MASTER.png')) (merged as any).backBackgroundUrl = '/assets/kta/KTA_MASTER_BELAKANG.png';
    (merged as any).bgImageUrl = '/assets/kta/KTA_MASTER_DEPAN.png';
    (merged as any).bgOpacity = 0;

    // Keep the signer/date defaults safe for older KTA configurations.
    // Legacy barcode settings remain accepted for spreadsheet compatibility,
    // but barcode elements are no longer rendered anywhere on the KTA.
    if (Number((merged as any).signerY ?? 88) === 88) (merged as any).signerY = 82;
    if (Number((merged as any).issueLocationDateY ?? 70) === 70) (merged as any).issueLocationDateY = 60;

    this.ktaSettings = {
      ...merged,
      logos: Array.isArray(merged.logos) ? merged.logos : [],
      dataFields: Array.isArray(merged.dataFields) ? merged.dataFields : [],
      textElements: Array.isArray(merged.textElements) ? merged.textElements : [],
      terms: Array.isArray(merged.terms) ? merged.terms : []
    };

    this.notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('saka:kta-settings-updated', {
        detail: this.getKtaSettings()
      }));
    }
  }

  public saveKtaSettings(settings: KtaCardSettings) {
    this.setKtaSettingsInMemory(settings);

    if (typeof window === 'undefined') return;

    const token = this.getAuthToken();
    void fetch('/api/kta-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({
        settings: this.getKtaSettings()
      })
    }).then(async response => {
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || `HTTP ${response.status}`);
      }
      return response.json().catch(() => null);
    }).catch(error => {
      console.error('[Storage] Gagal menyimpan pengaturan KTA ke GAS:', error);
    });
  }

  // =========================================================
  // TOUR PACKAGES
  // =========================================================

  public getTourPackages(): TourPackage[] {
    return this.cloudTours.length > 0
      ? [...this.cloudTours]
      : [...INITIAL_TOUR_PACKAGES];
  }

  public setTourPackages(tours: TourPackage[]) {
    this.cloudTours = Array.isArray(tours) ? [...tours] : [];
    this.notify();
  }

  public deleteTourPackage(
    id: string,
    actor?: any
  ) {
    const tours =
      this.getTourPackages();

    const filteredTours =
      tours.filter(
        tour =>
          tour.id !== id
      );

    if (
      filteredTours.length ===
      tours.length
    ) {
      return false;
    }

    this.setTourPackages(
      filteredTours
    );

    const token =
      this.getAuthToken();

    if (!token) {
      this.setTourPackages(
        tours
      );

      console.error(
        '[Delete Tour] Sesi administrator tidak tersedia.'
      );

      return false;
    }

    void fetch(
      '/api/mutate',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        credentials:
          'include',
        body: JSON.stringify({
          type:
            'TOUR',
          action:
            'DELETE',
          payload: {
            id
          },
          reason:
            'Penghapusan paket wisata oleh administrator'
        })
      }
    )
      .then(
        async response => {
          let result: any =
            null;

          try {
            result =
              await response.json();
          } catch {}

          if (
            !response.ok ||
            !result?.success
          ) {
            this.setTourPackages(
              tours
            );

            console.error(
              '[Delete Tour] Server/Spreadsheet menolak penghapusan:',
              result?.message ||
                response.status
            );
          }
        }
      )
      .catch(
        error => {
          this.setTourPackages(
            tours
          );

          console.error(
            '[Delete Tour] Gagal menyinkronkan penghapusan:',
            error
          );
        }
      );

    return true;
  }

  // =========================================================
  // ACTIVITIES
  // =========================================================

  public getActivities(): Activity[] {
    return this.cloudActivities.length > 0
      ? [...this.cloudActivities]
      : [...INITIAL_ACTIVITIES];
  }

  public setActivities(activities: Activity[]) {
    this.cloudActivities = Array.isArray(activities) ? [...activities] : [];
    this.notify();
  }

  public deleteActivity(
    id: string,
    actor?: any
  ) {
    const activities =
      this.getActivities();

    const filteredActivities =
      activities.filter(
        activity =>
          activity.id !==
          id
      );

    if (
      filteredActivities.length ===
      activities.length
    ) {
      return false;
    }

    this.setActivities(
      filteredActivities
    );

    const token =
      this.getAuthToken();

    if (!token) {
      this.setActivities(
        activities
      );

      console.error(
        '[Delete Activity] Sesi administrator tidak tersedia.'
      );

      return false;
    }

    void fetch(
      '/api/mutate',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          'Authorization':
            `Bearer ${token}`
        },
        credentials:
          'include',
        body: JSON.stringify({
          type:
            'ACTIVITY',
          action:
            'DELETE',
          payload: {
            id
          },
          reason:
            'Penghapusan kegiatan oleh administrator'
        })
      }
    )
      .then(
        async response => {
          let result: any =
            null;

          try {
            result =
              await response.json();
          } catch {}

          if (
            !response.ok ||
            !result?.success
          ) {
            this.setActivities(
              activities
            );

            console.error(
              '[Delete Activity] Server/Spreadsheet menolak penghapusan:',
              result?.message ||
                response.status
            );
          }
        }
      )
      .catch(
        error => {
          this.setActivities(
            activities
          );

          console.error(
            '[Delete Activity] Gagal menyinkronkan penghapusan:',
            error
          );
        }
      );

    return true;
  }

  // =========================================================
  // CULINARY & SOUVENIRS
  // =========================================================

  public getCulinarySouvenirs(): CulinarySouvenirItem[] {
    return this.cloudCulinarySouvenirs.length > 0
      ? [...this.cloudCulinarySouvenirs]
      : [...INITIAL_CULINARY_SOUVENIRS];
  }

  public setCulinarySouvenirs(items: CulinarySouvenirItem[]) {
    this.cloudCulinarySouvenirs = Array.isArray(items) ? [...items] : [];
    this.notify();
  }

  // =========================================================
  // KRIDA MODULES
  // =========================================================

  public getKridaModules(): KridaModuleItem[] {
    return this.kridaModules.map(item => ({
      ...item,
      images: item.images ? item.images.map(v => ({ ...v })) : [],
      links: item.links ? item.links.map(v => ({ ...v })) : [],
      downloads: item.downloads ? item.downloads.map(v => ({ ...v })) : [],
      curriculum: item.curriculum ? item.curriculum.map(v => ({ ...v })) : [],
      competencyTable: item.competencyTable ? item.competencyTable.map(v => ({ ...v })) : [],
      testRequirements: item.testRequirements ? {
        purwa: [...(item.testRequirements.purwa || [])],
        madya: [...(item.testRequirements.madya || [])],
        utama: [...(item.testRequirements.utama || [])]
      } : undefined
    }));
  }

  public updateKridaModule(updatedItem: KridaModuleItem, updatedBy?: string): boolean {
    if (!updatedItem?.id) return false;
    const index = this.kridaModules.findIndex(item => item.id === updatedItem.id);
    if (index < 0) return false;

    const nextItem: KridaModuleItem = {
      ...updatedItem,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || updatedItem.updatedBy || 'Admin'
    };
    this.kridaModules = this.kridaModules.map((item, i) => i === index ? nextItem : item);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('spwn_krida_modules_v1', JSON.stringify(this.kridaModules));
      }
    } catch {}

    this.notify();
    return true;
  }

  // =========================================================
  // INDONESIA TERRITORIES
  // =========================================================

  public getProvinces():
    Province[] {
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
        regency.provinceId ===
        provinceId
    );
  }

  public getDistricts(
    regencyId?: string
  ): District[] {
    if (!regencyId) {
      return [];
    }

    return getDistrictsForRegency(
      regencyId
    );
  }

  /**
   * Kompatibilitas untuk UI lama.
   * Fitur Branch/Gudep sudah tidak digunakan.
   */
  public getBranches(
    ..._args: any[]
  ): any[] {
    return [];
  }

  public getSkills():
    Skill[] {
    return MASTER_SKILLS;
  }

  // =========================================================
  // AUDIT LOGS
  // =========================================================

  public getAuditLogs(): AuditLog[] {
    return [...this.cloudAuditLogs];
  }

  public setAuditLogs(logs: AuditLog[]) {
    this.cloudAuditLogs = Array.isArray(logs) ? [...logs] : [];
    this.notify();
  }

  // =========================================================
  // USERS & AUTH
  // =========================================================

  public getUsers(): CurrentUser[] {
    return [...this.cloudUsers];
  }

  public setUsers(users: CurrentUser[]) {
    this.cloudUsers = Array.isArray(users) ? [...users] : [];
    this.notify();
  }

  public saveUsers(
    users: CurrentUser[]
  ) {
    this.setUsers(
      users
    );
  }

  public getCurrentUser():
    CurrentUser {
    if (
      typeof window ===
      'undefined'
    ) {
      return DEFAULT_PUBLIC_USER;
    }

    try {
      const data =
        localStorage.getItem(
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
    if (
      typeof window ===
      'undefined'
    ) {
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

  public getAuthToken():
    string | null {
    if (
      typeof window ===
      'undefined'
    ) {
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
    if (
      typeof window ===
      'undefined'
    ) {
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

  /**
   * Sinkronisasi snapshot dari server.
   *
   * Prinsip Cloud-First:
   * - Respons server adalah sumber kebenaran untuk data cloud.
   * - Array kosong dari server tetap menggantikan in-memory cloud state.
   * - Domain data tidak pernah dibaca atau dipulihkan dari localStorage.
   * - Pending member writes hanya hidup selama sesi browser dan menunggu
   *   konfirmasi dari snapshot Google Spreadsheet.
   */
  public async syncWithServer(): Promise<boolean> {
    const token = this.getAuthToken();

    try {
      const headers: Record<string, string> = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/data', {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.members)) {
        return false;
      }

      // -------------------------------------------------------
      // MEMBERS
      // -------------------------------------------------------
      // Penting: jangan gunakan `length > 0` di sini.
      // Jika server mengirim [], cache lokal HARUS ikut menjadi [].
      const pending = this.getPendingMemberWrites();

      const protectedMembers = (data.members as Member[]).map(
        (serverMember: Member) => {
          const entry =
            pending[serverMember.id] ||
            Object.values(pending).find((p: any) => {
              if (!p?.member) return false;

              const sameNationalNumber =
                !!serverMember.nationalMemberNumber &&
                p.member.nationalMemberNumber ===
                  serverMember.nationalMemberNumber;

              const sameEmail =
                !!serverMember.email &&
                String(p.member.email || '').toLowerCase() ===
                  String(serverMember.email || '').toLowerCase();

              return sameNationalNumber || sameEmail;
            });

          return entry?.member
            ? {
                ...serverMember,
                ...entry.member,
              }
            : serverMember;
        }
      );

      // Selalu tulis snapshot, termasuk ketika array kosong.
      this.setMembers(protectedMembers);

      // -------------------------------------------------------
      // USERS
      // -------------------------------------------------------
      // Untuk keamanan, jangan menghapus daftar user lokal hanya karena
      // endpoint publik mengembalikan [] kepada non-Super Admin.
      // Tetapi bila server memang memberikan daftar users, gunakan snapshot
      // server tersebut sebagai sumber kebenaran.
      if (Array.isArray(data.users) && data.users.length > 0) {
        const serverUsers = data.users as CurrentUser[];
        this.setUsers(serverUsers);

        const roleByMemberId = new Map<string, CurrentUser>();

        serverUsers.forEach((user: any) => {
          const memberId = String(user?.memberId || '').trim();
          if (memberId) {
            roleByMemberId.set(memberId, user);
          }
        });

        const currentMembers = this.getMembers();

        const mergedMembers = currentMembers.map((member: any) => {
          const user = roleByMemberId.get(
            String(member?.id || '').trim()
          );

          if (!user) {
            return member;
          }

          const role = String(user.role || 'MEMBER').toUpperCase();

          const isOperator =
            role === 'ADMIN_NATIONAL' ||
            role === 'ADMIN_PROVINCE' ||
            role === 'ADMIN_REGENCY' ||
            role === 'ADMIN_BRANCH';

          if (!isOperator) {
            return {
              ...member,
              isOperator: false,
              operatorRole: undefined,
              operatorJurisdictionId: undefined,
              operatorJurisdictionName: undefined,
            };
          }

          return {
            ...member,
            isOperator: true,
            operatorRole: role,
            operatorJurisdictionId:
              user.jurisdictionId || undefined,
            operatorJurisdictionName:
              user.jurisdictionName || undefined,
          };
        });

        this.setMembers(mergedMembers);
      }

      // -------------------------------------------------------
      // TOURS
      // -------------------------------------------------------
      // Hanya sinkronkan bila API memang mengirim field tersebut.
      // Array kosong tetap valid dan harus menggantikan cache lama.
      if (Array.isArray(data.tours)) {
        this.setTourPackages(data.tours as TourPackage[]);
      }

      // -------------------------------------------------------
      // ACTIVITIES
      // -------------------------------------------------------
      if (Array.isArray(data.activities)) {
        this.setActivities(data.activities as Activity[]);
      }

      // -------------------------------------------------------
      // CULINARY / SOUVENIRS
      // -------------------------------------------------------
      if (Array.isArray(data.culinaryItems)) {
        this.setCulinarySouvenirs(
          data.culinaryItems as CulinarySouvenirItem[]
        );
      }

      // -------------------------------------------------------
      // KRIDA MODULES
      // -------------------------------------------------------
      // Krida modules are currently static application content.
      // Do not persist cloud snapshots into browser localStorage.

      // -------------------------------------------------------
      // AUDIT LOGS
      // -------------------------------------------------------
      if (Array.isArray(data.auditLogs)) {
        this.setAuditLogs(data.auditLogs as AuditLog[]);
      }

      this.notify();
      return true;
    } catch (error) {
      console.warn(
        '[Storage] Sinkronisasi server gagal:',
        error
      );

      // Jangan menghapus cache ketika jaringan gagal. Cache hanya boleh
      // diganti oleh respons server yang valid.
      return false;
    }
  }

}

export const storage =
  new StorageService();