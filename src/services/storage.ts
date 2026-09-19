/**
 * storage_DATA_HYDRATION_FINAL.ts
 *
 * Tujuan:
 * Menambahkan fallback data awal ketika localStorage/database lokal masih kosong.
 *
 * Cara penggunaan:
 * Integrasikan fungsi hydrateStorageDefaults() di dalam refresh/load awal storage.ts.
 *
 * File ini sengaja dibuat sebagai modul tambahan agar storage.ts asli tidak rusak.
 */

import {
  INITIAL_TOUR_PACKAGES,
  INITIAL_ACTIVITIES,
  INITIAL_CULINARY_SOUVENIRS
} from "../data/initialData";

const KEYS = {
  TOURS: "spwn_tours",
  ACTIVITIES: "spwn_activities",
  CULINARY: "spwn_culinary_souvenirs"
};

export function hydrateStorageDefaults() {
  const tours = localStorage.getItem(KEYS.TOURS);
  const activities = localStorage.getItem(KEYS.ACTIVITIES);
  const culinary = localStorage.getItem(KEYS.CULINARY);

  if (!tours || JSON.parse(tours).length === 0) {
    localStorage.setItem(
      KEYS.TOURS,
      JSON.stringify(INITIAL_TOUR_PACKAGES)
    );
  }

  if (!activities || JSON.parse(activities).length === 0) {
    localStorage.setItem(
      KEYS.ACTIVITIES,
      JSON.stringify(INITIAL_ACTIVITIES)
    );
  }

  if (!culinary || JSON.parse(culinary).length === 0) {
    localStorage.setItem(
      KEYS.CULINARY,
      JSON.stringify(INITIAL_CULINARY_SOUVENIRS)
    );
  }
}

export default hydrateStorageDefaults;
