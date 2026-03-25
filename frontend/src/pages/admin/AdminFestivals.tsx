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
import { useState } from "react";
import { CalendarDays, Plus, Edit, Trash2, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Festival {
  id: string;
  name: string;
  nameHindi: string;
  date: string;
  endDate?: string;
  templeIds: string[];
  crowdMultiplier: number;
  significance: "major" | "moderate" | "minor";
  description: string;
  specialTimings?: string;
  expectedFootfall?: number;
}

const temples = [
  { id: "somnath", name: "Somnath Temple" },
  { id: "dwarka", name: "Dwarkadhish Temple" },
  { id: "ambaji", name: "Ambaji Temple" },
  { id: "pavagadh", name: "Pavagadh Temple" }
];

export default function AdminFestivals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [filterTemple, setFilterTemple] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState<Partial<Festival>>({
    name: "",
    nameHindi: "",
    date: "",
    endDate: "",
    templeIds: [],
    crowdMultiplier: 2.0,
    significance: "moderate",
    description: "",
    specialTimings: "",
    expectedFootfall: 10000
  });

  const { data: festivals = [], isLoading } = useQuery({
    queryKey: ["/api/v2/festivals"],
    queryFn: async () => {
      const res = await fetch("/api/v2/festivals");
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (festival: Partial<Festival>) => {
      const method = selectedFestival ? "PUT" : "POST";
      const url = selectedFestival 
        ? `/api/v2/admin/festivals/${selectedFestival.id}` 
        : "/api/v2/admin/festivals";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(festival),
      });
      if (!res.ok) throw new Error("Failed to save festival");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/festivals"] });
      toast({ title: "Success", description: "Festival saved successfully" });
      setEditDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save festival", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v2/admin/festivals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v2/festivals"] });
      toast({ title: "Success", description: "Festival deleted" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      nameHindi: "",
      date: "",
      endDate: "",
      templeIds: [],
      crowdMultiplier: 2.0,
      significance: "moderate",
      description: "",
      specialTimings: "",
      expectedFootfall: 10000
    });
    setSelectedFestival(null);
  };

  const openEditDialog = (festival?: Festival) => {
    if (festival) {
      setSelectedFestival(festival);
      setFormData(festival);
    } else {
      resetForm();
    }
    setEditDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.date || !formData.templeIds?.length) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case "major":
        return <Badge className="bg-red-100 text-red-700">Major</Badge>;
      case "moderate":
        return <Badge className="bg-yellow-100 text-yellow-700">Moderate</Badge>;
      case "minor":
        return <Badge className="bg-green-100 text-green-700">Minor</Badge>;
      default:
        return <Badge>{significance}</Badge>;
    }
  };

  const filteredFestivals = filterTemple === "all" 
    ? festivals 
    : festivals.filter((f: Festival) => f.templeIds?.includes(filterTemple));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Festival Management</h1>
            <p className="text-gray-500">Manage festival calendar and crowd predictions</p>
          </div>
          <Button onClick={() => openEditDialog()} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Festival
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Select value={filterTemple} onValueChange={setFilterTemple}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Temple" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Temples</SelectItem>
              {temples.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">{filteredFestivals.length} Festivals</Badge>
        </div>

        {/* Festivals Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-600" />
              Festival Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredFestivals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No festivals found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Festival</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temples</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Crowd</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Significance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFestivals.map((festival: Festival) => (
                      <tr key={festival.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{festival.name}</p>
                            <p className="text-sm text-gray-500">{festival.nameHindi}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {festival.date}
                          {festival.endDate && <span className="text-gray-500"> to {festival.endDate}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {festival.templeIds?.map(id => {
                              const temple = temples.find(t => t.id === id);
                              return (
                                <Badge key={id} variant="outline" className="text-xs">
                                  {temple?.name.split(" ")[0]}
                                </Badge>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${festival.crowdMultiplier >= 5 ? 'text-red-500' : festival.crowdMultiplier >= 3 ? 'text-yellow-500' : 'text-green-500'}`} />
                            <span className="text-sm">{festival.crowdMultiplier}x</span>
                          </div>
                          {festival.expectedFootfall && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              {(festival.expectedFootfall / 1000).toFixed(0)}K expected
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {getSignificanceBadge(festival.significance)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(festival)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => {
                                if (confirm("Delete this festival?")) {
                                  deleteMutation.mutate(festival.id);
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

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedFestival ? "Edit Festival" : "Add New Festival"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Festival Name (English) *</Label>
                  <Input 
                    value={formData.name || ""} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Mahashivratri"
                  />
                </div>
                <div>
                  <Label>Festival Name (Hindi)</Label>
                  <Input 
                    value={formData.nameHindi || ""} 
                    onChange={e => setFormData({...formData, nameHindi: e.target.value})}
                    placeholder="e.g., महाशिवरात्रि"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input 
                    type="date" 
                    value={formData.date || ""} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date (for multi-day)</Label>
                  <Input 
                    type="date" 
                    value={formData.endDate || ""} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>Temples *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {temples.map(temple => (
                    <Button
                      key={temple.id}
                      type="button"
                      size="sm"
                      variant={formData.templeIds?.includes(temple.id) ? "default" : "outline"}
                      onClick={() => {
                        const ids = formData.templeIds || [];
                        if (ids.includes(temple.id)) {
                          setFormData({...formData, templeIds: ids.filter(id => id !== temple.id)});
                        } else {
                          setFormData({...formData, templeIds: [...ids, temple.id]});
                        }
                      }}
                    >
                      {temple.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Significance *</Label>
                  <Select 
                    value={formData.significance || "moderate"} 
                    onValueChange={(v: "major" | "moderate" | "minor") => setFormData({...formData, significance: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="minor">Minor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Crowd Multiplier</Label>
                  <Input 
                    type="number" 
                    step="0.5"
                    min="1"
                    max="10"
                    value={formData.crowdMultiplier || 2} 
                    onChange={e => setFormData({...formData, crowdMultiplier: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Expected Footfall</Label>
                  <Input 
                    type="number" 
                    value={formData.expectedFootfall || ""} 
                    onChange={e => setFormData({...formData, expectedFootfall: parseInt(e.target.value)})}
                    placeholder="e.g., 100000"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ""} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the festival..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Special Timings</Label>
                <Textarea 
                  value={formData.specialTimings || ""} 
                  onChange={e => setFormData({...formData, specialTimings: e.target.value})}
                  placeholder="e.g., Temple open 24 hours. Special aarti at midnight."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Festival"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
