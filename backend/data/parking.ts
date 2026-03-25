/**
 * Parking Lot Data for all 4 Gujarat Temples
 * Contains lot definitions, capacities, and pricing
 */

export interface ParkingLot {
  id: string;
  name: string;
  templeId: string;
  type: "two-wheeler" | "car" | "bus" | "mixed";
  totalSpots: number;
  occupiedSpots: number;
  pricePerHour: number;
  distanceFromTemple: number; // meters
  isShaded: boolean;
  hasElectricCharging: boolean;
  amenities: string[];
  coordinates: { lat: number; lon: number };
  openTime: string;
  closeTime: string;
}

export interface ParkingReservation {
  id: string;
  lotId: string;
  templeId: string;
  vehicleNumber: string;
  vehicleType: "two-wheeler" | "car" | "bus";
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  spotNumber?: string;
  status: "reserved" | "active" | "completed" | "cancelled";
  totalAmount: number;
  createdAt: Date;
}

// ============ PARKING LOT DATA ============

const somnathParkingLots: ParkingLot[] = [
  {
    id: "somnath-main-parking",
    name: "Main Temple Parking",
    templeId: "somnath",
    type: "mixed",
    totalSpots: 500,
    occupiedSpots: 0, // Will be updated dynamically
    pricePerHour: 20,
    distanceFromTemple: 200,
    isShaded: false,
    hasElectricCharging: true,
    amenities: ["Restrooms", "Drinking Water", "Security Guard", "CCTV"],
    coordinates: { lat: 20.8880, lon: 70.4012 },
    openTime: "05:00",
    closeTime: "22:00"
  },
  {
    id: "somnath-beach-parking",
    name: "Beach Side Parking",
    templeId: "somnath",
    type: "car",
    totalSpots: 200,
    occupiedSpots: 0,
    pricePerHour: 30,
    distanceFromTemple: 150,
    isShaded: true,
    hasElectricCharging: false,
    amenities: ["Restrooms", "Beach Access", "CCTV"],
    coordinates: { lat: 20.8885, lon: 70.4025 },
    openTime: "06:00",
    closeTime: "21:00"
  },
  {
    id: "somnath-two-wheeler",
    name: "Two Wheeler Parking",
    templeId: "somnath",
    type: "two-wheeler",
    totalSpots: 300,
    occupiedSpots: 0,
    pricePerHour: 10,
    distanceFromTemple: 100,
    isShaded: true,
    hasElectricCharging: false,
    amenities: ["Helmet Storage", "CCTV"],
    coordinates: { lat: 20.8878, lon: 70.4008 },
    openTime: "05:00",
    closeTime: "22:00"
  }
];

const dwarkaParkingLots: ParkingLot[] = [
  {
    id: "dwarka-main-parking",
    name: "Dwarkadhish Main Parking",
    templeId: "dwarka",
    type: "mixed",
    totalSpots: 400,
    occupiedSpots: 0,
    pricePerHour: 20,
    distanceFromTemple: 300,
    isShaded: false,
    hasElectricCharging: true,
    amenities: ["Restrooms", "Drinking Water", "Auto-rickshaw Stand", "CCTV"],
    coordinates: { lat: 22.2382, lon: 68.9678 },
    openTime: "05:00",
    closeTime: "21:30"
  },
  {
    id: "dwarka-gomti-parking",
    name: "Gomti Ghat Parking",
    templeId: "dwarka",
    type: "car",
    totalSpots: 150,
    occupiedSpots: 0,
    pricePerHour: 25,
    distanceFromTemple: 200,
    isShaded: false,
    hasElectricCharging: false,
    amenities: ["Ghat Access", "Restrooms"],
    coordinates: { lat: 22.2390, lon: 68.9685 },
    openTime: "05:30",
    closeTime: "21:00"
  },
  {
    id: "dwarka-bus-parking",
    name: "Bus Terminal Parking",
    templeId: "dwarka",
    type: "bus",
    totalSpots: 50,
    occupiedSpots: 0,
    pricePerHour: 50,
    distanceFromTemple: 500,
    isShaded: true,
    hasElectricCharging: false,
    amenities: ["Driver Rest Area", "Restrooms", "Food Stalls", "CCTV"],
    coordinates: { lat: 22.2370, lon: 68.9660 },
    openTime: "05:00",
    closeTime: "22:00"
  }
];

const ambajiParkingLots: ParkingLot[] = [
  {
    id: "ambaji-main-parking",
    name: "Ambaji Main Parking",
    templeId: "ambaji",
    type: "mixed",
    totalSpots: 600,
    occupiedSpots: 0,
    pricePerHour: 15,
    distanceFromTemple: 400,
    isShaded: false,
    hasElectricCharging: false,
    amenities: ["Restrooms", "Drinking Water", "E-rickshaw Service", "CCTV"],
    coordinates: { lat: 24.3330, lon: 72.8510 },
    openTime: "04:00",
    closeTime: "23:00"
  },
  {
    id: "ambaji-ropeway-parking",
    name: "Gabbar Ropeway Parking",
    templeId: "ambaji",
    type: "car",
    totalSpots: 200,
    occupiedSpots: 0,
    pricePerHour: 20,
    distanceFromTemple: 600,
    isShaded: true,
    hasElectricCharging: true,
    amenities: ["Ropeway Access", "Restrooms", "Cafeteria", "CCTV"],
    coordinates: { lat: 24.3340, lon: 72.8520 },
    openTime: "06:00",
    closeTime: "20:00"
  },
  {
    id: "ambaji-overflow-parking",
    name: "Festival Overflow Parking",
    templeId: "ambaji",
    type: "mixed",
    totalSpots: 1000,
    occupiedSpots: 0,
    pricePerHour: 10,
    distanceFromTemple: 800,
    isShaded: false,
    hasElectricCharging: false,
    amenities: ["Shuttle Bus Service", "Basic Restrooms"],
    coordinates: { lat: 24.3320, lon: 72.8490 },
    openTime: "04:00",
    closeTime: "23:00"
  }
];

const pavagadhParkingLots: ParkingLot[] = [
  {
    id: "pavagadh-base-parking",
    name: "Ropeway Base Parking",
    templeId: "pavagadh",
    type: "mixed",
    totalSpots: 350,
    occupiedSpots: 0,
    pricePerHour: 20,
    distanceFromTemple: 100, // from ropeway base
    isShaded: true,
    hasElectricCharging: true,
    amenities: ["Ropeway Station Access", "Restrooms", "Cafeteria", "CCTV", "Luggage Storage"],
    coordinates: { lat: 22.4660, lon: 73.5110 },
    openTime: "06:00",
    closeTime: "19:00"
  },
  {
    id: "pavagadh-champaner-parking",
    name: "Champaner Heritage Parking",
    templeId: "pavagadh",
    type: "car",
    totalSpots: 150,
    occupiedSpots: 0,
    pricePerHour: 15,
    distanceFromTemple: 2000,
    isShaded: false,
    hasElectricCharging: false,
    amenities: ["Heritage Site Access", "Guide Services", "Restrooms"],
    coordinates: { lat: 22.4850, lon: 73.5350 },
    openTime: "08:00",
    closeTime: "18:00"
  },
  {
    id: "pavagadh-bus-parking",
    name: "Tour Bus Parking",
    templeId: "pavagadh",
    type: "bus",
    totalSpots: 30,
    occupiedSpots: 0,
    pricePerHour: 40,
    distanceFromTemple: 200,
    isShaded: true,
    hasElectricCharging: false,
    amenities: ["Driver Lounge", "Restrooms", "Food Counter", "CCTV"],
    coordinates: { lat: 22.4655, lon: 73.5100 },
    openTime: "06:00",
    closeTime: "19:00"
  }
];

// Combined parking data
export const allParkingLots: ParkingLot[] = [
  ...somnathParkingLots,
  ...dwarkaParkingLots,
  ...ambajiParkingLots,
  ...pavagadhParkingLots
];

// In-memory storage for parking occupancy (simulated)
const parkingOccupancy: Map<string, number> = new Map();

/**
 * Initialize parking with random occupancy
 */
export function initializeParkingOccupancy(): void {
  allParkingLots.forEach(lot => {
    // Simulate 30-70% occupancy
    const occupancyRate = 0.3 + Math.random() * 0.4;
    parkingOccupancy.set(lot.id, Math.floor(lot.totalSpots * occupancyRate));
  });
}

// Initialize on load
initializeParkingOccupancy();

/**
 * Get parking lots for a temple
 */
export function getParkingLotsForTemple(templeId: string): ParkingLot[] {
  return allParkingLots
    .filter(lot => lot.templeId === templeId)
    .map(lot => ({
      ...lot,
      occupiedSpots: parkingOccupancy.get(lot.id) || 0
    }));
}

/**
 * Get a specific parking lot
 */
export function getParkingLotById(lotId: string): ParkingLot | null {
  const lot = allParkingLots.find(l => l.id === lotId);
  if (!lot) return null;
  return {
    ...lot,
    occupiedSpots: parkingOccupancy.get(lot.id) || 0
  };
}

/**
 * Update parking occupancy
 */
export function updateParkingOccupancy(lotId: string, change: number): boolean {
  const lot = allParkingLots.find(l => l.id === lotId);
  if (!lot) return false;
  
  const currentOccupancy = parkingOccupancy.get(lotId) || 0;
  const newOccupancy = Math.max(0, Math.min(lot.totalSpots, currentOccupancy + change));
  parkingOccupancy.set(lotId, newOccupancy);
  return true;
}

/**
 * Check if a lot has available spots
 */
export function hasAvailableSpots(lotId: string, spotsNeeded: number = 1): boolean {
  const lot = getParkingLotById(lotId);
  if (!lot) return false;
  return (lot.totalSpots - lot.occupiedSpots) >= spotsNeeded;
}

/**
 * Get best parking recommendation
 */
export function getBestParking(
  templeId: string,
  vehicleType: "two-wheeler" | "car" | "bus"
): ParkingLot | null {
  const lots = getParkingLotsForTemple(templeId)
    .filter(lot => 
      lot.type === vehicleType || 
      lot.type === "mixed"
    )
    .filter(lot => lot.totalSpots > lot.occupiedSpots)
    .sort((a, b) => {
      // Score by: availability, distance, price
      const aAvailability = (a.totalSpots - a.occupiedSpots) / a.totalSpots;
      const bAvailability = (b.totalSpots - b.occupiedSpots) / b.totalSpots;
      
      const aScore = aAvailability * 0.4 + (1 - a.distanceFromTemple / 1000) * 0.4 + (1 - a.pricePerHour / 50) * 0.2;
      const bScore = bAvailability * 0.4 + (1 - b.distanceFromTemple / 1000) * 0.4 + (1 - b.pricePerHour / 50) * 0.2;
      
      return bScore - aScore;
    });

  return lots[0] || null;
}

/**
 * Get parking status summary for a temple
 */
export function getParkingSummary(templeId: string): {
  totalLots: number;
  totalSpots: number;
  availableSpots: number;
  occupancyPercentage: number;
  bestLot: ParkingLot | null;
} {
  const lots = getParkingLotsForTemple(templeId);
  const totalSpots = lots.reduce((sum, lot) => sum + lot.totalSpots, 0);
  const occupiedSpots = lots.reduce((sum, lot) => sum + lot.occupiedSpots, 0);
  const availableSpots = totalSpots - occupiedSpots;
  
  return {
    totalLots: lots.length,
    totalSpots,
    availableSpots,
    occupancyPercentage: Math.round((occupiedSpots / totalSpots) * 100),
    bestLot: getBestParking(templeId, "car")
  };
}

/**
 * Simulate parking changes (for demo purposes)
 */
export function simulateParkingChanges(): void {
  allParkingLots.forEach(lot => {
    const change = Math.floor((Math.random() - 0.5) * 10); // -5 to +5
    updateParkingOccupancy(lot.id, change);
  });
}
