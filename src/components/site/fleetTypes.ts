/**
 * FLEET TYPES — the 6 crane classes shown in EquipmentGuide.tsx ("About the
 * Fleet") and on /load-chart/page.tsx.
 *
 * Split out of EquipmentGuide.tsx (2026-09-29) so a plain Server Component
 * (the /load-chart page) can import this data too — EquipmentGuide.tsx
 * itself is `"use client"`, and a Server Component importing a named,
 * non-component export from a Client Component module doesn't get the real
 * value at runtime (it resolves to a client reference instead, which broke
 * with `FLEET_TYPES.map is not a function`). A plain, client-free data
 * module is the fix; both files import from here now instead of one
 * defining it and the other reaching into that file.
 */

import type { IconName } from "./primitives";
import { FLEET_PHOTOS, PHOTOS, IMG, GRADIENTS } from "./photos";

export type FleetType = {
  name: string;
  icon: IconName;
  photo: string;
  /** True only for FLEET_PHOTOS's real, locally-hosted set — drives the
   *  "Stock photo" corner tag, so a genuine TNT photo and a stand-in
   *  Unsplash one are never presented as if they were the same kind of
   *  claim. */
  isRealFleetPhoto: boolean;
  gradient: string;
};

export const FLEET_TYPES: FleetType[] = [
  { name: "All-Terrain Cranes", icon: "allterrain", photo: FLEET_PHOTOS.allTerrainCrane, isRealFleetPhoto: true, gradient: GRADIENTS.navy },
  { name: "Crawler Cranes", icon: "crawler", photo: FLEET_PHOTOS.crawlerCrane, isRealFleetPhoto: true, gradient: GRADIENTS.slate },
  { name: "Hydraulic Truck Cranes", icon: "boom", photo: FLEET_PHOTOS.hydraulicTruckCrane, isRealFleetPhoto: true, gradient: GRADIENTS.maroon },
  { name: "Rough-Terrain Cranes", icon: "transport", photo: IMG(PHOTOS.roughTerrainCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.navy },
  { name: "Carry Deck Cranes", icon: "carrydeck", photo: IMG(PHOTOS.carryDeckCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.slate },
  { name: "Tower Cranes", icon: "tower", photo: IMG(PHOTOS.towerCrane, 800), isRealFleetPhoto: false, gradient: GRADIENTS.maroon },
];
