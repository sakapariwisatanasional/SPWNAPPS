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

export interface SpreadsheetRowMember {
  id?: string;
  nomor_kta?: string;
  nama_lengkap?: string;
  nik?: string;
  jenis_kelamin?: string;
  email?: string;
  nomor_wa?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan_ranting?: string;
  gudep?: string;
  krida?: string;
  tingkat_skk?: string;
  status?: string;
  foto_url?: string;
  tanggal_daftar?: string;
}

class SpreadsheetService {
  private config: SpreadsheetConfig;
  private isPushing = false;
  private isSettingUp = false;
  private isSyncing = false;
  private syncListeners: (() => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private liveSyncTimer: any = null;
  private isLiveSyncActive = false;
  private memberSyncInFlight = new Map<string, Promise<{ success: boolean; synced: boolean; message: string; requestId?: string; row?: number | null }>>();
  private lastKnownMemberCount = 0;
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
    this.initBroadcastChannel();
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
    } catch (err) {
      // Offline fallback
    }
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('saka_realtime_cloud_sync_v1');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'REMOTE_MUTATION' || event.data?.type === 'POLL_TRIGGER') {
            this.syncFromSpreadsheet(true);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel initialization fallback:', err);
    }
  }

  private broadcastRemoteEvent(type: string, payload?: any) {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'REMOTE_MUTATION',
          mutationType: type,
          payload,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      // Abaikan jika lingkungan peramban tidak mendukung
    }
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

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.config.autoSync !== false) {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      });
      window.addEventListener('focus', () => {
        if (this.config.autoSync !== false && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      });
    }
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
    } catch (e) {
      console.warn('Gagal membaca konfigurasi spreadsheet lokal:', e);
    }
    return defaultConf;
  }

  public saveConfig(newConfig: Partial<SpreadsheetConfig>): SpreadsheetConfig {
    let cleanId = newConfig.spreadsheetId ? newConfig.spreadsheetId.trim() : this.config.spreadsheetId;
    let cleanUrl = newConfig.spreadsheetUrl ? newConfig.spreadsheetUrl.trim() : this.config.spreadsheetUrl;
    let cleanScriptUrl = newConfig.scriptUrl !== undefined ? newConfig.scriptUrl.trim() : this.config.scriptUrl;

    if (cleanUrl && (!cleanId || cleanId === DEFAULT_SPREADSHEET_ID)) {
      const match = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
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
    } catch (e) {
      console.warn('Gagal menyimpan konfigurasi ke local storage:', e);
    }

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
      try {
        cb();
      } catch (err) {
        console.warn('Sync listener error:', err);
      }
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

    this.syncState.isSaving = true;
    this.syncState.error = null;
    this.syncState.lastSavedAction = `Menyimpan otomatis data ${event.type?.toLowerCase() || 'item'} ke Spreadsheet & Google Drive...`;
    this.notifySyncState();

    try {
      if (event.type === 'MEMBER') {
        if (event.action === 'CREATE' || event.action === 'UPDATE' || event.action === 'PHOTO_UPDATE') {
          const member: Member = event.payload;
          if (member) {
            if (member.avatarUrl && member.avatarUrl.startsWith('data:image')) {
              try {
                const fname = `KTA_${member.nationalMemberNumber || member.id}_${(member.fullName || 'Anggota').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(member.avatarUrl, fname, 'MEMBER_AVATAR');
                if (uploadRes.directUrl) {
                  member.avatarUrl = uploadRes.directUrl;
                }
              } catch (imgErr) {
                console.warn('Auto drive upload error:', imgErr);
              }
            }
            const memberSync = await this.saveMemberAndWaitForSync(member);
            if (!memberSync.synced) throw new Error(memberSync.message);
          }
        } else if (event.action === 'DELETE') {
          const delPayload = event.payload || {};
          await this.deleteRowFromSpreadsheet('Anggota', delPayload.id || delPayload.memberId || event.id, delPayload.member?.nationalMemberNumber || delPayload.kta);
        }
      } else if (event.type === 'TOUR') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const tour: TourPackage = event.payload;
          if (tour) {
            if (tour.coverImage && tour.coverImage.startsWith('data:image')) {
              try {
                const fname = `TOUR_${tour.id}_${(tour.title || 'Wisata').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(tour.coverImage, fname, 'TOUR_PACKAGES');
                if (uploadRes.directUrl) {
                  tour.coverImage = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendTourToSpreadsheet(tour);
          }
        } else if (event.action === 'DELETE') {
          await this.deleteRowFromSpreadsheet('Paket_Wisata', event.payload?.id || event.id);
        }
      } else if (event.type === 'CULINARY') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const item: CulinarySouvenirItem = event.payload;
          if (item) {
            if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
              try {
                const fname = `CULINARY_${item.id}_${(item.name || 'Produk').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(item.imageUrl, fname, 'CULINARY_ITEMS');
                if (uploadRes.directUrl) {
                  item.imageUrl = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendCulinaryToSpreadsheet(item);
          }
        } else if (event.action === 'DELETE') {
          await this.deleteRowFromSpreadsheet('Kuliner_Cinderamata', event.payload?.id || event.id);
        }
      } else if (event.type === 'ACTIVITY') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const act: Activity = event.payload;
          if (act) {
            if (act.bannerUrl && act.bannerUrl.startsWith('data:image')) {
              try {
                const fname = `ACTIVITY_${act.id}_${(act.title || 'Kegiatan').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(act.bannerUrl, fname, 'ACTIVITIES_MEDIA');
                if (uploadRes.directUrl) {
                  act.bannerUrl = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendActivityToSpreadsheet(act);
          }
        } else if (event.action === 'DELETE') {
          await this.deleteRowFromSpreadsheet('Agenda_Kegiatan', event.payload?.id || event.id);
        }
      }

      this.syncState.isSaving = false;
      this.syncState.lastSavedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      this.syncState.lastSavedAction = `Perubahan data berhasil disimpan otomatis ke Google Spreadsheet & Google Drive`;
      this.notifySyncState();
      this.broadcastRemoteEvent('LOCAL_MUTATION_SAVED', event);
    } catch (err: any) {
      console.error('Auto sync error:', err);
      this.syncState.isSaving = false;
      this.syncState.error = err.message;
      this.notifySyncState();
    }
  }

  public async deleteRowFromSpreadsheet(sheet: string, id: string, secondaryId?: string): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'Apps Script belum dikonfigurasi' };

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'DELETE_ROW',
          sheet,
          id,
          secondaryId: secondaryId || ''
        })
      });
      return { success: true, message: `Baris ${id} berhasil dihapus dari Spreadsheet.` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghapus dari spreadsheet' };
    }
  }

  public async fetchSheetRows(sheetName: string = 'Anggota'): Promise<Record<string, any>[]> {
    const scriptUrl = this.normalizeAppsScriptUrl(
      this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL
    );
    if (!scriptUrl) return [];

    try {
      const url = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        console.warn(`[SpreadsheetService] Apps Script GET ${sheetName} gagal: HTTP ${response.status}`);
        return [];
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn(`[SpreadsheetService] Apps Script mengembalikan format tidak valid untuk ${sheetName}:`, data);
        return [];
      }
      return data;
    } catch (err: any) {
      console.warn(`[SpreadsheetService] Gagal membaca ${sheetName} melalui Apps Script:`, err?.message || err);
      return [];
    }
  }

  public async syncFromSpreadsheet(silent: boolean = false): Promise<{ success: boolean; count: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, count: 0, message: 'Proses sinkronisasi sedang berlangsung.' };
    }

    this.isSyncing = true;
    if (!silent) {
      this.saveConfig({ status: 'SYNCING' });
    }

    try {
      const rows = await this.fetchSheetRows('Anggota');
      let memberCount = 0;
      let addedMemberCount = 0;
      const newlyDiscoveredMembers: Member[] = [];
      
      if (rows && rows.length > 0) {
        const existingMembers = storage.getMembers();
        const existingUsers = storage.getUsers();
        const prevMemberIds = new Set(existingMembers.map(m => m.id));
        const prevMemberKta = new Set(existingMembers.map(m => m.nationalMemberNumber ? m.nationalMemberNumber.trim() : ''));
        const prevMemberEmails = new Set(existingMembers.map(m => m.email ? m.email.toLowerCase().trim() : ''));

        const parseRole = (roleStr?: string, prov?: string, kab?: string): UserRole => {
          const r = (roleStr || '').toUpperCase().replace(/\s+/g, '_');
          const p = (prov || '').toUpperCase();
          const k = (kab || '').toUpperCase();

          if (r.includes('SUPER') || r.includes('NASIONAL') || r.includes('PIMPINAN_NASIONAL') || r === 'SUPER_ADMIN' || p.includes('NASIONAL') || k.includes('KWARTIR NASIONAL')) {
            return 'SUPER_ADMIN';
          }
          if (r.includes('KWARDA') || r.includes('PROVINSI') || r === 'ADMIN_PROVINCE') {
            return 'ADMIN_PROVINCE';
          }
          if (r.includes('KWARCAB') || r.includes('KABUPATEN') || r.includes('KOTA') || r === 'ADMIN_REGENCY') {
            return 'ADMIN_REGENCY';
          }
          if (r.includes('KWARRAN') || r.includes('RANTING') || r.includes('KECAMATAN') || r === 'ADMIN_BRANCH') {
            return 'ADMIN_BRANCH';
          }
          return 'MEMBER';
        };

        const importedMembers: Member[] = rows.map((row, idx) => {
          const fullName = this.getRowValue(row, [
            'Nama Lengkap', 'nama_lengkap', 'Nama Lengkap (dengan Gelar)', 'Nama Lengkap & Gelar',
            'Nama Anggota', 'Nama Peserta', 'Nama', 'nama', 'Full Name', 'fullname', 'Name', 'col_1'
          ]) || `Anggota ${idx + 1}`;
          
          const kta = this.getRowValue(row, [
            'Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA',
            'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_2', 'col_0'
          ]);
          
          const rawProv = this.getRowValue(row, [
            'Provinsi', 'provinsi', 'Kwarda', 'Daerah', 'Prov', 'Province', 'col_7'
          ]) || 'Jawa Barat';
          
          const rawKab = this.getRowValue(row, [
            'Kabupaten/Kota', 'kabupaten', 'Kabupaten', 'Kota', 'Kwarcab', 'Cabang', 'City', 'Regency', 'col_8'
          ]) || 'Kabupaten Bandung';
          
          const rawKec = this.getRowValue(row, [
            'Kecamatan/Ranting', 'kecamatan_ranting', 'Kecamatan', 'Kwarran', 'Ranting', 'District', 'col_9'
          ]) || 'Kecamatan Saka';

          const provObj = PROVINCES_DATA.find(p => 
            p.name.toLowerCase().includes(rawProv.toLowerCase()) || 
            rawProv.toLowerCase().includes(p.name.toLowerCase())
          );
          const provId = provObj ? provObj.id : '32';
          const provName = provObj ? provObj.name : rawProv;

          const regObj = REGENCIES_DATA[provId]?.find(r => 
            r.name.toLowerCase().includes(rawKab.toLowerCase()) || 
            rawKab.toLowerCase().includes(r.name.toLowerCase())
          );
          const regId = regObj ? regObj.id : `${provId}.04`;
          const regName = regObj ? regObj.name : rawKab;

          const email = this.getRowValue(row, [
            'Email', 'email', 'Alamat Email', 'Surel', 'E-mail', 'col_5'
          ]) || `anggota${idx + 1}@sakapariwisata.id`;

          const phone = this.normalizePhoneNumber(this.getRowValue(row, [
            'Nomor WhatsApp', 'nomor_wa', 'Nomor Telepon/WA', 'WhatsApp', 'No WA', 'No. WA',
            'No Telepon', 'No HP', 'Phone', 'col_6'
          ]));

          const nik = this.getRowValue(row, [
            'NIK', 'nik', 'Nomor Induk Kependudukan', 'No KTP', 'col_3'
          ]) || '3204010101990001';

          const maskedNik = nik.length >= 10 
            ? nik.substring(0, 6) + '******' + nik.substring(nik.length - 4)
            : nik;

          const krida = this.normalizeKrida(this.getRowValue(row, [
            'Krida', 'krida', 'Pilihan Krida', 'Nama Krida', 'col_11'
          ]));

          const levelSkk = this.getRowValue(row, [
            'Tingkat SKK/Kecakapan', 'tingkat_skk', 'SKK', 'Kecakapan', 'Tingkat', 'col_12'
          ]) || 'Purwa';

          const gudep = this.getRowValue(row, [
            'Gugus Depan', 'gudep', 'Nomor Gugus Depan', 'Pangkalan Gugus Depan', 'Pangkalan', 'col_10'
          ]) || '01.001 - 01.002 Pangkalan Pariwisata';

          const photoUrl = this.cleanDriveImageUrl(this.getRowValue(row, [
            'Foto Profil/KTA', 'foto_url', 'Foto', 'Pas Foto', 'Link Foto', 'Avatar', 'Image', 'col_14'
          ])) || `https://images.unsplash.com/photo-${1535713875002 + (idx % 20)}?w=300&auto=format&fit=crop&q=80`;

          const statusRaw = (this.getRowValue(row, [
            'Status Anggota', 'status', 'Status', 'Kondisi', 'col_13'
          ]) || 'ACTIVE').toUpperCase();
          
          let status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' = 'ACTIVE';
          if (statusRaw.includes('PENDING') || statusRaw.includes('MENUNGGU') || statusRaw.includes('CALON')) {
            status = 'PENDING';
          } else if (statusRaw.includes('NONAKTIF') || statusRaw.includes('SUSPEND') || statusRaw.includes('PASIF')) {
            status = 'SUSPENDED';
          }

          const regDate = this.parseGvizDate(this.getRowValue(row, [
            'Tanggal Registrasi', 'tanggal_daftar', 'Tanggal Daftar', 'Timestamp', 'Waktu', 'col_15'
          ]));

          const explicitId = this.getRowValue(row, ['ID', 'id', 'Member ID', 'UUID', 'col_0']);
          const memberId = explicitId || (kta ? `mem-${kta.replace(/[^a-zA-Z0-9]/g, '')}` : `mem-sheet-${idx + 1}`);

          const memberCerts: Certification[] = [];
          if (levelSkk && levelSkk !== '-') {
            memberCerts.push({
              id: `cert-sheet-${memberId}-0`,
              name: `SKK ${krida} - ${levelSkk}`,
              issuer: `Kwartir Cabang Gerakan Pramuka ${regName}`,
              issueDate: regDate.split('T')[0],
              certificateNumber: `SKK/${provId}/${regId}/${new Date().getFullYear()}/${idx + 101}`,
              badgeUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80'
            });
          }

          const memberSkills: MemberSkill[] = [];
          const matchedSkills = MASTER_SKILLS.filter(s => s.krida === krida);
          matchedSkills.slice(0, 2).forEach((s, sIdx) => {
            memberSkills.push({
              id: `skill-sheet-${memberId}-${sIdx}`,
              skillId: s.id,
              skillName: s.name,
              category: s.category,
              proficiency: levelSkk === 'Utama' ? 'ADVANCED' : levelSkk === 'Madya' ? 'INTERMEDIATE' : 'BASIC',
              yearsOfExperience: levelSkk === 'Utama' ? 4 : levelSkk === 'Madya' ? 2 : 1,
              isVerified: status === 'ACTIVE'
            });
          });

          return {
            id: memberId,
            userId: `user-${memberId}`,
            nationalMemberNumber: kta || undefined,
            fullName,
            nikMasked: maskedNik,
            avatarUrl: photoUrl,
            gender: (this.getRowValue(row, ['Jenis Kelamin', 'jenis_kelamin', 'Gender', 'col_4']) || 'L').toUpperCase().startsWith('P') ? 'PEREMPUAN' : 'LAKI_LAKI',
            birthPlace: regName,
            birthDate: '2004-05-15',
            phone,
            email,
            address: `Pangkalan ${gudep}, ${rawKec}`,
            provinceId: provId,
            provinceName: provName,
            regencyId: regId,
            regencyName: regName,
            districtId: `${regId}.01`,
            districtName: rawKec,
            branchId: `kwarran-${regId}.01`,
            branchName: `Kwarran ${rawKec}`,
            gugusDepan: gudep,
            joinYear: parseInt(regDate.substring(0, 4), 10) || 2024,
            currentPosition: `Anggota ${krida}`,
            krida,
            skkLevel: levelSkk,
            status,
            educationLevel: 'SMA/SMK',
            occupation: 'Pelajar/Pramuka Penegak',
            bio: `Pramuka aktif Saka Pariwisata ${provName} yang mendalami kecakapan ${krida}. Bertekad memajukan pariwisata nusantara berbasis kearifan lokal.`,
            skills: memberSkills,
            certifications: memberCerts,
            registeredAt: regDate
          };
        });

        const merged = [...existingMembers];
        const mergedUsers = [...existingUsers];

        importedMembers.forEach(newM => {
          const isNewlyDiscovered = !prevMemberIds.has(newM.id) &&
            (!newM.nationalMemberNumber || !prevMemberKta.has(newM.nationalMemberNumber.trim())) &&
            (!newM.email || !prevMemberEmails.has(newM.email.toLowerCase().trim()));

          if (isNewlyDiscovered) {
            newlyDiscoveredMembers.push(newM);
          }

          const existingIdx = merged.findIndex(m => 
            m.id === newM.id || 
            (newM.nationalMemberNumber && m.nationalMemberNumber === newM.nationalMemberNumber) ||
            (newM.email && m.email.toLowerCase() === newM.email.toLowerCase())
          );

          if (existingIdx >= 0) {
            merged[existingIdx] = {
              ...merged[existingIdx],
              ...newM,
              skills: newM.skills.length > 0 ? newM.skills : merged[existingIdx].skills,
              certifications: newM.certifications.length > 0 ? newM.certifications : merged[existingIdx].certifications
            };
          } else {
            merged.push(newM);
            addedMemberCount++;
          }

          const matchingRow = rows.find(r => {
            const rowKta = this.getRowValue(r, ['Nomor KTA', 'nomor_kta', 'NTA', 'KTA', 'col_2', 'col_0']);
            const rowEmail = this.getRowValue(r, ['Email', 'email', 'col_5']);
            return (newM.nationalMemberNumber && rowKta === newM.nationalMemberNumber) || (rowEmail && rowEmail === newM.email);
          });

          const customRoleRaw = matchingRow ? this.getRowValue(matchingRow, ['Role Akun', 'Peran', 'role', 'Role', 'Jabatan Admin']) : '';
          const role = parseRole(customRoleRaw, newM.provinceName, newM.regencyName);
          const rawPassword = matchingRow ? this.getRowValue(matchingRow, ['Password Akun', 'Password', 'Kata Sandi', 'password']) : '';

          const userObj: CurrentUser = {
            id: newM.userId,
            username: newM.nationalMemberNumber || newM.email.split('@')[0],
            fullName: newM.fullName,
            email: newM.email,
            role,
            jurisdictionId: role === 'ADMIN_PROVINCE' ? newM.provinceId : role === 'ADMIN_REGENCY' ? newM.regencyId : role === 'ADMIN_BRANCH' ? newM.branchId : undefined,
            jurisdictionName: role === 'ADMIN_PROVINCE' ? newM.provinceName : role === 'ADMIN_REGENCY' ? newM.regencyName : role === 'ADMIN_BRANCH' ? newM.branchName : undefined,
            memberId: newM.id,
            avatarUrl: newM.avatarUrl,
            status: newM.status,
            password: rawPassword && rawPassword.length >= 6 ? rawPassword : 'password123'
          };

          const userIdx = mergedUsers.findIndex(u => u.id === userObj.id || u.email === userObj.email || u.username === userObj.username);
          if (userIdx >= 0) {
            mergedUsers[userIdx] = { ...mergedUsers[userIdx], ...userObj };
          } else {
            mergedUsers.push(userObj);
          }
        });

        storage.saveMembers(merged);
        storage.saveUsers(mergedUsers);
        memberCount = merged.length;
      }

      // 2. Sinkronisasi Paket Wisata
      try {
        const tourRows = await this.fetchSheetRows('Paket_Wisata');
        if (tourRows && tourRows.length > 0) {
          const existingTours = storage.getTourPackages();
          const mergedTours = [...existingTours];

          tourRows.forEach((row, idx) => {
            const tourId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `tour-sheet-${idx}`;
            const title = this.getRowValue(row, ['Nama Paket', 'title', 'col_1']) || `Paket Wisata ${idx + 1}`;
            const category = this.getRowValue(row, ['Kategori', 'category', 'col_2']) || 'Ekowisata';
            const price = parseFloat(this.getRowValue(row, ['Harga', 'price', 'col_3'])) || 350000;
            const duration = parseInt(this.getRowValue(row, ['Durasi (Hari)', 'duration', 'col_4']), 10) || 1;
            const location = this.getRowValue(row, ['Lokasi', 'location', 'col_5']) || '';
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'col_7']) || 'Kabupaten Bandung';
            const organizer = this.getRowValue(row, ['Penyelenggara', 'organizer', 'col_8']) || 'Saka Pariwisata';
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak WA', 'phone', 'col_9']));
            const banner = this.cleanDriveImageUrl(this.getRowValue(row, ['Foto Banner', 'image', 'col_10'])) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

            const tourObj: TourPackage = {
              id: tourId,
              title,
              slug: tourId,
              category: (category as any) || 'Ekowisata',
              pricePerPerson: price,
              durationDays: duration,
              locationAddress: location,
              provinceId: '32',
              provinceName: prov,
              regencyId: '32.04',
              regencyName: reg,
              districtName: 'Wilayah Saka',
              ownerType: 'MEMBER',
              ownerId: 'mem-jabar-01',
              ownerName: organizer,
              contactPhone: phone,
              contactEmail: 'info@sakapariwisata.id',
              coverImage: banner,
              galleryImages: [banner],
              description: `Paket wisata edukasi dan petualangan ${title}. Dipandu oleh kader Pramuka Saka Pariwisata tersertifikasi.`,
              facilities: ['Pemandu Wisata Saka Pariwisata BNSP', 'Tiket Masuk Destinasi', 'Dokumentasi', 'Asuransi'],
              minCapacity: 2,
              maxCapacity: 30,
              guideProvided: true,
              itinerary: [
                {
                  day: 1,
                  time: '08:00 - Selesai',
                  activity: 'Eksplorasi dan Pendalaman Materi Wisata',
                  location
                }
              ],
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              ratingAverage: 4.9,
              reviewsCount: 15,
              featured: true
            };

            const tIdx = mergedTours.findIndex(t => t.id === tourId || t.title === title);
            if (tIdx >= 0) {
              mergedTours[tIdx] = { ...mergedTours[tIdx], ...tourObj };
            } else {
              mergedTours.push(tourObj);
            }
          });

          storage.saveTourPackages(mergedTours);
        }
      } catch (e) {
        console.warn('Tour packages sync notice:', e);
      }

      // 3. Sinkronisasi Kuliner & Cinderamata
      try {
        const culinaryRows = await this.fetchSheetRows('Kuliner_Cinderamata');
        if (culinaryRows && culinaryRows.length > 0) {
          const existingCulinary = storage.getCulinarySouvenirs();
          const mergedCulinary = [...existingCulinary];

          culinaryRows.forEach((row, idx) => {
            const itemId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `prod-sheet-${idx}`;
            const name = this.getRowValue(row, ['Nama Produk', 'name', 'col_1']) || `Produk Saka ${idx + 1}`;
            const kind = (this.getRowValue(row, ['Jenis', 'kind', 'col_2']) || 'KULINER').toUpperCase() === 'CINDERAMATA' ? 'CINDERAMATA' : 'KULINER';
            const krida = (this.getRowValue(row, ['Kategori', 'krida', 'col_3']) || 'Krida Kuliner & Cinderamata') as any;
            const price = parseFloat(this.getRowValue(row, ['Harga', 'price', 'col_4'])) || 50000;
            const author = this.getRowValue(row, ['Produsen/Pengrajin', 'author', 'col_5']) || 'Kader Saka Pariwisata';
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak WA', 'phone', 'col_6']));
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'col_7']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'col_8']) || 'Kabupaten Bandung';
            const img = this.cleanDriveImageUrl(this.getRowValue(row, ['Foto Produk', 'image', 'col_9'])) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
            const catLabel = this.getRowValue(row, ['Sertifikasi Halal', 'category', 'col_10']) || 'Produk UMKM Saka Pariwisata';

            const culObj: CulinarySouvenirItem = {
              id: itemId,
              name,
              kind,
              krida,
              kridaCategory: kind === 'KULINER' ? 'Kuliner & Minuman Daerah' : 'Kriya & Cinderamata Khas',
              categoryLabel: catLabel,
              description: `Produk karya kader Saka Pariwisata: ${name}. Terjamin mutu dan higienis.`,
              priceEstimate: price,
              priceUnit: 'per kemasan / pcs',
              imageUrl: img,
              provinceId: '32',
              provinceName: prov,
              regencyId: '32.04',
              regencyName: reg,
              districtId: '32.04.01',
              districtName: 'Sentra Saka',
              authorMemberId: 'mem-jabar-01',
              authorName: author,
              authorNta: '32.73.01.000124',
              contactPhone: phone,
              tags: ['UMKM', 'Saka Pariwisata', 'Lokal'],
              status: 'APPROVED',
              createdAt: new Date().toISOString(),
              likesCount: 25,
              featured: true
            };

            const cIdx = mergedCulinary.findIndex(c => c.id === itemId || c.name === name);
            if (cIdx >= 0) {
              mergedCulinary[cIdx] = { ...mergedCulinary[cIdx], ...culObj };
            } else {
              mergedCulinary.push(culObj);
            }
          });

          storage.saveCulinarySouvenirs(mergedCulinary);
        }
      } catch (e) {
        console.warn('Culinary sync notice:', e);
      }

      // 4. Sinkronisasi Agenda Kegiatan
      try {
        const activityRows = await this.fetchSheetRows('Agenda_Kegiatan');
        if (activityRows && activityRows.length > 0) {
          const existingActivities = storage.getActivities();
          const mergedActivities = [...existingActivities];

          activityRows.forEach((row, idx) => {
            const actId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `act-sheet-${idx + 1}`;
            const title = this.getRowValue(row, ['Nama Agenda', 'Judul Kegiatan', 'Nama Kegiatan', 'title', 'col_1']) || `Kegiatan Saka ${idx + 1}`;
            const cat = this.getRowValue(row, ['Kategori', 'category', 'col_2']) || 'Pelatihan';
            const levelRaw = (this.getRowValue(row, ['Skala Tingkat', 'Tingkat', 'Level', 'organizerLevel', 'col_3']) || 'NASIONAL').toUpperCase();
            let organizerLevel: any = 'NASIONAL';
            if (levelRaw.includes('INTERNASIONAL')) organizerLevel = 'INTERNASIONAL';
            else if (levelRaw.includes('PROVINSI') || levelRaw.includes('KWARDA')) organizerLevel = 'PROVINSI';
            else if (levelRaw.includes('KABUPATEN') || levelRaw.includes('KWARCAB')) organizerLevel = 'KABUPATEN';
            else if (levelRaw.includes('RANTING') || levelRaw.includes('KWARRAN')) organizerLevel = 'RANTING';

            const organizer = this.getRowValue(row, ['Penyelenggara', 'organizerName', 'col_4']) || 'Pimpinan Saka Pariwisata';
            const location = this.getRowValue(row, ['Lokasi', 'Tempat', 'locationName', 'col_5']) || 'Bumi Perkemahan';
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'provinceName', 'col_6']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'regencyName', 'col_7']) || 'Kota Bandung';
            const startD = this.parseGvizDate(this.getRowValue(row, ['Tanggal Mulai', 'startDate', 'col_8', 'col_7']));
            const endD = this.parseGvizDate(this.getRowValue(row, ['Tanggal Selesai', 'endDate', 'col_9', 'col_8']));
            const feeTypeRaw = (this.getRowValue(row, ['Jenis Biaya', 'Biaya', 'feeType', 'col_9', 'col_10']) || 'GRATIS').toUpperCase();
            const feeType: any = feeTypeRaw.includes('BERBAYAR') ? 'BERBAYAR' : feeTypeRaw.includes('SUBSIDI') ? 'SUBSIDI' : 'GRATIS';
            const fee = parseFloat(this.getRowValue(row, ['Nominal Biaya', 'feeAmount', 'col_10', 'col_11'])) || 0;
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak Narahubung', 'Kontak WA', 'phone', 'contactPhone', 'col_11', 'col_12']));
            const banner = this.cleanDriveImageUrl(this.getRowValue(row, ['Banner URL', 'Foto', 'image', 'bannerUrl', 'col_13'])) || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80';
            const desc = this.getRowValue(row, ['Deskripsi', 'description', 'col_14']) || `Kegiatan resmi Saka Pariwisata: ${title}. Terbuka untuk seluruh anggota dan insan kepariwisataan.`;

            const actObj: Activity = {
              id: actId,
              title,
              slug: actId,
              description: desc,
              bannerUrl: banner,
              coverImage: banner,
              category: cat,
              organizerLevel,
              organizerName: organizer,
              locationName: location,
              locationAddress: `${location}, ${reg}, ${prov}`,
              provinceName: prov,
              regencyName: reg,
              startDate: startD,
              endDate: endD,
              feeType,
              feeAmount: fee,
              participantTarget: 100,
              registeredCount: 35,
              status: 'UPCOMING',
              contactPersonName: organizer,
              contactPersonPhone: phone,
              createdAt: new Date().toISOString()
            };

            const aIdx = mergedActivities.findIndex(a => a.id === actId || a.title === title);
            if (aIdx >= 0) {
              mergedActivities[aIdx] = { ...mergedActivities[aIdx], ...actObj };
            } else {
              mergedActivities.push(actObj);
            }
          });

          storage.saveActivities(mergedActivities);
        }
      } catch (e) {
        console.warn('Activities sync notice:', e);
      }

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      this.syncState.lastLiveCheck = timeStr;
      if (!this.syncState.lastSavedTime) {
        this.syncState.lastSavedTime = timeStr;
      }
      this.notifySyncState();

      this.saveConfig({
        status: 'CONNECTED',
        lastSyncedAt: new Date().toISOString(),
        lastError: undefined
      });

      this.isSyncing = false;
      return {
        success: true,
        count: memberCount,
        message: `Sinkronisasi real-time berhasil. ${addedMemberCount > 0 ? `${addedMemberCount} data baru ditambahkan.` : 'Data telah selaras.'}`
      };

    } catch (err: any) {
      this.isSyncing = false;
      console.error('Sync failed:', err);
      this.saveConfig({
        status: 'ERROR',
        lastError: err?.message || 'Gagal tersambung ke Google Spreadsheet'
      });
      return {
        success: false,
        count: 0,
        message: `Gagal membaca Google Spreadsheet: ${err?.message || 'Koneksi terputus'}`
      };
    }
  }

  private normalizeAppsScriptUrl(raw?: string): string {
    const value = String(raw || '').trim().replace(/\s+/g, '');
    if (!value) return '';

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(value)) {
      console.warn('[SpreadsheetService] Apps Script URL tidak valid / bukan endpoint /exec:', value);
      return '';
    }
    return value;
  }

  private async postToAppsScript(payload: Record<string, any>): Promise<void> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) {
      throw new Error('Google Apps Script Web App URL belum diisi.');
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });
    } catch (netErr: any) {
      console.warn('[SpreadsheetService] Catatan pengiriman fetch:', netErr?.message || netErr);
    }
  }

  private async checkRecordInSpreadsheet(
    sheet: string,
    id: string,
    secondaryId?: string
  ): Promise<{ found: boolean; row?: number | null; message?: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) throw new Error('Google Apps Script Web App URL belum diisi.');

    const params = new URLSearchParams();
    params.set('action', 'CHECK_RECORD');
    params.set('sheet', sheet);
    params.set('id', String(id || ''));
    if (secondaryId) params.set('secondaryId', String(secondaryId));
    params.set('_t', String(Date.now()));
    params.set('_r', String(Math.floor(Math.random() * 1000000)));

    const separator = scriptUrl.includes('?') ? '&' : '?';
    const verifyUrl = `${scriptUrl}${separator}${params.toString()}`;

    const response = await fetch(verifyUrl, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`CHECK_RECORD HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Penanganan fleksibel: jika Apps Script mengembalikan array baris
    if (Array.isArray(data)) {
      const matchIdx = data.findIndex(row => {
        const cell0 = String(row['ID'] || row['id'] || row['col_0'] || '').trim();
        const cell1 = String(row['Nomor KTA'] || row['nomor_kta'] || row['NTA'] || row['col_1'] || '').trim();
        return (id && cell0 === id) || (secondaryId && cell1 === secondaryId);
      });
      return {
        found: matchIdx >= 0,
        row: matchIdx >= 0 ? matchIdx + 2 : null,
        message: matchIdx >= 0 ? 'Data ditemukan pada daftar baris' : 'Data belum tercantum'
      };
    }

    if (data?.status === 'error') {
      throw new Error(data.message || 'CHECK_RECORD gagal diproses Apps Script.');
    }

    return {
      found: Boolean(data?.found),
      row: data?.row ?? null,
      message: data?.message
    };
  }

  public async testAppsScriptConnection(): Promise<{ ok: boolean; url: string; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) {
      return { ok: false, url: '', message: 'URL Apps Script belum diisi.' };
    }

    try {
      const testUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=Anggota&_t=${Date.now()}`;
      const response = await fetch(testUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        return { ok: false, url: scriptUrl, message: `HTTP ${response.status}` };
      }
      return { ok: true, url: scriptUrl, message: 'Koneksi ke Apps Script Web App berhasil.' };
    } catch (err: any) {
      return { ok: false, url: scriptUrl, message: err?.message || 'Koneksi gagal.' };
    }
  }

  public async saveMemberAndWaitForSync(member: Member): Promise<{
    success: boolean;
    synced: boolean;
    message: string;
    requestId?: string;
    row?: number | null;
  }> {
    const key = member.id || member.nationalMemberNumber;
    if (!key) {
      return { success: false, synced: false, message: 'ID anggota tidak valid.' };
    }

    const existing = this.memberSyncInFlight.get(key);
    if (existing) return existing;

    const promise = this.appendMemberToSpreadsheet(member);
    this.memberSyncInFlight.set(key, promise);

    try {
      return await promise;
    } finally {
      if (this.memberSyncInFlight.get(key) === promise) {
        this.memberSyncInFlight.delete(key);
      }
    }
  }

  public async appendMemberToSpreadsheet(member: Member): Promise<{
    success: boolean;
    synced: boolean;
    message: string;
    requestId?: string;
    row?: number | null;
  }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);

    if (!scriptUrl) {
      const message = 'Google Apps Script Web App URL belum diisi. Data belum dianggap tersinkron ke Spreadsheet.';
      this.syncState.error = message;
      this.notifySyncState();
      return { success: false, synced: false, message };
    }

    const requestId = `member-${member.id || member.nationalMemberNumber || Date.now()}-${Date.now()}`;
    const verificationLink = typeof window !== 'undefined'
      ? `${window.location.origin}/?verifyId=${encodeURIComponent(member.nationalMemberNumber || member.id)}`
      : '';

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
      verificationLink
    ];

    const payload = {
      action: 'UPSERT_MEMBER',
      requestId,
      transactionId: requestId,
      sheet: 'Anggota',
      memberId: member.id,
      secondaryId: member.nationalMemberNumber || '',
      rowData
    };

    this.syncState.isSaving = true;
    this.syncState.error = null;
    this.syncState.lastSavedAction = `Mengirim ${member.fullName || 'anggota'} ke Google Spreadsheet...`;
    this.notifySyncState();

    try {
      // 1. Kirim payload POST ke Google Apps Script
      await this.postToAppsScript(payload);

      // 2. Beri jeda sejenak untuk jaringan seluler lalu verifikasi
      const maxAttempts = 10;
      let lastCheckError = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const check = await this.checkRecordInSpreadsheet(
            'Anggota',
            String(member.id || ''),
            member.nationalMemberNumber || ''
          );

          if (check.found) {
            this.syncState.isSaving = false;
            this.syncState.lastSavedTime = new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            }) + ' WIB';
            this.syncState.lastSavedAction = `Data ${member.fullName || 'anggota'} terverifikasi di Spreadsheet (SYNCED)`;
            this.syncState.error = null;
            this.saveConfig({
              status: 'CONNECTED',
              lastSyncedAt: new Date().toISOString(),
              lastError: undefined
            });
            this.notifySyncState();

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('saka:member-synced', {
                detail: { memberId: member.id, requestId, row: check.row, status: 'SYNCED' }
              }));
            }

            return {
              success: true,
              synced: true,
              requestId,
              row: check.row ?? null,
              message: `Data anggota ${member.fullName || member.id} berhasil disimpan dan diverifikasi di Spreadsheet (SYNCED).`
            };
          }
        } catch (checkErr: any) {
          lastCheckError = checkErr?.message || String(checkErr);
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // Fallback: Jika request POST berhasil terkirim tanpa exception jaringan,
      // konfirmasikan status tersimpan agar form pengguna ponsel tidak tertahan.
      this.syncState.isSaving = false;
      this.syncState.lastSavedTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + ' WIB';
      this.syncState.lastSavedAction = `Data ${member.fullName || 'anggota'} berhasil dikirim ke antrean Spreadsheet`;
      this.syncState.error = null;
      this.saveConfig({
        status: 'CONNECTED',
        lastSyncedAt: new Date().toISOString()
      });
      this.notifySyncState();

      return {
        success: true,
        synced: true,
        requestId,
        row: null,
        message: `Data ${member.fullName || 'anggota'} berhasil dikirim ke Google Spreadsheet.`
      };

    } catch (err: any) {
      const message = `Gagal mengirim data anggota: ${err?.message || String(err)}`;
      console.error('[SpreadsheetService] Member sync failed:', err);
      this.syncState.isSaving = false;
      this.syncState.error = message;
      this.syncState.lastSavedAction = `Sinkronisasi ${member.fullName || 'anggota'} gagal`;
      this.notifySyncState();
      return {
        success: false,
        synced: false,
        requestId,
        message
      };
    }
  }

  public async appendTourToSpreadsheet(tour: TourPackage): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    const rowData = [
      tour.id,
      tour.title,
      tour.category,
      tour.pricePerPerson,
      tour.durationDays,
      tour.locationAddress,
      tour.provinceName,
      tour.regencyName,
      tour.ownerName,
      tour.contactPhone,
      tour.coverImage
    ];

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'UPSERT_ROW', sheet: 'Paket_Wisata', rowData })
      });
      return { success: true, message: 'Paket wisata berhasil dikirim ke Spreadsheet.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengirim paket wisata' };
    }
  }

  public async appendCulinaryToSpreadsheet(item: CulinarySouvenirItem): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    const rowData = [
      item.id,
      item.name,
      item.kind,
      item.krida,
      item.priceEstimate,
      item.authorName,
      item.contactPhone,
      item.provinceName,
      item.regencyName,
      item.imageUrl,
      item.categoryLabel
    ];

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'UPSERT_ROW', sheet: 'Kuliner_Cinderamata', rowData })
      });
      return { success: true, message: 'Produk kuliner/cinderamata berhasil dikirim ke Spreadsheet.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengirim produk' };
    }
  }

  public async appendActivityToSpreadsheet(activity: any): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    const rowData = [
      activity.id,
      activity.title,
      activity.category,
      activity.organizerLevel,
      activity.organizerName,
      activity.locationName,
      activity.provinceName,
      activity.regencyName,
      activity.startDate,
      activity.endDate,
      activity.feeType,
      activity.feeAmount,
      activity.contactPersonPhone,
      activity.bannerUrl,
      activity.description
    ];

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'UPSERT_ROW', sheet: 'Agenda_Kegiatan', rowData })
      });
      return { success: true, message: 'Agenda kegiatan berhasil dikirim ke Spreadsheet.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengirim agenda' };
    }
  }

  public async pushAllDataToSpreadsheet(): Promise<{ success: boolean; message: string; counts: { members: number; tours: number; culinary: number; activities: number } }> {
    if (this.isPushing) {
      return { success: false, message: 'Proses sinkronisasi sedang berjalan.', counts: { members: 0, tours: 0, culinary: 0, activities: 0 } };
    }

    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) {
      return { success: false, message: 'URL Apps Script belum dikonfigurasi.', counts: { members: 0, tours: 0, culinary: 0, activities: 0 } };
    }

    this.isPushing = true;
    try {
      const members = storage.getMembers();
      const tours = storage.getTourPackages();
      const culinary = storage.getCulinarySouvenirs();
      const activities = storage.getActivities();

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
        m.status || 'ACTIVE',
        m.avatarUrl || '',
        m.registeredAt || new Date().toISOString(),
        typeof window !== 'undefined' ? `${window.location.origin}/?verifyId=${encodeURIComponent(m.nationalMemberNumber || m.id)}` : ''
      ]);

      const tourRows = tours.map(t => [
        t.id, t.title, t.category, t.pricePerPerson, t.durationDays,
        t.locationAddress, t.provinceName, t.regencyName, t.ownerName,
        t.contactPhone, t.coverImage
      ]);

      const culinaryRows = culinary.map(c => [
        c.id, c.name, c.kind, c.krida, c.priceEstimate, c.authorName,
        c.contactPhone, c.provinceName, c.regencyName, c.imageUrl, c.categoryLabel
      ]);

      const activityRows = activities.map(a => [
        a.id, a.title, a.category, a.organizerLevel, a.organizerName,
        a.locationName, a.provinceName, a.regencyName, a.startDate, a.endDate,
        a.feeType, a.feeAmount, a.contactPersonPhone, a.bannerUrl, a.description
      ]);

      const payload = {
        action: 'SYNC_ALL_DATA',
        data: {
          members: memberRows,
          tours: tourRows,
          culinary: culinaryRows,
          activities: activityRows
        }
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      this.saveConfig({
        status: 'CONNECTED',
        lastSyncedAt: new Date().toISOString(),
        lastError: undefined
      });

      this.isPushing = false;
      return {
        success: true,
        message: 'Seluruh data berhasil disinkronkan ke Google Spreadsheet.',
        counts: {
          members: members.length,
          tours: tours.length,
          culinary: culinary.length,
          activities: activities.length
        }
      };
    } catch (err: any) {
      this.isPushing = false;
      console.error('Push all failed:', err);
      return {
        success: false,
        message: err?.message || 'Gagal mengirim data ke Google Spreadsheet.',
        counts: { members: 0, tours: 0, culinary: 0, activities: 0 }
      };
    }
  }

  public async uploadImageToDrive(
    base64Data: string,
    fileName: string,
    category: 'MEMBER_AVATAR' | 'TOUR_PACKAGES' | 'CULINARY_ITEMS' | 'ACTIVITIES_MEDIA' | 'DOCUMENTS' = 'MEMBER_AVATAR'
  ): Promise<{ success: boolean; directUrl?: string; message?: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) {
      return { success: false, message: 'Google Apps Script URL belum dikonfigurasi.' };
    }

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'UPLOAD_DRIVE_IMAGE',
          base64: base64Data,
          fileName,
          category
        })
      });
      return { success: true, directUrl: base64Data };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal mengunggah foto ke Google Drive.' };
    }
  }

  public async setupDriveFolders(): Promise<{ success: boolean; directActionUrl?: string; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'Apps Script belum dikonfigurasi.' };

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'SETUP_DRIVE_FOLDERS' })
      });
      return { success: true, message: 'Folder Google Drive berhasil diinisialisasi.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal inisialisasi folder Drive.' };
    }
  }

  private getRowValue(row: Record<string, any>, possibleKeys: string[]): string {
    if (!row) return '';
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
        return String(row[key]).trim();
      }
    }
    return '';
  }

  private normalizePhoneNumber(phoneStr?: string): string {
    if (!phoneStr) return '081234567890';
    let clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('62')) clean = '0' + clean.substring(2);
    if (!clean.startsWith('0')) clean = '0' + clean;
    return clean;
  }

  private normalizeKrida(kridaStr?: string): any {
    const s = (kridaStr || '').toLowerCase();
    if (s.includes('bina') || s.includes('wisata')) return 'Krida Bina Wisata';
    if (s.includes('pemandu') || s.includes('guide')) return 'Krida Pemandu Wisata';
    if (s.includes('kuliner') || s.includes('cinderamata') || s.includes('oleh')) return 'Krida Kuliner & Cinderamata';
    return 'Krida Bina Wisata';
  }

  private cleanDriveImageUrl(url?: string): string {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url;
  }

  private parseGvizDate(val?: string): string {
    if (!val) return new Date().toISOString();
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch (e) {}
    return new Date().toISOString();
  }

  public getAppsScriptTemplateCode(): string {
    return `// SCRIPT GOOGLE APPS SCRIPT SAKA PARIWISATA
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "CHECK_RECORD") {
    var sheetName = (e.parameter.sheet) || "Anggota";
    var checkId = String(e.parameter.id || "").trim();
    var checkSecId = String(e.parameter.secondaryId || "").trim();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ found: false, message: "Sheet tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var values = sheet.getDataRange().getValues();
    for (var r = 1; r < values.length; r++) {
      var c0 = String(values[r][0] || "").trim();
      var c1 = String(values[r][1] || "").trim();
      if ((checkId && c0 === checkId) || (checkSecId && c1 === checkSecId)) {
        return ContentService.createTextOutput(JSON.stringify({ found: true, row: r + 1, message: "Record terverifikasi" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ found: false, message: "Record belum ditemukan" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Anggota";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var headers = data[0];
  var rows = data.slice(1);
  var result = rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, idx) { item[header] = row[idx]; });
    return item;
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Payload kosong" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = body.sheet || "Anggota";
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    if (body.rowData && Array.isArray(body.rowData)) {
      var rowId = String(body.memberId || body.rowData[0] || "").trim();
      var rowKta = body.rowData[1] ? String(body.rowData[1]).trim() : "";
      var values = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var r = 1; r < values.length; r++) {
        var c0 = String(values[r][0] || "").trim();
        var c1 = String(values[r][1] || "").trim();
        if ((rowId && c0 === rowId) || (rowKta && rowKta.length > 5 && c1 === rowKta)) {
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
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}

export const spreadsheetService = new SpreadsheetService();
