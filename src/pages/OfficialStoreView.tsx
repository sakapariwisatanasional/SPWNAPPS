import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Crown,
  Gift,
  Package,
  ShoppingBag,
  Sparkles,
  Shirt,
  TimerReset,
  Watch,
  X
} from 'lucide-react';
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

const formatPrice = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return 'Segera diumumkan';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Segera diumumkan';
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

const useCountdown = (target?: string) => {
  const getRemaining = () => {
    if (!target) return 0;

    const timestamp = new Date(target).getTime();

    if (Number.isNaN(timestamp)) return 0;

    return Math.max(0, timestamp - Date.now());
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    setRemaining(getRemaining());

    const timer = window.setInterval(() => {
      setRemaining(getRemaining());
    }, 1000);

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

const ProductVisual: React.FC<{
  product: OfficialMerchandiseProduct;
  compact?: boolean;
  detail?: boolean;
}> = ({ product, compact = false, detail = false }) => {
  const Icon = iconMap[product.iconName || 'package'] || Package;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${
        product.accentClass || 'from-slate-900 via-purple-900 to-emerald-700'
      } ${compact ? 'h-48' : detail ? 'h-80 sm:h-[420px]' : 'h-64 sm:h-72'}`}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, white 0 1px, transparent 2px)'
        }}
      />

      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-white/20 bg-white/10" />
      <div className="absolute -bottom-16 -left-12 h-52 w-52 rounded-full border border-white/10 bg-black/10" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.13em] text-white backdrop-blur-md">
        Official Merchandise
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="rounded-2xl border border-white/20 bg-black/20 px-3 py-2 backdrop-blur-md">
          <div className="text-[8px] font-bold uppercase tracking-[.14em] text-white/55">
            Saka Pariwisata
          </div>
          <div className="mt-0.5 text-xs font-black text-white">
            {product.shortName || product.name}
          </div>
        </div>

        <div className="rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative flex items-center justify-center rounded-[2.5rem] border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md rotate-[-4deg] ${
            compact
              ? 'h-32 w-32'
              : detail
                ? 'h-52 w-52 sm:h-64 sm:w-64'
                : 'h-44 w-44 sm:h-52 sm:w-52'
          }`}
        >
          <div className="absolute inset-3 rounded-[2rem] border border-white/15" />

          <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-white/70" />
          <div className="absolute bottom-7 left-6 h-1.5 w-1.5 rounded-full bg-white/50" />

          <Icon
            className={`text-white/90 ${
              compact
                ? 'h-16 w-16'
                : detail
                  ? 'h-28 w-28 sm:h-32 sm:w-32'
                  : 'h-20 w-20 sm:h-24 sm:w-24'
            }`}
            strokeWidth={1.1}
          />
        </div>
      </div>
    </div>
  );
};

const Countdown: React.FC<{
  launchAt?: string;
  large?: boolean;
  dark?: boolean;
}> = ({ launchAt, large = false, dark = false }) => {
  const countdown = useCountdown(launchAt);

  if (countdown.expired) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black ${
          dark
            ? 'bg-emerald-400/15 text-emerald-200'
            : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Segera tersedia
      </div>
    );
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
        <div
          key={label}
          className={`rounded-xl text-center backdrop-blur-md ${
            large
              ? 'min-w-[54px] p-2.5 sm:min-w-[66px]'
              : 'min-w-[42px] p-1.5'
          } ${
            dark
              ? 'border border-white/15 bg-black/20 text-white'
              : 'border border-slate-200 bg-slate-50 text-slate-800'
          }`}
        >
          <div
            className={`font-black tabular-nums ${
              large ? 'text-lg sm:text-xl' : 'text-sm'
            }`}
          >
            {pad(Number(value))}
          </div>
          <div
            className={`text-[7px] uppercase tracking-wider ${
              dark ? 'text-white/55' : 'text-slate-400'
            }`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatusBadge: React.FC<{
  product: OfficialMerchandiseProduct;
  dark?: boolean;
}> = ({ product, dark = false }) => {
  const countdown = useCountdown(product.launchAt);

  if (countdown.expired) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black ${
          dark
            ? 'bg-emerald-400 text-slate-950'
            : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        SEGERA TERSEDIA
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black ${
        dark
          ? 'bg-amber-400 text-slate-950'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      <TimerReset className="h-3.5 w-3.5" />
      COMING SOON
    </span>
  );
};

const ProductCard: React.FC<{
  product: OfficialMerchandiseProduct;
  onOpen: (product: OfficialMerchandiseProduct) => void;
}> = ({ product, onOpen }) => (
  <article
    className="group cursor-pointer overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
    onClick={() => onOpen(product)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(product);
      }
    }}
    role="button"
    tabIndex={0}
  >
    <div className="relative">
      <ProductVisual product={product} compact />

      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black text-slate-700 shadow-sm backdrop-blur">
        {categoryLabels[product.category]}
      </div>

      {product.featured && (
        <div className="absolute bottom-3 left-3 rounded-full bg-[#34206b]/90 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white backdrop-blur">
          Pilihan
        </div>
      )}
    </div>

    <div className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[.14em] text-[#7b2cbf]">
            {product.tags[0]}
          </div>

          <h3 className="mt-1 text-sm font-black leading-snug text-[#28243a]">
            {product.name}
          </h3>
        </div>

        <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#7b2cbf]" />
      </div>

      <p className="mt-2 min-h-[42px] text-[10px] leading-relaxed text-slate-500">
        {product.description}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <div className="text-[9px] text-slate-400">Harga rencana</div>
          <div className="text-base font-black text-[#159f6b]">
            {formatPrice(product.price)}
          </div>
        </div>

        <StatusBadge product={product} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <div className="mb-1 flex items-center gap-1 text-[8px] font-bold text-slate-400">
            <Clock3 className="h-3 w-3" />
            Peluncuran
          </div>

          <div className="text-xs font-black text-slate-700">
            {formatDate(product.launchAt)}
          </div>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-purple-50 group-hover:text-[#7b2cbf]">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  </article>
);

const ProductDetailModal: React.FC<{
  product: OfficialMerchandiseProduct;
  onClose: () => void;
}> = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-5xl sm:rounded-[2rem]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail produk"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid lg:grid-cols-[.9fr_1.1fr]">
          <ProductVisual product={product} detail />

          <div className="p-5 sm:p-7 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#7b2cbf]">
                {categoryLabels[product.category]}
              </span>

              <StatusBadge product={product} />
            </div>

            <h2 className="mt-4 text-2xl font-black leading-tight text-[#28243a] sm:text-3xl">
              {product.name}
            </h2>

            <div className="mt-3 text-xl font-black text-[#159f6b]">
              {formatPrice(product.price)}
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {product.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  Rencana peluncuran
                </div>

                <div className="mt-2 text-sm font-black text-slate-800">
                  {formatDate(product.launchAt)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Kategori
                </div>

                <div className="mt-2 text-sm font-black text-slate-800">
                  {categoryLabels[product.category]}
                </div>
              </div>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-[9px] font-black uppercase tracking-[.14em] text-slate-400">
                  Ukuran
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 rounded-xl border px-3 py-2 text-xs font-black transition ${
                        selectedSize === size
                          ? 'border-[#34206b] bg-[#34206b] text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-[#7b2cbf]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {selectedSize && (
                  <div className="mt-2 text-[9px] text-slate-400">
                    Pilihan ukuran: <span className="font-bold text-slate-600">{selectedSize}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[9px] font-black uppercase tracking-[.14em] text-slate-400">
                  Menuju peluncuran
                </div>

                <div className="text-[9px] text-slate-400">
                  Waktu perangkat
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <Countdown launchAt={product.launchAt} large />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  window.alert(
                    'Fitur pengingat akan diaktifkan setelah sistem notifikasi Official Store siap.'
                  );
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#34206b] px-4 py-3 text-xs font-black text-white transition hover:bg-[#271650]"
              >
                <Bell className="h-4 w-4" />
                Ingatkan Saya
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-[9px] leading-relaxed text-amber-800">
              Produk ini masih dalam tahap <strong>Coming Soon</strong>. Harga yang
              ditampilkan merupakan harga rencana dan dapat berubah sebelum penjualan resmi dibuka.
            </div>

            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-bold text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({
  products,
  onBackHome
}) => {
  const [category, setCategory] = useState<
    'ALL' | OfficialMerchandiseProduct['category']
  >('ALL');

  const [selectedProduct, setSelectedProduct] =
    useState<OfficialMerchandiseProduct | null>(null);

  const featured = useMemo(
    () => products.find((p) => p.featured && p.active) || products[0],
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.active &&
          (category === 'ALL' || p.category === category)
      ),
    [products, category]
  );

  return (
    <div className="min-h-full bg-[#f8f8fb] text-[#28243a]">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-5 text-white sm:px-6 sm:py-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(123,44,191,.42),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(21,159,107,.28),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl">
          <button
            type="button"
            onClick={onBackHome}
            className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Beranda
          </button>

          <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.16em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                Official Store
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                Identitas Saka Pariwisata,
                <br />
                <span className="text-emerald-300">
                  siap menemani setiap langkah.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
                Katalog merchandise resmi untuk kegiatan, perjalanan,
                pembelajaran, dan kebanggaan sebagai bagian dari ekosistem
                Saka Pariwisata.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.15em] text-white/50">
                <Bell className="h-3.5 w-3.5" />
                Status katalog
              </div>

              <div className="mt-2 text-sm font-black">
                Pre-launch merchandise
              </div>

              <div className="mt-1 text-[10px] text-white/55">
                Pesanan akan dibuka setelah produk resmi tersedia.
              </div>
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl">
            <div className="grid lg:grid-cols-[.95fr_1.05fr]">
              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-11">
                <div className="text-[9px] font-black uppercase tracking-[.18em] text-amber-300">
                  Produk perdana
                </div>

                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {featured.name}
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-white/60">
                  {featured.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <StatusBadge product={featured} dark />

                  <span className="text-[10px] font-bold text-white/50">
                    Harga rencana {formatPrice(featured.price)}
                  </span>
                </div>

                <div className="mt-5">
                  <Countdown
                    launchAt={featured.launchAt}
                    large
                    dark
                  />
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(featured)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black text-slate-950 transition hover:bg-emerald-100"
                  >
                    Lihat detail produk
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 text-[9px] text-white/40">
                  Countdown mengikuti waktu perangkat pengunjung.
                </div>
              </div>

              <ProductVisual product={featured} />
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[.16em] text-[#7b2cbf]">
                Koleksi resmi
              </div>

              <h2 className="mt-1 text-2xl font-black">
                Pilihan merchandise
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Klik produk untuk melihat detail dan informasi peluncuran.
              </p>
            </div>

            <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  'ALL',
                  'APPAREL',
                  'OUTDOOR',
                  'ACCESSORIES',
                  'IDENTITY'
                ] as const
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] font-black transition ${
                    category === item
                      ? 'bg-[#34206b] text-white'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-purple-200 hover:text-[#7b2cbf]'
                  }`}
                >
                  {item === 'ALL' ? 'Semua' : categoryLabels[item]}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.6rem] border border-dashed border-slate-200 bg-white p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />

              <div className="mt-3 text-sm font-black text-slate-700">
                Belum ada produk pada kategori ini
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Silakan pilih kategori lainnya.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black text-slate-700">
              Official Store Saka Pariwisata
            </div>

            <div className="mt-1 max-w-2xl text-[10px] leading-relaxed text-slate-400">
              Produk, harga, ukuran, dan jadwal peluncuran dapat diperbarui
              sebelum penjualan resmi dibuka.
            </div>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
            <ShoppingBag className="h-4 w-4" />
            Pre-launch catalog
          </div>
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
