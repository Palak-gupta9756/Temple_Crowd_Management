import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Building2 } from "lucide-react";
import { temples } from "@/data/temples";

export default function AdminTemples() {
  // Fetch crowd data for temples
  const { data: crowdData = [] } = useQuery({
    queryKey: ["/api/crowd/all"],
    queryFn: async () => {
      const res = await fetch("/api/crowd/all");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const getCrowdInfo = (templeId: string) => {
    return crowdData.find((c: any) => c.templeId === templeId);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700";
      case "moderate":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Temples Management</h1>
          <p className="text-gray-500">View and manage temple information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Temples</p>
                <p className="text-2xl font-bold">{temples.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Crowd</p>
                <p className="text-2xl font-bold">
                  {crowdData.filter((c: any) => c.status?.toLowerCase() === "low").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-100">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Crowd</p>
                <p className="text-2xl font-bold">
                  {crowdData.filter((c: any) => c.status?.toLowerCase() === "high").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {temples.map((temple) => {
            const crowd = getCrowdInfo(temple.id);
            return (
              <Card key={temple.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  {/* Temple Image */}
                  <div className="w-32 h-32 shrink-0">
                    <img 
                      src={temple.image} 
                      alt={temple.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Temple Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{temple.name}</h3>
                      {crowd && (
                        <Badge className={getStatusColor(crowd.status)}>
                          {crowd.status || "Unknown"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{temple.location}</span>
                      </div>
                      {crowd && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Wait: {crowd.currentWaitTime} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>Visitors: {crowd.visitorCount}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
