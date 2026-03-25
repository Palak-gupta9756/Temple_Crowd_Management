export interface Temple {
  id: string;
  name: string;
  location: string;
}

export const temples: Temple[] = [
  {
    id: "somnath",
    name: "Somnath Mahadev",
    location: "Prabhas Patan, Veraval",
  },
  {
    id: "dwarka",
    name: "Dwarkadhish Temple",
    location: "Dwarka",
  },
  {
    id: "ambaji",
    name: "Ambaji Mata Temple",
    location: "Ambaji, Banaskantha",
  },
  {
    id: "pavagadh",
    name: "Kalika Mata Temple",
    location: "Pavagadh Hill, Panchmahal",
  },
];

export function getTempleById(id: string): Temple | undefined {
  return temples.find(t => t.id === id);
}

export function getTempleNameById(id: string): string {
  const temple = getTempleById(id);
  return temple?.name || "Unknown Temple";
}
