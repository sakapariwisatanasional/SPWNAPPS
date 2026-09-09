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

const SPREADSHEET_CONFIG_KEY = 'saka_spreadsheet_config_v1';

function getManualAppsScriptUrl(): string {
  try {
    const raw = localStorage.getItem(SPREADSHEET_CONFIG_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const url = String(parsed?.scriptUrl || '').trim().replace(/\s+/g, '');
    return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(url) ? url : '';
  } catch {
    return '';
  }
}

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
  preset: 'CR80_KTA', widthMm: 85.60, heightMm: 53.98, cornerRadiusMm: 3.18,
  cardTheme: 'purple_saka',
  customBackgroundColorFront: '#24105b', customBackgroundColorBack: '#111827',
  frontBackgroundUrl: '', backBackgroundUrl: '', bgImageUrl: '', bgOpacity: 0.10,
  frontLogoUrl: '', backLogoUrl: '', logos: [],
  dataFields: [
    { id:'field-name', field:'fullName', label:'NAMA', showLabel:false, side:'FRONT', visible:true, x:34, y:51, width:46, fontSize:16, fontWeight:'bold', color:'#ffffff', textTransform:'uppercase', align:'left' },
    { id:'field-member-id', field:'id', label:'NO. ANGGOTA', showLabel:false, side:'FRONT', visible:true, x:34, y:62, width:46, fontSize:9, fontWeight:'bold', color:'#fbbf24', align:'left' },
    { id:'field-position', field:'currentPosition', label:'JABATAN', showLabel:false, side:'FRONT', visible:true, x:34, y:70, width:46, fontSize:9, fontWeight:'bold', color:'#a7f3d0', align:'left' },
    { id:'field-kwartir', field:'provinceName', label:'KWARTIR', showLabel:false, side:'FRONT', visible:true, x:34, y:78, width:46, fontSize:8, fontWeight:'medium', color:'#e2e8f0', align:'left' },
  ],
  textElements: [],
  frontOrganizationTitle: 'SAKA PARIWISATA', frontOrganizationSubtitle: 'Gerakan Pramuka Indonesia',
  frontOrganizationTitleX: 15, frontOrganizationTitleY: 6, frontOrganizationTitleWidth: 65, frontOrganizationTitleFontSize: 11, frontOrganizationTitleFontWeight: 'bold', frontOrganizationTitleColor: '#ffffff', frontOrganizationTitleAlign: 'left',
  frontOrganizationSubtitleX: 15, frontOrganizationSubtitleY: 12, frontOrganizationSubtitleWidth: 70, frontOrganizationSubtitleFontSize: 8, frontOrganizationSubtitleFontWeight: 'normal', frontOrganizationSubtitleColor: '#e5e7eb', frontOrganizationSubtitleAlign: 'left',
  frontValidityText: 'Masa Berlaku: Selama Menjadi Anggota', watermarkOpacity: 0.10, showKridaBadge: true,
  backHeaderTitle: 'KTA SAKA PARIWISATA', backHeaderSubtitle: 'Sistem Otorisasi KTA Nasional',
  terms: ['Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata.','Keaslian data dapat diverifikasi melalui QR Code.','Anggota wajib menjunjung Tri Satya, Dasa Darma, dan Sapta Pesona Pariwisata.'],
  issueLocationDate: 'Jakarta, 14 Agustus 2026', barcodeType: 'CODE128', barcodeCustomValue: '',
  signerName: 'Reza Pahlevi', signerTitle: 'Ketua Pimpinan Saka Pariwisata Nasional', signerSubtitle: '', showStamp: false,
  showPhoto: true, showQrCode: true, qrX: 78, qrY: 30, qrSize: 22, showBarcode: true, barcodeX: 68, barcodeY: 70, barcodeWidth: 27, barcodeHeight: 9, barcodeShowText: false
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
  /**
   * Memperbarui seluruh data profil anggota dari panel administrator.
   * Perubahan disimpan ke LocalStorage terlebih dahulu agar UI langsung
   * terbarui, kemudian dikirim ke API /api/mutate agar tersimpan di server
   * dan diteruskan ke Google Apps Script.
   */
  public async adminUpdateMember(
    memberId: string,
    payload: Partial<Member>,
    actor: CurrentUser,
    reason: string
  ): Promise<Member | null> {
    if (!memberId) return null;

    const members = this.getMembers();
    const index = members.findIndex(member => member.id === memberId);
    if (index === -1) return null;

    const current = members[index];
    const updatedMember: Member = {
      ...current,
      ...payload,
      id: memberId,
      // Field wajib jangan sampai hilang akibat payload parsial.
      userId: payload.userId ?? current.userId,
      registeredAt: current.registeredAt || new Date().toISOString(),
      verificationToken: current.verificationToken || `VERIFY-${memberId}`,
      locationHistory: current.locationHistory || [],
      certifications: payload.certifications ?? current.certifications ?? [],
      skills: payload.skills ?? current.skills ?? []
    };

    // Validasi isolasi wilayah di sisi client sebagai lapisan pertama.
    const role = actor?.role;
    const jurisdictionId = actor?.jurisdictionId;
    if (role === 'ADMIN_PROVINCE' && jurisdictionId && updatedMember.provinceId !== jurisdictionId) {
      throw new Error('Anda tidak memiliki wewenang untuk memindahkan anggota ke provinsi lain.');
    }
    if (role === 'ADMIN_REGENCY' && jurisdictionId && updatedMember.regencyId !== jurisdictionId) {
      throw new Error('Anda tidak memiliki wewenang untuk memindahkan anggota ke Kwartir Cabang lain.');
    }
    if (role === 'ADMIN_BRANCH' && jurisdictionId && updatedMember.branchId !== jurisdictionId) {
      throw new Error('Anda tidak memiliki wewenang untuk memindahkan anggota ke wilayah cabang lain.');
    }

    // Simpan lokal terlebih dahulu agar UI responsif. Tandai record sebagai
    // sedang dipersist ke server/Google Spreadsheet agar live-sync tidak
    // menimpa perubahan ini dengan data Spreadsheet yang masih lama.
    const previousMember = { ...current };
    members[index] = updatedMember;
    this.setMembers(members);

    const markPendingWrite = (pending: boolean) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.PENDING_MEMBER_WRITES);
        const map = raw ? JSON.parse(raw) : {};
        if (pending) {
          map[memberId] = { status: updatedMember.status, timestamp: Date.now() };
        } else {
          delete map[memberId];
        }
        localStorage.setItem(STORAGE_KEYS.PENDING_MEMBER_WRITES, JSON.stringify(map));
      } catch {}
    };

    markPendingWrite(true);

    // Sinkronkan avatar dengan akun user yang terkait.
    if (updatedMember.userId) {
      const users = this.getUsers();
      const userIndex = users.findIndex(user => user.id === updatedMember.userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: updatedMember.fullName,
          email: updatedMember.email,
          avatarUrl: updatedMember.avatarUrl
        };
        this.setUsers(users);
      }
    }

    // Audit lokal.
    const audit: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: actor?.id || 'unknown',
      userName: actor?.name || 'Operator',
      userRole: actor?.role || 'SUPER_ADMIN',
      action: 'UPDATE_MEMBER_PROFILE',
      entityType: 'MEMBER',
      entityId: memberId,
      description: reason || 'Pembaruan profil anggota',
      timestamp: new Date().toISOString(),
      ipAddress: 'client'
    };
    const logs = this.getAuditLogs();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([audit, ...logs].slice(0, 500)));
    this.notify();

    // Jika aplikasi berjalan dengan sesi API, kirim perubahan ke server.
    const token = this.getAuthToken();
    if (!token) {
      members[index] = previousMember;
      this.setMembers(members);
      markPendingWrite(false);
      throw new Error('Sesi administrator tidak ditemukan. Silakan login ulang sebelum mengubah status anggota.');
    }

    try {
      const manualScriptUrl = getManualAppsScriptUrl();
      if (!manualScriptUrl) {
        throw new Error('URL Google Apps Script belum diisi melalui Dashboard > Pengaturan API.');
      }

      const response = await fetch('/api/mutate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'MEMBER',
          action: 'UPDATE',
          payload: updatedMember,
          reason: reason || 'Pembaruan profil anggota',
          scriptUrl: getManualAppsScriptUrl()
        })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Server menolak perubahan profil (HTTP ${response.status}).`);
      }

      markPendingWrite(false);
    } catch (error) {
      // Jangan biarkan UI menyimpan status palsu jika server/Spreadsheet gagal.
      const latestMembers = this.getMembers();
      const latestIndex = latestMembers.findIndex(member => member.id === memberId);
      if (latestIndex !== -1) {
        latestMembers[latestIndex] = previousMember;
        this.setMembers(latestMembers);
      }
      markPendingWrite(false);
      throw error;
    }

    return updatedMember;
  }

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
   * Generate Nomor Tanda Anggota (NTA) berdasarkan kode wilayah.
   * Format: PP.KK.KC.NNNNNN
   * PP = kode provinsi, KK = kode kabupaten/kota, KC = kode kecamatan,
   * NNNNNN = nomor urut 6 digit yang unik di dalam wilayah tersebut.
   */
  public generateNationalMemberNumber(
    provinceCode: string,
    regencyCode: string,
    districtCode: string
  ): string {
    const pp = String(provinceCode || '00').replace(/\D/g, '').slice(-2).padStart(2, '0');
    const kk = String(regencyCode || '00.00').split('.').filter(Boolean).pop()?.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00';
    const kc = String(districtCode || '00.00.00').split('.').filter(Boolean).pop()?.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00';
    const prefix = `${pp}.${kk}.${kc}.`;

    const members = this.getMembers();
    let maxSequence = 0;

    members.forEach(member => {
      const nta = String(member?.nationalMemberNumber || '').trim();
      if (!nta.startsWith(prefix)) return;

      const sequence = parseInt(nta.slice(prefix.length).replace(/\D/g, ''), 10);
      if (Number.isFinite(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    });

    return `${prefix}${String(maxSequence + 1).padStart(6, '0')}`;
  }

  /**
   * Menerbitkan NTA untuk anggota yang belum memiliki nomor.
   * Nomor selalu mengikuti wilayah anggota saat ini.
   */
  public assignNationalMemberNumber(memberId: string): Member | null {
    const members = this.getMembers();
    const index = members.findIndex(member => member.id === memberId);
    if (index === -1) return null;

    const member = members[index];
    const nta = member.nationalMemberNumber || this.generateNationalMemberNumber(
      member.provinceId || '00',
      member.regencyId || '00.00',
      member.districtId || '00.00.00'
    );

    members[index] = { ...member, nationalMemberNumber: nta };
    this.setMembers(members);
    return members[index];
  }

  /**
   * Generate NTA massal berdasarkan wilayah yang dipilih.
   * Hanya anggota tanpa NTA yang diberi nomor agar nomor lama tidak berubah.
   */
  public generateNationalMemberNumbersByRegion(
    provinceId?: string,
    regencyId?: string,
    districtId?: string
  ): { updated: number; skipped: number; total: number } {
    const members = this.getMembers();
    let sequenceByPrefix: Record<string, number> = {};
    let updated = 0;
    let skipped = 0;

    const selected = members.filter(member => {
      if (provinceId && member.provinceId !== provinceId) return false;
      if (regencyId && member.regencyId !== regencyId) return false;
      if (districtId && member.districtId !== districtId) return false;
      return true;
    });

    // Seed sequence dari semua nomor yang sudah ada, bukan hanya hasil filter.
    members.forEach(member => {
      const nta = String(member.nationalMemberNumber || '');
      const match = nta.match(/^(\d{2}\.\d{2}\.\d{2})\.(\d{6})$/);
      if (match) {
        const n = Number(match[2]);
        sequenceByPrefix[match[1]] = Math.max(sequenceByPrefix[match[1]] || 0, n);
      }
    });

    selected.forEach(member => {
      if (member.nationalMemberNumber) {
        skipped++;
        return;
      }

      const pp = String(member.provinceId || '00').replace(/\D/g, '').slice(-2).padStart(2, '0');
      const kk = String(member.regencyId || '00.00').split('.').filter(Boolean).pop()?.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00';
      const kc = String(member.districtId || '00.00.00').split('.').filter(Boolean).pop()?.replace(/\D/g, '').slice(-2).padStart(2, '0') || '00';
      const prefix = `${pp}.${kk}.${kc}`;
      const next = (sequenceByPrefix[prefix] || 0) + 1;
      sequenceByPrefix[prefix] = next;

      member.nationalMemberNumber = `${prefix}.${String(next).padStart(6, '0')}`;
      updated++;
    });

    if (updated > 0) this.setMembers(members);
    return { updated, skipped, total: selected.length };
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
      const existingId = String(existingMember?.id || '').trim();
      const match = existingId.match(/^SPW-(\d+)$/i);
      if (match) {
        const numPart = parseInt(match[1], 10);
        if (!Number.isNaN(numPart) && numPart > maxNumber) maxNumber = numPart;
      }
    });

    const nextNumber = maxNumber + 1;
    const formattedId = `SPW-${String(nextNumber).padStart(6, '0')}`;

    const newMember: Member = {
      ...payload,
      id: formattedId,
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
      verificationToken: `VERIFY-${formattedId}-${Date.now()
        .toString(36)
        .toUpperCase()}`,
      locationHistory: [],
      nationalMemberNumber: payload.nationalMemberNumber || this.generateNationalMemberNumber(
        payload.provinceId,
        payload.regencyId,
        payload.districtId
      ),
      skills: payload.skills || [],
      certifications: payload.certifications || []
    };

    members.unshift(newMember);

    this.setMembers(members);

    return newMember;
  }

  public async updateMemberStatus(
    memberId: string,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED',
    actor?: CurrentUser
  ): Promise<boolean> {
    const current = this.getMembers().find(member => member.id === memberId);
    if (!current) return false;

    try {
      await this.adminUpdateMember(
        memberId,
        { status },
        actor || this.getCurrentUser() || DEFAULT_PUBLIC_USER as CurrentUser,
        status === 'ACTIVE'
          ? 'Verifikasi anggota oleh administrator'
          : status === 'SUSPENDED'
            ? 'Penolakan/penonaktifan anggota oleh administrator'
            : 'Pengembalian status anggota menjadi pending'
      );
      return true;
    } catch (error) {
      console.error('[Member Status] Gagal menyimpan status:', error);
      return false;
    }
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

    // Simpan perubahan lokal terlebih dahulu agar UI langsung berubah.
    this.setMembers(filteredMembers);

    // DELETE harus diteruskan ke server agar benar-benar menghapus baris
    // pada Google Spreadsheet. Jangan hanya mengandalkan LocalStorage.
    const token = this.getAuthToken();
    const scriptUrl = getManualAppsScriptUrl();
    if (!token || !scriptUrl) {
      // Rollback jika sesi/API atau URL Apps Script belum tersedia.
      this.setMembers(members);
      console.error('[Delete Member] Sesi administrator atau URL Apps Script tidak tersedia.');
      return false;
    }

    void fetch('/api/mutate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        type: 'MEMBER',
        action: 'DELETE',
        payload: {
          id: memberId,
          memberId,
          kta: members.find(member => member.id === memberId)?.nationalMemberNumber || ''
        },
        reason: 'Penghapusan anggota oleh administrator',
        scriptUrl
      })
    }).then(async response => {
      let result: any = null;
      try { result = await response.json(); } catch {}
      if (!response.ok || !result?.success) {
        this.setMembers(members);
        console.error('[Delete Member] Server/Spreadsheet menolak penghapusan:', result?.message || response.status);
      }
    }).catch(error => {
      this.setMembers(members);
      console.error('[Delete Member] Gagal menyinkronkan penghapusan ke Spreadsheet:', error);
    });

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
    const tours = this.getTourPackages();
    const filteredTours = tours.filter(tour => tour.id !== id);
    if (filteredTours.length === tours.length) return false;

    this.setTourPackages(filteredTours);
    const token = this.getAuthToken();
    const scriptUrl = getManualAppsScriptUrl();
    if (!token || !scriptUrl) {
      this.setTourPackages(tours);
      console.error('[Delete Tour] Sesi administrator atau URL Apps Script tidak tersedia.');
      return false;
    }

    void fetch('/api/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({
        type: 'TOUR', action: 'DELETE', payload: { id },
        reason: 'Penghapusan paket wisata oleh administrator', scriptUrl
      })
    }).then(async response => {
      let result: any = null; try { result = await response.json(); } catch {}
      if (!response.ok || !result?.success) {
        this.setTourPackages(tours);
        console.error('[Delete Tour] Server/Spreadsheet menolak penghapusan:', result?.message || response.status);
      }
    }).catch(error => {
      this.setTourPackages(tours);
      console.error('[Delete Tour] Gagal menyinkronkan penghapusan:', error);
    });
    return true;
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
    const activities = this.getActivities();
    const filteredActivities = activities.filter(activity => activity.id !== id);
    if (filteredActivities.length === activities.length) return false;

    this.setActivities(filteredActivities);
    const token = this.getAuthToken();
    const scriptUrl = getManualAppsScriptUrl();
    if (!token || !scriptUrl) {
      this.setActivities(activities);
      console.error('[Delete Activity] Sesi administrator atau URL Apps Script tidak tersedia.');
      return false;
    }

    void fetch('/api/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({
        type: 'ACTIVITY', action: 'DELETE', payload: { id },
        reason: 'Penghapusan kegiatan oleh administrator', scriptUrl
      })
    }).then(async response => {
      let result: any = null; try { result = await response.json(); } catch {}
      if (!response.ok || !result?.success) {
        this.setActivities(activities);
        console.error('[Delete Activity] Server/Spreadsheet menolak penghapusan:', result?.message || response.status);
      }
    }).catch(error => {
      this.setActivities(activities);
      console.error('[Delete Activity] Gagal menyinkronkan penghapusan:', error);
    });
    return true;
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
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (!data || !Array.isArray(data.members)) return false;

      // Jangan menghapus data lokal hanya karena server sedang kosong.
      if (data.members.length > 0) {
        this.setMembers(data.members as Member[]);
      }

      if (Array.isArray(data.users) && data.users.length > 0) {
        this.setUsers(data.users as CurrentUser[]);
      }

      if (Array.isArray(data.auditLogs)) {
        try {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
        } catch {}
      }

      this.notify();
      return true;
    } catch (error) {
      console.warn('[Storage] Sinkronisasi server gagal:', error);
      return false;
    }
  }
}

export const storage =
  new StorageService();
