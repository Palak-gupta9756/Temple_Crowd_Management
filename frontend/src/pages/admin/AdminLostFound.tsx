import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Package, Search, Eye, CheckCircle, XCircle, Clock, 
  Wallet, Smartphone, Key, FileText, Shirt, Footprints, HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LostItem {
  _id: string;
  templeId: string;
  category: string;
  description: string;
  color?: string;
  brand?: string;
  reportedAt: string;
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
  finderName?: string;
  finderPhone?: string;
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
  { value: "jewelry", label: "Jewelry / Ornaments", icon: Package },
  { value: "document", label: "Documents / ID", icon: FileText },
  { value: "keys", label: "Keys", icon: Key },
  { value: "footwear", label: "Footwear", icon: Footprints },
  { value: "clothing", label: "Clothing", icon: Shirt },
  { value: "other", label: "Other Items", icon: HelpCircle }
];

const categoryIcons: Record<string, string> = {
  bag: "🎒", wallet: "👛", phone: "📱", jewelry: "💍", document: "📄",
  keys: "🔑", footwear: "👟", clothing: "👕", other: "📦"
};

export default function AdminLostFound() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("found");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostItem | FoundItem | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<"lost" | "found">("found");

  // Fetch data
  const { data: lostItems = [], isLoading: loadingLost } = useQuery({
    queryKey: ["/api/v3/lost-found/lost", selectedTemple],
    queryFn: async () => {
      const param = selectedTemple !== "all" ? `?templeId=${selectedTemple}` : "";
      const res = await fetch(`/api/v3/lost-found/lost${param}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: foundItems = [], isLoading: loadingFound } = useQuery({
    queryKey: ["/api/v3/lost-found/found", selectedTemple],
    queryFn: async () => {
      const param = selectedTemple !== "all" ? `?templeId=${selectedTemple}` : "";
      const res = await fetch(`/api/v3/lost-found/found${param}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: offices = [] } = useQuery({
    queryKey: ["/api/v3/lost-found/offices"],
    queryFn: async () => {
      const res = await fetch("/api/v3/lost-found/offices");
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/v3/lost-found/stats", selectedTemple],
    queryFn: async () => {
      const param = selectedTemple !== "all" ? `?templeId=${selectedTemple}` : "";
      const res = await fetch(`/api/v3/lost-found/stats${param}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
  });

  // Update status mutations
  const updateLostStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/v3/admin/lost-found/lost/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update" }));
        throw new Error(error.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/lost"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/stats"] });
      toast({ title: "Success", description: "Lost item status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateFoundStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/v3/admin/lost-found/found/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update" }));
        throw new Error(error.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/found"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/stats"] });
      toast({ title: "Success", description: "Found item marked as claimed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteLostItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v3/admin/lost-found/lost/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete" }));
        throw new Error(error.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/lost"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/stats"] });
      toast({ title: "Success", description: "Lost item report deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteFoundItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v3/admin/lost-found/found/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to delete" }));
        throw new Error(error.error || "Failed to delete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/found"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v3/lost-found/stats"] });
      toast({ title: "Success", description: "Found item deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const openDetailDialog = (item: LostItem | FoundItem, type: "lost" | "found") => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setDetailDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
      lost: { color: "bg-red-100 text-red-700", icon: XCircle },
      found: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      claimed: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
      expired: { color: "bg-gray-100 text-gray-700", icon: Clock },
      "awaiting-claim": { color: "bg-yellow-100 text-yellow-700", icon: Clock },
      donated: { color: "bg-purple-100 text-purple-700", icon: Package },
      disposed: { color: "bg-gray-100 text-gray-700", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.lost;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace("-", " ")}
      </Badge>
    );
  };

  // Filter items by search
  const filterItems = <T extends LostItem | FoundItem>(items: T[]): T[] => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.color && item.color.toLowerCase().includes(query))
    );
  };

  const filteredLostItems = filterItems<LostItem>(lostItems);
  const filteredFoundItems = filterItems<FoundItem>(foundItems);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lost & Found Management</h1>
            <p className="text-gray-500">Manage lost and found items across temples</p>
          </div>
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Temple" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Temples</SelectItem>
              {temples.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Reported Lost</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalLost}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Items Found</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalFound}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Awaiting Claim</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.awaitingClaim}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Claimed This Week</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.claimedThisWeek}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by description, category, color..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="found">Found Items ({filteredFoundItems.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost Reports ({filteredLostItems.length})</TabsTrigger>
            <TabsTrigger value="offices">Offices ({offices.length})</TabsTrigger>
          </TabsList>

          {/* Found Items Tab */}
          <TabsContent value="found">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Found Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingFound ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
                  </div>
                ) : filteredFoundItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No found items</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Item</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temple</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Found At</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stored At</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Expiry</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFoundItems.map((item: FoundItem) => {
                          const temple = temples.find(t => t.id === item.templeId);
                          return (
                            <tr key={item._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{categoryIcons[item.category] || "📦"}</span>
                                  <div>
                                    <p className="font-medium">{item.description.slice(0, 40)}...</p>
                                    <p className="text-xs text-gray-500">{item.category} {item.color && `• ${item.color}`}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{temple?.name.split(" ")[0]}</td>
                              <td className="py-3 px-4 text-sm">{item.foundLocation}</td>
                              <td className="py-3 px-4 text-sm">{item.storedAt}</td>
                              <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{item.expiryDate}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openDetailDialog(item, "found")}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {item.status === "awaiting-claim" && (
                                    <Button 
                                      size="sm" 
                                      className="bg-blue-600 hover:bg-blue-700"
                                      onClick={() => updateFoundStatusMutation.mutate({ id: item._id, status: "claimed" })}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
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

          {/* Lost Items Tab */}
          <TabsContent value="lost">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Lost Item Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLost ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
                  </div>
                ) : filteredLostItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lost item reports</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Item</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temple</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reporter</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reported</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLostItems.map((item: LostItem) => {
                          const temple = temples.find(t => t.id === item.templeId);
                          return (
                            <tr key={item._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{categoryIcons[item.category] || "📦"}</span>
                                  <div>
                                    <p className="font-medium">{item.description.slice(0, 40)}...</p>
                                    <p className="text-xs text-gray-500">{item.category} {item.color && `• ${item.color}`}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{temple?.name.split(" ")[0]}</td>
                              <td className="py-3 px-4 text-sm font-medium">{item.reporterName}</td>
                              <td className="py-3 px-4 text-sm font-mono">{item.reporterPhone}</td>
                              <td className="py-3 px-4 text-sm">{item.reportedAt}</td>
                              <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openDetailDialog(item, "lost")}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {item.status === "lost" && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => updateLostStatusMutation.mutate({ id: item._id, status: "found" })}
                                      >
                                        Found
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        onClick={() => {
                                          if (confirm("Delete this report?")) {
                                            deleteLostItemMutation.mutate(item._id);
                                          }
                                        }}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
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

          {/* Offices Tab */}
          <TabsContent value="offices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />
                  Lost & Found Offices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offices.map((office: LostFoundOffice) => {
                    const temple = temples.find(t => t.id === office.templeId);
                    return (
                      <Card key={office.templeId} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{office.name}</h3>
                              <Badge variant="outline">{temple?.name.split(" ")[0]}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{office.location}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {office.openTime} - {office.closeTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-mono">{office.contactNumber}</span>
                              <span className="text-gray-500">{office.email}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={detailDialog} onOpenChange={setDetailDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedItemType === "lost" ? "Lost Item Report" : "Found Item Details"}
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{categoryIcons[selectedItem.category] || "📦"}</span>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {categories.find(c => c.value === selectedItem.category)?.label}
                    </h3>
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Temple</p>
                    <p className="font-medium">{temples.find(t => t.id === selectedItem.templeId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {selectedItemType === "lost" ? "Reported On" : "Found On"}
                    </p>
                    <p className="font-medium">
                      {selectedItemType === "lost" 
                        ? (selectedItem as LostItem).reportedAt 
                        : (selectedItem as FoundItem).foundAt}
                    </p>
                  </div>
                  {selectedItem.color && (
                    <div>
                      <p className="text-sm text-gray-500">Color</p>
                      <p className="font-medium">{selectedItem.color}</p>
                    </div>
                  )}
                  {selectedItemType === "lost" && (selectedItem as LostItem).brand && (
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-medium">{(selectedItem as LostItem).brand}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>

                {selectedItem.additionalDetails && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Additional Details</p>
                    <p className="text-gray-700">{selectedItem.additionalDetails}</p>
                  </div>
                )}

                {selectedItemType === "lost" && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700 mb-2 font-medium">Reporter Information</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{(selectedItem as LostItem).reporterName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-mono">{(selectedItem as LostItem).reporterPhone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItemType === "found" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 mb-2 font-medium">Storage Information</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Found At</p>
                        <p className="font-medium">{(selectedItem as FoundItem).foundLocation}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stored At</p>
                        <p className="font-medium">{(selectedItem as FoundItem).storedAt}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expiry Date</p>
                        <p className="font-medium">{(selectedItem as FoundItem).expiryDate}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialog(false)}>Close</Button>
              {selectedItem && selectedItemType === "found" && selectedItem.status === "awaiting-claim" && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    updateFoundStatusMutation.mutate({ id: selectedItem._id, status: "claimed" });
                    setDetailDialog(false);
                  }}
                >
                  Mark as Claimed
                </Button>
              )}
              {selectedItem && selectedItemType === "lost" && selectedItem.status === "lost" && (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateLostStatusMutation.mutate({ id: selectedItem._id, status: "found" });
                    setDetailDialog(false);
                  }}
                >
                  Mark as Found
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
