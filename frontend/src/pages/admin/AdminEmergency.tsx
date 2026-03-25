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
import { 
  Siren, Plus, Edit, Trash2, Phone, MapPin, Users, Clock,
  Heart, Shield, Flame, Building2, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FirstAidStation {
  id: string;
  templeId: string;
  name: string;
  location: string;
  facilities: string[];
  staffCount: number;
  isOpen24Hours: boolean;
  openTime?: string;
  closeTime?: string;
  contactNumber: string;
}

interface EmergencyContact {
  id: string;
  templeId: string;
  type: "ambulance" | "police" | "fire" | "temple-security" | "control-room" | "hospital";
  name: string;
  number: string;
  isEmergency: boolean;
  responseTime?: string;
}

interface SafeZone {
  id: string;
  templeId: string;
  name: string;
  type: "assembly-point" | "shelter" | "evacuation-route";
  location: string;
  capacity: number;
  description: string;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const contactTypes = [
  { value: "ambulance", label: "Ambulance", icon: Heart, color: "bg-red-100 text-red-700" },
  { value: "police", label: "Police", icon: Shield, color: "bg-blue-100 text-blue-700" },
  { value: "fire", label: "Fire", icon: Flame, color: "bg-orange-100 text-orange-700" },
  { value: "temple-security", label: "Temple Security", icon: Users, color: "bg-purple-100 text-purple-700" },
  { value: "control-room", label: "Control Room", icon: Building2, color: "bg-gray-100 text-gray-700" },
  { value: "hospital", label: "Hospital", icon: Heart, color: "bg-green-100 text-green-700" }
];

const safeZoneTypes = [
  { value: "assembly-point", label: "Assembly Point" },
  { value: "shelter", label: "Shelter" },
  { value: "evacuation-route", label: "Evacuation Route" }
];

const facilityOptions = [
  "Oxygen Cylinder", "Stretcher", "Wheelchair", "Basic Medicines", 
  "BP Monitor", "Glucose", "First Aid Kit", "AED", "Nebulizer"
];

export default function AdminEmergency() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [activeTab, setActiveTab] = useState<string>("stations");
  
  // Dialog states
  const [stationDialog, setStationDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [zoneDialog, setZoneDialog] = useState(false);
  
  const [selectedStation, setSelectedStation] = useState<FirstAidStation | null>(null);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);

  // Form states
  const [stationForm, setStationForm] = useState<Partial<FirstAidStation>>({
    name: "", location: "", facilities: [], staffCount: 2,
    isOpen24Hours: true, contactNumber: ""
  });

  const [contactForm, setContactForm] = useState<Partial<EmergencyContact>>({
    type: "ambulance", name: "", number: "", isEmergency: true, responseTime: ""
  });

  const [zoneForm, setZoneForm] = useState<Partial<SafeZone>>({
    name: "", type: "assembly-point", location: "", capacity: 100, description: ""
  });

  // Fetch data
  const { data: stationsData, isLoading: loadingStations } = useQuery({
    queryKey: ["/api/v3/emergency/first-aid", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v3/emergency/first-aid/${selectedTemple}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ["/api/v3/emergency/contacts", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v3/emergency/contacts/${selectedTemple}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: zonesData, isLoading: loadingZones } = useQuery({
    queryKey: ["/api/v3/emergency/safe-zones", selectedTemple],
    queryFn: async () => {
      const res = await fetch(`/api/v3/emergency/safe-zones/${selectedTemple}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  // Mutations
  const saveStationMutation = useMutation({
    mutationFn: async (station: Partial<FirstAidStation>) => {
      const method = selectedStation ? "PUT" : "POST";
      const url = selectedStation 
        ? `/api/v3/admin/emergency/first-aid/${selectedStation.id}`
        : `/api/v3/admin/emergency/first-aid`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...station, templeId: selectedTemple }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/first-aid", selectedTemple] });
      toast({ title: "Success", description: "First aid station saved" });
      setStationDialog(false);
      resetStationForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save station", variant: "destructive" });
    },
  });

  const saveContactMutation = useMutation({
    mutationFn: async (contact: Partial<EmergencyContact>) => {
      const method = selectedContact ? "PUT" : "POST";
      const url = selectedContact 
        ? `/api/v3/admin/emergency/contacts/${selectedContact.id}`
        : `/api/v3/admin/emergency/contacts`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, templeId: selectedTemple }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/contacts", selectedTemple] });
      toast({ title: "Success", description: "Emergency contact saved" });
      setContactDialog(false);
      resetContactForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save contact", variant: "destructive" });
    },
  });

  const saveZoneMutation = useMutation({
    mutationFn: async (zone: Partial<SafeZone>) => {
      const method = selectedZone ? "PUT" : "POST";
      const url = selectedZone 
        ? `/api/v3/admin/emergency/safe-zones/${selectedZone.id}`
        : `/api/v3/admin/emergency/safe-zones`;
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...zone, templeId: selectedTemple }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/safe-zones", selectedTemple] });
      toast({ title: "Success", description: "Safe zone saved" });
      setZoneDialog(false);
      resetZoneForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save zone", variant: "destructive" });
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v3/admin/emergency/first-aid/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/first-aid", selectedTemple] });
      toast({ title: "Success", description: "Station deleted" });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v3/admin/emergency/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/contacts", selectedTemple] });
      toast({ title: "Success", description: "Contact deleted" });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v3/admin/emergency/safe-zones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/emergency/safe-zones", selectedTemple] });
      toast({ title: "Success", description: "Safe zone deleted" });
    },
  });

  // Reset forms
  const resetStationForm = () => {
    setStationForm({ name: "", location: "", facilities: [], staffCount: 2, isOpen24Hours: true, contactNumber: "" });
    setSelectedStation(null);
  };

  const resetContactForm = () => {
    setContactForm({ type: "ambulance", name: "", number: "", isEmergency: true, responseTime: "" });
    setSelectedContact(null);
  };

  const resetZoneForm = () => {
    setZoneForm({ name: "", type: "assembly-point", location: "", capacity: 100, description: "" });
    setSelectedZone(null);
  };

  // Open dialogs
  const openStationDialog = (station?: FirstAidStation) => {
    if (station) {
      setSelectedStation(station);
      setStationForm(station);
    } else {
      resetStationForm();
    }
    setStationDialog(true);
  };

  const openContactDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setSelectedContact(contact);
      setContactForm(contact);
    } else {
      resetContactForm();
    }
    setContactDialog(true);
  };

  const openZoneDialog = (zone?: SafeZone) => {
    if (zone) {
      setSelectedZone(zone);
      setZoneForm(zone);
    } else {
      resetZoneForm();
    }
    setZoneDialog(true);
  };

  const stations = stationsData || [];
  const contacts = contactsData || [];
  const zones = zonesData || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Services</h1>
            <p className="text-gray-500">Manage first-aid stations, contacts, and safe zones</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">First Aid Stations</p>
                  <p className="text-2xl font-bold">{stations.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Emergency Contacts</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Safe Zones</p>
                  <p className="text-2xl font-bold">{zones.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="stations">First Aid Stations</TabsTrigger>
            <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="zones">Safe Zones</TabsTrigger>
          </TabsList>

          {/* Stations Tab */}
          <TabsContent value="stations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  First Aid Stations
                </CardTitle>
                <Button onClick={() => openStationDialog()} className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Station
                </Button>
              </CardHeader>
              <CardContent>
                {loadingStations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
                  </div>
                ) : stations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No first aid stations configured</p>
                ) : (
                  <div className="space-y-4">
                    {stations.map((station: FirstAidStation) => (
                      <Card key={station.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{station.name}</h3>
                                {station.isOpen24Hours ? (
                                  <Badge className="bg-green-100 text-green-700">24/7</Badge>
                                ) : (
                                  <Badge variant="outline">{station.openTime} - {station.closeTime}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {station.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {station.staffCount} staff
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {station.contactNumber}
                                </span>
                              </div>
                              {station.facilities && station.facilities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {station.facilities.map(f => (
                                    <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => openStationDialog(station)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  if (confirm("Delete this station?")) {
                                    deleteStationMutation.mutate(station.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  Emergency Contacts
                </CardTitle>
                <Button onClick={() => openContactDialog()} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </CardHeader>
              <CardContent>
                {loadingContacts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                ) : contacts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No emergency contacts configured</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Number</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Response Time</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Emergency</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact: EmergencyContact) => {
                          const typeObj = contactTypes.find(t => t.value === contact.type);
                          const Icon = typeObj?.icon || Phone;
                          return (
                            <tr key={contact.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <Badge className={typeObj?.color || ""}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {typeObj?.label}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 font-medium">{contact.name}</td>
                              <td className="py-3 px-4 font-mono">{contact.number}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {contact.responseTime || "-"}
                              </td>
                              <td className="py-3 px-4">
                                {contact.isEmergency ? (
                                  <Badge className="bg-red-100 text-red-700">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Yes
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">No</Badge>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => openContactDialog(contact)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      if (confirm("Delete this contact?")) {
                                        deleteContactMutation.mutate(contact.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safe Zones Tab */}
          <TabsContent value="zones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Safe Zones & Assembly Points
                </CardTitle>
                <Button onClick={() => openZoneDialog()} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Zone
                </Button>
              </CardHeader>
              <CardContent>
                {loadingZones ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
                  </div>
                ) : zones.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No safe zones configured</p>
                ) : (
                  <div className="space-y-4">
                    {zones.map((zone: SafeZone) => (
                      <Card key={zone.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{zone.name}</h3>
                                <Badge className={
                                  zone.type === "assembly-point" ? "bg-blue-100 text-blue-700" :
                                  zone.type === "shelter" ? "bg-green-100 text-green-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }>
                                  {zone.type.replace("-", " ")}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {zone.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  Capacity: {zone.capacity}
                                </span>
                              </div>
                              {zone.description && (
                                <p className="text-sm text-gray-600">{zone.description}</p>
                              )}
                            </div>
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
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Station Dialog */}
        <Dialog open={stationDialog} onOpenChange={setStationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedStation ? "Edit Station" : "Add First Aid Station"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Station Name *</Label>
                <Input 
                  value={stationForm.name || ""} 
                  onChange={e => setStationForm({...stationForm, name: e.target.value})}
                  placeholder="e.g., Main First Aid Center"
                />
              </div>
              <div>
                <Label>Location *</Label>
                <Input 
                  value={stationForm.location || ""} 
                  onChange={e => setStationForm({...stationForm, location: e.target.value})}
                  placeholder="e.g., Near Main Entrance Gate"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Number *</Label>
                  <Input 
                    value={stationForm.contactNumber || ""} 
                    onChange={e => setStationForm({...stationForm, contactNumber: e.target.value})}
                    placeholder="+91-XXXX-XXXXXX"
                  />
                </div>
                <div>
                  <Label>Staff Count</Label>
                  <Input 
                    type="number" 
                    value={stationForm.staffCount || 2} 
                    onChange={e => setStationForm({...stationForm, staffCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={stationForm.isOpen24Hours || false}
                    onCheckedChange={v => setStationForm({...stationForm, isOpen24Hours: v})}
                  />
                  <Label>Open 24 Hours</Label>
                </div>
              </div>
              {!stationForm.isOpen24Hours && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Open Time</Label>
                    <Input 
                      type="time" 
                      value={stationForm.openTime || "06:00"} 
                      onChange={e => setStationForm({...stationForm, openTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Close Time</Label>
                    <Input 
                      type="time" 
                      value={stationForm.closeTime || "21:00"} 
                      onChange={e => setStationForm({...stationForm, closeTime: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>Facilities</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {facilityOptions.map(facility => (
                    <Button
                      key={facility}
                      type="button"
                      size="sm"
                      variant={stationForm.facilities?.includes(facility) ? "default" : "outline"}
                      onClick={() => {
                        const current = stationForm.facilities || [];
                        if (current.includes(facility)) {
                          setStationForm({...stationForm, facilities: current.filter(f => f !== facility)});
                        } else {
                          setStationForm({...stationForm, facilities: [...current, facility]});
                        }
                      }}
                    >
                      {facility}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStationDialog(false)}>Cancel</Button>
              <Button onClick={() => saveStationMutation.mutate(stationForm)} disabled={saveStationMutation.isPending}>
                {saveStationMutation.isPending ? "Saving..." : "Save Station"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={contactDialog} onOpenChange={setContactDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedContact ? "Edit Contact" : "Add Emergency Contact"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Contact Type *</Label>
                <Select 
                  value={contactForm.type || "ambulance"} 
                  onValueChange={(v: EmergencyContact["type"]) => setContactForm({...contactForm, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Name *</Label>
                <Input 
                  value={contactForm.name || ""} 
                  onChange={e => setContactForm({...contactForm, name: e.target.value})}
                  placeholder="e.g., 108 Ambulance Service"
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input 
                  value={contactForm.number || ""} 
                  onChange={e => setContactForm({...contactForm, number: e.target.value})}
                  placeholder="108 or +91-XXXX-XXXXXX"
                />
              </div>
              <div>
                <Label>Response Time</Label>
                <Input 
                  value={contactForm.responseTime || ""} 
                  onChange={e => setContactForm({...contactForm, responseTime: e.target.value})}
                  placeholder="e.g., 5-10 min"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={contactForm.isEmergency || false}
                  onCheckedChange={v => setContactForm({...contactForm, isEmergency: v})}
                />
                <Label>Mark as Emergency Contact</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactDialog(false)}>Cancel</Button>
              <Button onClick={() => saveContactMutation.mutate(contactForm)} disabled={saveContactMutation.isPending}>
                {saveContactMutation.isPending ? "Saving..." : "Save Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Zone Dialog */}
        <Dialog open={zoneDialog} onOpenChange={setZoneDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedZone ? "Edit Safe Zone" : "Add Safe Zone"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Zone Name *</Label>
                <Input 
                  value={zoneForm.name || ""} 
                  onChange={e => setZoneForm({...zoneForm, name: e.target.value})}
                  placeholder="e.g., Main Assembly Point"
                />
              </div>
              <div>
                <Label>Zone Type *</Label>
                <Select 
                  value={zoneForm.type || "assembly-point"} 
                  onValueChange={(v: SafeZone["type"]) => setZoneForm({...zoneForm, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {safeZoneTypes.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location *</Label>
                <Input 
                  value={zoneForm.location || ""} 
                  onChange={e => setZoneForm({...zoneForm, location: e.target.value})}
                  placeholder="e.g., Near Main Parking Lot"
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  value={zoneForm.capacity || 100} 
                  onChange={e => setZoneForm({...zoneForm, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={zoneForm.description || ""} 
                  onChange={e => setZoneForm({...zoneForm, description: e.target.value})}
                  placeholder="Brief description..."
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
      </div>
    </AdminLayout>
  );
}
