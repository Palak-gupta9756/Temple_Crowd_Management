import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Car, Bike, Bus, ParkingCircle, MapPin, Clock, 
  Zap, CheckCircle2, AlertTriangle, Navigation, Wifi,
  Shield, Droplets, Coffee
} from "lucide-react";
import { temples } from "@/data/temples";
import { cn } from "@/lib/utils";

interface ParkingLot {
  id: string;
  name: string;
  templeId: string;
  type: "two-wheeler" | "car" | "bus" | "mixed";
  totalSpots: number;
  occupiedSpots: number;
  pricePerHour: number;
  distanceFromTemple: number;
  isShaded: boolean;
  hasElectricCharging: boolean;
  amenities: string[];
  coordinates: { lat: number; lon: number };
  openTime: string;
  closeTime: string;
  availableSpots?: number;
  occupancyPercentage?: number;
}

interface ParkingSummary {
  totalLots: number;
  totalSpots: number;
  availableSpots: number;
  occupancyPercentage: number;
  bestLot: ParkingLot | null;
}

export default function ParkingManagement() {
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [vehicleType, setVehicleType] = useState<"two-wheeler" | "car" | "bus">("car");

  // Fetch parking data for selected temple
  const { data: parkingData, isLoading, refetch } = useQuery({
    queryKey: ["parking", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v2/parking/${selectedTemple}`);
      if (!res.ok) throw new Error("Failed to fetch parking data");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch best parking recommendation
  const { data: bestParkingData } = useQuery({
    queryKey: ["bestParking", selectedTemple, vehicleType],
    queryFn: async () => {
      const res = await fetch(`/api/v2/parking/${selectedTemple}/best?vehicle=${vehicleType}`);
      if (!res.ok) throw new Error("Failed to fetch best parking");
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Fetch all temples parking summary
  const { data: allSummaryData } = useQuery({
    queryKey: ["allParkingSummary"],
    queryFn: async () => {
      const res = await fetch("/api/v2/parking");
      if (!res.ok) throw new Error("Failed to fetch parking summary");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const summary: ParkingSummary | null = parkingData?.summary;
  const lots: ParkingLot[] = parkingData?.lots || [];
  const bestParking = bestParkingData?.recommendation;
  const allSummaries = allSummaryData?.data || [];

  const getVehicleIcon = (type: string, className = "w-5 h-5") => {
    switch (type) {
      case "two-wheeler": return <Bike className={className} />;
      case "car": return <Car className={className} />;
      case "bus": return <Bus className={className} />;
      case "mixed": return <ParkingCircle className={className} />;
      default: return <Car className={className} />;
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-orange-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  // Occupancy color helper removed - using inline Tailwind classes instead

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Full</Badge>;
    if (percentage >= 70) return <Badge className="bg-orange-500">Filling</Badge>;
    if (percentage >= 50) return <Badge className="bg-yellow-500 text-black">Available</Badge>;
    return <Badge className="bg-green-500">Plenty Available</Badge>;
  };

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("electric") || lower.includes("charging")) return <Zap className="w-4 h-4" />;
    if (lower.includes("cctv") || lower.includes("security")) return <Shield className="w-4 h-4" />;
    if (lower.includes("restroom") || lower.includes("toilet")) return <Droplets className="w-4 h-4" />;
    if (lower.includes("food") || lower.includes("cafe")) return <Coffee className="w-4 h-4" />;
    if (lower.includes("wifi")) return <Wifi className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const filterLotsByVehicle = (lots: ParkingLot[]) => {
    return lots.filter(lot => 
      lot.type === vehicleType || lot.type === "mixed"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center gap-2">
            <ParkingCircle className="w-10 h-10" />
            Smart Parking
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find available parking near temples. Real-time occupancy updates and best spot recommendations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Temple" />
            </SelectTrigger>
            <SelectContent>
              {temples.map(temple => (
                <SelectItem key={temple.id} value={temple.id}>{temple.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as any)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4" /> Car
                </div>
              </SelectItem>
              <SelectItem value="two-wheeler">
                <div className="flex items-center gap-2">
                  <Bike className="w-4 h-4" /> Two-Wheeler
                </div>
              </SelectItem>
              <SelectItem value="bus">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4" /> Bus
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="temple" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="temple">Temple Parking</TabsTrigger>
            <TabsTrigger value="overview">All Temples Overview</TabsTrigger>
          </TabsList>

          {/* Temple Parking Tab */}
          <TabsContent value="temple">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Card */}
                {summary && (
                  <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{summary.totalLots}</div>
                          <div className="text-white/80 text-sm">Parking Lots</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{summary.totalSpots}</div>
                          <div className="text-white/80 text-sm">Total Spots</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-300">{summary.availableSpots}</div>
                          <div className="text-white/80 text-sm">Available</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold">{summary.occupancyPercentage}%</div>
                          <div className="text-white/80 text-sm">Occupancy</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Best Recommendation */}
                {bestParking && (
                  <Card className="border-2 border-green-500 bg-green-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          <CardTitle className="text-green-700">Recommended Parking</CardTitle>
                        </div>
                        <Badge className="bg-green-500">Best Match</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{bestParking.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {bestParking.distanceFromTemple}m from temple
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              ~{bestParking.estimatedWalkTime} min walk
                            </span>
                            <span>₹{bestParking.pricePerHour}/hr</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {bestParking.availableSpots} spots
                          </div>
                          <div className="text-sm text-gray-500">available</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {bestParking.amenities.slice(0, 4).map((amenity: string, i: number) => (
                          <Badge key={i} variant="outline" className="flex items-center gap-1">
                            {getAmenityIcon(amenity)}
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <Button className="mt-4 bg-green-500 hover:bg-green-600">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate to Parking
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* All Lots */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">All Parking Lots</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filterLotsByVehicle(lots).map(lot => {
                      const available = lot.totalSpots - lot.occupiedSpots;
                      const occupancy = Math.round((lot.occupiedSpots / lot.totalSpots) * 100);
                      
                      return (
                        <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getVehicleIcon(lot.type)}
                                <CardTitle className="text-base">{lot.name}</CardTitle>
                              </div>
                              {getStatusBadge(occupancy)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Occupancy Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Occupancy</span>
                                <span className={cn("font-medium", getOccupancyColor(occupancy))}>
                                  {occupancy}%
                                </span>
                              </div>
                              <Progress 
                                value={occupancy} 
                                className={cn(
                                  "h-2",
                                  occupancy >= 90 && "[&>div]:bg-red-500",
                                  occupancy >= 70 && occupancy < 90 && "[&>div]:bg-orange-500",
                                  occupancy >= 50 && occupancy < 70 && "[&>div]:bg-yellow-500",
                                  occupancy < 50 && "[&>div]:bg-green-500"
                                )}
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{lot.occupiedSpots} occupied</span>
                                <span>{available} available</span>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="w-3 h-3" />
                                {lot.distanceFromTemple}m
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3 h-3" />
                                {lot.openTime} - {lot.closeTime}
                              </div>
                              <div className="col-span-2 font-medium text-blue-600">
                                ₹{lot.pricePerHour}/hour
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {lot.isShaded && (
                                <Badge variant="outline" className="text-xs">Shaded</Badge>
                              )}
                              {lot.hasElectricCharging && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  EV Charging
                                </Badge>
                              )}
                              {lot.amenities.slice(0, 2).map((a, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                              ))}
                            </div>

                            {/* Action */}
                            <Button variant="outline" className="w-full mt-4" size="sm">
                              <Navigation className="w-4 h-4 mr-2" />
                              Get Directions
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {filterLotsByVehicle(lots).length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No parking lots available for {vehicleType === "two-wheeler" ? "two-wheelers" : vehicleType + "s"} at this temple.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-4">
              {allSummaries.map((templeSummary: any) => {
                const temple = temples.find(t => t.id === templeSummary.templeId);
                
                return (
                  <Card 
                    key={templeSummary.templeId}
                    className={cn(
                      "cursor-pointer hover:shadow-lg transition-all",
                      selectedTemple === templeSummary.templeId && "ring-2 ring-blue-500"
                    )}
                    onClick={() => setSelectedTemple(templeSummary.templeId)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{temple?.name || templeSummary.templeId}</CardTitle>
                        {getStatusBadge(templeSummary.occupancyPercentage)}
                      </div>
                      <CardDescription>{temple?.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Occupancy Bar */}
                      <div className="mb-4">
                        <Progress 
                          value={templeSummary.occupancyPercentage}
                          className={cn(
                            "h-3",
                            templeSummary.occupancyPercentage >= 90 && "[&>div]:bg-red-500",
                            templeSummary.occupancyPercentage >= 70 && templeSummary.occupancyPercentage < 90 && "[&>div]:bg-orange-500",
                            templeSummary.occupancyPercentage >= 50 && templeSummary.occupancyPercentage < 70 && "[&>div]:bg-yellow-500",
                            templeSummary.occupancyPercentage < 50 && "[&>div]:bg-green-500"
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{templeSummary.totalLots}</div>
                          <div className="text-xs text-gray-500">Lots</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {templeSummary.availableSpots}
                          </div>
                          <div className="text-xs text-gray-500">Available</div>
                        </div>
                        <div>
                          <div className={cn(
                            "text-2xl font-bold",
                            getOccupancyColor(templeSummary.occupancyPercentage)
                          )}>
                            {templeSummary.occupancyPercentage}%
                          </div>
                          <div className="text-xs text-gray-500">Full</div>
                        </div>
                      </div>

                      {templeSummary.bestLot && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-700">
                            <span className="font-medium">Best option:</span> {templeSummary.bestLot.name}
                            <span className="text-green-600 ml-2">
                              ({templeSummary.bestLot.totalSpots - templeSummary.bestLot.occupiedSpots} spots)
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
