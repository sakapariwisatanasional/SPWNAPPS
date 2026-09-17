import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, CheckCircle2, Clock3, Compass, Crown, Gift, Package, ShoppingBag, Sparkles, Shirt, TimerReset, Watch, X } from 'lucide-react';
import { OfficialMerchandiseProduct } from '../types';

interface OfficialStoreViewProps {
  products: OfficialMerchandiseProduct[];
  onBackHome: () => void;
}

const categoryLabels: Record<OfficialMerchandiseProduct['category'], string> = {
  APPAREL: 'Apparel',
  ACCESSORIES: 'Aksesori',
  IDENTITY: 'Identitas',
  OUTDOOR: 'Outdoor'
};

const iconMap: Record<string, React.ElementType> = {
  shirt: Shirt,
  jacket: Package,
  cap: Crown,
  bottle: Watch,
  lanyard: Gift,
  compass: Compass
};

const formatPrice = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

const useCountdown = (target?: string) => {
  const getRemaining = () => {
    if (!target) return 0;
    return Math.max(0, new Date(target).getTime() - Date.now());
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  const total = Math.floor(remaining / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: remaining <= 0
  };
};

const ProductVisual: React.FC<{ product: OfficialMerchandiseProduct; compact?: boolean }> = ({ product, compact = false }) => {
  const Icon = iconMap[product.iconName || 'package'] || Package;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${product.accentClass || 'from-slate-900 via-purple-900 to-emerald-700'} ${compact ? 'h-44' : 'h-64 sm:h-72'}`}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, white 0 1px, transparent 2px)' }} />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/20 bg-white/10" />
      <div className="absolute -left-10 -bottom-12 h-40 w-40 rounded-full border border-white/10 bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-[2.2rem] border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md rotate-[-4deg]">
          <div className="absolute inset-3 rounded-[1.7rem] border border-white/15" />
          <Icon className="h-20 w-20 sm:h-24 sm:w-24 text-white/90" strokeWidth={1.25} />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-[.18em] text-white/85">Saka Pariwisata</span>
        </div>
      </div>
      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.13em] text-white backdrop-blur-md">Official Merchandise</div>
    </div>
  );
};

const Countdown: React.FC<{ launchAt?: string; large?: boolean }> = ({ launchAt, large = false }) => {
  const countdown = useCountdown(launchAt);
  if (countdown.expired) {
    return <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Segera tersedia</div>;
  }
  const blocks = [
    ['Hari', countdown.days],
    ['Jam', countdown.hours],
    ['Menit', countdown.minutes],
    ['Detik', countdown.seconds]
  ];
  return (
    <div className={`flex items-center ${large ? 'gap-2' : 'gap-1.5'}`}>
      {blocks.map(([label, value]) => (
        <div key={label} className={`${large ? 'min-w-[54px] sm:min-w-[66px] p-2.5' : 'min-w-[42px] p-1.5'} rounded-xl border border-white/15 bg-black/20 text-center text-white backdrop-blur-md`}>
          <div className={`${large ? 'text-lg sm:text-xl' : 'text-sm'} font-black tabular-nums`}>{pad(Number(value))}</div>
          <div className="text-[7px] uppercase tracking-wider text-white/65">{label}</div>
        </div>
      ))}
    </div>
  );
};

const ProductCard: React.FC<{ product: OfficialMerchandiseProduct }> = ({ product }) => (
  <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="relative">
      <ProductVisual product={product} compact />
      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black text-slate-700 shadow-sm backdrop-blur">{categoryLabels[product.category]}</div>
    </div>
    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[.14em] text-[#7b2cbf]">{product.tags[0]}</div>
          <h3 className="mt-1 text-sm font-black leading-snug text-[#28243a]">{product.name}</h3>
        </div>
        <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
      </div>
      <p className="mt-2 min-h-[42px] text-[10px] leading-relaxed text-slate-500">{product.description}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div><div className="text-[9px] text-slate-400">Harga rencana</div><div className="text-base font-black text-[#159f6b]">{formatPrice(product.price)}</div></div>
        <span className="rounded-xl bg-amber-50 px-2.5 py-1.5 text-[9px] font-black text-amber-700">Coming Soon</span>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="mb-1.5 flex items-center gap-1 text-[8px] font-bold text-slate-400"><Clock3 className="h-3 w-3" /> Peluncuran</div>
        <div className="text-xs font-black text-slate-700">{product.launchAt ? new Date(product.launchAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Segera diumumkan'}</div>
        <div className="mt-2"><Countdown launchAt={product.launchAt} /></div>
      </div>
    </div>
  </article>
);

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({ products, onBackHome }) => {
  const [category, setCategory] = useState<'ALL' | OfficialMerchandiseProduct['category']>('ALL');
  const featured = useMemo(() => products.find(p => p.featured && p.active) || products[0], [products]);
  const filtered = useMemo(() => products.filter(p => p.active && (category === 'ALL' || p.category === category)), [products, category]);

  return (
    <div className="min-h-full bg-[#f8f8fb] text-[#28243a]">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-5 text-white sm:px-6 sm:py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(123,44,191,.42),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(21,159,107,.28),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl">
          <button type="button" onClick={onBackHome} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-white/80 hover:bg-white/10"><ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda</button>
          <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-emerald-200"><Sparkles className="h-3.5 w-3.5" /> Official Store</div>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Identitas Saka Pariwisata,<br /><span className="text-emerald-300">siap menemani setiap langkah.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">Katalog merchandise resmi untuk kegiatan, perjalanan, pembelajaran, dan kebanggaan sebagai bagian dari ekosistem Saka Pariwisata.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-white/50"><Bell className="h-3.5 w-3.5" /> Status katalog</div><div className="mt-2 text-sm font-black">Pre-launch merchandise</div><div className="mt-1 text-[10px] text-white/55">Pesanan akan dibuka setelah produk resmi tersedia.</div></div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl">
            <div className="grid lg:grid-cols-[.95fr_1.05fr]">
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <div className="text-[9px] font-black uppercase tracking-[.18em] text-amber-300">Produk perdana</div>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{featured.name}</h2>
                <p className="mt-3 text-xs leading-relaxed text-white/60">{featured.description}</p>
                <div className="mt-5 flex items-center gap-2"><span className="rounded-full bg-amber-400 px-3 py-1.5 text-[9px] font-black text-slate-950">COMING SOON</span><span className="text-[10px] font-bold text-white/50">Harga rencana {formatPrice(featured.price)}</span></div>
                <div className="mt-5"><Countdown launchAt={featured.launchAt} large /></div>
                <div className="mt-3 text-[9px] text-white/40">Countdown mengikuti waktu perangkat pengunjung.</div>
              </div>
              <ProductVisual product={featured} />
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-[9px] font-black uppercase tracking-[.16em] text-[#7b2cbf]">Koleksi resmi</div><h2 className="mt-1 text-2xl font-black">Pilihan merchandise</h2><p className="mt-1 text-xs text-slate-500">Semua produk saat ini masih berstatus coming soon.</p></div>
            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
              {(['ALL', 'APPAREL', 'OUTDOOR', 'ACCESSORIES', 'IDENTITY'] as const).map(item => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] font-black transition ${category === item ? 'bg-[#34206b] text-white' : 'border border-slate-200 bg-white text-slate-500 hover:border-purple-200 hover:text-[#7b2cbf]'}`}>{item === 'ALL' ? 'Semua' : categoryLabels[item]}</button>)}
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>
    </div>
  );
};
