import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Map, Plus, Edit, Trash2, MapPin, Clock, Accessibility } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TempleZone {
  id: string;
  name: string;
  nameHindi: string;
  type: "entrance" | "queue" | "sanctum" | "exit" | "prasad" | "amenity" | "attraction";
  coordinates: { x: number; y: number };
  capacity: number;
  avgTimeMinutes: number;
  isAccessible: boolean;
  description: string;
}

interface TempleRoute {
  id: string;
  name: string;
  type: "standard" | "vip" | "accessible" | "express";
  zones: string[];
  estimatedMinutes: number;
  description: string;
  restrictions?: string[];
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const zoneTypes = [
  { value: "entrance", label: "Entrance" },
  { value: "queue", label: "Queue Area" },
  { value: "sanctum", label: "Sanctum" },
  { value: "exit", label: "Exit" },
  { value: "prasad", label: "Prasad Counter" },
  { value: "amenity", label: "Amenity" },
  { value: "attraction", label: "Attraction" }
];

const routeTypes = [
  { value: "standard", label: "Standard", color: "bg-blue-100 text-blue-700" },
  { value: "vip", label: "VIP", color: "bg-purple-100 text-purple-700" },
  { value: "accessible", label: "Accessible", color: "bg-green-100 text-green-700" },
  { value: "express", label: "Express", color: "bg-orange-100 text-orange-700" }
];

export default function AdminRoutes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [activeTab, setActiveTab] = useState<string>("zones");
  const [zoneDialog, setZoneDialog] = useState(false);
  const [routeDialog, setRouteDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<TempleZone | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<TempleRoute | null>(null);

  // Zone form state
  const [zoneForm, setZoneForm] = useState<Partial<TempleZone>>({
    name: "", nameHindi: "", type: "entrance", capacity: 100,
    avgTimeMinutes: 10, isAccessible: true, description: "",
    coordinates: { x: 50, y: 50 }
  });

  // Route form state
  const [routeForm, setRouteForm] = useState<Partial<TempleRoute>>({
    name: "", type: "standard", zones: [], estimatedMinutes: 30,
    description: "", restrictions: []
  });

  const { data: mapData, isLoading } = useQuery({
    queryKey: ["/api/v2/routes", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v2/routes/${selectedTemple}`);
      if (!res.ok) return { zones: [], routes: [], tips: [] };
      const data = await res.json();
      return data.data || { zones: [], routes: [], tips: [] };
    },
  });

  const saveZoneMutation = useMutation({
    mutationFn: async (zone: Partial<TempleZone>) => {
      const method = selectedZone ? "PUT" : "POST";
      const url = selectedZone 
        ? `/api/v2/admin/routes/${selectedTemple}/zones/${selectedZone.id}`
        : `/api/v2/admin/routes/${selectedTemple}/zones`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zone),
      });
      if (!res.ok) throw new Error("Failed to save zone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/routes", selectedTemple] });
      toast({ title: "Success", description: "Zone saved successfully" });
      setZoneDialog(false);
      resetZoneForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save zone", variant: "destructive" });
    },
  });

  const saveRouteMutation = useMutation({
    mutationFn: async (route: Partial<TempleRoute>) => {
      const method = selectedRoute ? "PUT" : "POST";
      const url = selectedRoute 
        ? `/api/v2/admin/routes/${selectedTemple}/routes/${selectedRoute.id}`
        : `/api/v2/admin/routes/${selectedTemple}/routes`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(route),
      });
      if (!res.ok) throw new Error("Failed to save route");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/routes", selectedTemple] });
      toast({ title: "Success", description: "Route saved successfully" });
      setRouteDialog(false);
      resetRouteForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save route", variant: "destructive" });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v2/admin/routes/${selectedTemple}/zones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/routes", selectedTemple] });
      toast({ title: "Success", description: "Zone deleted" });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v2/admin/routes/${selectedTemple}/routes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/routes", selectedTemple] });
      toast({ title: "Success", description: "Route deleted" });
    },
  });

  const resetZoneForm = () => {
    setZoneForm({
      name: "", nameHindi: "", type: "entrance", capacity: 100,
      avgTimeMinutes: 10, isAccessible: true, description: "",
      coordinates: { x: 50, y: 50 }
    });
    setSelectedZone(null);
  };

  const resetRouteForm = () => {
    setRouteForm({
      name: "", type: "standard", zones: [], estimatedMinutes: 30,
      description: "", restrictions: []
    });
    setSelectedRoute(null);
  };

  const openZoneDialog = (zone?: TempleZone) => {
    if (zone) {
      setSelectedZone(zone);
      setZoneForm(zone);
    } else {
      resetZoneForm();
    }
    setZoneDialog(true);
  };

  const openRouteDialog = (route?: TempleRoute) => {
    if (route) {
      setSelectedRoute(route);
      setRouteForm(route);
    } else {
      resetRouteForm();
    }
    setRouteDialog(true);
  };

  const getZoneTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      entrance: "bg-green-100 text-green-700",
      queue: "bg-yellow-100 text-yellow-700",
      sanctum: "bg-purple-100 text-purple-700",
      exit: "bg-blue-100 text-blue-700",
      prasad: "bg-orange-100 text-orange-700",
      amenity: "bg-gray-100 text-gray-700",
      attraction: "bg-pink-100 text-pink-700"
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  const zones = mapData?.zones || [];
  const routes = mapData?.routes || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Routes & Zones Management</h1>
            <p className="text-gray-500">Configure temple zones and pilgrimage routes</p>
          </div>
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Temple" />
            </SelectTrigger>
            <SelectContent>
              {temples.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="zones">Zones ({zones.length})</TabsTrigger>
            <TabsTrigger value="routes">Routes ({routes.length})</TabsTrigger>
          </TabsList>

          {/* Zones Tab */}
          <TabsContent value="zones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Temple Zones
                </CardTitle>
                <Button onClick={() => openZoneDialog()} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : zones.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No zones configured for this temple</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Zone Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Capacity</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Avg Time</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Accessible</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zones.map((zone: TempleZone) => (
                          <tr key={zone.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{zone.name}</p>
                                <p className="text-sm text-gray-500">{zone.nameHindi}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">{getZoneTypeBadge(zone.type)}</td>
                            <td className="py-3 px-4 text-sm">{zone.capacity} people</td>
                            <td className="py-3 px-4 text-sm flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {zone.avgTimeMinutes} min
                            </td>
                            <td className="py-3 px-4">
                              {zone.isAccessible ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <Accessibility className="h-3 w-3 mr-1" />
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => openZoneDialog(zone)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm("Delete this zone?")) {
                                      deleteZoneMutation.mutate(zone.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-orange-600" />
                  Pilgrimage Routes
                </CardTitle>
                <Button onClick={() => openRouteDialog()} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : routes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No routes configured for this temple</p>
                ) : (
                  <div className="space-y-4">
                    {routes.map((route: TempleRoute) => {
                      const routeType = routeTypes.find(t => t.value === route.type);
                      return (
                        <Card key={route.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{route.name}</h3>
                                  <Badge className={routeType?.color || ""}>{routeType?.label}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{route.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {route.estimatedMinutes} min
                                  </span>
                                  <span>{route.zones?.length || 0} zones</span>
                                </div>
                                {route.zones && route.zones.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {route.zones.map((zoneId, idx) => {
                                      const zone = zones.find((z: TempleZone) => z.id === zoneId);
                                      return (
                                        <Badge key={zoneId} variant="outline" className="text-xs">
                                          {idx + 1}. {zone?.name || zoneId}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => openRouteDialog(route)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm("Delete this route?")) {
                                      deleteRouteMutation.mutate(route.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Zone Edit Dialog */}
        <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedZone ? "Edit Zone" : "Add New Zone"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zone Name (English) *</Label>
                  <Input 
                    value={zoneForm.name || ""} 
                    onChange={e => setZoneForm({...zoneForm, name: e.target.value})}
                    placeholder="e.g., Main Gate"
                  />
                </div>
                <div>
                  <Label>Zone Name (Hindi)</Label>
                  <Input 
                    value={zoneForm.nameHindi || ""} 
                    onChange={e => setZoneForm({...zoneForm, nameHindi: e.target.value})}
                    placeholder="e.g., मुख्य द्वार"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zone Type *</Label>
                  <Select 
                    value={zoneForm.type || "entrance"} 
                    onValueChange={(v: TempleZone["type"]) => setZoneForm({...zoneForm, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {zoneTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input 
                    type="number" 
                    value={zoneForm.capacity || 100} 
                    onChange={e => setZoneForm({...zoneForm, capacity: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Avg Time (minutes)</Label>
                  <Input 
                    type="number" 
                    value={zoneForm.avgTimeMinutes || 10} 
                    onChange={e => setZoneForm({...zoneForm, avgTimeMinutes: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch 
                    checked={zoneForm.isAccessible || false}
                    onCheckedChange={v => setZoneForm({...zoneForm, isAccessible: v})}
                  />
                  <Label>Wheelchair Accessible</Label>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={zoneForm.description || ""} 
                  onChange={e => setZoneForm({...zoneForm, description: e.target.value})}
                  placeholder="Brief description of the zone..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setZoneDialog(false)}>Cancel</Button>
              <Button onClick={() => saveZoneMutation.mutate(zoneForm)} disabled={saveZoneMutation.isPending}>
                {saveZoneMutation.isPending ? "Saving..." : "Save Zone"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Route Edit Dialog */}
        <Dialog open={routeDialog} onOpenChange={setRouteDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Route Name *</Label>
                <Input 
                  value={routeForm.name || ""} 
                  onChange={e => setRouteForm({...routeForm, name: e.target.value})}
                  placeholder="e.g., Standard Darshan Route"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Route Type *</Label>
                  <Select 
                    value={routeForm.type || "standard"} 
                    onValueChange={(v: TempleRoute["type"]) => setRouteForm({...routeForm, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routeTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Est. Time (minutes)</Label>
                  <Input 
                    type="number" 
                    value={routeForm.estimatedMinutes || 30} 
                    onChange={e => setRouteForm({...routeForm, estimatedMinutes: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>Select Zones (in order)</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg bg-gray-50 min-h-[60px]">
                  {zones.length === 0 ? (
                    <p className="text-sm text-gray-500">No zones available. Create zones first.</p>
                  ) : (
                    zones.map((zone: TempleZone) => {
                      const isSelected = routeForm.zones?.includes(zone.id);
                      const index = routeForm.zones?.indexOf(zone.id);
                      return (
                        <Button
                          key={zone.id}
                          type="button"
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => {
                            const currentZones = routeForm.zones || [];
                            if (isSelected) {
                              setRouteForm({...routeForm, zones: currentZones.filter(id => id !== zone.id)});
                            } else {
                              setRouteForm({...routeForm, zones: [...currentZones, zone.id]});
                            }
                          }}
                        >
                          {isSelected && <span className="mr-1">{(index ?? 0) + 1}.</span>}
                          {zone.name}
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={routeForm.description || ""} 
                  onChange={e => setRouteForm({...routeForm, description: e.target.value})}
                  placeholder="Brief description of the route..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRouteDialog(false)}>Cancel</Button>
              <Button onClick={() => saveRouteMutation.mutate(routeForm)} disabled={saveRouteMutation.isPending}>
                {saveRouteMutation.isPending ? "Saving..." : "Save Route"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
