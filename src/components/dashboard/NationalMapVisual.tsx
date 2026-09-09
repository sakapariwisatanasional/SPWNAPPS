import React, { useMemo } from 'react';
import { MapPin, Users, Compass } from 'lucide-react';

interface NationalMapVisualProps {
  members?: any[];
  onSelectKwarda?: (kwardaName: string) => void;
}

export const NationalMapVisual: React.FC<NationalMapVisualProps> = ({
  members = [],
  onSelectKwarda,
}) => {
  const safeMembers = useMemo(() => (Array.isArray(members) ? members : []), [members]);

  // Agregasi jumlah anggota per Kwarda
  const kwardaCounts = useMemo(() => {
    const map: Record<string, number> = {};
    safeMembers.forEach((m) => {
      const region = m?.kwarda || 'Lainnya';
      map[region] = (map[region] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [safeMembers]);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              Total Cakupan Saka Pariwisata
            </h4>
            <p className="text-[11px] text-slate-500">
              Tersebar di {kwardaCounts.length} Kwartir Daerah se-Indonesia
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
          {safeMembers.length} Personel
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {kwardaCounts.slice(0, 12).map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectKwarda && onSelectKwarda(item.name)}
            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition cursor-pointer flex flex-col justify-between"
          >
            <span className="text-[11px] font-semibold text-slate-700 truncate" title={item.name}>
              {item.name}
            </span>
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
              <span>Anggota</span>
              <span className="font-bold text-emerald-600">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NationalMapVisual;
