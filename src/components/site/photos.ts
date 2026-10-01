/**
 * Verified dummy photography (Unsplash, free stock).
 * Every ID below was checked to return HTTP 200 / image/jpeg before use.
 * Swap for owned project photography (or next/image) before production.
 */

export const IMG = (id: string, w = 1100) =>
  `https://images.unsplash.com/${id}?fm=jpg&q=70&w=${w}&auto=format&fit=crop`;

export const PHOTOS = {
  craneSlab: "photo-1751054554594-85de2fe63e6b",
  craneGroup: "photo-1692101736757-579f547ec36a",
  siteCrane1: "photo-1684497404598-6e844dff9cde",
  siteCrane2: "photo-1609867271967-a82f85c48531",
  crewObserve: "photo-1751054720514-067105f538d4",
  workerFrame: "photo-1587582423116-ec07293f0395",
  refineryNight: "photo-1726111262949-e22631a8c376",
  plantNight: "photo-1670689334799-cdc6777db8cc",
  windTurbine: "photo-1662307412846-de8b3001b749",
  // RIGGING & ATTACHMENTS — see RIGGING_PHOTOS below for the real,
  // locally-hosted set added 2026-08-26 (later same day). This Unsplash-only
  // set was the FIRST pass and undersold what's actually available: Unsplash
  // genuinely has poor rigging-hardware coverage, but that conclusion never
  // should have generalized to "only 3 categories possible" — tntcrane.com
  // and rmscranes.com's own service pages, not checked at the time, turned
  // out to have plenty. overheadBridgeCraneReal is the one category still
  // without a found real substitute, so it's the only survivor still in use.
  hookBlockReal: "photo-1718738002405-b149aac720bf",
  gantryCraneReal: "photo-1781156215091-4133052708d0",
  overheadBridgeCraneReal: "photo-1784916313628-d6525ab2199f",
  // ABOUT THE FLEET — Unsplash fallback for the 3 crane types FLEET_PHOTOS
  // has no real TNT photo for (2026-09-13). Checked each returns HTTP 200 /
  // image/jpeg, and viewed each before picking it:
  //   - roughTerrainCrane: a SANY mobile crane's boom/hook/cab close-up —
  //     genuinely a rough-terrain-class crane, not a generic stand-in.
  //   - carryDeckCrane: the closest available match, NOT a precise one —
  //     Unsplash has no real carry-deck-crane coverage (the class is a
  //     low-profile 4-wheel yard crane with no truck cab). This is a
  //     truck-mounted boom crane at a residential job site instead; picked
  //     for being a small, compact mobile crane rather than claiming to be
  //     an exact match.
  //   - towerCrane: a straightforward tower-crane boom against open sky.
  roughTerrainCrane: "photo-1597089038854-6be9a836a40d",
  carryDeckCrane: "photo-1583246820648-e06ee5e2c267",
  towerCrane: "photo-1539269071019-8bc6d57b0205",
  // ALL-TERRAIN CARD PHOTOS (2026-09-29, on request — "Add different image
  // on all the cards ... Don't show the same images"): the
  // /load-chart/all-terrain-cranes card grid has 46 cards but only one real
  // TNT all-terrain photo (FLEET_PHOTOS.allTerrainCrane) — no rights-cleared
  // photo exists per individual manufacturer model (see CraneCardGrid.tsx's
  // own docblock). These 5 are genuine photos of real all-terrain/mobile
  // telescopic cranes (checked by eye, not just by search term — Unsplash's
  // "mobile crane"/"telescopic crane truck" results are heavily diluted with
  // die-cast toy-crane photography and unrelated tower/crawler cranes, both
  // skipped here), verified HTTP 200 / image/jpeg. Rotated across the grid
  // alongside the one real photo so no two adjacent cards repeat the same
  // image — see CraneCardGrid.tsx for the rotation and the "Stock photo" tag
  // this set carries there.
  allTerrainStock1: "photo-1781356857510-0be2172fecc1",
  allTerrainStock2: "photo-1771679910145-3a368d7f537c",
  allTerrainStock3: "photo-1586458995526-09ce6839babe",
  allTerrainStock4: "photo-1724556507333-670bf6033737",
  allTerrainStock5: "photo-1748974467633-2e21ffd9dd94",
} as const;

/**
 * RIGGING & ATTACHMENTS — real TNT/RMS photography (2026-08-26, correcting
 * the Unsplash-only pass above). Sourced from tntcrane.com and rmscranes.com
 * (RMS Cranes is "A TNT Company") service pages, downloaded and inspected
 * before use:
 *   - hydraulicGantry: TNT-branded hydraulic gantry setting a heavy
 *     concrete/vessel-sized load (tntcrane.com, Gantry_Banner — a wider crop
 *     of the same job CASE_PHOTOS.petrochemicalVesselPlacement uses)
 *   - cantileverSpreaderBar: a TNT-branded cantilever bar rigged off a
 *     crawler crane's hook, lifting flush against a high-rise facade
 *     (tntcrane.com, Rigging_Cantilever_Old_1) — stands in for
 *     below-the-hook lifting devices generally, since a cantilever bar is
 *     one, rather than keeping a separate, less specific Unsplash card for
 *     the same equipment family
 *   - spmtModularTransport: a Goldhofer SPMT hauling a large transformer
 *     (tntcrane.com, Rigging_Goldhofer_SPMT_Transformer_2025_1)
 *   - jackAndSlide: a jack-and-slide operation leveling equipment on skid
 *     rails, RMS-stenciled timber cribbing visible (tntcrane.com,
 *     Rigging_Jacking_Sliding_2025_1)
 *   - versaLiftMachineryMoving: a TNT-branded Versa-Lift moving a
 *     Siemens transformer (tntcrane.com, TNT-Machinery-Moving_Versa-Lift-
 *     25-35_Siemens_2560x1440)
 *
 * NOT included: a photo filed under "…Personnel…" (Rigging_Buda_Manitou_
 * Personnel) turned out to show a Manitou forklift loading HVAC units, not
 * a man-basket/personnel platform — the filename was misleading. Using it
 * under a "Personnel Lift" label would have mislabeled real footage, which
 * is worse than the label not existing, so it was left out rather than
 * force-fit.
 */
export const RIGGING_PHOTOS = {
  hydraulicGantry: "/photos/rigging/hydraulic-gantry.jpg",
  cantileverSpreaderBar: "/photos/rigging/cantilever-spreader-bar.jpg",
  spmtModularTransport: "/photos/rigging/spmt-modular-transport.jpg",
  jackAndSlide: "/photos/rigging/jack-and-slide.jpg",
  versaLiftMachineryMoving: "/photos/rigging/versa-lift-machinery-moving.jpg",
} as const;

/**
 * ABOUT THE FLEET — real TNT photography (2026-09-13), for the 6-item
 * crane-type gallery in EquipmentGuide.tsx. Sourced directly from
 * tntcrane.com's own homepage/uploads, downloaded and inspected before use,
 * same rigor as RIGGING_PHOTOS above:
 *   - allTerrainCrane: a red TNT-branded all-terrain crane picking in
 *     downtown Houston traffic (tntcrane.com, AT-Crane_TNT-Crane-2)
 *   - crawlerCrane: a TNT crawler crane setting bridge girders over a creek
 *     (tntcrane.com, TNT_Crawler_Union-Pacific)
 *   - hydraulicTruckCrane: a line of TNT hydraulic truck cranes lifting a
 *     large pipeline section into place (tntcrane.com,
 *     Water-Pipeline-Project-Hydraulic-Truck-Cranes_1)
 *
 * NOT included: Rough-Terrain, Carry Deck, and Tower Cranes have no found
 * real TNT photo yet — their service subpages didn't surface one on
 * inspection. They use Unsplash fallback instead (PHOTOS.roughTerrainCrane /
 * carryDeckCrane / towerCrane above), same as this project's other catalogs
 * do for categories without real photography — not left bare.
 *
 * A set of same-named PNGs already existed on disk in public/photos/fleet/
 * (all-terrain-cranes.png, crawler-cranes.png, boom-trucks.png,
 * carry-deck-industrial.png, rough-terrain-cranes.png, tower-cranes.png,
 * heavy-lift-gantry.png) from an earlier pass — opened and inspected,
 * they're synthetic/AI-generated (uniform 1254×1254 output size, an
 * impossible wet-mirror-floor-at-sunset composition repeated across every
 * one, and a "TNT" logo rendered onto the equipment rather than
 * photographed). Left on disk but NOT referenced by name here — using them
 * would be exactly the kind of fabricated-as-real photo this project's
 * sourcing rule exists to prevent. Flagged for the user; consider deleting
 * them separately since a same-named file sitting unused is an easy trap for
 * a future edit to reach for by mistake.
 */
export const FLEET_PHOTOS = {
  allTerrainCrane: "/photos/fleet/all-terrain-crane.jpg",
  crawlerCrane: "/photos/fleet/crawler-crane.jpg",
  hydraulicTruckCrane: "/photos/fleet/hydraulic-truck-crane.jpg",
} as const;

/**
 * CASE STUDIES — real TNT photography, one per job (2026-08-26, replacing
 * the earlier three generic stock renders + one Unsplash placeholder — none
 * of the four previously showed actual TNT equipment on a real job site).
 * All four sourced from tntcrane.com's own uploads (one, the wind farm
 * erection, from rmscranes.com — RMS Cranes is "A TNT Company"), downloaded
 * and inspected before use, same rigor as the Fleet Guide photos:
 *   - refineryReactorExchange: a Liebherr LR1500 crawler crane rigged at a
 *     refinery/gas-plant site (tntcrane.com, Heavy-Lift_Demethanizer-Lift-1)
 *   - windFarmTurbineErection: two crawler cranes stepping a wind-tower
 *     section into place, blades and nacelle staged nearby (rmscranes.com,
 *     RMS-Cranes-Wind-Tower-Construction)
 *   - bridgeGirderSet: a TNT-branded all-terrain crane setting a girder
 *     over water (tntcrane.com, 900-Ton_Bridge-Girders_2024) — this job
 *     previously had no real photo at all and ran on an Unsplash placeholder
 *   - petrochemicalVesselPlacement: a TNT-branded hydraulic gantry lifting a
 *     vessel-sized load (tntcrane.com, Gantry_Old_1)
 *
 * None is an exact tonnage/technique match for its story's copy (the copy
 * itself is still placeholder narrative per this file's other case-photo
 * notes) — each is a genuine TNT job in the right category (refinery/plant,
 * wind, bridge, gantry), not a fabricated or mismatched stand-in.
 *
 * Local paths, same arrangement as FLEET_PHOTOS: not Unsplash IDs, so these
 * bypass `IMG()` and are sized by `next/image` at the call site.
 */
export const CASE_PHOTOS = {
  refineryReactorExchange: "/photos/cases/tnt-142-refinery-reactor-exchange.jpg",
  windFarmTurbineErection: "/photos/cases/tnt-098-wind-farm-turbine-erection.jpg",
  bridgeGirderSet: "/photos/cases/tnt-211-bridge-girder-set.jpg",
  petrochemicalVesselPlacement:
    "/photos/cases/tnt-176-petrochemical-vessel-placement.jpg",
} as const;

/**
 * SERVICES — real TNT photography for individual service cards (2026-09-03,
 * replacing an Unsplash placeholder on the Full-Scope Capability section's
 * lead feature). Sourced from tntcrane.com's own uploads, downloaded and
 * inspected before use, same rigor as the Fleet Guide / Case Studies photos:
 *   - craneRentalAtCraneCoolerLift: a TNT-branded all-terrain crane mid-lift
 *     at a commercial site, "TNT Crane & Rigging" wordmark clearly visible
 *     on the counterweight and cab door (tntcrane.com, AT-Crane_Cooler-
 *     Lift-3) — general enough to represent the rental fleet broadly rather
 *     than one specific job type.
 *
 * Local path, same arrangement as RIGGING_PHOTOS/CASE_PHOTOS: bypasses
 * `IMG()`.
 */
export const SERVICE_PHOTOS = {
  craneRentalAtCraneCoolerLift: "/photos/services/crane-rental-at-crane-cooler-lift.jpg",
} as const;

// Tonal fallbacks shown behind each photo — a dead URL degrades to a gradient,
// never a broken-image icon.
// Rebuilt on BLACK 2026-07-28 — the brand palette has no navy, and these
// gradients were the last place the retired #071034 survived. Key names kept so
// the call sites (EquipmentGuide, StickyStack, NumberedBlock) don't churn;
// `navy` now means "black stack". Maroon also corrected to the official
// #781514 — it still carried the pre-brand-kit #6e1f1a.
export const GRADIENTS = {
  navy: "linear-gradient(135deg, #000000 0%, #242424 100%)",
  slate: "linear-gradient(135deg, #1a1a1a 0%, #000000 100%)",
  maroon: "linear-gradient(135deg, #781514 0%, #1a1a1a 60%, #000000 100%)",
} as const;
