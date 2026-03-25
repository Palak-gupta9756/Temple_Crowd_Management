import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ParkingCircle, Plus, Edit, Trash2, Car, Bike, Bus, Zap, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  openTime: string;
  closeTime: string;
}

interface ParkingReservation {
  id: string;
  lotId: string;
  templeId: string;
  vehicleNumber: string;
  vehicleType: string;
  userId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const lotTypes = [
  { value: "two-wheeler", label: "Two Wheeler", icon: Bike },
  { value: "car", label: "Car", icon: Car },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "mixed", label: "Mixed", icon: ParkingCircle }
];

const amenityOptions = [
  "Restrooms", "Drinking Water", "Security Guard", "CCTV", 
  "Covered Parking", "Beach Access", "Bus Stand", "Wheelchair Ramp"
];

export default function AdminParking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [activeTab, setActiveTab] = useState<string>("lots");
  const [lotDialog, setLotDialog] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);

  // Lot form state
  const [lotForm, setLotForm] = useState<Partial<ParkingLot>>({
    name: "", type: "mixed", totalSpots: 100, occupiedSpots: 0,
    pricePerHour: 20, distanceFromTemple: 200, isShaded: false,
    hasElectricCharging: false, amenities: [], openTime: "05:00", closeTime: "22:00"
  });

  const { data: parkingData, isLoading } = useQuery({
    queryKey: ["/api/v2/parking", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v2/parking/${selectedTemple}`);
      if (!res.ok) return { lots: [], reservations: [] };
      const data = await res.json();
      return { lots: data.data || [], reservations: [] };
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["/api/v2/parking/reservations", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v2/parking/reservations?templeId=${selectedTemple}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const saveLotMutation = useMutation({
    mutationFn: async (lot: Partial<ParkingLot>) => {
      const method = selectedLot ? "PUT" : "POST";
      const url = selectedLot 
        ? `/api/v2/admin/parking/${selectedLot.id}`
        : `/api/v2/admin/parking`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lot, templeId: selectedTemple }),
      });
      if (!res.ok) throw new Error("Failed to save parking lot");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/parking", selectedTemple] });
      toast({ title: "Success", description: "Parking lot saved successfully" });
      setLotDialog(false);
      resetLotForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save parking lot", variant: "destructive" });
    },
  });

  const deleteLotMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v2/admin/parking/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/parking", selectedTemple] });
      toast({ title: "Success", description: "Parking lot deleted" });
    },
  });

  const updateOccupancyMutation = useMutation({
    mutationFn: async ({ id, occupied }: { id: string; occupied: number }) => {
      const res = await fetch(`/api/v2/admin/parking/${id}/occupancy`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupiedSpots: occupied }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/parking", selectedTemple] });
      toast({ title: "Success", description: "Occupancy updated" });
    },
  });

  const resetLotForm = () => {
    setLotForm({
      name: "", type: "mixed", totalSpots: 100, occupiedSpots: 0,
      pricePerHour: 20, distanceFromTemple: 200, isShaded: false,
      hasElectricCharging: false, amenities: [], openTime: "05:00", closeTime: "22:00"
    });
    setSelectedLot(null);
  };

  const openLotDialog = (lot?: ParkingLot) => {
    if (lot) {
      setSelectedLot(lot);
      setLotForm(lot);
    } else {
      resetLotForm();
    }
    setLotDialog(true);
  };

  const getTypeIcon = (type: string) => {
    const typeObj = lotTypes.find(t => t.value === type);
    const Icon = typeObj?.icon || ParkingCircle;
    return <Icon className="h-4 w-4" />;
  };

  const getOccupancyColor = (occupied: number, total: number) => {
    const pct = (occupied / total) * 100;
    if (pct >= 90) return "text-red-600 bg-red-100";
    if (pct >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const lots = parkingData?.lots || [];

  // Calculate stats
  const totalSpots = lots.reduce((sum: number, lot: ParkingLot) => sum + lot.totalSpots, 0);
  const occupiedSpots = lots.reduce((sum: number, lot: ParkingLot) => sum + lot.occupiedSpots, 0);
  const availableSpots = totalSpots - occupiedSpots;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parking Management</h1>
            <p className="text-gray-500">Manage parking lots and monitor occupancy</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Lots</p>
                  <p className="text-2xl font-bold">{lots.length}</p>
                </div>
                <ParkingCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Spots</p>
                  <p className="text-2xl font-bold">{totalSpots}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Occupied</p>
                  <p className="text-2xl font-bold text-red-600">{occupiedSpots}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">
                    {totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">{availableSpots}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">
                    {totalSpots > 0 ? Math.round((availableSpots / totalSpots) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="lots">Parking Lots</TabsTrigger>
            <TabsTrigger value="reservations">Reservations ({reservations.length})</TabsTrigger>
          </TabsList>

          {/* Lots Tab */}
          <TabsContent value="lots">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ParkingCircle className="h-5 w-5 text-orange-600" />
                  Parking Lots
                </CardTitle>
                <Button onClick={() => openLotDialog()} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lot
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : lots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No parking lots configured</p>
                ) : (
                  <div className="space-y-4">
                    {lots.map((lot: ParkingLot) => (
                      <Card key={lot.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(lot.type)}
                                <h3 className="font-semibold">{lot.name}</h3>
                                <Badge variant="outline">{lot.type}</Badge>
                                {lot.hasElectricCharging && (
                                  <Badge className="bg-green-100 text-green-700">
                                    <Zap className="h-3 w-3 mr-1" />
                                    EV
                                  </Badge>
                                )}
                                {lot.isShaded && (
                                  <Badge variant="outline">Shaded</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {lot.distanceFromTemple}m from temple
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {lot.openTime} - {lot.closeTime}
                                </span>
                                <span>₹{lot.pricePerHour}/hr</span>
                              </div>

                              {/* Occupancy Bar */}
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span>Occupancy</span>
                                  <span className={getOccupancyColor(lot.occupiedSpots, lot.totalSpots).split(" ")[0]}>
                                    {lot.occupiedSpots}/{lot.totalSpots} 
                                    ({Math.round((lot.occupiedSpots / lot.totalSpots) * 100)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      (lot.occupiedSpots / lot.totalSpots) >= 0.9 ? 'bg-red-500' :
                                      (lot.occupiedSpots / lot.totalSpots) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(lot.occupiedSpots / lot.totalSpots) * 100}%` }}
                                  />
                                </div>
                              </div>

                              {lot.amenities && lot.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {lot.amenities.map(amenity => (
                                    <Badge key={amenity} variant="outline" className="text-xs">{amenity}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2 ml-4">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => openLotDialog(lot)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm("Delete this parking lot?")) {
                                      deleteLotMutation.mutate(lot.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {/* Quick occupancy update */}
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={lot.occupiedSpots <= 0}
                                  onClick={() => updateOccupancyMutation.mutate({ 
                                    id: lot.id, 
                                    occupied: Math.max(0, lot.occupiedSpots - 10) 
                                  })}
                                >
                                  -10
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={lot.occupiedSpots >= lot.totalSpots}
                                  onClick={() => updateOccupancyMutation.mutate({ 
                                    id: lot.id, 
                                    occupied: Math.min(lot.totalSpots, lot.occupiedSpots + 10) 
                                  })}
                                >
                                  +10
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Parking Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reservations found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vehicle</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lot</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res: ParkingReservation) => (
                          <tr key={res.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-mono">{res.id.slice(-8)}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{res.vehicleNumber}</p>
                                <p className="text-xs text-gray-500">{res.vehicleType}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm">{res.lotId}</td>
                            <td className="py-3 px-4 text-sm">{res.bookingDate}</td>
                            <td className="py-3 px-4 text-sm">{res.startTime} - {res.endTime}</td>
                            <td className="py-3 px-4 text-sm font-medium">₹{res.totalAmount}</td>
                            <td className="py-3 px-4">
                              <Badge className={
                                res.status === "active" ? "bg-green-100 text-green-700" :
                                res.status === "completed" ? "bg-gray-100 text-gray-700" :
                                res.status === "reserved" ? "bg-blue-100 text-blue-700" :
                                "bg-red-100 text-red-700"
                              }>
                                {res.status}
                              </Badge>
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
        </Tabs>

        {/* Lot Edit Dialog */}
        <Dialog open={lotDialog} onOpenChange={setLotDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedLot ? "Edit Parking Lot" : "Add New Parking Lot"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Lot Name *</Label>
                <Input 
                  value={lotForm.name || ""} 
                  onChange={e => setLotForm({...lotForm, name: e.target.value})}
                  placeholder="e.g., Main Temple Parking"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lot Type *</Label>
                  <Select 
                    value={lotForm.type || "mixed"} 
                    onValueChange={(v: ParkingLot["type"]) => setLotForm({...lotForm, type: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lotTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Spots</Label>
                  <Input 
                    type="number" 
                    value={lotForm.totalSpots || 100} 
                    onChange={e => setLotForm({...lotForm, totalSpots: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price per Hour (₹)</Label>
                  <Input 
                    type="number" 
                    value={lotForm.pricePerHour || 20} 
                    onChange={e => setLotForm({...lotForm, pricePerHour: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Distance from Temple (m)</Label>
                  <Input 
                    type="number" 
                    value={lotForm.distanceFromTemple || 200} 
                    onChange={e => setLotForm({...lotForm, distanceFromTemple: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Open Time</Label>
                  <Input 
                    type="time" 
                    value={lotForm.openTime || "05:00"} 
                    onChange={e => setLotForm({...lotForm, openTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Close Time</Label>
                  <Input 
                    type="time" 
                    value={lotForm.closeTime || "22:00"} 
                    onChange={e => setLotForm({...lotForm, closeTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={lotForm.isShaded || false}
                    onCheckedChange={v => setLotForm({...lotForm, isShaded: v})}
                  />
                  <Label>Shaded Parking</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={lotForm.hasElectricCharging || false}
                    onCheckedChange={v => setLotForm({...lotForm, hasElectricCharging: v})}
                  />
                  <Label>EV Charging</Label>
                </div>
              </div>

              <div>
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {amenityOptions.map(amenity => (
                    <Button
                      key={amenity}
                      type="button"
                      size="sm"
                      variant={lotForm.amenities?.includes(amenity) ? "default" : "outline"}
                      onClick={() => {
                        const current = lotForm.amenities || [];
                        if (current.includes(amenity)) {
                          setLotForm({...lotForm, amenities: current.filter(a => a !== amenity)});
                        } else {
                          setLotForm({...lotForm, amenities: [...current, amenity]});
                        }
                      }}
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLotDialog(false)}>Cancel</Button>
              <Button onClick={() => saveLotMutation.mutate(lotForm)} disabled={saveLotMutation.isPending}>
                {saveLotMutation.isPending ? "Saving..." : "Save Lot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
