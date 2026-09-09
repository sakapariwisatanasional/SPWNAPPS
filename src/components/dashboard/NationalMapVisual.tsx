import React, { useMemo, useState } from 'react';
import { Compass, Search, MapPin } from 'lucide-react';

export interface NationalMapVisualProps {
  members?: any[];
  onSelectKwarda?: (kwardaName: string) => void;
}

export const NationalMapVisual: React.FC<NationalMapVisualProps> = ({
  members = [],
  onSelectKwarda,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Proteksi array anggota
  const safeMembers = useMemo(() => {
    return Array.isArray(members) ? members : [];
  }, [members]);

  // Agregasi jumlah anggota per Kwarda secara aman
  const kwardaStats = useMemo(() => {
    const counts: Record<string, number> = {};
    safeMembers.forEach((m) => {
      const region = m?.kwarda?.trim() || 'Nasional / Belum Terdata';
      counts[region] = (counts[region] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [safeMembers]);

  // Filter Kwarda dengan pencarian
  const filteredKwarda = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return kwardaStats;
    return kwardaStats.filter((k) => k.name.toLowerCase().includes(q));
  }, [kwardaStats, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Banner Rekapitulasi */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Sebaran Personel Nasional
            </h4>
            <p className="text-[11px] text-slate-500">
              Tersebar di {kwardaStats.length} Kwartir Daerah se-Indonesia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kwarda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-44"
            />
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-200 shrink-0">
            {safeMembers.length.toLocaleString('id-ID')} Personel
          </span>
        </div>
      </div>

      {/* Grid Distribusi Kwarda */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
        {filteredKwarda.length > 0 ? (
          filteredKwarda.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectKwarda && onSelectKwarda(item.name)}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>Anggota</span>
                <span className="font-bold text-emerald-600">{item.count.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            Kwarda tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

export default NationalMapVisual;
