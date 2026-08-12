import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Search, Package, MapPin, Phone, Clock, CheckCircle, 
  Plus, AlertCircle, Mail, Building2, Eye, Wallet, Smartphone,
  Key, Shirt, Footprints, FileText, BookOpen, HelpCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface LostItem {
  _id: string;
  templeId: string;
  category: string;
  description: string;
  color?: string;
  brand?: string;
  reportedAt: string;
  foundAt?: string;
  status: "lost" | "found" | "claimed" | "expired";
  reporterName: string;
  reporterPhone: string;
  additionalDetails?: string;
}

interface FoundItem {
  _id: string;
  templeId: string;
  category: string;
  description: string;
  color?: string;
  foundLocation: string;
  foundAt: string;
  status: "awaiting-claim" | "claimed" | "donated" | "disposed";
  storedAt: string;
  expiryDate: string;
  additionalDetails?: string;
}

interface LostFoundOffice {
  templeId: string;
  name: string;
  location: string;
  contactNumber: string;
  openTime: string;
  closeTime: string;
  email: string;
}

interface Stats {
  totalLost: number;
  totalFound: number;
  awaitingClaim: number;
  claimedThisWeek: number;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

const categories = [
  { value: "bag", label: "Bag / Backpack", icon: Package },
  { value: "wallet", label: "Wallet / Purse", icon: Wallet },
  { value: "phone", label: "Mobile Phone", icon: Smartphone },
  { value: "jewelry", label: "Jewelry / Ornaments", icon: BookOpen },
  { value: "document", label: "Documents / ID", icon: FileText },
  { value: "keys", label: "Keys", icon: Key },
  { value: "footwear", label: "Footwear", icon: Footprints },
  { value: "clothing", label: "Clothing", icon: Shirt },
  { value: "other", label: "Other Items", icon: HelpCircle }
];

const categoryIcons: Record<string, string> = {
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

export default function LostAndFound() {
  const { t } = useTranslation();
  const [selectedTemple, setSelectedTemple] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("found");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [offices, setOffices] = useState<LostFoundOffice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Dialog states
  const [reportLostOpen, setReportLostOpen] = useState(false);
  const [reportFoundOpen, setReportFoundOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<FoundItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Lost item form
  const [lostCategory, setLostCategory] = useState("wallet");
  const [lostDescription, setLostDescription] = useState("");
  const [lostColor, setLostColor] = useState("");
  const [lostBrand, setLostBrand] = useState("");
  const [lostReporterName, setLostReporterName] = useState("");
  const [lostReporterPhone, setLostReporterPhone] = useState("");
  const [lostReporterEmail, setLostReporterEmail] = useState("");
  const [lostDetails, setLostDetails] = useState("");
  
  // Found item form
  const [foundCategory, setFoundCategory] = useState("wallet");
  const [foundDescription, setFoundDescription] = useState("");
  const [foundColor, setFoundColor] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [foundFinderName, setFoundFinderName] = useState("");
  const [foundFinderPhone, setFoundFinderPhone] = useState("");
  const [foundStoredAt, setFoundStoredAt] = useState("");
  const [foundDetails, setFoundDetails] = useState("");
  
  // Claim form
  const [claimName, setClaimName] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimVerification, setClaimVerification] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedTemple]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const templeParam = selectedTemple && selectedTemple !== "all" ? `?templeId=${selectedTemple}` : "";
      
      const [lostRes, foundRes, officesRes, statsRes] = await Promise.all([
        fetch(`/api/v3/lost-found/lost${templeParam}`),
        fetch(`/api/v3/lost-found/found${templeParam}`),
        fetch("/api/v3/lost-found/offices"),
        fetch(`/api/v3/lost-found/stats${templeParam}`)
      ]);

      const [lostData, foundData, officesData, statsData] = await Promise.all([
        lostRes.json(),
        foundRes.json(),
        officesRes.json(),
        statsRes.json()
      ]);

      setLostItems(lostData.data || []);
      setFoundItems(foundData.data || []);
      setOffices(officesData.data || []);
      setStats(statsData.data || null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }
    
    setLoading(true);
    try {
      const templeParam = selectedTemple && selectedTemple !== "all" ? `&templeId=${selectedTemple}` : "";
      const res = await fetch(`/api/v3/lost-found/search?query=${encodeURIComponent(searchQuery)}${templeParam}`);
      const data = await res.json();
      
      setLostItems(data.data?.lost || []);
      setFoundItems(data.data?.found || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportLost = async () => {
    if (!lostDescription || !lostReporterName || !lostReporterPhone || !selectedTemple || selectedTemple === "all") return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/v3/lost-found/lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTemple,
          category: lostCategory,
          description: lostDescription,
          color: lostColor,
          brand: lostBrand,
          reporterName: lostReporterName,
          reporterPhone: lostReporterPhone,
          reporterEmail: lostReporterEmail,
          additionalDetails: lostDetails
        })
      });

      if (res.ok) {
        setReportLostOpen(false);
        setSuccessMessage("Lost item reported! We'll contact you if it's found.");
        fetchData();
        // Reset form
        setLostDescription("");
        setLostColor("");
        setLostBrand("");
        setLostReporterName("");
        setLostReporterPhone("");
        setLostReporterEmail("");
        setLostDetails("");
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Failed to report lost item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportFound = async () => {
    if (!foundDescription || !foundLocation || !foundStoredAt || !selectedTemple || selectedTemple === "all") return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/v3/lost-found/found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: selectedTemple,
          category: foundCategory,
          description: foundDescription,
          color: foundColor,
          foundLocation,
          finderName: foundFinderName,
          finderPhone: foundFinderPhone,
          storedAt: foundStoredAt,
          additionalDetails: foundDetails
        })
      });

      if (res.ok) {
        setReportFoundOpen(false);
        setSuccessMessage("Found item registered! Thank you for your honesty.");
        fetchData();
        // Reset form
        setFoundDescription("");
        setFoundColor("");
        setFoundLocation("");
        setFoundFinderName("");
        setFoundFinderPhone("");
        setFoundStoredAt("");
        setFoundDetails("");
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Failed to report found item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimItem = async () => {
    if (!selectedItemForClaim || !claimName || !claimPhone || !claimVerification) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v3/lost-found/claim/${selectedItemForClaim._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimedBy: claimName,
          claimedByPhone: claimPhone,
          verificationMethod: claimVerification
        })
      });

      if (res.ok) {
        setClaimDialogOpen(false);
        setSuccessMessage("Claim submitted! Please visit the office to collect your item.");
        fetchData();
        setClaimName("");
        setClaimPhone("");
        setClaimVerification("");
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Failed to claim item:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getTempleDisplayName = (id: string) => {
    return temples.find(t => t.id === id)?.name || id;
  };

  const filteredFoundItems = selectedCategory 
    ? foundItems.filter(i => i.category === selectedCategory)
    : foundItems;

  const filteredLostItems = selectedCategory
    ? lostItems.filter(i => i.category === selectedCategory)
    : lostItems;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <Navbar />
      <div className="container mx-auto px-4 max-w-6xl pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="h-8 w-8 text-orange-500" />
              {t("lostFound.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("lostFound.subtitle")}</p>
          </div>
          
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("common.allTemples")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allTemples")}</SelectItem>
              {temples.map(temple => (
                <SelectItem key={temple.id} value={temple.id}>
                  {temple.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.totalLost}</p>
                  <p className="text-sm text-red-700">Items Reported Lost</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.totalFound}</p>
                  <p className="text-sm text-green-700">Items Found</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{stats.awaitingClaim}</p>
                  <p className="text-sm text-orange-700">Awaiting Claim</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.claimedThisWeek}</p>
                  <p className="text-sm text-blue-700">Claimed This Week</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons & Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 flex gap-2">
                <Input 
                  placeholder="Search items (e.g., blue wallet, Samsung phone)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Dialog open={reportLostOpen} onOpenChange={setReportLostOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report Lost Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Report Lost Item</DialogTitle>
                      <DialogDescription>
                        Provide details about the item you lost
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTemple === "all" ? (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please select a temple first to report a lost item.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={lostCategory} onValueChange={setLostCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {categoryIcons[cat.value]} {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Description *</Label>
                          <Textarea 
                            placeholder="Describe the item in detail..."
                            value={lostDescription}
                            onChange={(e) => setLostDescription(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Color</Label>
                            <Input 
                              placeholder="e.g., Black, Brown"
                              value={lostColor}
                              onChange={(e) => setLostColor(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Brand (if any)</Label>
                            <Input 
                              placeholder="e.g., Samsung, Woodland"
                              value={lostBrand}
                              onChange={(e) => setLostBrand(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Your Name *</Label>
                            <Input 
                              value={lostReporterName}
                              onChange={(e) => setLostReporterName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input 
                              value={lostReporterPhone}
                              onChange={(e) => setLostReporterPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Email (optional)</Label>
                          <Input 
                            type="email"
                            value={lostReporterEmail}
                            onChange={(e) => setLostReporterEmail(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Additional Details</Label>
                          <Textarea 
                            placeholder="Where/when did you lose it?"
                            value={lostDetails}
                            onChange={(e) => setLostDetails(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={!lostDescription || !lostReporterName || !lostReporterPhone || submitting}
                          onClick={handleReportLost}
                        >
                          {submitting ? "Submitting..." : "Submit Report"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Dialog open={reportFoundOpen} onOpenChange={setReportFoundOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Report Found Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-green-600">Report Found Item</DialogTitle>
                      <DialogDescription>
                        Thank you for turning in a found item
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedTemple === "all" ? (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Please select a temple first to report a found item.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Category</Label>
                          <Select value={foundCategory} onValueChange={setFoundCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {categoryIcons[cat.value]} {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Description *</Label>
                          <Textarea 
                            placeholder="Describe the item..."
                            value={foundDescription}
                            onChange={(e) => setFoundDescription(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Color</Label>
                          <Input 
                            placeholder="e.g., Black, Red"
                            value={foundColor}
                            onChange={(e) => setFoundColor(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Where was it found? *</Label>
                          <Input 
                            placeholder="e.g., Near main entrance"
                            value={foundLocation}
                            onChange={(e) => setFoundLocation(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Your Name</Label>
                            <Input 
                              value={foundFinderName}
                              onChange={(e) => setFoundFinderName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input 
                              value={foundFinderPhone}
                              onChange={(e) => setFoundFinderPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Where is item stored? *</Label>
                          <Input 
                            placeholder="e.g., Lost & Found Office"
                            value={foundStoredAt}
                            onChange={(e) => setFoundStoredAt(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Additional Details</Label>
                          <Textarea 
                            placeholder="Any other details..."
                            value={foundDetails}
                            onChange={(e) => setFoundDetails(e.target.value)}
                          />
                        </div>
                        
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          disabled={!foundDescription || !foundLocation || !foundStoredAt || submitting}
                          onClick={handleReportFound}
                        >
                          {submitting ? "Submitting..." : "Submit Report"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === "" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("")}
              >
                All Categories
              </Badge>
              {categories.map(cat => (
                <Badge 
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {categoryIcons[cat.value]} {cat.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="found" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Found Items ({filteredFoundItems.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Lost Items ({filteredLostItems.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Found Items Tab */}
            <TabsContent value="found">
              {filteredFoundItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No found items to display</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredFoundItems.map(item => (
                    <Card key={item._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{categoryIcons[item.category] || "📦"}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{item.description}</h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Found: {item.foundLocation}
                                </p>
                              </div>
                              <Badge variant={item.status === "awaiting-claim" ? "default" : "secondary"}>
                                {item.status === "awaiting-claim" ? "Available" : item.status}
                              </Badge>
                            </div>
                            
                            {item.color && (
                              <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                            )}
                            
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.foundAt)}
                              </span>
                              <span>{getTempleDisplayName(item.templeId)}</span>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">
                              Stored at: {item.storedAt}
                            </p>
                            
                            {item.status === "awaiting-claim" && (
                              <Button 
                                size="sm" 
                                className="mt-3"
                                onClick={() => {
                                  setSelectedItemForClaim(item);
                                  setClaimDialogOpen(true);
                                }}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                This is mine
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Lost Items Tab */}
            <TabsContent value="lost">
              {filteredLostItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No lost items reported</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredLostItems.map(item => (
                    <Card key={item._id} className="hover:shadow-md transition-shadow border-red-100">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{categoryIcons[item.category] || "📦"}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold">{item.description}</h3>
                                {item.brand && (
                                  <p className="text-sm text-gray-600">Brand: {item.brand}</p>
                                )}
                              </div>
                              <Badge variant={item.status === "lost" ? "destructive" : "secondary"}>
                                {item.status}
                              </Badge>
                            </div>
                            
                            {item.color && (
                              <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                            )}
                            
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(item.reportedAt)}
                              </span>
                              <span>{getTempleDisplayName(item.templeId)}</span>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">
                              Reported by: {item.reporterName}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Claim Dialog */}
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim This Item</DialogTitle>
              <DialogDescription>
                Please provide verification details to claim this item
              </DialogDescription>
            </DialogHeader>
            
            {selectedItemForClaim && (
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{selectedItemForClaim.description}</p>
                  <p className="text-sm text-gray-600">
                    Found at: {selectedItemForClaim.foundLocation}
                  </p>
                </div>
                
                <div>
                  <Label>Your Name *</Label>
                  <Input 
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Phone Number *</Label>
                  <Input 
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>How can you verify this is yours? *</Label>
                  <Textarea 
                    placeholder="Describe unique features only the owner would know..."
                    value={claimVerification}
                    onChange={(e) => setClaimVerification(e.target.value)}
                  />
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You'll need to visit the office to collect the item with valid ID proof.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  className="w-full"
                  disabled={!claimName || !claimPhone || !claimVerification || submitting}
                  onClick={handleClaimItem}
                >
                  {submitting ? "Submitting..." : "Submit Claim"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Office Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              Lost & Found Offices
            </CardTitle>
            <CardDescription>Visit these offices to claim found items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {offices.map(office => (
                <div 
                  key={office.templeId}
                  className="p-4 rounded-lg border bg-white"
                >
                  <h3 className="font-semibold">{office.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {office.location}
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {office.openTime} - {office.closeTime}
                    </p>
                    <a href={`tel:${office.contactNumber}`} className="flex items-center gap-2 text-primary">
                      <Phone className="h-4 w-4" />
                      {office.contactNumber}
                    </a>
                    <a href={`mailto:${office.email}`} className="flex items-center gap-2 text-primary">
                      <Mail className="h-4 w-4" />
                      {office.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
