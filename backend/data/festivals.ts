/**
 * Festival Calendar Data for 4 Gujarat Temples
 * Contains major Hindu festivals and temple-specific events
 */

export interface Festival {
  id: string;
  name: string;
  nameHindi: string;
  date: string; // ISO format YYYY-MM-DD
  endDate?: string; // For multi-day festivals
  templeIds: string[]; // Which temples this affects
  crowdMultiplier: number; // Expected crowd increase (1.5 = 50% more, 3.0 = 3x)
  significance: "major" | "moderate" | "minor";
  description: string;
  specialTimings?: string;
  expectedFootfall?: number;
}

// Festivals for the year (2026)
export const festivals: Festival[] = [
  // ============ MAJOR FESTIVALS ============
  {
    id: "mahashivratri-2026",
    name: "Mahashivratri",
    nameHindi: "महाशिवरात्रि",
    date: "2026-02-15",
    templeIds: ["somnath", "pavagadh"],
    crowdMultiplier: 5.0,
    significance: "major",
    description: "One of the most important festivals for Lord Shiva. Somnath sees massive crowds as it's a Jyotirlinga.",
    specialTimings: "Temple open for 24 hours. Special abhishekam at midnight.",
    expectedFootfall: 500000
  },
  {
    id: "janmashtami-2026",
    name: "Janmashtami",
    nameHindi: "जन्माष्टमी",
    date: "2026-08-14",
    templeIds: ["dwarka"],
    crowdMultiplier: 6.0,
    significance: "major",
    description: "Lord Krishna's birthday. Dwarkadhish Temple is one of the most important pilgrimage sites.",
    specialTimings: "Midnight celebrations. Temple open 24 hours. Special darshan from 11 PM.",
    expectedFootfall: 800000
  },
  {
    id: "navratri-2026",
    name: "Navratri",
    nameHindi: "नवरात्रि",
    date: "2026-10-02",
    endDate: "2026-10-11",
    templeIds: ["ambaji", "pavagadh"],
    crowdMultiplier: 7.0,
    significance: "major",
    description: "Nine nights dedicated to Goddess Durga. Ambaji and Kalika Mata temples see highest footfall.",
    specialTimings: "Garba celebrations every night from 9 PM. Special aarti at 4 AM and 7 PM.",
    expectedFootfall: 2000000
  },
  {
    id: "diwali-2026",
    name: "Diwali",
    nameHindi: "दीवाली",
    date: "2026-10-20",
    endDate: "2026-10-24",
    templeIds: ["somnath", "dwarka", "ambaji", "pavagadh"],
    crowdMultiplier: 4.0,
    significance: "major",
    description: "Festival of lights. All temples beautifully illuminated with special evening aarti.",
    specialTimings: "Extended hours. Special lighting ceremony at sunset.",
    expectedFootfall: 150000
  },
  
  // ============ MODERATE FESTIVALS ============
  {
    id: "holi-2026",
    name: "Holi",
    nameHindi: "होली",
    date: "2026-03-03",
    templeIds: ["dwarka", "somnath"],
    crowdMultiplier: 2.5,
    significance: "moderate",
    description: "Festival of colors. Special celebrations at Dwarkadhish with flower shower.",
    specialTimings: "Colorful celebrations from 10 AM to 2 PM.",
    expectedFootfall: 75000
  },
  {
    id: "shravan-2026",
    name: "Shravan Month",
    nameHindi: "श्रावण मास",
    date: "2026-07-11",
    endDate: "2026-08-08",
    templeIds: ["somnath"],
    crowdMultiplier: 3.0,
    significance: "moderate",
    description: "Holy month for Lord Shiva devotees. Every Monday (Shravan Somvar) sees extra crowd.",
    specialTimings: "Special abhishekam on Mondays at 5 AM.",
    expectedFootfall: 100000
  },
  {
    id: "raksha-bandhan-2026",
    name: "Raksha Bandhan",
    nameHindi: "रक्षा बंधन",
    date: "2026-08-09",
    templeIds: ["ambaji", "pavagadh"],
    crowdMultiplier: 2.0,
    significance: "moderate",
    description: "Festival of sibling bond. Special pujas for family prosperity.",
    expectedFootfall: 40000
  },
  {
    id: "ganesh-chaturthi-2026",
    name: "Ganesh Chaturthi",
    nameHindi: "गणेश चतुर्थी",
    date: "2026-08-23",
    endDate: "2026-09-02",
    templeIds: ["somnath", "dwarka", "ambaji", "pavagadh"],
    crowdMultiplier: 2.5,
    significance: "moderate",
    description: "Lord Ganesha's birthday. All temples have Ganesh idols installed.",
    specialTimings: "Visarjan on Anant Chaturdashi (10th day).",
    expectedFootfall: 60000
  },
  {
    id: "kartik-purnima-2026",
    name: "Kartik Purnima",
    nameHindi: "कार्तिक पूर्णिमा",
    date: "2026-11-15",
    templeIds: ["somnath", "dwarka"],
    crowdMultiplier: 2.5,
    significance: "moderate",
    description: "Dev Diwali - when gods celebrate Diwali. Special for coastal temples.",
    specialTimings: "Special aarti at sunrise and sunset.",
    expectedFootfall: 50000
  },

  // ============ MINOR/LOCAL FESTIVALS ============
  {
    id: "bhadarvi-poonam-2026",
    name: "Bhadarvi Poonam Fair",
    nameHindi: "भादरवी पूनम मेला",
    date: "2026-09-07",
    endDate: "2026-09-09",
    templeIds: ["ambaji"],
    crowdMultiplier: 8.0,
    significance: "major",
    description: "Largest fair at Ambaji. Lakhs of pilgrims walk barefoot from all over Gujarat.",
    specialTimings: "Fair open 24/7. Special darshan queue system in place.",
    expectedFootfall: 2500000
  },
  {
    id: "dev-uthani-ekadashi-2026",
    name: "Dev Uthani Ekadashi",
    nameHindi: "देव उठनी एकादशी",
    date: "2026-11-04",
    templeIds: ["dwarka"],
    crowdMultiplier: 2.0,
    significance: "minor",
    description: "End of Chaturmas. Lord Vishnu wakes from cosmic sleep.",
    expectedFootfall: 30000
  },
  {
    id: "makarsankranti-2026",
    name: "Makar Sankranti",
    nameHindi: "मकर संक्रांति",
    date: "2026-01-14",
    templeIds: ["somnath", "dwarka", "ambaji", "pavagadh"],
    crowdMultiplier: 2.5,
    significance: "moderate",
    description: "Harvest festival. Kite flying celebrations across Gujarat.",
    specialTimings: "Early morning til-gul distribution.",
    expectedFootfall: 45000
  },
  {
    id: "chaitra-navratri-2026",
    name: "Chaitra Navratri",
    nameHindi: "चैत्र नवरात्रि",
    date: "2026-03-19",
    endDate: "2026-03-27",
    templeIds: ["ambaji", "pavagadh"],
    crowdMultiplier: 3.5,
    significance: "moderate",
    description: "Spring Navratri. More devotional, less crowded than Sharad Navratri.",
    expectedFootfall: 500000
  },
  {
    id: "ram-navami-2026", 
    name: "Ram Navami",
    nameHindi: "राम नवमी",
    date: "2026-03-27",
    templeIds: ["dwarka", "somnath"],
    crowdMultiplier: 2.0,
    significance: "moderate",
    description: "Lord Rama's birthday. Special pujas and bhajans.",
    expectedFootfall: 35000
  }
];

/**
 * Get festivals for a specific temple
 */
export function getFestivalsForTemple(templeId: string): Festival[] {
  return festivals.filter(f => f.templeIds.includes(templeId));
}

/**
 * Get upcoming festivals (next N days)
 */
export function getUpcomingFestivals(days: number = 30): Festival[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  return festivals.filter(f => {
    const festDate = new Date(f.date);
    return festDate >= today && festDate <= futureDate;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get festivals for a specific date range
 */
export function getFestivalsInRange(startDate: Date, endDate: Date): Festival[] {
  return festivals.filter(f => {
    const festStart = new Date(f.date);
    const festEnd = f.endDate ? new Date(f.endDate) : festStart;
    return festEnd >= startDate && festStart <= endDate;
  });
}

/**
 * Check if a date falls on or near a festival
 */
export function getFestivalOnDate(date: Date, templeId?: string): Festival | null {
  const dateStr = date.toISOString().split('T')[0];
  
  const festival = festivals.find(f => {
    const matchesTemple = !templeId || f.templeIds.includes(templeId);
    const startDate = f.date;
    const endDate = f.endDate || f.date;
    return matchesTemple && dateStr >= startDate && dateStr <= endDate;
  });
  
  return festival || null;
}

/**
 * Get crowd multiplier for a specific date and temple
 */
export function getCrowdMultiplierForDate(date: Date, templeId: string): number {
  const festival = getFestivalOnDate(date, templeId);
  return festival?.crowdMultiplier || 1.0;
}

/**
 * Get all festivals that affect a temple within a date range
 */
export function getTempleFestivalsInRange(
  templeId: string, 
  startDate: Date, 
  endDate: Date
): Festival[] {
  return festivals.filter(f => {
    const matchesTemple = f.templeIds.includes(templeId);
    const festStart = new Date(f.date);
    const festEnd = f.endDate ? new Date(f.endDate) : festStart;
    return matchesTemple && festEnd >= startDate && festStart <= endDate;
  });
}
