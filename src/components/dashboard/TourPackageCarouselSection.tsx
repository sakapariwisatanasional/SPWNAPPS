import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Sparkles, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  Calendar,
  Users
} from 'lucide-react';
import { TourPackage, CurrentUser } from '../../types';

interface TourPackageCarouselSectionProps {
  tours: TourPackage[];
  currentUser?: CurrentUser;
  onViewTourDetail: (tour: TourPackage) => void;
  onSelectTab?: (tab: string) => void;
}

export const TourPackageCarouselSection: React.FC<TourPackageCarouselSectionProps> = ({
  tours,
  onViewTourDetail,
  onSelectTab
}) => {
  const publishedTours = tours.filter(t => t.status === 'APPROVED_PUBLISHED' || !t.status);
  const displayTours = publishedTours.length > 0 ? publishedTours : tours;

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract unique categories
  const categories = Array.from(new Set(displayTours.map(t => t.category).filter(Boolean)));

  // Filtered tours
  const filteredTours = displayTours.filter(t => 
    selectedCategory === 'ALL' || t.category === selectedCategory
  );

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlay || filteredTours.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlay, currentIndex, filteredTours.length]);

  const handlePrev = () => {
    if (filteredTours.length === 0) return;
    const newIdx = currentIndex === 0 ? filteredTours.length - 1 : currentIndex - 1;
    setCurrentIndex(newIdx);
    scrollToCard(newIdx);
  };

  const handleNext = () => {
    if (filteredTours.length === 0) return;
    const newIdx = currentIndex >= filteredTours.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIdx);
    scrollToCard(newIdx);
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth >= 1024 ? container.clientWidth / 3 : container.clientWidth >= 640 ? container.clientWidth / 2 : container.clientWidth;
      container.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleManualSelect = (index: number) => {
    setCurrentIndex(index);
    scrollToCard(index);
  };

  return (
    <section 
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200 shadow-sm relative overflow-hidden space-y-4 sm:space-y-6"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Section with Navigation Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
        <div className="space-y-1 sm:space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-teal-900 text-[11px] sm:text-xs font-bold shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-teal-600 animate-spin-slow" />
            <span>Destinasi & Ekowisata Unggulan</span>
          </div>

          <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
            Galeri Paket Wisata Nusantara
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eksplorasi pilihan paket perjalanan wisata edukatif, ramah lingkungan, dan mendukung ekonomi masyarakat lokal binaan kader Saka Pariwisata.
          </p>
        </div>

        {/* Carousel Navigation Arrows & View All Link */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0 pt-1 sm:pt-0">
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('tours')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrev}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Paket Sebelumnya"
              aria-label="Previous tour slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Paket Selanjutnya"
              aria-label="Next tour slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Edge-to-edge scrollable on phones) */}
      <div className="relative z-10 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => {
            setSelectedCategory('ALL');
            setCurrentIndex(0);
          }}
          className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
            selectedCategory === 'ALL'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Semua Ragam</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === 'ALL' ? 'bg-teal-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {displayTours.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = displayTours.filter(t => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat ? 'bg-teal-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Carousel Container */}
      <div className="relative z-10 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 sm:pb-4 custom-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredTours.map((tour, idx) => (
            <div
              key={tour.id}
              onClick={() => onViewTourDetail(tour)}
              className="flex-none w-[82vw] max-w-[310px] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] snap-start group bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer justify-between transform hover:-translate-y-1"
            >
              <div>
                {/* Cover Image & Overlays */}
                <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-900">
                  <img
                    src={tour.coverImage}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30" />

                  {/* Category Pill (Top Left) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-1 bg-teal-600/90 backdrop-blur-md text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold shadow-xs flex items-center gap-1 border border-teal-400/30">
                      <Sparkles className="w-3 h-3" />
                      <span>{tour.category}</span>
                    </span>
                  </div>

                  {/* Rating / Sapta Pesona Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-amber-300 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 border border-white/10 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{tour.rating || 4.9}</span>
                    </span>
                  </div>

                  {/* Bottom Overlay: Price & Duration */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-teal-200 uppercase font-semibold">Mulai dari</p>
                      <p className="text-sm sm:text-lg font-extrabold font-heading text-white leading-tight">
                        Rp {(tour.pricePerPerson ?? 0).toLocaleString('id-ID')}
                        <span className="text-[10px] font-normal text-slate-300"> / org</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] bg-black/60 backdrop-blur-md px-2 sm:px-2.5 py-1 rounded-xl border border-white/15 font-semibold text-emerald-300 shadow-xs">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{tour.durationDays} Hari</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-teal-800 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{tour.regencyName}, {tour.provinceName}</span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-teal-900 transition-colors line-clamp-2 font-heading leading-snug">
                    {tour.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tour.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Facilitator & CTA */}
              <div className="p-4 sm:p-5 pt-0 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Pemandu Saka Pariwisata</span>
                  </div>

                  <span className="font-bold text-teal-700 group-hover:text-teal-900 flex items-center gap-0.5 text-xs">
                    <span>Detail</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTourDetail(tour);
                  }}
                  className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold rounded-xl sm:rounded-2xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-teal-200/80 active:scale-98 min-h-[42px]"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                  <span>Lihat Itinerary & Reservasi</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators / Step Dots */}
        {filteredTours.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {filteredTours.map((_, i) => (
              <button
                key={i}
                onClick={() => handleManualSelect(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === i 
                    ? 'w-6 bg-teal-600' 
                    : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Ke slide ${i + 1}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
