import React from 'react';
import { MapPin, Users, Compass, Globe2 } from 'lucide-react';
import { Province } from '../../types';

interface NationalMapVisualProps {
  provinces: Province[];
  onSelectProvince?: (province: Province) => void;
}

export const NationalMapVisual: React.FC<NationalMapVisualProps> = ({
  provinces,
  onSelectProvince
}) => {
  const topProvinces = [...provinces]
    .sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0))
    .slice(0, 6);

  const totalMembers = provinces.reduce((acc, p) => acc + (p.memberCount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-emerald-600" />
          <span>Distribusi Keanggotaan Terpadu (38 Provinsi)</span>
        </h3>
        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
          Total: {(totalMembers || 0).toLocaleString('id-ID')} Anggota
        </span>
      </div>

      <div className="space-y-3">
        {topProvinces.map((prov) => {
          const count = prov.memberCount || 0;
          const percentage = totalMembers > 0 ? Math.round((count / totalMembers) * 100) : 0;

          return (
            <div 
              key={prov.id} 
              onClick={() => onSelectProvince && onSelectProvince(prov)}
              className="space-y-1 group cursor-pointer"
            >
              <div className="flex justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {prov.name}
                  <span className="text-[10px] text-slate-400 font-normal">({prov.island})</span>
                </span>
                <span className="font-mono text-slate-800">{(count || 0).toLocaleString('id-ID')} ({percentage}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 group-hover:from-emerald-400 group-hover:to-teal-400"
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
