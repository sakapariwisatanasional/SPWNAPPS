import { Member, TourPackage, CulinarySouvenirItem, Activity, CurrentUser, UserRole, Certification, MemberSkill } from '../types';
import { storage } from './storage';
import { PROVINCES_DATA, REGENCIES_DATA } from '../data/indonesiaTerritories';
import { MASTER_SKILLS } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;
export const DEFAULT_APPS_SCRIPT_URL = ''; // URL GAS WAJIB diisi manual melalui Dashboard

const SPREADSHEET_CONFIG_KEY = 'saka_spreadsheet_config_v1';

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  scriptUrl?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  autoRefreshIntervalSeconds?: number;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'IDLE';
  lastError?: string;
}

class SpreadsheetService {
  private config: SpreadsheetConfig;
  private isPushing = false;
  private isSyncing = false;
  private syncListeners: (() => void)[] = [];
  private liveSyncTimer: any = null;
  private isLiveSyncActive = false;
  private memberSyncInFlight = new Map<string, Promise<{ success: boolean; synced: boolean; message: string; requestId?: string; row?: number | null }>>();
  private syncState = {
    isSaving: false,
    lastSavedTime: null as string | null,
    lastSavedAction: null as string | null,
    error: null as string | null,
    isLivePolling: true,
    lastLiveCheck: null as string | null,
    pollingIntervalSeconds: 6
  };

  constructor() {
    this.config = this.loadConfig();
    this.syncState.pollingIntervalSeconds = this.config.autoRefreshIntervalSeconds || 6;
    this.initAutoSync();
    this.startLiveSyncEngine((this.config.autoRefreshIntervalSeconds || 6) * 1000);
    this.fetchServerConfig().catch(() => {});
  }

  public async fetchServerConfig() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) {
          const localScriptUrl = String(this.config.scriptUrl || '').trim();
          const localSpreadsheetId = String(this.config.spreadsheetId || '').trim();
          const serverScriptUrl = String(data.config.scriptUrl || '').trim();
          const serverSpreadsheetId = String(data.config.spreadsheetId || '').trim();

          this.config = {
            ...this.config,
            ...data.config,
            spreadsheetId: localSpreadsheetId || serverSpreadsheetId || DEFAULT_SPREADSHEET_ID,
            spreadsheetUrl: this.config.spreadsheetUrl || data.config.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
            scriptUrl: localScriptUrl || serverScriptUrl
          };
          localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
          this.notifySyncState();
        }
      }
    } catch {}
  }

  public startLiveSyncEngine(intervalMs: number = 6000) {
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
    this.isLiveSyncActive = true;
    this.syncState.pollingIntervalSeconds = Math.round(intervalMs / 1000);

    this.liveSyncTimer = setInterval(() => {
      if (this.config.autoSync !== false) {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      }
    }, intervalMs);
  }

  public stopLiveSyncEngine() {
    this.isLiveSyncActive = false;
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
  }

  private loadConfig(): SpreadsheetConfig {
    const defaultConf: SpreadsheetConfig = {
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
      scriptUrl: '',
      autoSync: true,
      autoRefreshIntervalSeconds: 6,
      status: 'IDLE'
    };

    try {
      const stored = localStorage.getItem(SPREADSHEET_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultConf,
          ...parsed,
          spreadsheetId: (parsed.spreadsheetId && parsed.spreadsheetId.trim()) || DEFAULT_SPREADSHEET_ID,
          spreadsheetUrl: (parsed.spreadsheetUrl && parsed.spreadsheetUrl.trim()) || DEFAULT_SPREADSHEET_URL,
          scriptUrl: (parsed.scriptUrl && parsed.scriptUrl.trim()) || '',
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
          autoRefreshIntervalSeconds: parsed.autoRefreshIntervalSeconds || 6
        };
      }
    } catch {}
    return defaultConf;
  }

  public saveConfig(newConfig: Partial<SpreadsheetConfig>): SpreadsheetConfig {
    let cleanId = newConfig.spreadsheetId ? newConfig.spreadsheetId.trim() : this.config.spreadsheetId;
    let cleanUrl = newConfig.spreadsheetUrl ? newConfig.spreadsheetUrl.trim() : this.config.spreadsheetUrl;
    let cleanScriptUrl = newConfig.scriptUrl !== undefined ? newConfig.scriptUrl.trim() : this.config.scriptUrl;

    if (cleanUrl && (!cleanId || cleanId === DEFAULT_SPREADSHEET_ID)) {
      const match = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) cleanId = match[1];
    }

    if (cleanId && (!cleanUrl || cleanUrl === DEFAULT_SPREADSHEET_URL)) {
      cleanUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit?usp=sharing`;
    }

    this.config = {
      ...this.config,
      ...newConfig,
      spreadsheetId: cleanId || DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: cleanUrl || DEFAULT_SPREADSHEET_URL,
      scriptUrl: cleanScriptUrl,
      autoSync: newConfig.autoSync !== undefined ? newConfig.autoSync : this.config.autoSync
    };

    try {
      localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
    } catch {}

    this.notifySyncState();
    return this.config;
  }

  public getConfig(): SpreadsheetConfig {
    return { ...this.config };
  }

  public getSyncState() {
    return {
      ...this.syncState,
      autoSync: this.config.autoSync !== false,
      hasScriptUrl: Boolean(this.normalizeAppsScriptUrl(this.config.scriptUrl)),
      status: this.config.status,
      lastSyncedAt: this.config.lastSyncedAt,
      isLiveSyncActive: this.isLiveSyncActive
    };
  }

  public subscribeSyncState(listener: () => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifySyncState() {
    this.syncListeners.forEach(cb => {
      try { cb(); } catch {}
    });
  }

  private initAutoSync() {
    storage.subscribeMutation(async (event) => {
      if (this.config.autoSync === false) return;
      await this.handleAutoSyncMutation(event);
    });
  }

  private async handleAutoSyncMutation(event: any) {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) return;

    try {
      if (event.type === 'MEMBER' && (event.action === 'CREATE' || event.action === 'UPDATE')) {
        const member: Member = event.payload;
        if (member) {
          await this.saveMemberAndWaitForSync(member);
        }
      }
    } catch (err: any) {
      console.warn('Auto sync error:', err);
    }
  }

  // Pembaca nilai kolom multi-alias fleksibel
  private getRowVal(row: Record<string, any>, aliases: string[]): string {
    if (!row) return '';
    const keys = Object.keys(row);
    
    // 1. Exact match
    for (const alias of aliases) {
      if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
        return String(row[alias]).trim();
      }
    }

    // 2. Case-insensitive / partial match
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanKey === cleanAlias || cleanKey.includes(cleanAlias)) {
          if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
            return String(row[k]).trim();
          }
        }
      }
    }

    return '';
  }

  public async fetchSheetRows(sheetName: string = 'Anggota'): Promise<Record<string, any>[]> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) return [];

    try {
      const url = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // Sinkronisasi data anggota riil dari Spreadsheet ke sistem.
  // Prinsip penting:
  // 1. Spreadsheet adalah sumber persistensi, tetapi polling TIDAK boleh menghapus
  //    data lokal hanya karena kolom Spreadsheet kosong.
  // 2. Perubahan yang baru saja dikirim ke server dilindungi sampai Spreadsheet
  //    benar-benar memantulkan nilai tersebut.
  // 3. Jangan membuat data palsu/default untuk field yang kosong di Spreadsheet.
  public async syncFromSpreadsheet(silent: boolean = false): Promise<{ success: boolean; count: number; message: string }> {
    if (this.isSyncing) return { success: false, count: 0, message: 'Sinkronisasi sedang berjalan.' };
    this.isSyncing = true;
    if (!silent) this.saveConfig({ status: 'SYNCING' });

    try {
      const rows = await this.fetchSheetRows('Anggota');

      // Jangan pernah mengganti database lokal dengan array kosong.
      if (!Array.isArray(rows) || rows.length === 0) {
        this.isSyncing = false;
        this.saveConfig({ status: 'CONNECTED', lastSyncedAt: new Date().toISOString() });
        return { success: true, count: 0, message: 'Spreadsheet tidak mengembalikan data; data lokal dipertahankan.' };
      }

      const existingMembers = storage.getMembers();
      const merged = [...existingMembers];

      let pendingMap: Record<string, any> = {};
      try {
        const raw = localStorage.getItem('saka_pending_member_writes_v1');
        pendingMap = raw ? JSON.parse(raw) : {};
      } catch {}

      const clean = (value: any) => String(value ?? '').trim();
      const nonEmpty = (value: any) => clean(value) !== '';

      const clearPendingIfConfirmed = (memberId: string, sheetMember: Member) => {
        const pending = pendingMap[memberId];
        if (!pending) return;

        const expected = pending.member || {};
        const checks = ['fullName', 'email', 'phone', 'provinceName', 'regencyName', 'branchName', 'gugusDepan', 'krida', 'status'];
        const confirmed = checks.every(key => {
          const wanted = clean(expected[key]);
          if (!wanted) return true;
          return clean((sheetMember as any)[key]) === wanted;
        });

        if (confirmed || Date.now() - Number(pending.timestamp || 0) > 10 * 60 * 1000) {
          delete pendingMap[memberId];
        }
      };

      rows.forEach((row, idx) => {
        const fullName = this.getRowVal(row, ['Nama Lengkap', 'nama_lengkap', 'Nama', 'Full Name', 'Nama Peserta']);
        const kta = this.getRowVal(row, ['Nomor KTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA']);
        const explicitId = this.getRowVal(row, ['ID Anggota', 'ID', 'id', 'Member ID']);

        // Baris tanpa identitas anggota tidak boleh dibuat menjadi anggota kosong.
        if (!fullName && !kta && !explicitId) return;

        const memberId = explicitId || (kta ? `mem-${kta.replace(/[^a-zA-Z0-9]/g, '')}` : `mem-sheet-${idx + 1}`);

        const rawProv = this.getRowVal(row, ['Kwarda / Provinsi', 'Provinsi', 'Kwarda', 'Province', 'provinsi']);
        const rawKab = this.getRowVal(row, ['Kwarcab / Kabupaten', 'Kabupaten', 'Kwarcab', 'Kabupaten/Kota', 'Kota', 'kabupaten']);
        const rawKec = this.getRowVal(row, ['Kwarran / Kecamatan', 'Kecamatan', 'Kwarran', 'Ranting', 'kecamatan_ranting']);
        const rawGudep = this.getRowVal(row, ['Gugus Depan / Pangkalan', 'Gugus Depan', 'Gudep', 'Pangkalan', 'gudep']);
        const rawPhone = this.getRowVal(row, ['Nomor WhatsApp', 'WhatsApp', 'No WA', 'No. WA', 'Telepon', 'Phone', 'nomor_wa', 'No HP']);
        const rawEmail = this.getRowVal(row, ['Email', 'Alamat Email', 'Surel', 'email']);
        const rawKrida = this.getRowVal(row, ['Krida', 'Pilihan Krida', 'Nama Krida', 'krida']);
        const rawAvatar = this.getRowVal(row, ['Foto URL', 'Foto', 'Pas Foto', 'Link Foto', 'Avatar', 'foto_url']);
        const rawDate = this.getRowVal(row, ['Tanggal Daftar', 'Tanggal Registrasi', 'Timestamp', 'tanggal_daftar']);
        const rawStatus = this.getRowVal(row, ['Status Verifikasi', 'Status Anggota', 'Status', 'status', 'Validasi']).toUpperCase();

        const matchedProv = PROVINCES_DATA.find(p =>
          (rawProv && p.name.toLowerCase().includes(rawProv.toLowerCase())) ||
          (rawProv && rawProv.toLowerCase().includes(p.name.toLowerCase()))
        );

        const existingIdx = merged.findIndex(m =>
          m.id === memberId || (kta && m.nationalMemberNumber === kta)
        );
        const existing = existingIdx >= 0 ? merged[existingIdx] : undefined;
        const pending = pendingMap[memberId];

        let finalStatus: 'ACTIVE' | 'PENDING' | 'SUSPENDED' = existing?.status || 'PENDING';
        if (rawStatus.includes('AKTIF') || rawStatus.includes('ACTIVE') || rawStatus.includes('DISETUJUI') || rawStatus.includes('APPROVED')) {
          finalStatus = 'ACTIVE';
        } else if (rawStatus.includes('SUSPEND') || rawStatus.includes('TOLAK') || rawStatus.includes('REJECT')) {
          finalStatus = 'SUSPENDED';
        } else if (rawStatus.includes('PENDING') || rawStatus.includes('MENUNGGU') || rawStatus.includes('PROSES')) {
          finalStatus = 'PENDING';
        }

        // Selama write belum dikonfirmasi Spreadsheet, jangan biarkan polling
        // mengembalikan status/data ke versi lama.
        if (pending?.member) {
          const expected = pending.member as Member;
          finalStatus = expected.status || finalStatus;
        }

        const memberObj: Member = {
          ...(existing || {} as Member),
          id: memberId,
          userId: existing?.userId || `user-${memberId}`,
          nationalMemberNumber: nonEmpty(kta) ? kta : existing?.nationalMemberNumber,
          fullName: nonEmpty(fullName) ? fullName : existing?.fullName || '',
          nikMasked: existing?.nikMasked || '**************',
          avatarUrl: nonEmpty(rawAvatar) ? rawAvatar : existing?.avatarUrl || '',
          gender: existing?.gender || 'LAKI_LAKI',
          birthPlace: existing?.birthPlace || '',
          birthDate: existing?.birthDate || '',
          phone: nonEmpty(rawPhone) ? rawPhone : existing?.phone || '',
          email: nonEmpty(rawEmail) ? rawEmail : existing?.email || '',
          address: existing?.address || '',
          provinceId: matchedProv?.id || existing?.provinceId || '',
          provinceName: nonEmpty(rawProv) ? rawProv : existing?.provinceName || '',
          regencyId: existing?.regencyId || '',
          regencyName: nonEmpty(rawKab) ? rawKab : existing?.regencyName || '',
          districtId: existing?.districtId || '',
          districtName: nonEmpty(rawKec) ? rawKec : existing?.districtName || '',
          branchId: existing?.branchId || '',
          branchName: nonEmpty(rawKec) ? `Kwarran ${rawKec}` : existing?.branchName || '',
          gugusDepan: nonEmpty(rawGudep) ? rawGudep : existing?.gugusDepan || '',
          joinYear: existing?.joinYear || new Date().getFullYear(),
          currentPosition: existing?.currentPosition || '',
          krida: nonEmpty(rawKrida) ? rawKrida as any : existing?.krida as any,
          status: finalStatus,
          educationLevel: existing?.educationLevel || '',
          occupation: existing?.occupation || '',
          bio: existing?.bio || '',
          skills: existing?.skills || [],
          certifications: existing?.certifications || [],
          registeredAt: nonEmpty(rawDate) ? rawDate : existing?.registeredAt || new Date().toISOString(),
          locationHistory: existing?.locationHistory || []
        };

        // Jika pending menyimpan snapshot lengkap, pertahankan field lokal yang
        // belum dipantulkan Spreadsheet agar polling tidak mengosongkannya.
        if (pending?.member) {
          const expected = pending.member as Member;
          const protectedFields: (keyof Member)[] = [
            'fullName', 'email', 'phone', 'address', 'provinceId', 'provinceName',
            'regencyId', 'regencyName', 'districtId', 'districtName', 'branchId',
            'branchName', 'gugusDepan', 'krida', 'currentPosition', 'educationLevel',
            'occupation', 'bio', 'avatarUrl', 'nationalMemberNumber', 'status'
          ];
          protectedFields.forEach(field => {
            const wanted = expected[field];
            if (wanted !== undefined && wanted !== null && clean(wanted) !== '') {
              (memberObj as any)[field] = wanted;
            }
          });
        }

        if (existingIdx >= 0) {
          merged[existingIdx] = { ...merged[existingIdx], ...memberObj };
        } else {
          merged.push(memberObj);
        }

        clearPendingIfConfirmed(memberId, memberObj);
      });

      try {
        localStorage.setItem('saka_pending_member_writes_v1', JSON.stringify(pendingMap));
      } catch {}

      storage.setMembers(merged);
      this.saveConfig({ status: 'CONNECTED', lastSyncedAt: new Date().toISOString() });
      this.isSyncing = false;
      return { success: true, count: rows.length, message: 'Sinkronisasi data riil berhasil tanpa mengosongkan data lokal.' };
    } catch (err: any) {
      this.isSyncing = false;
      this.saveConfig({ status: 'ERROR', lastError: err?.message });
      return { success: false, count: 0, message: err?.message || 'Gagal sinkronisasi.' };
    }
  }

  private normalizeAppsScriptUrl(raw?: string): string {
    const value = String(raw || '').trim().replace(/\s+/g, '');
    if (!value || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(value)) {
      return '';
    }
    return value;
  }

  public async saveMemberAndWaitForSync(member: Member): Promise<{ success: boolean; synced: boolean; message: string; row?: number | null }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) return { success: false, synced: false, message: 'URL Apps Script belum diisi.' };

    const rowData = [
      member.id,
      member.nationalMemberNumber || '',
      member.fullName || '',
      member.email || '',
      member.phone || '',
      member.provinceName || '',
      member.regencyName || '',
      member.branchName || '',
      member.gugusDepan || '',
      member.krida || '',
      member.status || 'PENDING',
      /^data:image\//i.test(String(member.avatarUrl || '')) ? '' : (member.avatarUrl || ''),
      member.registeredAt || new Date().toISOString(),
      typeof window !== 'undefined'
        ? `${window.location.origin}/profile?memberId=${encodeURIComponent(member.id)}&nta=${encodeURIComponent(member.nationalMemberNumber || member.id)}`
        : ''
    ];

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'UPSERT_MEMBER',
          sheet: 'Anggota',
          memberId: member.id,
          rowData
        })
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script HTTP ${response.status}`);
      }

      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error('Respons Google Apps Script bukan JSON yang valid. Pastikan Web App sudah di-deploy ulang.');
      }

      if (!result || result.success !== true || result.status !== 'success') {
        throw new Error(result?.message || 'Google Apps Script gagal menyimpan data.');
      }

      return {
        success: true,
        synced: true,
        message: result.message || 'Data berhasil disimpan ke Google Spreadsheet.',
        row: typeof result.row === 'number' ? result.row : null
      };
    } catch (err: any) {
      return {
        success: false,
        synced: false,
        message: err?.message || 'Gagal mengirim data ke Google Spreadsheet.'
      };
    }
  }

  public async pushAllDataToSpreadsheet(): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    try {
      const members = storage.getMembers();
      const memberRows = members.map(m => [
        m.id,
        m.nationalMemberNumber || '',
        m.fullName || '',
        m.email || '',
        m.phone || '',
        m.provinceName || '',
        m.regencyName || '',
        m.branchName || '',
        m.gugusDepan || '',
        m.krida || '',
        m.status || 'PENDING',
        /^data:image\//i.test(String(m.avatarUrl || '')) ? '' : (m.avatarUrl || ''),
        m.registeredAt || new Date().toISOString(),
        ''
      ]);

      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'SYNC_ALL_DATA',
          sheet: 'Anggota',
          data: { members: memberRows }
        })
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script HTTP ${response.status}`);
      }

      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error('Respons Google Apps Script bukan JSON yang valid. Pastikan Web App sudah di-deploy ulang.');
      }

      if (!result || result.success !== true || result.status !== 'success') {
        throw new Error(result?.message || 'Google Apps Script gagal menyinkronkan data.');
      }

      return {
        success: true,
        message: result.message || `Sinkronisasi berhasil. Ditambah: ${result.inserted || 0}, diperbarui: ${result.updated || 0}.`
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal push data.' };
    }
  }

  /**
   * Upload gambar melalui server API -> Google Apps Script -> Google Drive.
   * Method ini sengaja TIDAK mengembalikan Base64 sebagai avatarUrl.
   */
  public async uploadImageToDrive(
    base64: string,
    filename: string,
    category: string = 'MEMBER_AVATAR'
  ): Promise<{ success: boolean; url: string; fileId?: string; message?: string }> {
    if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(String(base64 || '').trim())) {
      throw new Error('Format foto tidak valid.');
    }

    // Upload dilakukan melalui backend aplikasi. Backend memakai URL GAS
    // yang disimpan oleh Super Admin melalui Dashboard, sehingga perangkat
    // pengguna (termasuk HP) tidak perlu memiliki URL GAS di localStorage.
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        base64,
        filename: filename || `image_${Date.now()}.jpg`,
        category,
        scriptUrl: this.normalizeAppsScriptUrl(this.config.scriptUrl)
      })
    });

    let result: any = null;
    try { result = await response.json(); } catch {}

    if (!response.ok || !result?.success || !result?.url) {
      throw new Error(result?.message || `Upload foto gagal (HTTP ${response.status}).`);
    }

    return {
      success: true,
      url: String(result.url),
      fileId: result.fileId ? String(result.fileId) : undefined,
      message: result.message
    };
  }

  public async setupDriveFolders(): Promise<{ success: boolean; directActionUrl?: string; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) {
      return { success: false, message: 'URL Google Apps Script belum diisi melalui Dashboard.' };
    }
    const directActionUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=SETUP_DRIVE_FOLDERS`;
    return {
      success: true,
      directActionUrl,
      message: 'URL inisialisasi folder Google Drive siap dijalankan.'
    };
  }

  public getGoogleAppsScriptTemplate(): string {
    return this.getAppsScriptTemplateCode();
  }

  public getAppsScriptTemplateCode(): string {
    return "/**\n * ============================================================\n * SISTEM SINKRONISASI REAL-TIME SAKA PARIWISATA\n * GOOGLE APPS SCRIPT - Code.gs\n * ============================================================\n *\n * Fungsi:\n * 1. Membaca data anggota dari Spreadsheet\n * 2. Menerima pendaftaran anggota baru\n * 3. UPSERT data anggota\n * 4. Memperbarui status verifikasi anggota\n * 5. Mendukung sinkronisasi aplikasi web\n *\n * SHEET:\n * Anggota\n *\n * KOLOM:\n * A = ID Anggota\n * B = Nomor KTA\n * C = Nama Lengkap\n * D = Email\n * E = Nomor WhatsApp\n * F = Kwarda / Provinsi\n * G = Kwarcab / Kabupaten\n * H = Kwarran / Kecamatan\n * I = Gugus Depan / Pangkalan\n * J = Krida\n * K = Status Verifikasi\n * L = Foto URL\n * M = Tanggal Daftar\n * N = Link Verifikasi Cepat\n * ============================================================\n */\n\n\n/* ============================================================\n * KONFIGURASI\n * ============================================================ */\n\nvar SHEET_MEMBER = \"Anggota\";\n\n// ID Spreadsheet tujuan. Ambil dari URL Google Spreadsheet.\nvar SPREADSHEET_ID = \"1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E\";\n\nfunction getSpreadsheet() {\n  if (!SPREADSHEET_ID) {\n    throw new Error(\"SPREADSHEET_ID belum diisi.\");\n  }\n  return SpreadsheetApp.openById(SPREADSHEET_ID);\n}\n\nvar MEMBER_HEADERS = [\n  \"ID Anggota\",\n  \"Nomor KTA\",\n  \"Nama Lengkap\",\n  \"Email\",\n  \"Nomor WhatsApp\",\n  \"Kwarda / Provinsi\",\n  \"Kwarcab / Kabupaten\",\n  \"Kwarran / Kecamatan\",\n  \"Gugus Depan / Pangkalan\",\n  \"Krida\",\n  \"Status Verifikasi\",\n  \"Foto URL\",\n  \"Tanggal Daftar\",\n  \"Link Verifikasi Cepat\"\n];\n\n\n/* ============================================================\n * RESPONSE JSON\n * ============================================================ */\n\nfunction jsonResponse(data) {\n  return ContentService\n    .createTextOutput(JSON.stringify(data))\n    .setMimeType(ContentService.MimeType.JSON);\n}\n\n\n/* ============================================================\n * INISIALISASI SHEET\n * ============================================================ */\n\nfunction getOrInitSheet(ss) {\n  var sheet = ss.getSheetByName(SHEET_MEMBER);\n\n  if (!sheet) {\n    sheet = ss.insertSheet(SHEET_MEMBER);\n  }\n\n  ensureHeaders(sheet);\n\n  return sheet;\n}\n\n\n/* ============================================================\n * MEMASTIKAN HEADER\n * ============================================================ */\n\nfunction ensureHeaders(sheet) {\n\n  var requiredColumns = MEMBER_HEADERS.length;\n\n  if (sheet.getMaxColumns() < requiredColumns) {\n    sheet.insertColumnsAfter(\n      sheet.getMaxColumns(),\n      requiredColumns - sheet.getMaxColumns()\n    );\n  }\n\n  var currentHeaders = sheet\n    .getRange(1, 1, 1, requiredColumns)\n    .getValues()[0];\n\n  var needsUpdate = false;\n\n  for (var i = 0; i < requiredColumns; i++) {\n\n    if (\n      String(currentHeaders[i] || \"\").trim() !==\n      MEMBER_HEADERS[i]\n    ) {\n      needsUpdate = true;\n      break;\n    }\n\n  }\n\n  if (needsUpdate) {\n\n    sheet\n      .getRange(1, 1, 1, requiredColumns)\n      .setValues([MEMBER_HEADERS]);\n\n    sheet\n      .getRange(1, 1, 1, requiredColumns)\n      .setFontWeight(\"bold\");\n\n  }\n\n}\n\n\n/* ============================================================\n * NORMALISASI DATA\n * ============================================================ */\n\nfunction normalizeMemberRow(row) {\n\n  var result = [];\n\n  for (var i = 0; i < MEMBER_HEADERS.length; i++) {\n\n    if (\n      row &&\n      row[i] !== undefined &&\n      row[i] !== null\n    ) {\n      result.push(row[i]);\n    } else {\n      result.push(\"\");\n    }\n\n  }\n\n  return result;\n}\n\n\n/* ============================================================\n * MENCARI ANGGOTA\n *\n * Berdasarkan:\n * - ID Anggota\n * - Nomor KTA\n * ============================================================ */\n\nfunction findMemberRow(sheet, memberId, memberKta) {\n\n  var lastRow = sheet.getLastRow();\n\n  if (lastRow <= 1) {\n    return null;\n  }\n\n  var values = sheet\n    .getRange(\n      2,\n      1,\n      lastRow - 1,\n      MEMBER_HEADERS.length\n    )\n    .getValues();\n\n  var id = String(memberId || \"\").trim();\n  var kta = String(memberKta || \"\").trim();\n\n  for (var i = 0; i < values.length; i++) {\n\n    var rowId =\n      String(values[i][0] || \"\").trim();\n\n    var rowKta =\n      String(values[i][1] || \"\").trim();\n\n    if (id && rowId === id) {\n\n      return {\n        rowNumber: i + 2,\n        index: i\n      };\n\n    }\n\n    if (kta && rowKta === kta) {\n\n      return {\n        rowNumber: i + 2,\n        index: i\n      };\n\n    }\n\n  }\n\n  return null;\n}\n\n\n/* ============================================================\n * GET\n *\n * Digunakan oleh Web App untuk membaca anggota.\n *\n * Contoh:\n * ?action=CHECK_RECORD&id=ABC123\n *\n * atau:\n * ?action=CHECK_RECORD&secondaryId=KTA123\n * ============================================================ */\n\nfunction doGet(e) {\n\n  try {\n\n    var ss =\n      getSpreadsheet();\n\n    var sheetName = SHEET_MEMBER;\n\n    if (\n      e &&\n      e.parameter &&\n      e.parameter.sheet\n    ) {\n      sheetName =\n        String(e.parameter.sheet).trim();\n    }\n\n    var sheet =\n      ss.getSheetByName(sheetName);\n\n    if (!sheet) {\n\n      return jsonResponse({\n        success: true,\n        found: false,\n        data: [],\n        message: \"Sheet belum ada\"\n      });\n\n    }\n\n\n    /* --------------------------------------------------------\n     * CHECK RECORD\n     * -------------------------------------------------------- */\n\n    var action = \"\";\n\n    if (\n      e &&\n      e.parameter &&\n      e.parameter.action\n    ) {\n      action =\n        String(e.parameter.action).trim();\n    }\n\n\n    if (action === \"CHECK_RECORD\") {\n\n      var checkId = \"\";\n\n      var checkSecondaryId = \"\";\n\n      if (\n        e.parameter.id !== undefined\n      ) {\n        checkId =\n          String(e.parameter.id).trim();\n      }\n\n      if (\n        e.parameter.secondaryId !== undefined\n      ) {\n        checkSecondaryId =\n          String(e.parameter.secondaryId).trim();\n      }\n\n\n      var lastRow =\n        sheet.getLastRow();\n\n      if (lastRow <= 1) {\n\n        return jsonResponse({\n          success: true,\n          found: false,\n          message: \"Belum ada data anggota\"\n        });\n\n      }\n\n\n      var values =\n        sheet\n          .getRange(\n            2,\n            1,\n            lastRow - 1,\n            MEMBER_HEADERS.length\n          )\n          .getValues();\n\n\n      for (\n        var r = 0;\n        r < values.length;\n        r++\n      ) {\n\n        var rowId =\n          String(values[r][0] || \"\").trim();\n\n        var rowKta =\n          String(values[r][1] || \"\").trim();\n\n\n        if (\n          (checkId && rowId === checkId) ||\n          (\n            checkSecondaryId &&\n            rowKta === checkSecondaryId\n          )\n        ) {\n\n          return jsonResponse({\n            success: true,\n            found: true,\n            row: r + 2,\n            status:\n              values[r][10] || \"PENDING\",\n            message: \"Record ditemukan\"\n          });\n\n        }\n\n      }\n\n\n      return jsonResponse({\n        success: true,\n        found: false,\n        message: \"Record belum tercatat\"\n      });\n\n    }\n\n\n    /* --------------------------------------------------------\n     * DEFAULT GET\n     * -------------------------------------------------------- */\n\n    var lastRowDefault =\n      sheet.getLastRow();\n\n    if (lastRowDefault <= 1) {\n\n      return jsonResponse([]);\n\n    }\n\n\n    var data =\n      sheet\n        .getRange(\n          1,\n          1,\n          lastRowDefault,\n          MEMBER_HEADERS.length\n        )\n        .getValues();\n\n\n    var result = [];\n\n\n    for (\n      var i = 1;\n      i < data.length;\n      i++\n    ) {\n\n      var row = data[i];\n\n\n      var hasIdentity =\n        String(row[0] || \"\").trim() ||\n        String(row[1] || \"\").trim() ||\n        String(row[2] || \"\").trim();\n\n\n      if (!hasIdentity) {\n        continue;\n      }\n\n\n      var item = {};\n\n\n      for (\n        var h = 0;\n        h < MEMBER_HEADERS.length;\n        h++\n      ) {\n\n        item[MEMBER_HEADERS[h]] =\n          row[h] !== undefined\n            ? row[h]\n            : \"\";\n\n      }\n\n\n      result.push(item);\n\n    }\n\n\n    return jsonResponse(result);\n\n\n  } catch (err) {\n\n    return jsonResponse({\n      success: false,\n      status: \"error\",\n      message:\n        err && err.message\n          ? err.message\n          : String(err)\n    });\n\n  }\n\n}\n\n\n/* ============================================================\n * POST\n *\n * Semua transaksi dari aplikasi web masuk melalui sini.\n * ============================================================ */\n\nfunction doPost(e) {\n\n  var lock =\n    LockService.getScriptLock();\n\n\n  try {\n\n    lock.waitLock(30000);\n\n\n    /* --------------------------------------------------------\n     * VALIDASI PAYLOAD\n     * -------------------------------------------------------- */\n\n    if (\n      !e ||\n      !e.postData ||\n      !e.postData.contents\n    ) {\n\n      return jsonResponse({\n        success: false,\n        status: \"error\",\n        message: \"Payload kosong\"\n      });\n\n    }\n\n\n    /* --------------------------------------------------------\n     * PARSE JSON\n     * -------------------------------------------------------- */\n\n    var body = null;\n\n\n    try {\n\n      body =\n        JSON.parse(\n          e.postData.contents\n        );\n\n    } catch (parseError) {\n\n      body =\n        e.parameter || {};\n\n    }\n\n\n    if (!body) {\n\n      return jsonResponse({\n        success: false,\n        status: \"error\",\n        message: \"Payload tidak valid\"\n      });\n\n    }\n\n\n    /* --------------------------------------------------------\n     * SPREADSHEET\n     * -------------------------------------------------------- */\n\n    var ss =\n      getSpreadsheet();\n\n    var sheet =\n      getOrInitSheet(ss);\n\n\n    /* ========================================================\n     * ACTION 1\n     *\n     * UPDATE_AUTH_STATUS\n     *\n     * Mengubah:\n     * ACTIVE\n     * PENDING\n     * SUSPENDED\n     * ======================================================== */\n\n    if (\n      body.action ===\n      \"UPDATE_AUTH_STATUS\"\n    ) {\n\n      var authMemberId =\n        String(\n          body.memberId || \"\"\n        ).trim();\n\n\n      var authStatus =\n        String(\n          body.status || \"PENDING\"\n        )\n        .trim()\n        .toUpperCase();\n\n\n      var allowedStatuses = [\n        \"ACTIVE\",\n        \"PENDING\",\n        \"SUSPENDED\"\n      ];\n\n\n      if (\n        allowedStatuses.indexOf(\n          authStatus\n        ) === -1\n      ) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Status tidak valid: \" +\n            authStatus\n        });\n\n      }\n\n\n      if (!authMemberId) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"memberId wajib diisi\"\n        });\n\n      }\n\n\n      var authFound =\n        findMemberRow(\n          sheet,\n          authMemberId,\n          \"\"\n        );\n\n\n      if (!authFound) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Anggota dengan ID \" +\n            authMemberId +\n            \" tidak ditemukan\"\n        });\n\n      }\n\n\n      /* Kolom K = 11 */\n\n      sheet\n        .getRange(\n          authFound.rowNumber,\n          11\n        )\n        .setValue(authStatus);\n\n\n      SpreadsheetApp.flush();\n\n\n      var savedStatus =\n        String(\n          sheet\n            .getRange(\n              authFound.rowNumber,\n              11\n            )\n            .getValue() || \"\"\n        )\n        .trim()\n        .toUpperCase();\n\n\n      if (\n        savedStatus !==\n        authStatus\n      ) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Status gagal disimpan\"\n        });\n\n      }\n\n\n      return jsonResponse({\n        success: true,\n        status: \"success\",\n        action:\n          \"UPDATE_AUTH_STATUS\",\n        memberId:\n          authMemberId,\n        newStatus:\n          savedStatus,\n        row:\n          authFound.rowNumber,\n        message:\n          \"Status anggota berhasil diperbarui\"\n      });\n\n    }\n\n\n    /* ========================================================\n     * ACTION 1.5\n     *\n     * UPLOAD_IMAGE\n     *\n     * Menerima data:image/* Base64 hanya untuk dibuat menjadi file\n     * Google Drive. Base64 TIDAK pernah ditulis ke Spreadsheet.\n     * ======================================================== */\n\n    if (body.action === \"UPLOAD_IMAGE\") {\n\n      var imageBase64 = String(body.base64 || \"\").trim();\n      var imageFilename = String(body.filename || (\"image_\" + new Date().getTime() + \".jpg\")).trim();\n      var imageCategory = String(body.category || \"MEMBER_AVATAR\").trim().toUpperCase();\n\n      if (!/^data:image\\/(?:png|jpe?g|webp|gif);base64,/i.test(imageBase64)) {\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message: \"Data gambar tidak valid.\"\n        });\n      }\n\n      var MAX_IMAGE_BASE64 = 12 * 1024 * 1024;\n      if (imageBase64.length > MAX_IMAGE_BASE64) {\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message: \"Data gambar terlalu besar.\"\n        });\n      }\n\n      var imageMatch = imageBase64.match(/^data:(image\\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);\n      if (!imageMatch) {\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message: \"Format Base64 gambar tidak valid.\"\n        });\n      }\n\n      var mimeType = imageMatch[1];\n      var bytes = Utilities.base64Decode(imageMatch[2]);\n      var blob = Utilities.newBlob(bytes, mimeType, imageFilename);\n\n      // Semua kategori saat ini berada di repository Drive utama.\n      // Jika folder kategori dipisahkan nanti, cukup ubah pemetaan ini.\n      var folderId = \"16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh\";\n      var folder = DriveApp.getFolderById(folderId);\n      var file = folder.createFile(blob);\n\n      file.setName(imageFilename);\n\n      try {\n        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);\n      } catch (sharingError) {\n        console.log(\"Peringatan sharing Drive: \" + sharingError);\n      }\n\n      var fileId = file.getId();\n      var directUrl = \"https://lh3.googleusercontent.com/d/\" + fileId;\n      var viewUrl = \"https://drive.google.com/file/d/\" + fileId + \"/view\";\n\n      return jsonResponse({\n        success: true,\n        status: \"success\",\n        action: \"UPLOAD_IMAGE\",\n        fileId: fileId,\n        url: directUrl,\n        directUrl: directUrl,\n        viewUrl: viewUrl,\n        category: imageCategory,\n        filename: imageFilename,\n        message: \"Foto berhasil disimpan ke Google Drive\"\n      });\n    }\n\n\n    /* ========================================================\n     * ACTION 2\n     *\n     * UPSERT_MEMBER\n     * ======================================================== */\n\n    if (\n      body.action ===\n      \"UPSERT_MEMBER\"\n    ) {\n\n      var row =\n        body.rowData || null;\n\n\n      /* ------------------------------------------------------\n       * Jika data dikirim sebagai object member\n       * ------------------------------------------------------ */\n\n      if (\n        !row &&\n        body.member\n      ) {\n\n        var m =\n          body.member;\n\n\n        row = [\n          m.id || \"\",\n          m.nationalMemberNumber || \"\",\n          m.fullName || \"\",\n          m.email || \"\",\n          m.phone || \"\",\n          m.provinceName || \"\",\n          m.regencyName || \"\",\n          m.branchName || \"\",\n          m.gugusDepan || \"\",\n          m.krida || \"\",\n          m.status || \"PENDING\",\n          m.avatarUrl || \"\",\n          m.registeredAt ||\n            new Date().toISOString(),\n          m.verificationLink || \"\"\n        ];\n\n      }\n\n\n      if (\n        !row ||\n        !Array.isArray(row)\n      ) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"rowData atau member wajib diisi\"\n        });\n\n      }\n\n\n      row =\n        normalizeMemberRow(row);\n\n\n      var rowId =\n        String(\n          body.memberId ||\n          row[0] ||\n          \"\"\n        ).trim();\n\n\n      var rowKta =\n        String(\n          row[1] || \"\"\n        ).trim();\n\n\n      if (!rowId) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"ID Anggota wajib diisi\"\n        });\n\n      }\n\n\n      var found =\n        findMemberRow(\n          sheet,\n          rowId,\n          rowKta\n        );\n\n\n      var targetRow = 0;\n\n\n      /* ------------------------------------------------------\n       * UPDATE DATA LAMA\n       * ------------------------------------------------------ */\n\n      if (found) {\n\n        targetRow =\n          found.rowNumber;\n\n\n        var oldRow =\n          sheet\n            .getRange(\n              targetRow,\n              1,\n              1,\n              MEMBER_HEADERS.length\n            )\n            .getValues()[0];\n\n\n        var mergedRow = [];\n\n\n        for (\n          var c = 0;\n          c < MEMBER_HEADERS.length;\n          c++\n        ) {\n\n          var incoming =\n            row[c];\n\n          var oldValue =\n            oldRow[c];\n\n\n          /* ID tidak boleh hilang */\n\n          if (c === 0) {\n\n            mergedRow.push(\n              oldValue ||\n              incoming ||\n              rowId\n            );\n\n            continue;\n\n          }\n\n\n          /* Data kosong tidak menimpa data lama */\n\n          if (\n            incoming === \"\" ||\n            incoming === null ||\n            incoming === undefined\n          ) {\n\n            mergedRow.push(\n              oldValue\n            );\n\n          } else {\n\n            mergedRow.push(\n              incoming\n            );\n\n          }\n\n        }\n\n\n        sheet\n          .getRange(\n            targetRow,\n            1,\n            1,\n            MEMBER_HEADERS.length\n          )\n          .setValues([\n            mergedRow\n          ]);\n\n\n      } else {\n\n\n        /* ----------------------------------------------------\n         * TAMBAH ANGGOTA BARU\n         * ---------------------------------------------------- */\n\n        targetRow =\n          sheet.getLastRow() + 1;\n\n\n        if (targetRow < 2) {\n          targetRow = 2;\n        }\n\n\n        sheet\n          .getRange(\n            targetRow,\n            1,\n            1,\n            MEMBER_HEADERS.length\n          )\n          .setValues([\n            row\n          ]);\n\n      }\n\n\n      SpreadsheetApp.flush();\n\n\n      /* ------------------------------------------------------\n       * VERIFIKASI DATA\n       * ------------------------------------------------------ */\n\n      var savedRow =\n        sheet\n          .getRange(\n            targetRow,\n            1,\n            1,\n            MEMBER_HEADERS.length\n          )\n          .getValues()[0];\n\n\n      var savedId =\n        String(\n          savedRow[0] || \"\"\n        ).trim();\n\n\n      var savedMemberStatus =\n        String(\n          savedRow[10] || \"\"\n        ).trim();\n\n\n      if (\n        savedId !== rowId\n      ) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Verifikasi penyimpanan gagal\"\n        });\n\n      }\n\n\n      return jsonResponse({\n        success: true,\n        status: \"success\",\n        action:\n          \"UPSERT_MEMBER\",\n        memberId:\n          savedId,\n        statusVerifikasi:\n          savedMemberStatus,\n        row:\n          targetRow,\n        message:\n          found\n            ? \"Data anggota berhasil diperbarui\"\n            : \"Data anggota berhasil ditambahkan\"\n      });\n\n    }\n\n\n    /* ========================================================\n     * ACTION 3\n     *\n     * SYNC_ALL_DATA\n     *\n     * Menerima seluruh data anggota dari aplikasi web.\n     * Setiap anggota diproses sebagai UPSERT berdasarkan ID/KTA.\n     * ======================================================== */\n\n    if (body.action === \"SYNC_ALL_DATA\") {\n\n      var syncData = body.data || {};\n      var syncMembers = syncData.members || [];\n\n      if (!Array.isArray(syncMembers)) {\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message: \"data.members harus berupa array\"\n        });\n      }\n\n      var inserted = 0;\n      var updated = 0;\n      var skipped = 0;\n\n      for (var sm = 0; sm < syncMembers.length; sm++) {\n        var syncRow = syncMembers[sm];\n\n        if (!Array.isArray(syncRow)) {\n          skipped++;\n          continue;\n        }\n\n        syncRow = normalizeMemberRow(syncRow);\n\n        var syncId = String(syncRow[0] || \"\").trim();\n        var syncKta = String(syncRow[1] || \"\").trim();\n\n        if (!syncId) {\n          skipped++;\n          continue;\n        }\n\n        var syncFound = findMemberRow(sheet, syncId, syncKta);\n\n        if (syncFound) {\n          var syncOldRow = sheet\n            .getRange(syncFound.rowNumber, 1, 1, MEMBER_HEADERS.length)\n            .getValues()[0];\n\n          var syncMergedRow = [];\n\n          for (var sc = 0; sc < MEMBER_HEADERS.length; sc++) {\n            var incomingValue = syncRow[sc];\n            var oldValue = syncOldRow[sc];\n\n            if (incomingValue === \"\" || incomingValue === null || incomingValue === undefined) {\n              syncMergedRow.push(oldValue);\n            } else {\n              syncMergedRow.push(incomingValue);\n            }\n          }\n\n          syncMergedRow[0] = syncOldRow[0] || syncId;\n\n          sheet\n            .getRange(syncFound.rowNumber, 1, 1, MEMBER_HEADERS.length)\n            .setValues([syncMergedRow]);\n\n          updated++;\n        } else {\n          var newSyncRow = Math.max(sheet.getLastRow() + 1, 2);\n          sheet\n            .getRange(newSyncRow, 1, 1, MEMBER_HEADERS.length)\n            .setValues([syncRow]);\n\n          inserted++;\n        }\n      }\n\n      SpreadsheetApp.flush();\n\n      return jsonResponse({\n        success: true,\n        status: \"success\",\n        action: \"SYNC_ALL_DATA\",\n        inserted: inserted,\n        updated: updated,\n        skipped: skipped,\n        total: syncMembers.length,\n        message: \"Sinkronisasi seluruh data anggota berhasil\"\n      });\n    }\n\n\n    /* ========================================================\n     * ACTION 4\n     *\n     * VALIDATE_MEMBER\n     *\n     * Kompatibilitas sistem lama.\n     * ======================================================== */\n\n    if (\n      body.action ===\n      \"VALIDATE_MEMBER\"\n    ) {\n\n      var targetId =\n        String(\n          body.memberId || \"\"\n        ).trim();\n\n\n      var newStatus =\n        String(\n          body.status || \"ACTIVE\"\n        )\n        .trim()\n        .toUpperCase();\n\n\n      if (!targetId) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"memberId wajib diisi\"\n        });\n\n      }\n\n\n      var validateFound =\n        findMemberRow(\n          sheet,\n          targetId,\n          \"\"\n        );\n\n\n      if (!validateFound) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Anggota tidak ditemukan\"\n        });\n\n      }\n\n\n      sheet\n        .getRange(\n          validateFound.rowNumber,\n          11\n        )\n        .setValue(newStatus);\n\n\n      SpreadsheetApp.flush();\n\n\n      var validateResult =\n        String(\n          sheet\n            .getRange(\n              validateFound.rowNumber,\n              11\n            )\n            .getValue() || \"\"\n        )\n        .trim()\n        .toUpperCase();\n\n\n      if (\n        validateResult !==\n        newStatus\n      ) {\n\n        return jsonResponse({\n          success: false,\n          status: \"error\",\n          message:\n            \"Status gagal disimpan\"\n        });\n\n      }\n\n\n      return jsonResponse({\n        success: true,\n        status: \"success\",\n        action:\n          \"VALIDATE_MEMBER\",\n        memberId:\n          targetId,\n        newStatus:\n          validateResult,\n        row:\n          validateFound.rowNumber,\n        message:\n          \"Status anggota berhasil diubah\"\n      });\n\n    }\n\n\n    /* ========================================================\n     * ACTION TIDAK DIKENAL\n     * ======================================================== */\n\n    return jsonResponse({\n      success: true,\n      status: \"success\",\n      action:\n        body.action || \"\",\n      message:\n        \"Transaksi diterima\"\n    });\n\n\n  } catch (err) {\n\n\n    console.error(\n      \"GAS ERROR:\",\n      err\n    );\n\n\n    return jsonResponse({\n      success: false,\n      status: \"error\",\n      message:\n        err && err.message\n          ? err.message\n          : String(err)\n    });\n\n\n  } finally {\n\n\n    try {\n\n      lock.releaseLock();\n\n    } catch (releaseError) {\n\n      /* Tidak melakukan apa-apa */\n\n    }\n\n  }\n\n}\n\n\n/* ============================================================\n * FUNGSI TEST\n *\n * Gunakan fungsi ini dengan tombol RUN.\n *\n * Fungsi ini TIDAK membutuhkan doPost(e).\n *\n * Tes akan:\n * 1. Membuka Sheet Anggota\n * 2. Memastikan header tersedia\n * 3. Membaca jumlah data anggota\n * 4. Menampilkan hasil di Execution Log\n * ============================================================ */\n\nfunction testConnection() {\n\n  var ss =\n    getSpreadsheet();\n\n\n  if (!ss) {\n\n    throw new Error(\n      \"Spreadsheet tidak ditemukan.\"\n    );\n\n  }\n\n\n  var sheet =\n    getOrInitSheet(ss);\n\n\n  var lastRow =\n    sheet.getLastRow();\n\n\n  console.log(\n    \"====================================\"\n  );\n\n  console.log(\n    \"TEST SISTEM SAKA PARIWISATA\"\n  );\n\n  console.log(\n    \"Spreadsheet: \" +\n    ss.getName()\n  );\n\n  console.log(\n    \"Sheet: \" +\n    sheet.getName()\n  );\n\n  console.log(\n    \"Jumlah baris: \" +\n    lastRow\n  );\n\n  console.log(\n    \"Status: KONEKSI BERHASIL\"\n  );\n\n  console.log(\n    \"====================================\"\n  );\n\n\n  return {\n    success: true,\n    spreadsheet:\n      ss.getName(),\n    sheet:\n      sheet.getName(),\n    rows:\n      lastRow\n  };\n\n}\n\n\n/* ============================================================\n * TEST UPDATE STATUS\n *\n * GANTI ID_TEST DENGAN ID ANGGOTA YANG ADA.\n *\n * Contoh:\n * var ID_TEST = \"SPW-0001\";\n * ============================================================ */\n\nfunction testUpdateStatus() {\n\n  var ID_TEST = \"member-1788799985377\";\n\n\n  if (\n    ID_TEST ===\n    \"GANTI_DENGAN_ID_ANGGOTA\"\n  ) {\n\n    throw new Error(\n      \"Silakan isi ID_TEST terlebih dahulu.\"\n    );\n\n  }\n\n\n  var ss =\n    getSpreadsheet();\n\n\n  var sheet =\n    getOrInitSheet(ss);\n\n\n  var found =\n    findMemberRow(\n      sheet,\n      ID_TEST,\n      \"\"\n    );\n\n\n  if (!found) {\n\n    throw new Error(\n      \"Anggota dengan ID \" +\n      ID_TEST +\n      \" tidak ditemukan.\"\n    );\n\n  }\n\n\n  sheet\n    .getRange(\n      found.rowNumber,\n      11\n    )\n    .setValue(\"ACTIVE\");\n\n\n  SpreadsheetApp.flush();\n\n\n  var result =\n    String(\n      sheet\n        .getRange(\n          found.rowNumber,\n          11\n        )\n        .getValue() || \"\"\n    )\n    .trim()\n    .toUpperCase();\n\n\n  console.log(\n    \"ID Anggota: \" +\n    ID_TEST\n  );\n\n  console.log(\n    \"Baris: \" +\n    found.rowNumber\n  );\n\n  console.log(\n    \"Status baru: \" +\n    result\n  );\n\n\n  return {\n    success:\n      result === \"ACTIVE\",\n    memberId:\n      ID_TEST,\n    row:\n      found.rowNumber,\n    status:\n      result\n  };\n\n}";
  }

}

export const spreadsheetService = new SpreadsheetService();
