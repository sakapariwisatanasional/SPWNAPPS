import React, { useMemo } from 'react';
import { MapPin, Users, Globe2 } from 'lucide-react';
import { Province, Member } from '../../types';

interface NationalMapVisualProps {
  provinces: Province[];
  members?: Member[];
  onSelectProvince?: (province: Province) => void;
}

export const NationalMapVisual: React.FC<NationalMapVisualProps> = ({
  provinces = [],
  members = [],
  onSelectProvince
}) => {
  const safeProvinces = Array.isArray(provinces) ? provinces : [];
  const safeMembers = Array.isArray(members) ? members : [];

  // Hitung jumlah riil anggota per provinsi dari data Google Spreadsheet
  const { provinceDistribution, totalRealMembers } = useMemo(() => {
    const countsMap: Record<string, number> = {};

    // Normalisasi dan hitung kemunculan provinsi dari data anggota aktif/terdaftar
    safeMembers.forEach((m) => {
      if (!m) return;
      
      // Ambil kode/ID atau nama provinsi anggota
      const provId = m.provinceId ? String(m.provinceId).trim() : '';
      const provName = m.provinceName ? m.provinceName.toLowerCase().trim() : '';

      // Cocokkan ke daftar 38 provinsi resmi
      const matchedProv = safeProvinces.find((p) => 
        (provId && p.id === provId) ||
        (provName && p.name.toLowerCase().trim() === provName) ||
        (provName && (p.name.toLowerCase().includes(provName) || provName.includes(p.name.toLowerCase())))
      );

      const targetKey = matchedProv ? matchedProv.id : (provId || 'OTHER');
      countsMap[targetKey] = (countsMap[targetKey] || 0) + 1;
    });

    const total = safeMembers.length;

    // Petakan ke seluruh provinsi resmi (38 Provinsi) dengan data riil
    const list = safeProvinces.map((p) => {
      const realCount = countsMap[p.id] || 0;
      const percentage = total > 0 ? Math.round((realCount / total) * 100) : 0;
      return {
        ...p,
        realMemberCount: realCount,
        percentage
      };
    });

    // Urutkan berdasarkan provinsi dengan anggota terbanyak hasil data riil
    list.sort((a, b) => b.realMemberCount - a.realMemberCount);

    return {
      provinceDistribution: list,
      totalRealMembers: total
    };
  }, [safeProvinces, safeMembers]);

  // Tampilkan provinsi teratas (atau semua provinsi yang memiliki anggota)
  const displayProvinces = useMemo(() => {
    const withMembers = provinceDistribution.filter(p => p.realMemberCount > 0);
    // Jika data anggota masih sedikit, tampilkan 8 provinsi teratas
    if (withMembers.length <= 8) {
      return provinceDistribution.slice(0, 8);
    }
    return withMembers;
  }, [provinceDistribution]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 font-heading flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-600" />
            <span>Distribusi Keanggotaan Terpadu (38 Provinsi)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Kalkulasi riil berdasarkan wilayah anggota yang tersinkronisasi di Google Spreadsheet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            Total: {totalRealMembers.toLocaleString('id-ID')} Anggota Riil
          </span>
        </div>
      </div>

      <div className="space-y-3.5">
        {displayProvinces.map((prov) => {
          const count = prov.realMemberCount || 0;
          const percentage = prov.percentage || 0;

          return (
            <div 
              key={prov.id} 
              onClick={() => onSelectProvince && onSelectProvince(prov)}
              className="space-y-1.5 group cursor-pointer"
            >
              <div className="flex justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${count > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-900 font-bold">{prov.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({prov.island})</span>
                </span>
                <span className="font-mono text-slate-800">
                  {count.toLocaleString('id-ID')} Anggota ({percentage}%)
                </span>
              </div>

              {/* Progress bar representasi persentase riil */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    count > 0 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400' 
                      : 'bg-transparent'
                  }`}
                  style={{ width: count > 0 ? `${Math.max(percentage, 2)}%` : '0%' }}
                />
              </div>
            </div>
          );
        })}

        {totalRealMembers === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs space-y-1">
            <Users className="w-6 h-6 mx-auto text-slate-300" />
            <p>Belum ada data anggota yang masuk dari Google Spreadsheet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
