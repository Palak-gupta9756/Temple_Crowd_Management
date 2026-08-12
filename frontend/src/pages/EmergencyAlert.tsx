import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, Phone, Siren, MapPin, Shield, Users, 
  Heart, Flame, Search, ChevronRight, Clock, Building2, AlertCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface FirstAidStation {
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
  coordinates: { x: number; y: number };
  description: string;
}

interface CrowdThreshold {
  templeId: string;
  maxCapacity: number;
  warningThreshold: number;
  criticalThreshold: number;
  evacuationThreshold: number;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const alertTypes = [
  { value: "medical", label: "Medical Emergency", icon: Heart, color: "text-red-500" },
  { value: "security", label: "Security Issue", icon: Shield, color: "text-blue-500" },
  { value: "lost-person", label: "Lost Person", icon: Search, color: "text-orange-500" },
  { value: "fire", label: "Fire Emergency", icon: Flame, color: "text-red-600" },
  { value: "other", label: "Other Emergency", icon: AlertTriangle, color: "text-yellow-500" }
];

const contactTypeIcons: Record<string, { icon: typeof Phone; color: string }> = {
  ambulance: { icon: Heart, color: "text-red-500" },
  police: { icon: Shield, color: "text-blue-500" },
  fire: { icon: Flame, color: "text-orange-500" },
  "temple-security": { icon: Users, color: "text-green-500" },
  "control-room": { icon: Siren, color: "text-purple-500" },
  hospital: { icon: Building2, color: "text-teal-500" }
};

export default function EmergencyAlert() {
  const { t } = useTranslation();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [firstAidStations, setFirstAidStations] = useState<FirstAidStation[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [crowdThreshold, setCrowdThreshold] = useState<CrowdThreshold | null>(null);
  const [loading, setLoading] = useState(true);
  const [panicDialogOpen, setPanicDialogOpen] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  
  // Form state
  const [alertType, setAlertType] = useState<string>("medical");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertLocation, setAlertLocation] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmergencyData();
  }, [selectedTemple]);

  const fetchEmergencyData = async () => {
    setLoading(true);
    try {
      const [firstAidRes, contactsRes, safeZonesRes, thresholdsRes] = await Promise.all([
        fetch(`/api/v3/emergency/first-aid?templeId=${selectedTemple}`),
        fetch(`/api/v3/emergency/contacts?templeId=${selectedTemple}`),
        fetch(`/api/v3/emergency/safe-zones?templeId=${selectedTemple}`),
        fetch(`/api/v3/emergency/thresholds/${selectedTemple}`)
      ]);

      const [firstAidData, contactsData, safeZonesData, thresholdsData] = await Promise.all([
        firstAidRes.json(),
        contactsRes.json(),
        safeZonesRes.json(),
        thresholdsRes.json()
      ]);

      setFirstAidStations(firstAidData.data || []);
      setEmergencyContacts(contactsData.data || []);
      setSafeZones(safeZonesData.data || []);
      setCrowdThreshold(thresholdsData.data || null);
    } catch (error) {
      console.error("Failed to fetch emergency data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePanicAlert = async () => {
    if (!alertMessage || !reporterPhone) return;
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/v3/alerts/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTemple,
          type: alertType,
          urgency: "high",
          message: alertMessage,
          location: alertLocation,
          reporterName,
          reporterPhone
        })
      });

      if (response.ok) {
        setAlertSent(true);
        setPanicDialogOpen(false);
        // Reset form
        setAlertMessage("");
        setAlertLocation("");
        setReporterName("");
        setReporterPhone("");
        
        // Hide success message after 10 seconds
        setTimeout(() => setAlertSent(false), 10000);
      }
    } catch (error) {
      console.error("Failed to send panic alert:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTempleDisplayName = (id: string) => {
    return temples.find(t => t.id === id)?.name || id;
  };

  const getSafeZoneTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "assembly-point": "Assembly Point",
      "shelter": "Emergency Shelter",
      "evacuation-route": "Evacuation Route"
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 max-w-6xl pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Siren className="h-8 w-8 text-red-500" />
              {t("emergency.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("emergency.subtitle")}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedTemple} onValueChange={setSelectedTemple}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectTemple")} />
              </SelectTrigger>
              <SelectContent>
                {temples.map(temple => (
                  <SelectItem key={temple.id} value={temple.id}>
                    {temple.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alert Sent Success */}
        {alertSent && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Emergency Alert Sent!</AlertTitle>
            <AlertDescription className="text-green-700">
              Help is on the way. Temple security and emergency services have been notified.
              Expected response time: 2-5 minutes. Stay calm and stay in your location.
            </AlertDescription>
          </Alert>
        )}

        {/* Panic Button */}
        <Card className="mb-8 border-red-200 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">Need Immediate Help?</h2>
                <p className="text-red-100">Press the button to alert temple security and emergency services</p>
              </div>
              
              <Dialog open={panicDialogOpen} onOpenChange={setPanicDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6 shadow-lg animate-pulse"
                  >
                    <Siren className="mr-2 h-6 w-6" />
                    EMERGENCY HELP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <Siren className="h-5 w-5" />
                      Send Emergency Alert
                    </DialogTitle>
                    <DialogDescription>
                      This will immediately notify temple security and emergency services
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Type of Emergency</Label>
                      <Select value={alertType} onValueChange={setAlertType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {alertTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={`h-4 w-4 ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Describe the Emergency *</Label>
                      <Textarea 
                        placeholder="What happened? Be as specific as possible..."
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Your Location</Label>
                      <Input 
                        placeholder="e.g., Near main entrance, Queue line #3"
                        value={alertLocation}
                        onChange={(e) => setAlertLocation(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Your Name</Label>
                        <Input 
                          placeholder="Name"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Phone Number *</Label>
                        <Input 
                          placeholder="+91-XXXXXXXXXX"
                          value={reporterPhone}
                          onChange={(e) => setReporterPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700" 
                      size="lg"
                      disabled={!alertMessage || !reporterPhone || submitting}
                      onClick={handlePanicAlert}
                    >
                      {submitting ? "Sending..." : "SEND EMERGENCY ALERT"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Emergency Quick Dial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Emergency Contacts - {getTempleDisplayName(selectedTemple)}
                </CardTitle>
                <CardDescription>Tap to call emergency services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {emergencyContacts.map(contact => {
                    const typeInfo = contactTypeIcons[contact.type] || { icon: Phone, color: "text-gray-500" };
                    const Icon = typeInfo.icon;
                    return (
                      <a 
                        key={contact.id}
                        href={`tel:${contact.number}`}
                        className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-full bg-gray-100 ${typeInfo.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{contact.name}</p>
                          <p className="text-lg font-bold text-primary">{contact.number}</p>
                          {contact.responseTime && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {contact.responseTime}
                            </p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* First Aid Stations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  First Aid Stations
                </CardTitle>
                <CardDescription>Medical assistance locations within the temple</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {firstAidStations.map(station => (
                    <div 
                      key={station.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-white"
                    >
                      <div className="p-3 rounded-full bg-red-100 text-red-600">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{station.name}</h3>
                            <p className="text-gray-600 flex items-center gap-1 text-sm">
                              <MapPin className="h-4 w-4" />
                              {station.location}
                            </p>
                          </div>
                          <Badge variant={station.isOpen24Hours ? "default" : "secondary"}>
                            {station.isOpen24Hours ? "24/7" : `${station.openTime} - ${station.closeTime}`}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-2">
                          {station.facilities.map((facility, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-gray-500">Staff: {station.staffCount} members</p>
                          <a 
                            href={`tel:${station.contactNumber}`}
                            className="flex items-center gap-1 text-primary font-semibold"
                          >
                            <Phone className="h-4 w-4" />
                            {station.contactNumber}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Safe Zones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Safe Zones & Assembly Points
                </CardTitle>
                <CardDescription>Emergency evacuation and meeting points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {safeZones.map(zone => (
                    <div 
                      key={zone.id}
                      className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          {getSafeZoneTypeLabel(zone.type)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{zone.name}</h3>
                      <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {zone.location}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">{zone.description}</p>
                      <div className="mt-3 flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>Capacity: <strong>{zone.capacity.toLocaleString()}</strong> people</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Crowd Limits */}
            {crowdThreshold && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    Crowd Safety Thresholds
                  </CardTitle>
                  <CardDescription>Automatic alerts are triggered at these levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <div>
                        <p className="font-semibold">Maximum Temple Capacity</p>
                        <p className="text-sm text-gray-600">Total visitors allowed at once</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {crowdThreshold.maxCapacity.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-yellow-50 text-center">
                        <p className="text-sm text-gray-600">Warning Level</p>
                        <p className="text-2xl font-bold text-yellow-600">{crowdThreshold.warningThreshold}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 text-center">
                        <p className="text-sm text-gray-600">Critical Level</p>
                        <p className="text-2xl font-bold text-orange-600">{crowdThreshold.criticalThreshold}%</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50 text-center">
                        <p className="text-sm text-gray-600">Evacuation</p>
                        <p className="text-2xl font-bold text-red-600">{crowdThreshold.evacuationThreshold}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="/medical"
                className="flex flex-col items-center gap-2 p-6 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-center"
              >
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <Heart className="h-6 w-6" />
                </div>
                <span className="font-semibold">Request Medical Help</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </a>
              
              <a 
                href="/lost-found"
                className="flex flex-col items-center gap-2 p-6 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-center"
              >
                <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                  <Search className="h-6 w-6" />
                </div>
                <span className="font-semibold">Lost & Found</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </a>
              
              <a 
                href="/routes"
                className="flex flex-col items-center gap-2 p-6 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-center"
              >
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="font-semibold">Temple Routes</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </a>
              
              <a 
                href="/crowd-dashboard"
                className="flex flex-col items-center gap-2 p-6 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-center"
              >
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Users className="h-6 w-6" />
                </div>
                <span className="font-semibold">Crowd Status</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
