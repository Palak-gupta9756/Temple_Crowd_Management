/**
 * Emergency & Medical Facility Data for all 4 Gujarat Temples
 * Contains first-aid locations, emergency contacts, and safety infrastructure
 */

export interface FirstAidStation {
  id: string;
  templeId: string;
  name: string;
  location: string;
  coordinates: { x: number; y: number };
  facilities: string[];
  staffCount: number;
  isOpen24Hours: boolean;
  openTime?: string;
  closeTime?: string;
  contactNumber: string;
}

export interface EmergencyContact {
  id: string;
  templeId: string;
  type: "ambulance" | "police" | "fire" | "temple-security" | "control-room" | "hospital";
  name: string;
  number: string;
  isEmergency: boolean;
  responseTime?: string; // e.g., "5-10 min"
}

export interface SafeZone {
  id: string;
  templeId: string;
  name: string;
  type: "assembly-point" | "shelter" | "evacuation-route";
  location: string;
  capacity: number;
  coordinates: { x: number; y: number };
  description: string;
}

export interface CrowdThreshold {
  templeId: string;
  maxCapacity: number;
  warningThreshold: number; // % at which warning issued
  criticalThreshold: number; // % at which critical alert issued
  evacuationThreshold: number; // % at which evacuation starts
}

// ============ FIRST AID STATIONS ============

const somnathFirstAid: FirstAidStation[] = [
  {
    id: "somnath-fa-main",
    templeId: "somnath",
    name: "Main First Aid Center",
    location: "Near Main Entrance Gate",
    coordinates: { x: 48, y: 88 },
    facilities: ["Oxygen Cylinder", "Stretcher", "Wheelchair", "Basic Medicines", "BP Monitor", "Glucose"],
    staffCount: 4,
    isOpen24Hours: true,
    contactNumber: "+91-2876-232111"
  },
  {
    id: "somnath-fa-beach",
    templeId: "somnath",
    name: "Beach Side Medical Post",
    location: "Near Beach Viewing Area",
    coordinates: { x: 50, y: 15 },
    facilities: ["First Aid Kit", "Stretcher", "Basic Medicines"],
    staffCount: 2,
    isOpen24Hours: false,
    openTime: "06:00",
    closeTime: "21:00",
    contactNumber: "+91-2876-232112"
  }
];

const dwarkaFirstAid: FirstAidStation[] = [
  {
    id: "dwarka-fa-main",
    templeId: "dwarka",
    name: "Dwarkadhish Medical Center",
    location: "Near Moksha Dwar",
    coordinates: { x: 75, y: 65 },
    facilities: ["Oxygen Cylinder", "Stretcher", "Wheelchair", "AED Defibrillator", "Basic Medicines", "IV Setup"],
    staffCount: 5,
    isOpen24Hours: true,
    contactNumber: "+91-2892-234111"
  },
  {
    id: "dwarka-fa-ghat",
    templeId: "dwarka",
    name: "Gomti Ghat First Aid",
    location: "Bottom of 56 Steps at Gomti Ghat",
    coordinates: { x: 50, y: 98 },
    facilities: ["First Aid Kit", "Oxygen", "Stretcher"],
    staffCount: 2,
    isOpen24Hours: false,
    openTime: "05:00",
    closeTime: "21:00",
    contactNumber: "+91-2892-234112"
  }
];

const ambajiFirstAid: FirstAidStation[] = [
  {
    id: "ambaji-fa-main",
    templeId: "ambaji",
    name: "Ambaji Main Medical Center",
    location: "Near Main Temple Gate",
    coordinates: { x: 55, y: 85 },
    facilities: ["Oxygen Cylinder", "Stretcher", "Wheelchair", "Basic Medicines", "BP Monitor", "Glucose", "Nebulizer"],
    staffCount: 6,
    isOpen24Hours: true,
    contactNumber: "+91-2749-262111"
  },
  {
    id: "ambaji-fa-ropeway",
    templeId: "ambaji",
    name: "Gabbar Ropeway First Aid",
    location: "Gabbar Hill Ropeway Base",
    coordinates: { x: 25, y: 45 },
    facilities: ["First Aid Kit", "Oxygen", "Stretcher", "Wheelchair"],
    staffCount: 2,
    isOpen24Hours: false,
    openTime: "06:00",
    closeTime: "20:00",
    contactNumber: "+91-2749-262112"
  },
  {
    id: "ambaji-fa-overflow",
    templeId: "ambaji",
    name: "Festival Overflow Medical Camp",
    location: "Festival Overflow Parking Area",
    coordinates: { x: 30, y: 95 },
    facilities: ["Tents", "Beds", "IV Setup", "Oxygen", "Ambulance Bay"],
    staffCount: 8,
    isOpen24Hours: true,
    contactNumber: "+91-2749-262113"
  }
];

const pavagadhFirstAid: FirstAidStation[] = [
  {
    id: "pavagadh-fa-base",
    templeId: "pavagadh",
    name: "Base Station Medical Center",
    location: "Ropeway Base Station",
    coordinates: { x: 45, y: 92 },
    facilities: ["Oxygen Cylinder", "Stretcher", "Wheelchair", "Basic Medicines", "BP Monitor"],
    staffCount: 3,
    isOpen24Hours: false,
    openTime: "06:00",
    closeTime: "19:30",
    contactNumber: "+91-2676-244111"
  },
  {
    id: "pavagadh-fa-machi",
    templeId: "pavagadh",
    name: "Machi Plateau First Aid",
    location: "Machi Rest Area",
    coordinates: { x: 50, y: 60 },
    facilities: ["First Aid Kit", "Oxygen", "Stretcher"],
    staffCount: 2,
    isOpen24Hours: false,
    openTime: "06:30",
    closeTime: "18:30",
    contactNumber: "+91-2676-244112"
  }
];

// ============ EMERGENCY CONTACTS ============

const somnathContacts: EmergencyContact[] = [
  { id: "somnath-ambulance", templeId: "somnath", type: "ambulance", name: "108 Ambulance", number: "108", isEmergency: true, responseTime: "5-10 min" },
  { id: "somnath-police", templeId: "somnath", type: "police", name: "Veraval Police Station", number: "100", isEmergency: true, responseTime: "5-8 min" },
  { id: "somnath-fire", templeId: "somnath", type: "fire", name: "Fire Station Veraval", number: "101", isEmergency: true, responseTime: "8-12 min" },
  { id: "somnath-security", templeId: "somnath", type: "temple-security", name: "Temple Security Office", number: "+91-2876-232100", isEmergency: false },
  { id: "somnath-control", templeId: "somnath", type: "control-room", name: "Temple Control Room", number: "+91-2876-232000", isEmergency: true, responseTime: "Immediate" },
  { id: "somnath-hospital", templeId: "somnath", type: "hospital", name: "Sir T Hospital Veraval", number: "+91-2876-243555", isEmergency: false, responseTime: "15-20 min" }
];

const dwarkaContacts: EmergencyContact[] = [
  { id: "dwarka-ambulance", templeId: "dwarka", type: "ambulance", name: "108 Ambulance", number: "108", isEmergency: true, responseTime: "5-12 min" },
  { id: "dwarka-police", templeId: "dwarka", type: "police", name: "Dwarka Police Station", number: "100", isEmergency: true, responseTime: "5-10 min" },
  { id: "dwarka-fire", templeId: "dwarka", type: "fire", name: "Fire Station Dwarka", number: "101", isEmergency: true, responseTime: "10-15 min" },
  { id: "dwarka-security", templeId: "dwarka", type: "temple-security", name: "Temple Trust Security", number: "+91-2892-234100", isEmergency: false },
  { id: "dwarka-control", templeId: "dwarka", type: "control-room", name: "Temple Control Room", number: "+91-2892-234000", isEmergency: true, responseTime: "Immediate" },
  { id: "dwarka-hospital", templeId: "dwarka", type: "hospital", name: "Dwarka General Hospital", number: "+91-2892-235555", isEmergency: false, responseTime: "10-15 min" }
];

const ambajiContacts: EmergencyContact[] = [
  { id: "ambaji-ambulance", templeId: "ambaji", type: "ambulance", name: "108 Ambulance", number: "108", isEmergency: true, responseTime: "8-15 min" },
  { id: "ambaji-police", templeId: "ambaji", type: "police", name: "Ambaji Police Station", number: "100", isEmergency: true, responseTime: "5-8 min" },
  { id: "ambaji-fire", templeId: "ambaji", type: "fire", name: "Danta Fire Station", number: "101", isEmergency: true, responseTime: "15-20 min" },
  { id: "ambaji-security", templeId: "ambaji", type: "temple-security", name: "Temple Security", number: "+91-2749-262100", isEmergency: false },
  { id: "ambaji-control", templeId: "ambaji", type: "control-room", name: "Temple Control Room", number: "+91-2749-262000", isEmergency: true, responseTime: "Immediate" },
  { id: "ambaji-hospital", templeId: "ambaji", type: "hospital", name: "CHC Ambaji", number: "+91-2749-263555", isEmergency: false, responseTime: "5-10 min" }
];

const pavagadhContacts: EmergencyContact[] = [
  { id: "pavagadh-ambulance", templeId: "pavagadh", type: "ambulance", name: "108 Ambulance", number: "108", isEmergency: true, responseTime: "10-20 min" },
  { id: "pavagadh-police", templeId: "pavagadh", type: "police", name: "Halol Police Station", number: "100", isEmergency: true, responseTime: "10-15 min" },
  { id: "pavagadh-fire", templeId: "pavagadh", type: "fire", name: "Halol Fire Station", number: "101", isEmergency: true, responseTime: "15-25 min" },
  { id: "pavagadh-security", templeId: "pavagadh", type: "temple-security", name: "Temple Security", number: "+91-2676-244100", isEmergency: false },
  { id: "pavagadh-control", templeId: "pavagadh", type: "control-room", name: "Ropeway Control Room", number: "+91-2676-244000", isEmergency: true, responseTime: "Immediate" },
  { id: "pavagadh-hospital", templeId: "pavagadh", type: "hospital", name: "Halol Civil Hospital", number: "+91-2676-220555", isEmergency: false, responseTime: "20-30 min" }
];

// ============ SAFE ZONES ============

const somnathSafeZones: SafeZone[] = [
  {
    id: "somnath-sz-main",
    templeId: "somnath",
    name: "Main Assembly Point",
    type: "assembly-point",
    location: "Open Ground near Main Parking",
    capacity: 5000,
    coordinates: { x: 30, y: 95 },
    description: "Primary evacuation assembly point with PA system and lighting"
  },
  {
    id: "somnath-sz-beach",
    templeId: "somnath",
    name: "Beach Evacuation Point",
    type: "evacuation-route",
    location: "Open Beach Area (away from water)",
    capacity: 3000,
    coordinates: { x: 50, y: 5 },
    description: "Secondary evacuation point for emergencies"
  }
];

const dwarkaSafeZones: SafeZone[] = [
  {
    id: "dwarka-sz-main",
    templeId: "dwarka",
    name: "Jagat Mandir Assembly Point",
    type: "assembly-point",
    location: "Open Area near Bus Parking",
    capacity: 4000,
    coordinates: { x: 20, y: 60 },
    description: "Primary assembly point with emergency supplies"
  }
];

const ambajiSafeZones: SafeZone[] = [
  {
    id: "ambaji-sz-main",
    templeId: "ambaji",
    name: "Main Dharamshala Ground",
    type: "assembly-point",
    location: "Near Temple Trust Dharamshala",
    capacity: 10000,
    coordinates: { x: 40, y: 90 },
    description: "Large capacity assembly point"
  },
  {
    id: "ambaji-sz-overflow",
    templeId: "ambaji",
    name: "Festival Ground",
    type: "shelter",
    location: "Overflow Parking Ground",
    capacity: 20000,
    coordinates: { x: 25, y: 95 },
    description: "Used during festivals as emergency shelter"
  }
];

const pavagadhSafeZones: SafeZone[] = [
  {
    id: "pavagadh-sz-base",
    templeId: "pavagadh",
    name: "Base Station Assembly",
    type: "assembly-point",
    location: "Ropeway Base Parking",
    capacity: 2000,
    coordinates: { x: 45, y: 98 },
    description: "Primary evacuation point at hill base"
  },
  {
    id: "pavagadh-sz-machi",
    templeId: "pavagadh",
    name: "Machi Shelter Area",
    type: "shelter",
    location: "Machi Plateau Rest Area",
    capacity: 1000,
    coordinates: { x: 50, y: 65 },
    description: "Midway shelter for stranded pilgrims"
  }
];

// ============ CROWD THRESHOLDS ============

export const crowdThresholds: CrowdThreshold[] = [
  { templeId: "somnath", maxCapacity: 15000, warningThreshold: 70, criticalThreshold: 85, evacuationThreshold: 95 },
  { templeId: "dwarka", maxCapacity: 12000, warningThreshold: 70, criticalThreshold: 85, evacuationThreshold: 95 },
  { templeId: "ambaji", maxCapacity: 25000, warningThreshold: 65, criticalThreshold: 80, evacuationThreshold: 90 },
  { templeId: "pavagadh", maxCapacity: 8000, warningThreshold: 60, criticalThreshold: 75, evacuationThreshold: 85 }
];

// ============ COMBINED DATA ============

export const allFirstAidStations: FirstAidStation[] = [
  ...somnathFirstAid,
  ...dwarkaFirstAid,
  ...ambajiFirstAid,
  ...pavagadhFirstAid
];

export const allEmergencyContacts: EmergencyContact[] = [
  ...somnathContacts,
  ...dwarkaContacts,
  ...ambajiContacts,
  ...pavagadhContacts
];

export const allSafeZones: SafeZone[] = [
  ...somnathSafeZones,
  ...dwarkaSafeZones,
  ...ambajiSafeZones,
  ...pavagadhSafeZones
];

// ============ HELPER FUNCTIONS ============

export function getFirstAidStations(templeId: string): FirstAidStation[] {
  return allFirstAidStations.filter(s => s.templeId === templeId);
}

export function getEmergencyContacts(templeId: string): EmergencyContact[] {
  return allEmergencyContacts.filter(c => c.templeId === templeId);
}

export function getSafeZones(templeId: string): SafeZone[] {
  return allSafeZones.filter(z => z.templeId === templeId);
}

export function getCrowdThreshold(templeId: string): CrowdThreshold | undefined {
  return crowdThresholds.find(t => t.templeId === templeId);
}

export function getNearestFirstAid(templeId: string): FirstAidStation | null {
  const stations = getFirstAidStations(templeId);
  // Return the main station (first one) or the one that's open 24 hours
  return stations.find(s => s.isOpen24Hours) || stations[0] || null;
}

export function getEmergencyNumber(templeId: string, type: EmergencyContact["type"]): string | null {
  const contact = allEmergencyContacts.find(c => c.templeId === templeId && c.type === type);
  return contact?.number || null;
}
