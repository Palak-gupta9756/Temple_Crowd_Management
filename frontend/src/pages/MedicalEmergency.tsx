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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Heart, Phone, MapPin, Clock, CheckCircle, 
  Stethoscope, Accessibility, Activity, Wind, Plus, AlertCircle,
  Ambulance, User, ArrowRight
} from "lucide-react";
import { useTranslation } from "react-i18next";

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

interface MedicalResponse {
  id: string;
  requestType: string;
  patientName: string;
  status: string;
  nearestFirstAid?: FirstAidStation;
  estimatedResponse: string;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const requestTypes = [
  { value: "wheelchair", label: "Wheelchair", icon: Accessibility, description: "For mobility assistance" },
  { value: "stretcher", label: "Stretcher", icon: Activity, description: "For patients who cannot walk" },
  { value: "first-aid", label: "First Aid", icon: Plus, description: "Minor injuries, cuts, burns" },
  { value: "ambulance", label: "Ambulance", icon: Ambulance, description: "Medical emergency transport" },
  { value: "oxygen", label: "Oxygen", icon: Wind, description: "Breathing difficulty" },
  { value: "other", label: "Other", icon: Stethoscope, description: "Other medical needs" }
];

const urgencyLevels = [
  { value: "low", label: "Low", description: "Can wait 10-15 minutes", color: "text-green-600 bg-green-50" },
  { value: "medium", label: "Medium", description: "Need help in 5-10 minutes", color: "text-yellow-600 bg-yellow-50" },
  { value: "high", label: "High", description: "Need help immediately", color: "text-orange-600 bg-orange-50" },
  { value: "critical", label: "Critical", description: "Life-threatening emergency", color: "text-red-600 bg-red-50" }
];

export default function MedicalEmergency() {
  const { t } = useTranslation();
  const [selectedTemple, setSelectedTemple] = useState<string>("somnath");
  const [firstAidStations, setFirstAidStations] = useState<FirstAidStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [response, setResponse] = useState<MedicalResponse | null>(null);
  
  // Form state
  const [requestType, setRequestType] = useState<string>("first-aid");
  const [urgency, setUrgency] = useState<string>("high");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFirstAidStations();
  }, [selectedTemple]);

  const fetchFirstAidStations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v3/emergency/first-aid?templeId=${selectedTemple}`);
      const data = await res.json();
      setFirstAidStations(data.data || []);
    } catch (error) {
      console.error("Failed to fetch first-aid stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!patientName || !condition || !location || !contactPhone) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/v3/medical/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTemple,
          requestType,
          patientName,
          patientAge: patientAge ? parseInt(patientAge) : undefined,
          condition,
          location,
          contactPhone,
          urgency
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse(data.data);
        setRequestSubmitted(true);
        setDialogOpen(false);
        
        // Reset form
        setPatientName("");
        setPatientAge("");
        setCondition("");
        setLocation("");
        setContactPhone("");
      }
    } catch (error) {
      console.error("Failed to submit medical request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getTempleDisplayName = (id: string) => {
    return temples.find(t => t.id === id)?.name || id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 max-w-5xl pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              {t("medical.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("medical.subtitle")}</p>
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

        {/* Request Submitted Alert */}
        {requestSubmitted && response && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Medical Assistance Requested!</AlertTitle>
            <AlertDescription className="text-green-700">
              <p className="mb-2">
                Your request for <strong>{requestType}</strong> has been received. 
                Help is being dispatched to your location.
              </p>
              <p><strong>Request ID:</strong> {response.id}</p>
              <p><strong>Estimated Response:</strong> {(response as any).estimatedResponse || "2-5 minutes"}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setRequestSubmitted(false)}
              >
                Close
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Request Button */}
        <Card className="mb-8 border-red-200 bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">Need Medical Help?</h2>
                <p className="text-red-100">Request wheelchair, stretcher, first-aid or ambulance</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6 shadow-lg"
                  >
                    <Stethoscope className="mr-2 h-6 w-6" />
                    REQUEST HELP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                      <Heart className="h-5 w-5" />
                      Request Medical Assistance
                    </DialogTitle>
                    <DialogDescription>
                      Fill in the details for faster assistance
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 mt-4">
                    {/* Request Type */}
                    <div>
                      <Label className="mb-3 block">Type of Assistance Needed</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {requestTypes.map(type => (
                          <button
                            key={type.value}
                            onClick={() => setRequestType(type.value)}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                              requestType === type.value 
                                ? "border-red-500 bg-red-50" 
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <type.icon className={`h-5 w-5 ${requestType === type.value ? "text-red-500" : "text-gray-500"}`} />
                            <div>
                              <p className="font-medium text-sm">{type.label}</p>
                              <p className="text-xs text-gray-500">{type.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <Label className="mb-3 block">Urgency Level</Label>
                      <RadioGroup value={urgency} onValueChange={setUrgency} className="grid grid-cols-2 gap-2">
                        {urgencyLevels.map(level => (
                          <div key={level.value}>
                            <RadioGroupItem 
                              value={level.value} 
                              id={level.value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={level.value}
                              className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-current ${level.color}`}
                            >
                              <span className="font-semibold">{level.label}</span>
                              <span className="text-xs opacity-75">{level.description}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Patient Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Patient Name *</Label>
                        <Input 
                          placeholder="Full name"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Age (optional)</Label>
                        <Input 
                          type="number"
                          placeholder="Age"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Describe the Condition *</Label>
                      <Textarea 
                        placeholder="What are the symptoms? Any known medical conditions?"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Current Location *</Label>
                      <Input 
                        placeholder="e.g., Near main entrance, Queue line #2, Prasad counter"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Contact Phone Number *</Label>
                      <Input 
                        placeholder="+91-XXXXXXXXXX"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700 text-sm">
                        For life-threatening emergencies, please also call <strong>108</strong> directly.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700" 
                      size="lg"
                      disabled={!patientName || !condition || !location || !contactPhone || submitting}
                      onClick={handleSubmitRequest}
                    >
                      {submitting ? "Sending Request..." : "SEND REQUEST"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Quick Services */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {requestTypes.map(type => (
            <button
              key={type.value}
              onClick={() => {
                setRequestType(type.value);
                setDialogOpen(true);
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <type.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-center">{type.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* First Aid Stations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-red-500" />
                  First Aid Stations at {getTempleDisplayName(selectedTemple)}
                </CardTitle>
                <CardDescription>
                  {firstAidStations.length} medical facilities available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {firstAidStations.map(station => (
                    <div 
                      key={station.id}
                      className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-red-100 text-red-600 shrink-0">
                          <Heart className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg">{station.name}</h3>
                              <p className="text-gray-600 flex items-center gap-1 text-sm">
                                <MapPin className="h-4 w-4 shrink-0" />
                                {station.location}
                              </p>
                            </div>
                            <Badge 
                              variant={station.isOpen24Hours ? "default" : "secondary"}
                              className="shrink-0"
                            >
                              {station.isOpen24Hours ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> 24/7
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {station.openTime} - {station.closeTime}
                                </span>
                              )}
                            </Badge>
                          </div>
                          
                          {/* Facilities */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {station.facilities.map((facility, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {facility}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Footer */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <User className="h-4 w-4" />
                              <span>{station.staffCount} staff available</span>
                            </div>
                            <a 
                              href={`tel:${station.contactNumber}`}
                              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="font-semibold">{station.contactNumber}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  Health & Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-800 mb-2">Before Your Visit</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Carry any essential medications</li>
                      <li>• Stay hydrated before visiting</li>
                      <li>• Eat a light meal</li>
                      <li>• Wear comfortable footwear</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-800 mb-2">During Your Visit</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Take breaks if feeling tired</li>
                      <li>• Stay in shaded areas when possible</li>
                      <li>• Keep emergency numbers saved</li>
                      <li>• Don't hesitate to ask for help</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="/emergency"
                className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50"
              >
                <span className="font-semibold">Emergency Services</span>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </a>
              <a 
                href="/lost-found"
                className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50"
              >
                <span className="font-semibold">Lost & Found</span>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
