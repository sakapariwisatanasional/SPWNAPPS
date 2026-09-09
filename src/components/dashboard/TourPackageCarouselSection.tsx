import React, { useMemo } from 'react';
import { Compass, MapPin, Tag, ChevronRight, Sparkles } from 'lucide-react';

export interface TourPackageCarouselSectionProps {
  packages?: any[];
  tourPackages?: any[];
  onSelectPackage?: (pkg: any) => void;
  [key: string]: any;
}

export const TourPackageCarouselSection: React.FC<TourPackageCarouselSectionProps> = ({
  packages = [],
  tourPackages = [],
  onSelectPackage,
}) => {
  // Normalisasi data aman
  const safePackages = useMemo(() => {
    const rawList = Array.isArray(packages) && packages.length > 0 ? packages : tourPackages;
    return (Array.isArray(rawList) ? rawList : []).filter((p) => Boolean(p));
  }, [packages, tourPackages]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Paket Wisata Saka Pariwisata
            </h3>
            <p className="text-[11px] text-slate-400">
              Karya rintisan dan paket edukasi anggota Saka se-Indonesia
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {safePackages.length > 0 ? (
          safePackages.slice(0, 4).map((pkg, idx) => (
            <div
              key={pkg?.id || idx}
              onClick={() => onSelectPackage && onSelectPackage(pkg)}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/30 hover:border-teal-200 transition cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    <Tag className="w-2.5 h-2.5" />
                    {pkg?.category || 'Wisata Edukasi'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {pkg?.price ? `Rp ${Number(pkg.price).toLocaleString('id-ID')}` : 'Gratis / Bhakti'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition line-clamp-1">
                  {pkg?.title || pkg?.name || 'Paket Wisata Saka'}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {pkg?.description || 'Pengalaman wisata pramuka terpadu berbasis kearifan lokal.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {pkg?.location || pkg?.kwarcab || 'Nasional'}
                </span>
                <span className="text-teal-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                  Detail <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center space-y-1">
            <Sparkles className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Belum ada paket wisata</p>
            <p className="text-[11px] text-slate-400">Paket yang ditambahkan akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourPackageCarouselSection;
