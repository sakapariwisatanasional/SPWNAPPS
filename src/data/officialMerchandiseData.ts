import type { OfficialMerchandiseProduct } from "../types";

/**
 * Extended merchandise catalog.
 * Additional UI fields are optional and backward compatible.
 */
export const OFFICIAL_MERCHANDISE_PRODUCTS: OfficialMerchandiseProduct[] = [
  {
    id: "spw-merch-polo-nasional",
    name: "Polo Official Saka Pariwisata Nasional",
    shortName: "Polo Official",
    category: "APPAREL",
    description:
      "Polo berkarakter smart-outdoor dengan identitas Saka Pariwisata Nasional untuk kegiatan resmi maupun lapangan.",
    price: 189000,
    accentClass: "from-emerald-950 via-emerald-700 to-teal-400",
    iconName: "shirt",
    image: "/images/merchandise/polo-official.png",
    gallery: [
      "/images/merchandise/polo-official.png"
    ],
    material: "Cotton Premium Smart Outdoor",
    stockStatus: "READY_STOCK",
    sizes: ["S", "M", "L", "XL", "2XL"],
    tags: ["Official", "Nasional", "Apparel"],
    comingSoon: false,
    purchaseEnabled: true,
    featured: true,
    active: true
  },
  {
    id: "spw-merch-jaket-jelajah",
    name: "Jaket Jelajah Nusantara",
    shortName: "Jaket Jelajah",
    category: "OUTDOOR",
    description:
      "Jaket ringan untuk eksplorasi destinasi, kegiatan Krida, perjalanan, dan agenda Saka Pariwisata.",
    price: 329000,
    accentClass: "from-violet-950 via-purple-800 to-fuchsia-500",
    iconName: "jacket",
    image: "/images/merchandise/jaket-jelajah.png",
    gallery: [
      "/images/merchandise/jaket-jelajah.png"
    ],
    material: "Lightweight Outdoor Fabric",
    stockStatus: "READY_STOCK",
    sizes: ["M", "L", "XL", "2XL"],
    tags: ["Outdoor", "Jelajah", "Limited"],
    comingSoon: false,
    purchaseEnabled: true,
    featured: true,
    active: true
  }
];
