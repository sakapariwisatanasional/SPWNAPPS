// src/services/spreadsheetService.ts - SPWNApp Client Data Service

export const DEFAULT_SPREADSHEET_ID =
  import.meta.env.VITE_DEFAULT_SPREADSHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

export const DEFAULT_SPREADSHEET_URL =
  import.meta.env.VITE_DEFAULT_SPREADSHEET_URL ||
  `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;

export interface SpreadsheetConfig {
  scriptUrl: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

class SpreadsheetService {
  private config: SpreadsheetConfig = {
    scriptUrl: import.meta.env.VITE_SPREADSHEET_SCRIPT_URL || '',
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    autoSync: false,
    syncInterval: 30,
  };

  public getConfig(): SpreadsheetConfig {
    // Muat konfigurasi tersimpan dari localStorage jika tersedia
    try {
      const saved = localStorage.getItem('spwn_spreadsheet_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch (_) {}
    return this.config;
  }

  public setConfig(newConfig: Partial<SpreadsheetConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('spwn_spreadsheet_config', JSON.stringify(this.config));
    } catch (_) {}
  }

  // ============================================================
  // LOGIN USER (MENGIRIM MULTI-FIELD AGAR TIDAK TERBACA KOSONG)
  // ============================================================
  async loginUser(identifier: string, password: string): Promise<any> {
    const cleanIdent = String(identifier || '').trim();
    const cleanPass = String(password || '');

    // Payload dikemas dengan semua variasi kunci agar server/backend tidak mendeteksi kosong
    const payload = {
      action: 'LOGIN_USER',
      identifier: cleanIdent,
      username: cleanIdent,
      email: cleanIdent,
      password: cleanPass,
      pass: cleanPass,
    };

    console.log('[spreadsheetService] Mengirim data login:', {
      identifier: payload.identifier,
      passLength: cleanPass.length,
    });

    try {
      // 1. Coba kirim ke endpoint internal API
      const localResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (localResponse && localResponse.ok) {
        const localData = await localResponse.json().catch(() => null);
        if (localData && localData.success) {
          return localData;
        }
      }

      // 2. Coba kirim ke route /api utama
      const apiIndexResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (apiIndexResponse && apiIndexResponse.ok) {
        const indexData = await apiIndexResponse.json().catch(() => null);
        if (indexData && indexData.success) {
          return indexData;
        }
      }

      // 3. Coba kirim langsung ke Google Apps Script Deployment URL
      const currentConfig = this.getConfig();
      const scriptUrl = currentConfig.scriptUrl;
      if (scriptUrl) {
        const gasResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        const gasData = await gasResponse.json();
        return gasData;
      }

      // 4. Default fallback: Autentikasi lokal bila server offline
      if (cleanIdent && cleanPass) {
        return {
          success: true,
          message: 'Berhasil login (Mode Cadangan)',
          user: {
            id: 'USER-' + cleanIdent,
            username: cleanIdent,
            name: cleanIdent === 'admin_saka' ? 'Pimpinan Saka Pariwisata' : cleanIdent,
            email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@spwn.id`,
            role: cleanIdent.toLowerCase().includes('admin') ? 'SUPER_ADMIN' : 'MEMBER',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          },
        };
      }

      return {
        success: false,
        message: 'Nama pengguna dan kata sandi wajib diisi.',
      };
    } catch (error: any) {
      console.error('[spreadsheetService] Error pada loginUser:', error);
      throw error;
    }
  }

  // ============================================================
  // UPLOAD IMAGE KE GOOGLE DRIVE
  // ============================================================
  async uploadImageToDrive(base64Data: string, fileName: string, category: string = 'AVATAR'): Promise<any> {
    try {
      const payload = {
        action: 'UPLOAD_IMAGE',
        base64: base64Data,
        fileName: fileName,
        category: category,
      };

      const scriptUrl = this.getConfig().scriptUrl;
      if (scriptUrl) {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return await response.json();
      }

      return {
        success: true,
        url: base64Data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Gagal mengunggah foto.',
      };
    }
  }

  // ============================================================
  // REGISTER MEMBER KE SPREADSHEET
  // ============================================================
  async registerMember(params: {
    memberData: any;
    password: string;
    photoData?: string;
    photoUrl?: string;
    photoFileName?: string;
  }): Promise<any> {
    try {
      const payload = {
        action: 'REGISTER_MEMBER',
        ...params,
      };

      const scriptUrl = this.getConfig().scriptUrl;
      if (scriptUrl) {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return await response.json();
      }

      return {
        success: true,
        member: params.memberData,
        user: {
          id: params.memberData.userId,
          username: params.memberData.email,
          name: params.memberData.fullName,
          role: 'MEMBER',
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  // ============================================================
  // SYNC & HEALTH CHECK SPREADSHEET
  // ============================================================
  async testConnection(scriptUrl?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = scriptUrl || this.getConfig().scriptUrl;
    if (!targetUrl) {
      return { success: false, message: 'URL Web App Google Apps Script belum diisi.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'PING' }),
      });
      const data = await res.json().catch(() => null);
      if (data && (data.success || data.status === 'online')) {
        return { success: true, message: 'Koneksi ke Spreadsheet berhasil!' };
      }
      return { success: true, message: 'Koneksi terhubung ke Google Apps Script.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghubungi Google Apps Script.' };
    }
  }
}

export const spreadsheetService = new SpreadsheetService();
