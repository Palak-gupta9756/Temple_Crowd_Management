import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Map, Navigation, Clock, Users, Accessibility, Crown, Zap, 
  MapPin, AlertTriangle, Lightbulb, ArrowRight, Circle, ChevronRight
} from "lucide-react";
import { temples } from "@/data/temples";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Zone {
  id: string;
  name: string;
  nameHindi: string;
  type: string;
  coordinates: { x: number; y: number };
  capacity: number;
  avgTimeMinutes: number;
  isAccessible: boolean;
  description: string;
}

interface Route {
  id: string;
  name: string;
  type: "standard" | "vip" | "accessible" | "express";
  zones: string[];
  estimatedMinutes: number;
  description: string;
  restrictions?: string[];
  zoneDetails?: Zone[];
}

interface TempleMapData {
  templeId: string;
  templeName: string;
  zones: Zone[];
  routes: Route[];
  tips: string[];
}

export default function TempleRoutes() {
  const { t } = useTranslation();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [isAccessible, setIsAccessible] = useState(false);
  const [hasTime, setHasTime] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Fetch temple map data
  const { data: mapData, isLoading } = useQuery({
    queryKey: ["templeMap", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v2/routes/${selectedTemple}/map`);
      if (!res.ok) throw new Error("Failed to fetch map data");
      return res.json();
    },
  });

  // Fetch optimal route based on preferences
  const { data: optimalRouteData } = useQuery({
    queryKey: ["optimalRoute", selectedTemple, isAccessible, hasTime, isVip],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isAccessible) params.set("accessible", "true");
      if (!hasTime) params.set("hasTime", "false");
      if (isVip) params.set("isVip", "true");
      
      const res = await fetch(`/api/v2/routes/${selectedTemple}/optimal?${params}`);
      if (!res.ok) throw new Error("Failed to fetch optimal route");
      return res.json();
    },
  });

  const templeData: TempleMapData | null = mapData?.data;
  const optimalRoute: Route | null = optimalRouteData?.route;

  const getZoneTypeIcon = (type: string) => {
    switch (type) {
      case "entrance": return <MapPin className="w-4 h-4 text-green-500" />;
      case "queue": return <Users className="w-4 h-4 text-orange-500" />;
      case "sanctum": return <Circle className="w-4 h-4 text-red-500 fill-red-500" />;
      case "exit": return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case "prasad": return <Circle className="w-4 h-4 text-yellow-500" />;
      case "amenity": return <Circle className="w-4 h-4 text-gray-500" />;
      case "attraction": return <Circle className="w-4 h-4 text-purple-500" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case "standard": return <Navigation className="w-5 h-5 text-blue-500" />;
      case "vip": return <Crown className="w-5 h-5 text-yellow-500" />;
      case "accessible": return <Accessibility className="w-5 h-5 text-green-500" />;
      case "express": return <Zap className="w-5 h-5 text-orange-500" />;
      default: return <Navigation className="w-5 h-5" />;
    }
  };

  const getRouteTypeBadge = (type: string) => {
    switch (type) {
      case "standard": return <Badge className="bg-blue-500">Standard</Badge>;
      case "vip": return <Badge className="bg-yellow-500 text-black">VIP</Badge>;
      case "accessible": return <Badge className="bg-green-500">Accessible</Badge>;
      case "express": return <Badge className="bg-orange-500">Express</Badge>;
      default: return <Badge>{type}</Badge>;
    }
  };

  const getZoneById = (zoneId: string): Zone | undefined => {
    return templeData?.zones.find(z => z.id === zoneId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
            <Map className="w-10 h-10" />
            {t("routes.title")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("routes.subtitle")}
          </p>
        </div>

        {/* Temple Selector */}
        <div className="flex justify-center mb-8">
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectTemple")} />
            </SelectTrigger>
            <SelectContent>
              {temples.map(temple => (
                <SelectItem key={temple.id} value={temple.id}>{temple.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preferences */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Your Preferences</CardTitle>
            <CardDescription>Customize your route based on your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="accessible" className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  Wheelchair / Elderly
                </Label>
                <Switch
                  id="accessible"
                  checked={isAccessible}
                  onCheckedChange={setIsAccessible}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="hasTime" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Have Time for Full Tour
                </Label>
                <Switch
                  id="hasTime"
                  checked={hasTime}
                  onCheckedChange={setHasTime}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="vip" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  VIP Pass Holder
                </Label>
                <Switch
                  id="vip"
                  checked={isVip}
                  onCheckedChange={setIsVip}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
          </div>
        ) : templeData ? (
          <Tabs defaultValue="recommended" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="recommended">Recommended Route</TabsTrigger>
              <TabsTrigger value="all-routes">All Routes</TabsTrigger>
              <TabsTrigger value="zones">Temple Zones</TabsTrigger>
            </TabsList>

            {/* Recommended Route Tab */}
            <TabsContent value="recommended">
              {optimalRoute ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Route Details */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getRouteTypeIcon(optimalRoute.type)}
                            <div>
                              <CardTitle className="text-white">{optimalRoute.name}</CardTitle>
                              <CardDescription className="text-white/80">
                                Recommended for your preferences
                              </CardDescription>
                            </div>
                          </div>
                          {getRouteTypeBadge(optimalRoute.type)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{optimalRoute.estimatedMinutes} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{optimalRoute.zones.length} stops</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-6">{optimalRoute.description}</p>

                        {/* Route Steps */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Route Steps</h4>
                          <div className="relative">
                            {optimalRoute.zones.map((zoneId, idx) => {
                              const zone = getZoneById(zoneId);
                              if (!zone) return null;
                              
                              return (
                                <div key={zoneId} className="flex items-start gap-4 pb-6 relative">
                                  {/* Vertical Line */}
                                  {idx < optimalRoute.zones.length - 1 && (
                                    <div className="absolute left-[14px] top-8 h-full w-0.5 bg-gray-200"></div>
                                  )}
                                  
                                  {/* Step Number */}
                                  <div className={cn(
                                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium z-10",
                                    zone.type === "sanctum" ? "bg-red-500 text-white" :
                                    zone.type === "entrance" ? "bg-green-500 text-white" :
                                    zone.type === "exit" ? "bg-blue-500 text-white" :
                                    "bg-gray-200 text-gray-600"
                                  )}>
                                    {idx + 1}
                                  </div>
                                  
                                  {/* Zone Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{zone.name}</span>
                                      <span className="text-sm text-orange-600">({zone.nameHindi})</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{zone.description}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                      <span>~{zone.avgTimeMinutes} min</span>
                                      {zone.isAccessible && (
                                        <Badge variant="outline" className="text-xs">
                                          <Accessibility className="w-3 h-3 mr-1" />
                                          Accessible
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Restrictions */}
                        {optimalRoute.restrictions && optimalRoute.restrictions.length > 0 && (
                          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-700 mb-2">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="font-medium">Important Notes</span>
                            </div>
                            <ul className="text-sm text-yellow-600 space-y-1">
                              {optimalRoute.restrictions.map((r, i) => (
                                <li key={i}>• {r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tips Sidebar */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Temple Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {templeData.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">No optimal route found. Try adjusting your preferences.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* All Routes Tab */}
            <TabsContent value="all-routes">
              <div className="grid md:grid-cols-2 gap-4">
                {templeData.routes.map(route => (
                  <Card 
                    key={route.id} 
                    className={cn(
                      "cursor-pointer hover:shadow-lg transition-all",
                      selectedRoute?.id === route.id && "ring-2 ring-green-500"
                    )}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getRouteTypeIcon(route.type)}
                          <div>
                            <CardTitle className="text-lg">{route.name}</CardTitle>
                          </div>
                        </div>
                        {getRouteTypeBadge(route.type)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{route.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {route.estimatedMinutes} min
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {route.zones.length} stops
                        </div>
                      </div>
                      
                      {/* Route Preview */}
                      <div className="mt-4 flex flex-wrap gap-1">
                        {route.zones.slice(0, 5).map((zoneId, idx) => {
                          const zone = getZoneById(zoneId);
                          return (
                            <Badge 
                              key={zoneId} 
                              variant="outline" 
                              className="text-xs"
                            >
                              {zone?.name.split(" ")[0] || zoneId}
                              {idx < Math.min(route.zones.length - 1, 4) && 
                                <ArrowRight className="w-3 h-3 ml-1" />
                              }
                            </Badge>
                          );
                        })}
                        {route.zones.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{route.zones.length - 5} more
                          </Badge>
                        )}
                      </div>

                      {route.restrictions && route.restrictions.length > 0 && (
                        <div className="mt-3 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {route.restrictions[0]}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Zones Tab */}
            <TabsContent value="zones">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Zone Legend */}
                <Card className="md:col-span-2 lg:col-span-3 mb-4">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 justify-center">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-500" /> Entrance
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-orange-500" /> Queue Area
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Circle className="w-4 h-4 text-red-500 fill-red-500" /> Sanctum
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="w-4 h-4 text-blue-500" /> Exit
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Circle className="w-4 h-4 text-yellow-500" /> Prasad
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Circle className="w-4 h-4 text-purple-500" /> Attraction
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {templeData.zones.map(zone => (
                  <Card key={zone.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getZoneTypeIcon(zone.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{zone.name}</h4>
                          <p className="text-sm text-orange-600">{zone.nameHindi}</p>
                          <p className="text-sm text-gray-500 mt-1">{zone.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              ~{zone.avgTimeMinutes} min
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Cap: {zone.capacity}
                            </Badge>
                            {zone.isAccessible && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                <Accessibility className="w-3 h-3 mr-1" />
                                Accessible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Select a temple to view route information</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
