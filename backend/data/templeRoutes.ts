/**
 * Temple Zones and Route Data for all 4 Gujarat Temples
 * Contains zone definitions, coordinates, and optimal routes
 */

export interface TempleZone {
  id: string;
  name: string;
  nameHindi: string;
  type: "entrance" | "queue" | "sanctum" | "exit" | "prasad" | "amenity" | "attraction";
  coordinates: { x: number; y: number }; // Relative coordinates for map display
  capacity: number; // Max people in zone
  avgTimeMinutes: number; // Average time spent in zone
  isAccessible: boolean; // Wheelchair accessible
  description: string;
}

export interface TempleRoute {
  id: string;
  name: string;
  type: "standard" | "vip" | "accessible" | "express";
  zones: string[]; // Ordered list of zone IDs
  estimatedMinutes: number;
  description: string;
  restrictions?: string[];
}

export interface TempleMapData {
  templeId: string;
  templeName: string;
  zones: TempleZone[];
  routes: TempleRoute[];
  tips: string[];
}

// ============ SOMNATH MAHADEV ============
const somnathZones: TempleZone[] = [
  {
    id: "somnath-main-entrance",
    name: "Main Gate",
    nameHindi: "मुख्य द्वार",
    type: "entrance",
    coordinates: { x: 50, y: 90 },
    capacity: 500,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Main security checkpoint and entry"
  },
  {
    id: "somnath-shoe-counter",
    name: "Shoe Deposit",
    nameHindi: "जूता काउंटर",
    type: "amenity",
    coordinates: { x: 45, y: 80 },
    capacity: 200,
    avgTimeMinutes: 3,
    isAccessible: true,
    description: "Free shoe storage with token system"
  },
  {
    id: "somnath-outer-queue",
    name: "Outer Queue",
    nameHindi: "बाहरी कतार",
    type: "queue",
    coordinates: { x: 50, y: 65 },
    capacity: 2000,
    avgTimeMinutes: 30,
    isAccessible: true,
    description: "Serpentine queue leading to inner temple"
  },
  {
    id: "somnath-inner-queue",
    name: "Inner Queue",
    nameHindi: "अंदरूनी कतार",
    type: "queue",
    coordinates: { x: 50, y: 45 },
    capacity: 500,
    avgTimeMinutes: 20,
    isAccessible: false,
    description: "Final queue before sanctum. Stairs involved."
  },
  {
    id: "somnath-sanctum",
    name: "Garbhagriha (Sanctum)",
    nameHindi: "गर्भगृह",
    type: "sanctum",
    coordinates: { x: 50, y: 25 },
    capacity: 50,
    avgTimeMinutes: 2,
    isAccessible: false,
    description: "Main Jyotirlinga darshan point"
  },
  {
    id: "somnath-exit",
    name: "Temple Exit",
    nameHindi: "निकास द्वार",
    type: "exit",
    coordinates: { x: 70, y: 30 },
    capacity: 300,
    avgTimeMinutes: 2,
    isAccessible: true,
    description: "Exit through side corridor"
  },
  {
    id: "somnath-prasad",
    name: "Prasad Counter",
    nameHindi: "प्रसाद काउंटर",
    type: "prasad",
    coordinates: { x: 75, y: 50 },
    capacity: 150,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Official temple prasad and offerings"
  },
  {
    id: "somnath-museum",
    name: "Somnath Museum",
    nameHindi: "सोमनाथ संग्रहालय",
    type: "attraction",
    coordinates: { x: 25, y: 70 },
    capacity: 200,
    avgTimeMinutes: 30,
    isAccessible: true,
    description: "History of temple reconstructions"
  },
  {
    id: "somnath-beach",
    name: "Somnath Beach View",
    nameHindi: "समुद्र तट",
    type: "attraction",
    coordinates: { x: 50, y: 10 },
    capacity: 500,
    avgTimeMinutes: 15,
    isAccessible: true,
    description: "Arabian Sea view behind temple"
  }
];

const somnathRoutes: TempleRoute[] = [
  {
    id: "somnath-standard",
    name: "Standard Darshan",
    type: "standard",
    zones: ["somnath-main-entrance", "somnath-shoe-counter", "somnath-outer-queue", "somnath-inner-queue", "somnath-sanctum", "somnath-exit", "somnath-prasad"],
    estimatedMinutes: 60,
    description: "Regular darshan route for all devotees"
  },
  {
    id: "somnath-vip",
    name: "VIP/Special Darshan",
    type: "vip",
    zones: ["somnath-main-entrance", "somnath-shoe-counter", "somnath-sanctum", "somnath-exit"],
    estimatedMinutes: 15,
    description: "Priority darshan with paid ticket",
    restrictions: ["Requires VIP ticket purchase"]
  },
  {
    id: "somnath-accessible",
    name: "Accessible Route",
    type: "accessible",
    zones: ["somnath-main-entrance", "somnath-shoe-counter", "somnath-outer-queue", "somnath-exit", "somnath-prasad"],
    estimatedMinutes: 40,
    description: "Route for elderly and wheelchair users. Darshan from outer mandap.",
    restrictions: ["Sanctum has steps - alternate view provided"]
  },
  {
    id: "somnath-full-tour",
    name: "Complete Temple Tour",
    type: "standard",
    zones: ["somnath-main-entrance", "somnath-museum", "somnath-shoe-counter", "somnath-outer-queue", "somnath-inner-queue", "somnath-sanctum", "somnath-exit", "somnath-prasad", "somnath-beach"],
    estimatedMinutes: 120,
    description: "Full experience including museum and beach view"
  }
];

// ============ DWARKADHISH TEMPLE ============
const dwarkaZones: TempleZone[] = [
  {
    id: "dwarka-swarga-dwar",
    name: "Swarga Dwar (Main Entry)",
    nameHindi: "स्वर्ग द्वार",
    type: "entrance",
    coordinates: { x: 50, y: 95 },
    capacity: 400,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "56 steps entry from Gomti Ghat"
  },
  {
    id: "dwarka-moksha-dwar",
    name: "Moksha Dwar (Alternate Entry)",
    nameHindi: "मोक्ष द्वार",
    type: "entrance",
    coordinates: { x: 80, y: 70 },
    capacity: 300,
    avgTimeMinutes: 3,
    isAccessible: true,
    description: "Side entry - fewer steps"
  },
  {
    id: "dwarka-shoe-counter",
    name: "Shoe Counter",
    nameHindi: "जूता काउंटर",
    type: "amenity",
    coordinates: { x: 40, y: 85 },
    capacity: 200,
    avgTimeMinutes: 3,
    isAccessible: true,
    description: "Multiple counters available"
  },
  {
    id: "dwarka-jagat-mandir",
    name: "Jagat Mandir Queue",
    nameHindi: "जगत मंदिर",
    type: "queue",
    coordinates: { x: 50, y: 60 },
    capacity: 1500,
    avgTimeMinutes: 35,
    isAccessible: true,
    description: "Main 5-story temple area queue"
  },
  {
    id: "dwarka-sanctum",
    name: "Garbhagriha",
    nameHindi: "गर्भगृह",
    type: "sanctum",
    coordinates: { x: 50, y: 35 },
    capacity: 40,
    avgTimeMinutes: 2,
    isAccessible: false,
    description: "Dwarkadhish (Krishna) main idol darshan"
  },
  {
    id: "dwarka-exit",
    name: "Exit",
    nameHindi: "निकास",
    type: "exit",
    coordinates: { x: 65, y: 45 },
    capacity: 250,
    avgTimeMinutes: 3,
    isAccessible: true,
    description: "Exit corridor"
  },
  {
    id: "dwarka-prasad",
    name: "Prasad Hall",
    nameHindi: "प्रसाद हॉल",
    type: "prasad",
    coordinates: { x: 70, y: 65 },
    capacity: 200,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Temple prasad including famous Makhan Mishri"
  },
  {
    id: "dwarka-gomti-ghat",
    name: "Gomti Ghat",
    nameHindi: "गोमती घाट",
    type: "attraction",
    coordinates: { x: 50, y: 100 },
    capacity: 300,
    avgTimeMinutes: 20,
    isAccessible: true,
    description: "Holy river ghat below temple steps"
  }
];

const dwarkaRoutes: TempleRoute[] = [
  {
    id: "dwarka-standard",
    name: "Standard Darshan",
    type: "standard",
    zones: ["dwarka-swarga-dwar", "dwarka-shoe-counter", "dwarka-jagat-mandir", "dwarka-sanctum", "dwarka-exit", "dwarka-prasad"],
    estimatedMinutes: 55,
    description: "Regular darshan via main 56 steps entry"
  },
  {
    id: "dwarka-accessible",
    name: "Accessible Route",
    type: "accessible",
    zones: ["dwarka-moksha-dwar", "dwarka-shoe-counter", "dwarka-jagat-mandir", "dwarka-exit", "dwarka-prasad"],
    estimatedMinutes: 45,
    description: "Fewer steps via Moksha Dwar. Ramp assistance available.",
    restrictions: ["Sanctum has narrow stairs - view from outer mandap"]
  },
  {
    id: "dwarka-morning-aarti",
    name: "Morning Aarti Experience",
    type: "standard",
    zones: ["dwarka-gomti-ghat", "dwarka-swarga-dwar", "dwarka-shoe-counter", "dwarka-jagat-mandir", "dwarka-sanctum", "dwarka-exit"],
    estimatedMinutes: 90,
    description: "Includes Gomti Ghat morning rituals at 6 AM"
  }
];

// ============ AMBAJI MATA TEMPLE ============
const ambajiZones: TempleZone[] = [
  {
    id: "ambaji-main-gate",
    name: "Main Entrance",
    nameHindi: "मुख्य द्वार",
    type: "entrance",
    coordinates: { x: 50, y: 90 },
    capacity: 600,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Main bazaar side entry"
  },
  {
    id: "ambaji-shoe-counter",
    name: "Shoe Deposit",
    nameHindi: "जूता काउंटर",
    type: "amenity",
    coordinates: { x: 35, y: 80 },
    capacity: 300,
    avgTimeMinutes: 4,
    isAccessible: true,
    description: "Free locker system"
  },
  {
    id: "ambaji-outer-pradakshina",
    name: "Outer Parikrama",
    nameHindi: "बाहरी परिक्रमा",
    type: "queue",
    coordinates: { x: 50, y: 65 },
    capacity: 3000,
    avgTimeMinutes: 40,
    isAccessible: true,
    description: "Circumambulation path around temple"
  },
  {
    id: "ambaji-inner-queue",
    name: "Inner Sanctum Queue",
    nameHindi: "आंतरिक कतार",
    type: "queue",
    coordinates: { x: 50, y: 45 },
    capacity: 800,
    avgTimeMinutes: 25,
    isAccessible: false,
    description: "Queue to Gabbar hill cave sanctum"
  },
  {
    id: "ambaji-sanctum",
    name: "Gabbar Hill Sanctum",
    nameHindi: "गब्बर गुफा",
    type: "sanctum",
    coordinates: { x: 50, y: 25 },
    capacity: 30,
    avgTimeMinutes: 2,
    isAccessible: false,
    description: "Sacred Vishwa Yantra - no idol, geometric pattern"
  },
  {
    id: "ambaji-exit",
    name: "Exit Path",
    nameHindi: "निकास मार्ग",
    type: "exit",
    coordinates: { x: 75, y: 35 },
    capacity: 400,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Exit via side stairs"
  },
  {
    id: "ambaji-prasad",
    name: "Prasad Counter",
    nameHindi: "प्रसाद काउंटर",
    type: "prasad",
    coordinates: { x: 80, y: 55 },
    capacity: 250,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Famous Sukhdi and coconut prasad"
  },
  {
    id: "ambaji-ropeway",
    name: "Gabbar Ropeway",
    nameHindi: "गब्बर रोपवे",
    type: "attraction",
    coordinates: { x: 20, y: 40 },
    capacity: 100,
    avgTimeMinutes: 25,
    isAccessible: true,
    description: "Cable car to Gabbar Hill temple"
  }
];

const ambajiRoutes: TempleRoute[] = [
  {
    id: "ambaji-standard",
    name: "Standard Darshan",
    type: "standard",
    zones: ["ambaji-main-gate", "ambaji-shoe-counter", "ambaji-outer-pradakshina", "ambaji-inner-queue", "ambaji-sanctum", "ambaji-exit", "ambaji-prasad"],
    estimatedMinutes: 85,
    description: "Complete temple darshan including parikrama"
  },
  {
    id: "ambaji-express",
    name: "Express Darshan",
    type: "express",
    zones: ["ambaji-main-gate", "ambaji-shoe-counter", "ambaji-inner-queue", "ambaji-sanctum", "ambaji-exit"],
    estimatedMinutes: 40,
    description: "Direct darshan skipping outer parikrama"
  },
  {
    id: "ambaji-accessible",
    name: "Accessible Route",
    type: "accessible",
    zones: ["ambaji-main-gate", "ambaji-shoe-counter", "ambaji-outer-pradakshina", "ambaji-exit", "ambaji-prasad"],
    estimatedMinutes: 55,
    description: "Ground level darshan from outer mandap. Hill climb not required."
  },
  {
    id: "ambaji-ropeway-tour",
    name: "Ropeway + Temple",
    type: "standard",
    zones: ["ambaji-ropeway", "ambaji-main-gate", "ambaji-shoe-counter", "ambaji-outer-pradakshina", "ambaji-inner-queue", "ambaji-sanctum", "ambaji-exit"],
    estimatedMinutes: 120,
    description: "Complete experience with Gabbar Hill ropeway ride"
  }
];

// ============ KALIKA MATA TEMPLE (PAVAGADH) ============
const pavagadhZones: TempleZone[] = [
  {
    id: "pavagadh-base",
    name: "Base Station",
    nameHindi: "बेस स्टेशन",
    type: "entrance",
    coordinates: { x: 50, y: 95 },
    capacity: 500,
    avgTimeMinutes: 10,
    isAccessible: true,
    description: "Ticket counter and ropeway base"
  },
  {
    id: "pavagadh-ropeway-lower",
    name: "Ropeway Station",
    nameHindi: "रोपवे स्टेशन",
    type: "amenity",
    coordinates: { x: 40, y: 85 },
    capacity: 300,
    avgTimeMinutes: 15,
    isAccessible: true,
    description: "Cable car to Machi plateau"
  },
  {
    id: "pavagadh-machi",
    name: "Machi Plateau",
    nameHindi: "माची पठार",
    type: "queue",
    coordinates: { x: 50, y: 65 },
    capacity: 1000,
    avgTimeMinutes: 20,
    isAccessible: true,
    description: "Intermediate stop with shops and rest area"
  },
  {
    id: "pavagadh-steps",
    name: "Temple Steps (250 steps)",
    nameHindi: "मंदिर सीढ़ियाँ",
    type: "queue",
    coordinates: { x: 50, y: 45 },
    capacity: 500,
    avgTimeMinutes: 25,
    isAccessible: false,
    description: "Final climb to hilltop temple"
  },
  {
    id: "pavagadh-sanctum",
    name: "Kalika Mata Sanctum",
    nameHindi: "कालिका माता गर्भगृह",
    type: "sanctum",
    coordinates: { x: 50, y: 20 },
    capacity: 40,
    avgTimeMinutes: 2,
    isAccessible: false,
    description: "Shakti Peeth - one of 51 sacred sites"
  },
  {
    id: "pavagadh-exit",
    name: "Temple Exit",
    nameHindi: "मंदिर निकास",
    type: "exit",
    coordinates: { x: 65, y: 30 },
    capacity: 200,
    avgTimeMinutes: 5,
    isAccessible: false,
    description: "Exit via same steps"
  },
  {
    id: "pavagadh-prasad",
    name: "Prasad Stall",
    nameHindi: "प्रसाद दुकान",
    type: "prasad",
    coordinates: { x: 70, y: 50 },
    capacity: 100,
    avgTimeMinutes: 5,
    isAccessible: true,
    description: "Located at Machi plateau"
  },
  {
    id: "pavagadh-champaner",
    name: "Champaner Heritage",
    nameHindi: "चंपानेर विरासत",
    type: "attraction",
    coordinates: { x: 25, y: 80 },
    capacity: 300,
    avgTimeMinutes: 60,
    isAccessible: true,
    description: "UNESCO World Heritage Site - Jama Masjid"
  }
];

const pavagadhRoutes: TempleRoute[] = [
  {
    id: "pavagadh-standard",
    name: "Standard Route (Ropeway + Steps)",
    type: "standard",
    zones: ["pavagadh-base", "pavagadh-ropeway-lower", "pavagadh-machi", "pavagadh-steps", "pavagadh-sanctum", "pavagadh-exit", "pavagadh-prasad"],
    estimatedMinutes: 90,
    description: "Ropeway to Machi, then 250 steps to temple"
  },
  {
    id: "pavagadh-trek",
    name: "Trekking Route",
    type: "standard",
    zones: ["pavagadh-base", "pavagadh-machi", "pavagadh-steps", "pavagadh-sanctum", "pavagadh-exit"],
    estimatedMinutes: 180,
    description: "Full trek from base - for adventure seekers"
  },
  {
    id: "pavagadh-accessible",
    name: "Accessible Route",
    type: "accessible",
    zones: ["pavagadh-base", "pavagadh-ropeway-lower", "pavagadh-machi", "pavagadh-prasad"],
    estimatedMinutes: 50,
    description: "Ropeway to Machi only. Darshan from Machi viewpoint.",
    restrictions: ["250 steps to sanctum are not accessible", "Spiritual darshan from Machi plateau available"]
  },
  {
    id: "pavagadh-heritage",
    name: "Heritage + Temple Tour",
    type: "standard",
    zones: ["pavagadh-champaner", "pavagadh-base", "pavagadh-ropeway-lower", "pavagadh-machi", "pavagadh-steps", "pavagadh-sanctum", "pavagadh-exit"],
    estimatedMinutes: 180,
    description: "Includes UNESCO Champaner ruins visit"
  }
];

// ============ COMBINED DATA ============
export const templeMapData: Record<string, TempleMapData> = {
  somnath: {
    templeId: "somnath",
    templeName: "Somnath Mahadev",
    zones: somnathZones,
    routes: somnathRoutes,
    tips: [
      "Beach view is best at sunset",
      "Monday evenings have special Rudrabhishek",
      "Light & Sound show at 8 PM (seasonal)",
      "Avoid Mahashivratri unless prepared for massive crowds"
    ]
  },
  dwarka: {
    templeId: "dwarka",
    templeName: "Dwarkadhish Temple",
    zones: dwarkaZones,
    routes: dwarkaRoutes,
    tips: [
      "Morning aarti at Gomti Ghat is breathtaking",
      "Janmashtami crowds start 2 days before",
      "Bet Dwarka island trip requires half day",
      "5-story temple climb has narrow steps"
    ]
  },
  ambaji: {
    templeId: "ambaji",
    templeName: "Ambaji Mata Temple",
    zones: ambajiZones,
    routes: ambajiRoutes,
    tips: [
      "Gabbar Hill ropeway closes during monsoon",
      "Bhadarvi Poonam sees 25 lakh+ visitors",
      "Navratri has special 3 AM darshan slot",
      "Sukhdi prasad is famous - try it!"
    ]
  },
  pavagadh: {
    templeId: "pavagadh",
    templeName: "Kalika Mata Temple",
    zones: pavagadhZones,
    routes: pavagadhRoutes,
    tips: [
      "Ropeway is essential for elderly visitors",
      "Champaner ruins are UNESCO protected",
      "Fog common in winter mornings",
      "Carry water for the 250 step climb"
    ]
  }
};

/**
 * Get zones for a temple
 */
export function getTempleZones(templeId: string): TempleZone[] {
  return templeMapData[templeId]?.zones || [];
}

/**
 * Get routes for a temple
 */
export function getTempleRoutes(templeId: string): TempleRoute[] {
  return templeMapData[templeId]?.routes || [];
}

/**
 * Get optimal route based on user preferences
 */
export function getOptimalRoute(
  templeId: string,
  preferences: {
    accessible?: boolean;
    hasTime?: boolean; // More time = full experience
    isVip?: boolean;
  }
): TempleRoute | null {
  const routes = getTempleRoutes(templeId);
  
  if (preferences.accessible) {
    return routes.find(r => r.type === "accessible") || routes[0];
  }
  if (preferences.isVip) {
    return routes.find(r => r.type === "vip") || routes[0];
  }
  if (preferences.hasTime === false) {
    return routes.find(r => r.type === "express") || routes[0];
  }
  
  // Default to standard
  return routes.find(r => r.type === "standard") || routes[0];
}

/**
 * Get full temple map data
 */
export function getTempleMapData(templeId: string): TempleMapData | null {
  return templeMapData[templeId] || null;
}
