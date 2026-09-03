import React, { useState } from 'react';
import { History, Shield, Search, Filter, Download, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const q = (searchQuery || '').toLowerCase();
    const actor = (log.userName || (log as any).actorName || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const details = (log.description || (log as any).details || '').toLowerCase();
    const entity = (log.entityId || (log as any).targetName || '').toLowerCase();

    const matchSearch =
      actor.includes(q) ||
      action.includes(q) ||
      details.includes(q) ||
      entity.includes(q);

    if (!matchSearch) return false;
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
          Audit Trail & Log Keamanan Sistem
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Catatan riwayat verifikasi, mutasi wilayah, penerbitan KTA, dan aktivitas administratif
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktor, nomor anggota, aksi..."
            className="bg-transparent outline-none w-full text-slate-800"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
        >
          <option value="ALL">Semua Jenis Aktivitas</option>
          <option value="REGISTER_MEMBER">Registrasi Anggota</option>
          <option value="APPROVE_MEMBER">Verifikasi & Terbit KTA</option>
          <option value="TRANSFER_MEMBER">Mutasi Wilayah</option>
          <option value="CREATE_TOUR">Pembuatan Paket Wisata</option>
        </select>
      </div>

      {/* Table & Mobile Card View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Aktor Pengguna</th>
                <th className="py-3 px-4">Tindakan / Aksi</th>
                <th className="py-3 px-4">Target Entitas</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada catatan audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp || (log as any).createdAt || Date.now()).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{log.userName || (log as any).actorName || 'Sistem'}</p>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                        {log.userRole || (log as any).actorRole || 'ADMIN'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{log.entityId || (log as any).targetName || (log as any).targetId || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.entityType || (log as any).targetType || '-'}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                      {log.description || (log as any).details || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Tidak ada catatan audit yang cocok.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2.5 bg-white text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{log.userName || (log as any).actorName || 'Sistem'}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp || (log as any).createdAt || Date.now()).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px] font-mono flex-shrink-0">
                    {log.action}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Target:</span>
                    <span className="font-semibold text-slate-800">{log.entityId || (log as any).targetName || (log as any).targetId || '-'} ({log.entityType || '-'})</span>
                  </div>
                  <div className="text-slate-600 pt-1 border-t border-slate-200/60">
                    {log.description || (log as any).details || '-'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-right pt-0.5">
                    IP: {log.ipAddress || '127.0.0.1'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
