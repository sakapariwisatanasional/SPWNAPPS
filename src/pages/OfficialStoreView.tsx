import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Compass,
  Crown,
  CreditCard,
  Gift,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Shirt,
  Trash2,
  Truck,
  User,
  Watch,
  X
} from 'lucide-react';
import { OfficialMerchandiseProduct } from '../types';

interface OfficialStoreViewProps {
  products: OfficialMerchandiseProduct[];
  onBackHome: () => void;
}

interface CartItem {
  productId: string;
  size?: string;
  quantity: number;
}

interface CheckoutForm {
  receiverName: string;
  whatsapp: string;
  address: string;
  province: string;
  regency: string;
  district: string;
  note: string;
}

interface DemoOrder {
  orderNumber: string;
  createdAt: string;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size?: string;
    quantity: number;
  }>;
  subtotal: number;
  checkout: CheckoutForm;
}

const CART_STORAGE_KEY = 'spwn-official-store-cart';
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

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

const isPurchasable = (product: OfficialMerchandiseProduct) =>
  product.active &&
  product.purchaseEnabled === true &&
  product.comingSoon === false;

const readCart = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Local storage may be unavailable in restricted browser contexts.
  }
};

const useCountdown = (target?: string) => {
  const getRemaining = () => {
    if (!target) return 0;

    return Math.max(0, new Date(target).getTime() - Date.now());
  };

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
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
}> = ({ product, compact = false }) => {
  const Icon = iconMap[product.iconName || 'package'] || Package;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${
        product.accentClass ||
        'from-slate-900 via-purple-900 to-emerald-700'
      } ${compact ? 'h-44' : 'h-64 sm:h-72'}`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, white 0 1px, transparent 2px)'
        }}
      />

      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/20 bg-white/10" />

      <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full border border-white/10 bg-black/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-36 w-36 rotate-[-4deg] items-center justify-center rounded-[2.2rem] border border-white/25 bg-white/10 shadow-2xl backdrop-blur-md sm:h-44 sm:w-44">
          <div className="absolute inset-3 rounded-[1.7rem] border border-white/15" />

          <Icon
            className="h-20 w-20 text-white/90 sm:h-24 sm:w-24"
            strokeWidth={1.25}
          />

          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-[.18em] text-white/85">
            Saka Pariwisata
          </span>
        </div>
      </div>

      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.13em] text-white backdrop-blur-md">
        Official Merchandise
      </div>

      {isPurchasable(product) && (
        <div className="absolute bottom-4 right-4 rounded-full border border-emerald-200/30 bg-emerald-400/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-emerald-100 backdrop-blur-md">
          Tersedia
        </div>
      )}
    </div>
  );
};

const Countdown: React.FC<{
  launchAt?: string;
  large?: boolean;
}> = ({ launchAt, large = false }) => {
  const countdown = useCountdown(launchAt);

  if (countdown.expired) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Tersedia
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
          className={`${
            large
              ? 'min-w-[54px] p-2.5 sm:min-w-[66px]'
              : 'min-w-[42px] p-1.5'
          } rounded-xl border border-white/15 bg-black/20 text-center text-white backdrop-blur-md`}
        >
          <div
            className={`font-black leading-none ${
              large ? 'text-base sm:text-lg' : 'text-xs'
            }`}
          >
            {pad(Number(value))}
          </div>

          <div
            className={`mt-1 font-bold uppercase tracking-[.08em] text-white/55 ${
              large ? 'text-[7px]' : 'text-[6px]'
            }`}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductCard: React.FC<{
  product: OfficialMerchandiseProduct;
  onOpen: (product: OfficialMerchandiseProduct) => void;
}> = ({ product, onOpen }) => {
  const purchasable = isPurchasable(product);

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="block w-full text-left"
      >
        <ProductVisual product={product} />

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-slate-500">
              {categoryLabels[product.category]}
            </span>

            {product.featured && (
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-[.1em] text-amber-600">
                <Sparkles className="h-3 w-3" />
                Pilihan
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-slate-800">
            {product.name}
          </h3>

          <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
            {product.description}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[.1em] text-slate-400">
                Harga
              </div>

              <div className="mt-0.5 text-sm font-black text-[#34206b]">
                {formatPrice(product.price)}
              </div>
            </div>

            <div
              className={`rounded-xl px-3 py-2 text-[9px] font-black ${
                purchasable
                  ? 'bg-[#34206b] text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {purchasable ? 'Lihat Produk' : 'Coming Soon'}
            </div>
          </div>
        </div>
      </button>
    </article>
  );
};

const ModalShell: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div
      className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.8rem] bg-white shadow-2xl sm:rounded-[1.8rem] ${
        wide ? 'max-w-5xl' : 'max-w-2xl'
      }`}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-black text-slate-800">{title}</h2>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 overflow-y-auto">{children}</div>
    </div>
  </div>
);

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({
  products,
  onBackHome
}) => {
  const [category, setCategory] = useState<
    'ALL' | OfficialMerchandiseProduct['category']
  >('ALL');

  const [cart, setCart] = useState<CartItem[]>(() => readCart());

  const [selectedProduct, setSelectedProduct] =
    useState<OfficialMerchandiseProduct | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [cartOpen, setCartOpen] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [successOrder, setSuccessOrder] = useState<DemoOrder | null>(null);

  const [notice, setNotice] = useState<string>('');

  const [checkoutError, setCheckoutError] = useState<string>('');

  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    receiverName: '',
    whatsapp: '',
    address: '',
    province: '',
    regency: '',
    district: '',
    note: ''
  });

  const featured = useMemo(
    () =>
      products.find(p => p.featured && p.active) ||
      products.find(p => p.active),
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter(
        p =>
          p.active &&
          (category === 'ALL' || p.category === category)
      ),
    [products, category]
  );

  const cartRows = useMemo(
    () =>
      cart
        .map(item => {
          const product = products.find(p => p.id === item.productId);

          return product && isPurchasable(product)
            ? { item, product }
            : null;
        })
        .filter(
          (
            row
          ): row is {
            item: CartItem;
            product: OfficialMerchandiseProduct;
          } => row !== null
        ),
    [cart, products]
  );

  const cartCount = useMemo(
    () => cartRows.reduce((total, row) => total + row.item.quantity, 0),
    [cartRows]
  );

  const subtotal = useMemo(
    () =>
      cartRows.reduce(
        (total, row) =>
          total + row.product.price * row.item.quantity,
        0
      ),
    [cartRows]
  );

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const hasOpenModal =
      Boolean(selectedProduct) ||
      cartOpen ||
      checkoutOpen ||
      Boolean(successOrder);

    if (!hasOpenModal) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    selectedProduct,
    cartOpen,
    checkoutOpen,
    successOrder
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (successOrder) {
        setSuccessOrder(null);
        return;
      }

      if (checkoutOpen) {
        setCheckoutOpen(false);
        return;
      }

      if (cartOpen) {
        setCartOpen(false);
        return;
      }

      if (selectedProduct) {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedProduct,
    cartOpen,
    checkoutOpen,
    successOrder
  ]);

  const openProduct = (product: OfficialMerchandiseProduct) => {
    setNotice('');
    setSelectedProduct(product);
    setSelectedQuantity(1);
    setSelectedSize(product.sizes?.[0]);
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    if (!isPurchasable(selectedProduct)) {
      setNotice('Produk ini belum tersedia untuk pembelian.');
      return;
    }

    if (selectedProduct.sizes?.length && !selectedSize) {
      setNotice('Silakan pilih ukuran terlebih dahulu.');
      return;
    }

    setCart(current => {
      const existing = current.find(
        item =>
          item.productId === selectedProduct.id &&
          item.size === selectedSize
      );

      if (existing) {
        return current.map(item =>
          item === existing
            ? {
                ...item,
                quantity: item.quantity + selectedQuantity
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: selectedProduct.id,
          size: selectedSize,
          quantity: selectedQuantity
        }
      ];
    });

    setSelectedProduct(null);
    setCartOpen(false);
    setNotice(
      `${selectedProduct.shortName || selectedProduct.name} berhasil ditambahkan ke keranjang.`
    );
  };

  const updateQuantity = (
    productId: string,
    size: string | undefined,
    delta: number
  ) => {
    setCart(current =>
      current
        .map(item => {
          if (
            item.productId !== productId ||
            item.size !== size
          ) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(0, item.quantity + delta)
          };
        })
        .filter(item => item.quantity > 0)
    );
  };

  const removeCartItem = (
    productId: string,
    size: string | undefined
  ) => {
    setCart(current =>
      current.filter(
        item =>
          !(
            item.productId === productId &&
            item.size === size
          )
      )
    );
  };

  const startCheckout = () => {
    if (!cartRows.length) {
      setNotice('Keranjang masih kosong.');
      return;
    }

    setCheckoutError('');
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const updateForm = (
    field: keyof CheckoutForm,
    value: string
  ) => {
    setForm(current => ({
      ...current,
      [field]: value
    }));

    if (checkoutError) {
      setCheckoutError('');
    }
  };

  const submitOrder = async () => {
    if (submittingOrder) return;

    const requiredFields: Array<[keyof CheckoutForm, string]> = [
      ['receiverName', 'Nama penerima'],
      ['whatsapp', 'Nomor WhatsApp'],
      ['address', 'Alamat lengkap'],
      ['province', 'Provinsi'],
      ['regency', 'Kabupaten/Kota'],
      ['district', 'Kecamatan']
    ];

    const missing = requiredFields.find(([field]) => !form[field].trim());

    if (missing) {
      setCheckoutError(`${missing[1]} wajib diisi.`);
      return;
    }

    const normalizedPhone = form.whatsapp.replace(/[^0-9]/g, '');

    if (normalizedPhone.length < 8) {
      setCheckoutError(
        'Nomor WhatsApp belum valid. Masukkan nomor yang dapat dihubungi.'
      );
      return;
    }

    if (!cartRows.length) {
      setCheckoutError('Keranjang tidak memiliki produk yang dapat dibeli.');
      return;
    }

    setSubmittingOrder(true);
    setCheckoutError('');

    try {
      const token = window.localStorage.getItem('saka_auth_token');
      const response = await fetch('/api/mutate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'ORDER',
          action: 'CREATE',
          payload: {
            items: cartRows.map(row => ({
              productId: row.product.id,
              size: row.item.size,
              quantity: row.item.quantity
            })),
            checkout: {
              receiverName: form.receiverName.trim(),
              whatsapp: normalizedPhone,
              address: form.address.trim(),
              province: form.province.trim(),
              regency: form.regency.trim(),
              district: form.district.trim(),
              note: form.note.trim()
            }
          }
        })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success || !result?.order) {
        throw new Error(
          result?.message ||
            `Pesanan belum tersimpan. Server mengembalikan HTTP ${response.status}.`
        );
      }

      const order: DemoOrder = result.order;

      setCart([]);
      setCheckoutOpen(false);
      setSuccessOrder(order);
    } catch (error: any) {
      setCheckoutError(
        error?.message ||
          'Pesanan belum dapat disimpan. Silakan coba lagi.'
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <section className="relative overflow-hidden bg-[#17112f]">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black text-white transition hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </button>

            <button
              type="button"
              onClick={event => {
                // Keep the cart action isolated from any parent navigation/click handler.
                event.preventDefault();
                event.stopPropagation();

                setNotice('');
                setSelectedProduct(null);
                setCheckoutOpen(false);
                setSuccessOrder(null);
                setCartOpen(true);
              }}
              className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-black text-white transition hover:bg-white/15"
            >
              <ShoppingBag className="h-4 w-4" />
              Keranjang

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[8px] font-black text-emerald-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="spwn-hero-panel flex min-h-[450px] items-center py-10 sm:py-14">
            <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-purple-200">
                  <Crown className="h-3.5 w-3.5" />
                  Official Merchandise
                </div>

                <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Identitas perjalanan.
                  <span className="block text-emerald-300">
                    Semangat Saka Pariwisata.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
                  Koleksi resmi Saka Pariwisata Nasional untuk
                  kegiatan, perjalanan, eksplorasi destinasi,
                  dan aktivitas organisasi.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {[
                    'Official',
                    'Jelajah Nusantara',
                    'Smart Outdoor',
                    'Identitas Saka'
                  ].map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[.1em] text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-400/20 via-purple-500/10 to-fuchsia-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
                  {featured ? (
                    <>
                      <ProductVisual product={featured} />

                      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[8px] font-black uppercase tracking-[.14em] text-emerald-300">
                              Koleksi Pilihan
                            </div>

                            <div className="mt-1 text-sm font-black text-white">
                              {featured.shortName ||
                                featured.name}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openProduct(featured)
                            }
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#34206b] transition hover:bg-emerald-100"
                            aria-label="Lihat produk"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-72 items-center justify-center text-white/50">
                      Belum ada produk.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="flex-1">{notice}</span>

            <button
              type="button"
              onClick={() => setNotice('')}
              className="text-emerald-500"
              aria-label="Tutup pemberitahuan"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-[#7b2cbf]">
              <Sparkles className="h-3.5 w-3.5" />
              Official Collection
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Koleksi Official Store
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
              Pilih produk yang tersedia atau lihat jadwal
              peluncuran koleksi berikutnya.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
            <Bell className="h-3.5 w-3.5" />
            Koleksi baru akan diumumkan bertahap.
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[
            ['ALL', 'Semua'],
            ['APPAREL', 'Apparel'],
            ['ACCESSORIES', 'Aksesori'],
            ['IDENTITY', 'Identitas'],
            ['OUTDOOR', 'Outdoor']
          ].map(([value, label]) => {
            const active = category === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setCategory(
                    value as
                      | 'ALL'
                      | OfficialMerchandiseProduct['category']
                  )
                }
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[.1em] transition ${
                  active
                    ? 'bg-[#34206b] text-white shadow-lg shadow-purple-900/10'
                    : 'border border-slate-200 bg-white text-slate-500 hover:border-purple-200 hover:text-[#34206b]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {featured && (
          <section className="mt-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[.95fr_1.05fr]">
              <ProductVisual product={featured} />

              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-[#7b2cbf]">
                    {categoryLabels[featured.category]}
                  </span>

                  {isPurchasable(featured) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-amber-700">
                      <Clock3 className="h-3 w-3" />
                      Coming Soon
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {featured.name}
                </h2>

                <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                  {featured.description}
                </p>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-[.1em] text-slate-400">
                      Harga
                    </div>

                    <div className="mt-1 text-xl font-black text-[#34206b]">
                      {formatPrice(featured.price)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openProduct(featured)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#34206b] px-4 py-3 text-[9px] font-black text-white transition hover:bg-[#45288b]"
                  >
                    Detail Produk
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={openProduct}
              />
            ))}
          </div>

          {!filtered.length && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-300" />

              <div className="mt-3 text-sm font-black text-slate-600">
                Belum ada produk pada kategori ini.
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-[2rem] border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-emerald-50 p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.14em] text-[#7b2cbf]">
                <Clock3 className="h-3.5 w-3.5" />
                Coming Soon
              </div>

              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                Koleksi berikutnya sedang dipersiapkan.
              </h3>

              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
                Beberapa produk akan dibuka secara bertahap.
                Pantau Official Store untuk melihat tanggal
                peluncuran masing-masing koleksi.
              </p>
            </div>

            {products.find(
              product =>
                product.comingSoon &&
                product.launchAt
            ) && (
              <div className="rounded-2xl bg-[#17112f] p-4">
                <div className="mb-2 text-center text-[8px] font-black uppercase tracking-[.14em] text-white/50">
                  Peluncuran terdekat
                </div>

                <Countdown
                  launchAt={
                    products.find(
                      product =>
                        product.comingSoon &&
                        product.launchAt
                    )?.launchAt
                  }
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedProduct && (
        <ModalShell
          title="Detail Produk"
          onClose={() => setSelectedProduct(null)}
          wide
        >
          <div className="grid lg:grid-cols-2">
            <ProductVisual product={selectedProduct} />

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-slate-500">
                  {categoryLabels[selectedProduct.category]}
                </span>

                {isPurchasable(selectedProduct) ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-emerald-700">
                    Tersedia
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[.1em] text-amber-700">
                    Coming Soon
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-xl font-black leading-tight text-slate-900 sm:text-2xl">
                {selectedProduct.name}
              </h2>

              <div className="mt-2 text-lg font-black text-[#34206b]">
                {formatPrice(selectedProduct.price)}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                {selectedProduct.description}
              </p>

              {selectedProduct.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selectedProduct.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-bold text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedProduct.sizes?.length ? (
                <div className="mt-6">
                  <div className="mb-2 text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Pilih ukuran
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setSelectedSize(size)
                        }
                        className={`min-w-12 rounded-xl border px-3 py-2 text-[9px] font-black transition ${
                          selectedSize === size
                            ? 'border-[#34206b] bg-[#34206b] text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isPurchasable(selectedProduct) ? (
                <>
                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[.1em] text-slate-400">
                        Jumlah
                      </div>

                      <div className="mt-1 text-[10px] text-slate-500">
                        Tambahkan ke keranjang
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity(
                            current =>
                              Math.max(1, current - 1)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="min-w-6 text-center text-sm font-black text-slate-800">
                        {selectedQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedQuantity(
                            current =>
                              Math.min(99, current + 1)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addToCart}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#34206b] px-4 py-3.5 text-[10px] font-black text-white transition hover:bg-[#45288b]"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Tambahkan ke Keranjang
                  </button>
                </>
              ) : (
                <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <div>
                      <div className="text-[10px] font-black text-amber-800">
                        Produk belum tersedia untuk pembelian.
                      </div>

                      <div className="mt-1 text-[9px] leading-relaxed text-amber-700/80">
                        Ikuti Official Store untuk melihat
                        pembukaan produk ini.
                      </div>

                      {selectedProduct.launchAt && (
                        <div className="mt-3">
                          <Countdown
                            launchAt={
                              selectedProduct.launchAt
                            }
                            large
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalShell>
      )}

      {cartOpen && (
        <ModalShell
          title={`Keranjang ${
            cartCount > 0 ? `(${cartCount})` : ''
          }`}
          onClose={() => setCartOpen(false)}
        >
          <div className="p-5 sm:p-6">
            {!cartRows.length ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-[#7b2cbf]">
                  <ShoppingBag className="h-6 w-6" />
                </div>

                <div className="mt-4 text-sm font-black text-slate-700">
                  Keranjang masih kosong
                </div>

                <p className="mx-auto mt-2 max-w-xs text-[10px] leading-relaxed text-slate-400">
                  Pilih produk yang tersedia untuk
                  melanjutkan ke checkout.
                </p>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="mt-5 rounded-xl bg-[#34206b] px-4 py-2.5 text-[10px] font-black text-white"
                >
                  Lihat Produk
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartRows.map(row => (
                    <div
                      key={`${row.item.productId}-${
                        row.item.size || 'default'
                      }`}
                      className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <ProductVisual
                          product={row.product}
                          compact
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black leading-snug text-slate-700">
                          {row.product.name}
                        </div>

                        <div className="mt-1 text-[9px] text-slate-400">
                          {row.item.size
                            ? `Ukuran ${row.item.size}`
                            : 'Ukuran standar'}
                        </div>

                        <div className="mt-1 text-[10px] font-black text-[#34206b]">
                          {formatPrice(
                            row.product.price
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 rounded-lg bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  row.item.productId,
                                  row.item.size,
                                  -1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span className="min-w-6 text-center text-[9px] font-black">
                              {row.item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  row.item.productId,
                                  row.item.size,
                                  1
                                )
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeCartItem(
                                row.item.productId,
                                row.item.size
                              )
                            }
                            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[8px] font-black text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Subtotal
                    </span>

                    <span className="text-lg font-black text-slate-800">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="mt-2 text-[9px] leading-relaxed text-slate-400">
                    Belum termasuk ongkos kirim. Ongkir akan
                    dikonfirmasi pada tahap pemrosesan pesanan.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startCheckout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#34206b] px-4 py-3.5 text-[10px] font-black text-white transition hover:bg-[#45288b]"
                >
                  Lanjut ke Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </ModalShell>
      )}

      {checkoutOpen && (
        <ModalShell
          title="Checkout Official Store"
          onClose={() => setCheckoutOpen(false)}
          wide
        >
          <div className="grid lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.12em] text-[#7b2cbf]">
                <User className="h-3.5 w-3.5" />
                Data penerima
              </div>

              <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                Isi data pengiriman dengan benar. Pesanan akan
                disimpan ke backend Official Store. Pembayaran
                belum terhubung pada tahap ini.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Nama penerima{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    value={form.receiverName}
                    onChange={event =>
                      updateForm(
                        'receiverName',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nama lengkap"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    <Phone className="h-3 w-3" />
                    WhatsApp{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    value={form.whatsapp}
                    onChange={event =>
                      updateForm(
                        'whatsapp',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    Alamat lengkap{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <textarea
                    value={form.address}
                    onChange={event =>
                      updateForm(
                        'address',
                        event.target.value
                      )
                    }
                    className="min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Provinsi{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    value={form.province}
                    onChange={event =>
                      updateForm(
                        'province',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Provinsi"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Kabupaten/Kota{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    value={form.regency}
                    onChange={event =>
                      updateForm(
                        'regency',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Kabupaten/Kota"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Kecamatan{' '}
                    <span className="text-red-500">
                      *
                    </span>
                  </span>

                  <input
                    value={form.district}
                    onChange={event =>
                      updateForm(
                        'district',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Kecamatan"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[.1em] text-slate-500">
                    Catatan
                  </span>

                  <input
                    value={form.note}
                    onChange={event =>
                      updateForm(
                        'note',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    placeholder="Opsional"
                  />
                </label>
              </div>

              {checkoutError && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-[10px] font-bold leading-relaxed text-red-700">
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                onClick={submitOrder}
                disabled={submittingOrder}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#34206b] px-4 py-3 text-[10px] font-black text-white transition hover:bg-[#45288b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="h-4 w-4" />
                {submittingOrder ? 'Menyimpan Pesanan...' : 'Buat Pesanan'}
              </button>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">
                <Package className="h-3.5 w-3.5" />
                Ringkasan pesanan
              </div>

              <div className="mt-4 space-y-3">
                {cartRows.map(row => (
                  <div
                    key={`${row.item.productId}-${
                      row.item.size || 'default'
                    }`}
                    className="flex gap-3"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <ProductVisual
                        product={row.product}
                        compact
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black leading-snug text-slate-700">
                        {row.product.name}
                      </div>

                      <div className="mt-0.5 text-[9px] text-slate-400">
                        {row.item.quantity} ×{' '}
                        {formatPrice(
                          row.product.price
                        )}
                        {row.item.size
                          ? ` · ${row.item.size}`
                          : ''}
                      </div>
                    </div>

                    <div className="text-[10px] font-black text-slate-700">
                      {formatPrice(
                        row.product.price *
                          row.item.quantity
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Subtotal
                  </span>

                  <span className="text-sm font-black text-slate-800">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="mt-2 flex items-start gap-2 rounded-xl bg-white p-3 text-[9px] leading-relaxed text-slate-500">
                  <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7b2cbf]" />
                  Ongkir belum dihitung pada tahap ini dan akan
                  dikonfirmasi setelah pesanan diterima.
                </div>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {successOrder && (
        <ModalShell
          title="Pesanan berhasil dibuat"
          onClose={() => setSuccessOrder(null)}
        >
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="mt-5 text-[9px] font-black uppercase tracking-[.16em] text-emerald-600">
              Nomor pesanan
            </div>

            <div className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {successOrder.orderNumber}
            </div>

            <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
              Pesanan telah tersimpan di backend Official Store
              dengan status awal <strong>Menunggu Pembayaran</strong>.
              Pembayaran belum terhubung pada tahap ini.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  Penerima
                </span>

                <span className="font-black text-slate-700">
                  {successOrder.checkout.receiverName}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  WhatsApp
                </span>

                <span className="font-black text-slate-700">
                  {successOrder.checkout.whatsapp}
                </span>
              </div>

              <div className="mt-2 flex items-start justify-between gap-4 text-[10px]">
                <span className="text-slate-400">
                  Subtotal
                </span>

                <span className="font-black text-slate-700">
                  {formatPrice(
                    successOrder.subtotal
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessOrder(null)
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#34206b] px-5 py-2.5 text-[10px] font-black text-white transition hover:bg-[#45288b]"
            >
              Kembali ke Official Store
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};
