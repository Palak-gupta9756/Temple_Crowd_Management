/**
 * Lost & Found Data Types and Initial Data
 * For reporting and claiming lost items at temples
 */

export interface LostItem {
  id: string;
  templeId: string;
  category: "bag" | "wallet" | "phone" | "jewelry" | "document" | "keys" | "footwear" | "clothing" | "other";
  description: string;
  color?: string;
  brand?: string;
  reportedAt: Date;
  foundAt?: string; // Location where found
  imageUrl?: string;
  status: "lost" | "found" | "claimed" | "expired";
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  finderName?: string;
  finderPhone?: string;
  claimDetails?: {
    claimedAt: Date;
    claimedBy: string;
    verificationMethod: string;
  };
  additionalDetails?: string;
}

export interface FoundItem {
  id: string;
  templeId: string;
  category: LostItem["category"];
  description: string;
  color?: string;
  foundLocation: string;
  foundAt: Date;
  imageUrl?: string;
  status: "awaiting-claim" | "claimed" | "donated" | "disposed";
  finderName?: string;
  finderPhone?: string;
  storedAt: string; // Temple office location
  expiryDate: Date; // After this, item may be donated/disposed
  claimDetails?: {
    claimedAt: Date;
    claimedBy: string;
    claimedByPhone: string;
    verificationMethod: string;
  };
  additionalDetails?: string;
}

export interface LostFoundOffice {
  templeId: string;
  name: string;
  location: string;
  contactNumber: string;
  openTime: string;
  closeTime: string;
  email: string;
}

export const categoryLabels: Record<LostItem["category"], string> = {
  bag: "Bag / Backpack",
  wallet: "Wallet / Purse",
  phone: "Mobile Phone",
  jewelry: "Jewelry / Ornaments",
  document: "Documents / ID",
  keys: "Keys",
  footwear: "Footwear",
  clothing: "Clothing",
  other: "Other Items"
};

export const categoryIcons: Record<LostItem["category"], string> = {
  bag: "🎒",
  wallet: "👛",
  phone: "📱",
  jewelry: "💍",
  document: "📄",
  keys: "🔑",
  footwear: "👟",
  clothing: "👕",
  other: "📦"
};

// Lost & Found offices at each temple
export const lostFoundOffices: LostFoundOffice[] = [
  {
    templeId: "somnath",
    name: "Somnath Trust Lost & Found",
    location: "Administrative Office, Near Clock Tower",
    contactNumber: "+91-2876-232150",
    openTime: "07:00",
    closeTime: "21:00",
    email: "lostandfound@somnath.org"
  },
  {
    templeId: "dwarka",
    name: "Dwarkadhish Lost & Found Office",
    location: "Near Swarga Dwar Gate",
    contactNumber: "+91-2892-234150",
    openTime: "06:00",
    closeTime: "21:00",
    email: "lostandfound@dwarkadhish.org"
  },
  {
    templeId: "ambaji",
    name: "Ambaji Temple Trust Office",
    location: "Trust Building, Main Market",
    contactNumber: "+91-2749-262150",
    openTime: "06:00",
    closeTime: "22:00",
    email: "lostandfound@ambajitemple.org"
  },
  {
    templeId: "pavagadh",
    name: "Pavagadh Ropeway Office",
    location: "Ropeway Base Station",
    contactNumber: "+91-2676-244150",
    openTime: "06:30",
    closeTime: "19:00",
    email: "lostandfound@pavagadh.org"
  }
];

// In-memory storage for demo (in production, this would be a database)
let lostItems: LostItem[] = [];
let foundItems: FoundItem[] = [];
let itemIdCounter = 1;

// Sample data for demo
const sampleLostItems: Omit<LostItem, "id">[] = [
  {
    templeId: "somnath",
    category: "wallet",
    description: "Brown leather wallet with some cash and cards",
    color: "Brown",
    brand: "Woodland",
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "lost",
    reporterName: "Ramesh Patel",
    reporterPhone: "+91-9876543210",
    reporterEmail: "ramesh@email.com",
    additionalDetails: "Lost near Narasimha temple area around 4 PM"
  },
  {
    templeId: "dwarka",
    category: "phone",
    description: "Samsung Galaxy S21, Blue color, with black case",
    color: "Blue",
    brand: "Samsung",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "lost",
    reporterName: "Priya Sharma",
    reporterPhone: "+91-9988776655",
    additionalDetails: "Lost while climbing the 56 steps"
  }
];

const sampleFoundItems: Omit<FoundItem, "id">[] = [
  {
    templeId: "somnath",
    category: "bag",
    description: "Red color small ladies handbag",
    color: "Red",
    foundLocation: "Main Temple Premises",
    foundAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "awaiting-claim",
    storedAt: "Lost & Found Office",
    expiryDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    additionalDetails: "Contains some makeup items and a small purse"
  },
  {
    templeId: "ambaji",
    category: "jewelry",
    description: "Gold chain - lightweight",
    color: "Gold",
    foundLocation: "Near Gabbar Ropeway",
    foundAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "awaiting-claim",
    storedAt: "Temple Trust Office",
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    finderName: "Security Staff",
    additionalDetails: "Found during evening cleaning"
  },
  {
    templeId: "pavagadh",
    category: "footwear",
    description: "Pair of Bata Chappals, black with blue straps",
    color: "Black",
    foundLocation: "Shoe Rack Area",
    foundAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "awaiting-claim",
    storedAt: "Ropeway Office",
    expiryDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    additionalDetails: "Size 8 approximately"
  }
];

// Initialize sample data
function initializeData() {
  if (lostItems.length === 0) {
    lostItems = sampleLostItems.map(item => ({
      ...item,
      id: `lost-${itemIdCounter++}`
    }));
  }
  if (foundItems.length === 0) {
    foundItems = sampleFoundItems.map(item => ({
      ...item,
      id: `found-${itemIdCounter++}`
    }));
  }
}

initializeData();

// ============ CRUD OPERATIONS ============

export function getAllLostItems(templeId?: string): LostItem[] {
  if (templeId) {
    return lostItems.filter(i => i.templeId === templeId);
  }
  return [...lostItems];
}

export function getAllFoundItems(templeId?: string): FoundItem[] {
  if (templeId) {
    return foundItems.filter(i => i.templeId === templeId);
  }
  return [...foundItems];
}

export function getLostItemById(id: string): LostItem | undefined {
  return lostItems.find(i => i.id === id);
}

export function getFoundItemById(id: string): FoundItem | undefined {
  return foundItems.find(i => i.id === id);
}

export function reportLostItem(item: Omit<LostItem, "id" | "status" | "reportedAt">): LostItem {
  const newItem: LostItem = {
    ...item,
    id: `lost-${itemIdCounter++}`,
    status: "lost",
    reportedAt: new Date()
  };
  lostItems.push(newItem);
  return newItem;
}

export function reportFoundItem(item: Omit<FoundItem, "id" | "status" | "foundAt" | "expiryDate">): FoundItem {
  const newItem: FoundItem = {
    ...item,
    id: `found-${itemIdCounter++}`,
    status: "awaiting-claim",
    foundAt: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
  };
  foundItems.push(newItem);
  return newItem;
}

export function claimFoundItem(
  itemId: string, 
  claimDetails: { claimedBy: string; claimedByPhone: string; verificationMethod: string }
): FoundItem | null {
  const item = foundItems.find(i => i.id === itemId);
  if (!item || item.status !== "awaiting-claim") {
    return null;
  }
  
  item.status = "claimed";
  item.claimDetails = {
    claimedAt: new Date(),
    ...claimDetails
  };
  return item;
}

export function updateLostItemStatus(itemId: string, status: LostItem["status"], foundAt?: string): LostItem | null {
  const item = lostItems.find(i => i.id === itemId);
  if (!item) return null;
  
  item.status = status;
  if (foundAt) item.foundAt = foundAt;
  return item;
}

export function updateFoundItemStatus(itemId: string, status: FoundItem["status"]): FoundItem | null {
  const item = foundItems.find(i => i.id === itemId);
  if (!item) return null;
  
  item.status = status;
  return item;
}

export function deleteLostItem(itemId: string): boolean {
  const index = lostItems.findIndex(i => i.id === itemId);
  if (index === -1) return false;
  
  lostItems.splice(index, 1);
  return true;
}

export function deleteFoundItem(itemId: string): boolean {
  const index = foundItems.findIndex(i => i.id === itemId);
  if (index === -1) return false;
  
  foundItems.splice(index, 1);
  return true;
}

export function getLostFoundOffice(templeId: string): LostFoundOffice | undefined {
  return lostFoundOffices.find(o => o.templeId === templeId);
}

export function searchItems(query: string, templeId?: string): { lost: LostItem[]; found: FoundItem[] } {
  const lowerQuery = query.toLowerCase();
  
  let matchingLost = lostItems.filter(item => 
    item.description.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    (item.color && item.color.toLowerCase().includes(lowerQuery)) ||
    (item.brand && item.brand.toLowerCase().includes(lowerQuery))
  );
  
  let matchingFound = foundItems.filter(item =>
    item.description.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery) ||
    (item.color && item.color.toLowerCase().includes(lowerQuery))
  );
  
  if (templeId) {
    matchingLost = matchingLost.filter(i => i.templeId === templeId);
    matchingFound = matchingFound.filter(i => i.templeId === templeId);
  }
  
  return { lost: matchingLost, found: matchingFound };
}

export function getItemsByCategory(category: LostItem["category"], templeId?: string): { lost: LostItem[]; found: FoundItem[] } {
  let matchingLost = lostItems.filter(i => i.category === category);
  let matchingFound = foundItems.filter(i => i.category === category);
  
  if (templeId) {
    matchingLost = matchingLost.filter(i => i.templeId === templeId);
    matchingFound = matchingFound.filter(i => i.templeId === templeId);
  }
  
  return { lost: matchingLost, found: matchingFound };
}

// Stats for dashboard
export function getLostFoundStats(templeId?: string): {
  totalLost: number;
  totalFound: number;
  awaitingClaim: number;
  claimedThisWeek: number;
} {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  let filteredLost = templeId ? lostItems.filter(i => i.templeId === templeId) : lostItems;
  let filteredFound = templeId ? foundItems.filter(i => i.templeId === templeId) : foundItems;
  
  return {
    totalLost: filteredLost.filter(i => i.status === "lost").length,
    totalFound: filteredFound.length,
    awaitingClaim: filteredFound.filter(i => i.status === "awaiting-claim").length,
    claimedThisWeek: filteredFound.filter(i => 
      i.status === "claimed" && 
      i.claimDetails && 
      new Date(i.claimDetails.claimedAt) > oneWeekAgo
    ).length
  };
}
