import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Camera, Upload, X, Plus, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { temples } from "@/data/temples";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

interface BookingDialogProps {
  templeId?: string;
  templeName?: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

interface DevoteeForm {
  name: string;
  age: string;
  gender: string;
  photoUrl: string;
  photoFile: File | null;
  idType: string;
  idNumber: string;
  idFileUrl: string;
  idFile: File | null;
}

// Camera dialog state
interface CameraState {
  open: boolean;
  index: number;
  type: 'photo' | 'id';
}

export function BookingDialog({ templeId, templeName, trigger }: BookingDialogProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [selectedTempleId, setSelectedTempleId] = useState<string>(templeId || "");
  const [numberOfDevotees, setNumberOfDevotees] = useState("1");
  const [cameraState, setCameraState] = useState<CameraState>({ open: false, index: 0, type: 'photo' });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [photoType, setPhotoType] = useState<'photo' | 'id'>('photo');
  const currentDevoteeRef = useRef<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Handle dialog open - check if user is logged in
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !user) {
      toast({
        title: "Login Required",
        description: "Please login to book darshan",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }
    setOpen(isOpen);
  };
  
  const [formData, setFormData] = useState({
    darshanType: "General",
    timeSlot: "",
    purpose: "Darshan",
    priestName: "",
  });

  const [devotees, setDevotees] = useState<DevoteeForm[]>([
    { name: "", age: "", gender: "", photoUrl: "", photoFile: null, idType: "Aadhaar", idNumber: "", idFileUrl: "", idFile: null },
  ]);

  // Get selected temple details
  const selectedTemple = selectedTempleId ? temples.find(t => t.id === selectedTempleId) : null;
  const finalTempleId = templeId || selectedTempleId;
  const finalTempleName = templeName || selectedTemple?.name || "";

  // Update devotees array when number changes
  const handleNumberOfDevoteesChange = (value: string) => {
    setNumberOfDevotees(value);
    const count = parseInt(value);
    const newDevotees = [...devotees];
    
    if (count > newDevotees.length) {
      for (let i = newDevotees.length; i < count; i++) {
        newDevotees.push({ name: "", age: "", gender: "", photoUrl: "", photoFile: null, idType: "Aadhaar", idNumber: "", idFileUrl: "", idFile: null });
      }
    } else if (count < newDevotees.length) {
      newDevotees.splice(count);
    }
    setDevotees(newDevotees);
  };

  // Handle devotee field change
  const updateDevotee = (index: number, field: keyof DevoteeForm, value: string) => {
    const newDevotees = [...devotees];
    (newDevotees[index] as any)[field] = value;
    setDevotees(newDevotees);
  };

  // Video ref callback to attach stream
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && cameraStreamRef.current) {
      element.srcObject = cameraStreamRef.current;
    }
  }, []);

  // Start camera
  const startCamera = async (devoteeIndex: number, type: 'photo' | 'id') => {
    currentDevoteeRef.current = devoteeIndex;
    setPhotoType(type);
    
    try {
      const constraints: MediaStreamConstraints = { 
        video: { 
          facingMode: type === 'photo' ? "user" : "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      setIsCameraActive(true);
      setCameraState({ open: true, index: devoteeIndex, type });
      
      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use upload instead.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraState(prev => ({ ...prev, open: false }));
  };

  // Capture photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || !isCameraActive) return;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    const index = currentDevoteeRef.current;
    const newDevotees = [...devotees];
    
    if (photoType === 'photo') {
      newDevotees[index].photoUrl = dataUrl;
      newDevotees[index].photoFile = null;
    } else {
      newDevotees[index].idFileUrl = dataUrl;
      newDevotees[index].idFile = null;
    }
    
    setDevotees(newDevotees);
    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (devoteeIndex: number, type: 'photo' | 'id', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newDevotees = [...devotees];
        if (type === 'photo') {
          newDevotees[devoteeIndex].photoUrl = e.target.result as string;
          newDevotees[devoteeIndex].photoFile = file;
        } else {
          newDevotees[devoteeIndex].idFileUrl = e.target.result as string;
          newDevotees[devoteeIndex].idFile = file;
        }
        setDevotees([...newDevotees]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Validate all devotees have photos
  const validateDevotees = () => {
    for (let i = 0; i < devotees.length; i++) {
      if (!devotees[i].photoUrl) {
        return { valid: false, index: i, field: 'photo' };
      }
      if (!devotees[i].idFileUrl) {
        return { valid: false, index: i, field: 'id' };
      }
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!finalTempleId || !finalTempleName) {
      toast({
        title: "Error",
        description: "Please select a temple first",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a visit date",
        variant: "destructive",
      });
      return;
    }

    const validation = validateDevotees();
    if (!validation.valid) {
      const fieldName = validation.field === 'photo' ? 'Photo' : 'ID Proof';
      toast({
        title: "Error",
        description: `${fieldName} is required for devotee ${validation.index + 1}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          templeId: finalTempleId,
          templeName: finalTempleName,
          ...formData,
          visitDate: format(date, "yyyy-MM-dd"),
          numberOfDevotees: devotees.length,
          devotees: devotees.map(d => ({
            name: d.name,
            age: parseInt(d.age) || 0,
            gender: d.gender,
            photoUrl: d.photoUrl,
            idProof: {
              idType: d.idType,
              idNumber: d.idNumber,
              idFileUrl: d.idFileUrl,
            },
          })),
        }),
      });

      if (!response.ok) throw new Error("Booking failed");

      toast({
        title: "Booking Successful!",
        description: `Your darshan booking for ${finalTempleName} has been confirmed.`,
      });
      
      setOpen(false);
      setNumberOfDevotees("1");
      setDevotees([{ name: "", age: "", gender: "", photoUrl: "", photoFile: null, idType: "Aadhaar", idNumber: "", idFileUrl: "", idFile: null }]);
      setFormData({ darshanType: "General", timeSlot: "", purpose: "Darshan", priestName: "" });
      setDate(undefined);
      if (!templeId) {
        setSelectedTempleId("");
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = (devoteeIndex: number, type: 'photo' | 'id') => {
    const input = fileInputRef.current;
    if (input) {
      input.setAttribute('data-devotee-index', devoteeIndex.toString());
      input.setAttribute('data-upload-type', type);
      input.click();
    }
  };

  // Handle file input change
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const devoteeIndex = parseInt(event.target.getAttribute('data-devotee-index') || '0');
    const type = event.target.getAttribute('data-upload-type') as 'photo' | 'id';
    if (!isNaN(devoteeIndex)) {
      handleFileUpload(devoteeIndex, type, event);
    }
    event.target.value = '';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || <Button>Book Darshan</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Darshan</DialogTitle>
            <DialogDescription>
              {finalTempleName ? `Book your visit to ${finalTempleName}` : "Select a temple and book your visit"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            {!templeId && (
              <div className="space-y-2">
                <Label htmlFor="temple">Select Temple *</Label>
                <Select
                  value={selectedTempleId}
                  onValueChange={setSelectedTempleId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a temple" />
                  </SelectTrigger>
                  <SelectContent>
                    {temples.map((temple) => (
                      <SelectItem key={temple.id} value={temple.id}>
                        {temple.name} - {temple.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="darshanType">Darshan Type *</Label>
              <Select
                value={formData.darshanType}
                onValueChange={(value) => setFormData({ ...formData, darshanType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select darshan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Special">Special</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visit Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Time Slot *</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6:00 AM - 9:00 AM">6:00 AM - 9:00 AM</SelectItem>
                    <SelectItem value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</SelectItem>
                    <SelectItem value="12:00 PM - 3:00 PM">12:00 PM - 3:00 PM</SelectItem>
                    <SelectItem value="3:00 PM - 6:00 PM">3:00 PM - 6:00 PM</SelectItem>
                    <SelectItem value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfDevotees">Number of Devotees *</Label>
                <Select
                  value={numberOfDevotees}
                  onValueChange={handleNumberOfDevoteesChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Darshan">Darshan</SelectItem>
                    <SelectItem value="Puja">Puja</SelectItem>
                    <SelectItem value="Abhishekam">Abhishekam</SelectItem>
                    <SelectItem value="Donation">Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priestName">Priest Name (Optional)</Label>
                <Input
                  id="priestName"
                  value={formData.priestName}
                  onChange={(e) => setFormData({ ...formData, priestName: e.target.value })}
                  placeholder="If specific priest required"
                />
              </div>
            </div>
            
            {/* Devotees Section */}
            <div className="border-t pt-4 mt-4">
              <Label className="text-lg font-semibold">Devotee Details *</Label>
              <p className="text-sm text-muted-foreground mb-4">Each devotee must have a photo and ID proof</p>
              
              {devotees.map((devotee, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <Label className="text-md font-medium">Devotee {index + 1}</Label>
                    </div>
                    {devotees.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDevotees = devotees.filter((_, i) => i !== index);
                          setDevotees(newDevotees);
                          setNumberOfDevotees(String(newDevotees.length));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`name-${index}`} className="text-xs">Name *</Label>
                      <Input
                        id={`name-${index}`}
                        required
                        value={devotee.name}
                        onChange={(e) => updateDevotee(index, 'name', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`age-${index}`} className="text-xs">Age *</Label>
                      <Input
                        id={`age-${index}`}
                        type="number"
                        min="0"
                        max="150"
                        required
                        value={devotee.age}
                        onChange={(e) => updateDevotee(index, 'age', e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`gender-${index}`} className="text-xs">Gender *</Label>
                      <Select
                        value={devotee.gender}
                        onValueChange={(value) => updateDevotee(index, 'gender', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Photo */}
                  <div className="space-y-2">
                    <Label className="text-xs">Photo * (Required)</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startCamera(index, 'photo')}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Camera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileInput(index, 'photo')}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                    {devotee.photoUrl ? (
                      <div className="relative inline-block">
                        <img 
                          src={devotee.photoUrl} 
                          alt={`Devotee ${index + 1} photo`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDevotees = [...devotees];
                            newDevotees[index].photoUrl = "";
                            newDevotees[index].photoFile = null;
                            setDevotees(newDevotees);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* ID Proof */}
                  <div className="border-t pt-3">
                    <Label className="text-xs">ID Proof * (Required)</Label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      <Select
                        value={devotee.idType}
                        onValueChange={(value) => updateDevotee(index, 'idType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                          <SelectItem value="Voter ID">Voter ID</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="ID Number *"
                        value={devotee.idNumber}
                        onChange={(e) => updateDevotee(index, 'idNumber', e.target.value)}
                        className="col-span-2"
                        required
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startCamera(index, 'id')}
                          className="flex-1"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileInput(index, 'id')}
                          className="flex-1"
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {devotee.idFileUrl && (
                      <div className="mt-2 relative">
                        <img 
                          src={devotee.idFileUrl} 
                          alt={`ID Proof ${index + 1}`}
                          className="h-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDevotees = [...devotees];
                            newDevotees[index].idFileUrl = "";
                            newDevotees[index].idFile = null;
                            setDevotees(newDevotees);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDevotees([...devotees, { name: "", age: "", gender: "", photoUrl: "", photoFile: null, idType: "Aadhaar", idNumber: "", idFileUrl: "", idFile: null }]);
                  setNumberOfDevotees(String(devotees.length + 1));
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Devotee
              </Button>
            </div>
            
            <Button type="submit" className="w-full">Confirm Booking</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={cameraState.open} onOpenChange={(open) => {
        if (!open) stopCamera();
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Take {photoType === 'photo' ? 'Photo' : 'ID Photo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={capturePhoto}
                className="flex-1"
                disabled={!isCameraActive}
              >
                Capture
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

