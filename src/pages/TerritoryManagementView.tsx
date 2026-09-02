import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Building, 
  Users, 
  Plus, 
  Search, 
  Globe2, 
  Layers 
} from 'lucide-react';
import { Province, Regency, District, Branch } from '../types';
import { storage } from '../services/storage';

interface TerritoryManagementViewProps {
  provinces: Province[];
}

export const TerritoryManagementView: React.FC<TerritoryManagementViewProps> = ({
  provinces
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('32'); // Default Jawa Barat
  const [searchProvince, setSearchProvince] = useState('');

  const selectedProvince = provinces.find(p => p.id === selectedProvinceId) || provinces[0];
  const regencies = selectedProvince ? storage.getRegencies(selectedProvince.id) : [];

  const [selectedRegencyId, setSelectedRegencyId] = useState<string>(regencies[0]?.id || '32.06');
  const selectedRegency = regencies.find(r => r.id === selectedRegencyId) || regencies[0];

  const districts = selectedRegency ? storage.getDistricts(selectedRegency.id) : [];

  const filteredProvinces = provinces.filter(p => 
    (p.name || '').toLowerCase().includes((searchProvince || '').toLowerCase()) ||
    (p.code || '').includes(searchProvince || '')
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
          Master Data Struktur Wilayah Organisasi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Hierarki Kwartir Daerah (Provinsi) $\rightarrow$ Kwartir Cabang (Kab/Kota) $\rightarrow$ Kwartir Ranting (Kecamatan) $\rightarrow$ Pangkalan Saka Pariwisata
        </p>
      </div>

      {/* 3-Column Hierarchy Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Provinces List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <span>Wilayah / Kwarda / Kwarnas ({provinces.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Level 1
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchProvince}
              onChange={(e) => setSearchProvince(e.target.value)}
              placeholder="Cari provinsi..."
              className="bg-transparent outline-none w-full text-slate-800"
            />
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredProvinces.map((prov) => {
              const isSelected = prov.id === selectedProvinceId;
              return (
                <button
                  key={prov.id}
                  onClick={() => {
                    setSelectedProvinceId(prov.id);
                    const regs = storage.getRegencies(prov.id);
                    if (regs.length > 0) setSelectedRegencyId(regs[0].id);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-xs' 
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                      {prov.code}
                    </span>
                    <span className="truncate">{prov.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    {prov.memberCount?.toLocaleString('id-ID') || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Regencies List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Kab/Kota / Kwarcab</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Level 2
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Wilayah di <strong className="text-slate-800">{selectedProvince?.name}</strong>:
          </p>

          <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {regencies.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Belum ada data kab/kota tersimpan.</p>
            ) : (
              regencies.map((reg) => {
                const isSelected = reg.id === selectedRegencyId;
                return (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegencyId(reg.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-xs' 
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                        {reg.code}
                      </span>
                      <span className="truncate">{reg.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Districts & Branches (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Kwartir Ranting / Kecamatan</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Level 3
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Kwartir Ranting di <strong className="text-slate-800">{selectedRegency?.name || 'Kabupaten'}</strong> (mengikuti nama Kecamatan):
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {districts.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                Pilih kabupaten untuk melihat daftar kwartir ranting (kecamatan) & pangkalan Saka Pariwisata.
              </div>
            ) : (
              districts.map((dist) => {
                const branches = storage.getBranches(dist.id);
                return (
                  <div key={dist.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
                          {dist.code}
                        </span>
                        <span>Kwarran {dist.name} (Kec. {dist.name})</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {branches.map(b => (
                        <div key={b.id} className="bg-white p-2 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <p className="font-bold text-emerald-900">{b.name}</p>
                            <p className="text-[10px] text-slate-400">{b.address}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md whitespace-nowrap">
                            Kwarran
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
