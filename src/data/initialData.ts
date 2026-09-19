// initialData.ts FINAL COMPATIBLE
// Mempertahankan export yang dibutuhkan storage.ts

export const DEFAULT_PUBLIC_USER: any = {
  id: "PUBLIC",
  name: "Guest User",
  role: "PUBLIC"
};

export const DEMO_USERS: any[] = [
  {
    id: "admin-demo",
    name: "Super Admin Kwartir Nasional",
    role: "SUPER_ADMIN"
  }
];

export const INITIAL_MEMBERS: any[] = [
  {
    id: "SPWN-000001",
    name: "Super Admin Kwartir Nasional",
    role: "ADMIN_NATIONAL"
  }
];

export const INITIAL_TOUR_PACKAGES: any[] = [
  {
    id: "tour-borobudur",
    name: "Wisata Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=900&q=80",
    description: "Destinasi wisata budaya dan sejarah Indonesia."
  },
  {
    id: "tour-bromo",
    name: "Gunung Bromo",
    location: "Jawa Timur",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80",
    description: "Pesona alam pegunungan dan sunrise Nusantara."
  }
];

export const INITIAL_ACTIVITIES: any[] = [
  {
    id: "activity-jelajah",
    title: "Jelajah Wisata Nusantara",
    description: "Eksplorasi dan promosi destinasi wisata."
  },
  {
    id: "activity-pelatihan",
    title: "Pelatihan Pemandu Wisata",
    description: "Peningkatan kompetensi anggota Saka Pariwisata."
  }
];

export const INITIAL_CULINARY_SOUVENIRS: any[] = [
  {
    id: "kuliner-rendang",
    name: "Rendang Nusantara",
    region: "Sumatera Barat",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    description: "Kuliner khas Indonesia."
  },
  {
    id: "kriya-batik",
    name: "Batik Nusantara",
    region: "Jawa",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80",
    description: "Produk kriya budaya Indonesia."
  }
];

export const INITIAL_AUDIT_LOGS: any[] = [];

export const MASTER_SKILLS: any[] = [];
