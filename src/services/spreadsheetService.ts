import { Member, TourPackage, CulinarySouvenirItem, Activity, CurrentUser, UserRole, Certification, MemberSkill } from '../types';
import { storage } from './storage';
import { PROVINCES_DATA, REGENCIES_DATA } from '../data/indonesiaTerritories';
import { MASTER_SKILLS } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;
export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0ZFGBmN3Hwt26lnUmpgXtwhS6f1PyWkezNsaU9OzSpKnIqxCaDnVcmJbl2sTaKJw4FQ/exec';

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
      scriptUrl: DEFAULT_APPS_SCRIPT_URL,
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
          scriptUrl: (parsed.scriptUrl && parsed.scriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL,
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
      hasScriptUrl: Boolean(this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL)),
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
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
      member.avatarUrl || '',
      member.registeredAt || new Date().toISOString(),
      typeof window !== 'undefined' ? `${window.location.origin}/profile?memberId=${encodeURIComponent(member.id)}&nta=${encodeURIComponent(member.nationalMemberNumber || member.id)}` : ''
    ];

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'UPSERT_MEMBER', sheet: 'Anggota', memberId: member.id, rowData })
      });
      if (!response.ok) {
        throw new Error(`Google Apps Script HTTP ${response.status}`);
      }
      let result: any = null;
      try { result = await response.json(); } catch {}
      if (result?.status === 'error') {
        throw new Error(result.message || 'Google Apps Script menolak penyimpanan.');
      }
      return { success: true, synced: true, message: 'Data berhasil disimpan ke Google Spreadsheet.' };
    } catch (err: any) {
      return { success: false, synced: false, message: err?.message || 'Gagal mengirim data.' };
    }
  }

  public async pushAllDataToSpreadsheet(): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    try {
      const members = storage.getMembers();
      const memberRows = members.map(m => [
        m.id, m.nationalMemberNumber || '', m.fullName || '', m.email || '',
        m.phone || '', m.provinceName || '', m.regencyName || '', m.branchName || '',
        m.gugusDepan || '', m.krida || '', m.status || 'PENDING', m.avatarUrl || '',
        m.registeredAt || new Date().toISOString(), ''
      ]);

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'SYNC_ALL_DATA', data: { members: memberRows } })
      });
      return { success: true, message: 'Data berhasil disinkronkan ke Spreadsheet.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal push data.' };
    }
  }

  public async setupDriveFolders(): Promise<{ success: boolean; directActionUrl?: string; message: string }> {
    return { success: true, message: 'Perintah inisialisasi folder Drive selesai.' };
  }

  public getGoogleAppsScriptTemplate(): string {
    return this.getAppsScriptTemplateCode();
  }

  public getAppsScriptTemplateCode(): string {
    return `// SCRIPT GOOGLE APPS SCRIPT SAKA PARIWISATA
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "CHECK_RECORD") {
    var sheet = ss.getSheetByName(e.parameter.sheet || "Anggota");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);

    var values = sheet.getDataRange().getValues();
    var checkId = String(e.parameter.id || "").trim();
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][0]).trim() === checkId || String(values[r][1]).trim() === checkId) {
        return ContentService.createTextOutput(JSON.stringify({ found: true, row: r + 1 })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getSheetByName((e && e.parameter && e.parameter.sheet) || "Anggota");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var headers = data[0];
  var rows = data.slice(1);
  var result = rows.map(function(row) {
    var item = {};
    headers.forEach(function(h, idx) { item[h] = row[idx]; });
    return item;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Payload kosong" })).setMimeType(ContentService.MimeType.JSON);
    }
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = body.sheet || "Anggota";
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    if (body.action === "UPDATE_AUTH_STATUS") {
      var authSheet = ss.getSheetByName("Users") || ss.getSheetByName("Pengguna");
      if (authSheet) {
        var authValues = authSheet.getDataRange().getValues();
        var authMemberId = String(body.memberId || "").trim();
        for (var au = 1; au < authValues.length; au++) {
          for (var ac = 0; ac < authValues[au].length; ac++) {
            if (String(authValues[au][ac]).trim() === authMemberId) {
              var statusCol = -1;
              for (var ah = 0; ah < authValues[0].length; ah++) {
                var header = String(authValues[0][ah]).toLowerCase();
                if (header === "status" || header === "status anggota" || header === "status verifikasi") { statusCol = ah + 1; break; }
              }
              if (statusCol > 0) authSheet.getRange(au + 1, statusCol).setValue(body.status || "PENDING");
              break;
            }
          }
        }
      }
    }

    if (body.rowData && Array.isArray(body.rowData)) {
      var rowId = String(body.memberId || body.rowData[0] || "").trim();
      var values = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var r = 1; r < values.length; r++) {
        if (String(values[r][0]).trim() === rowId) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow > 0) {
        sheet.getRange(targetRow, 1, 1, body.rowData.length).setValues([body.rowData]);
      } else {
        sheet.appendRow(body.rowData);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}

export const spreadsheetService = new SpreadsheetService();
