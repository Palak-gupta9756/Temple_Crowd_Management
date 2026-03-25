import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, CheckCircle, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  // Fetch bookings for stats
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings/all"],
    queryFn: async () => {
      const res = await fetch("/api/bookings/all");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch users for stats
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch crowd data for temples
  const { data: crowdData = [] } = useQuery({
    queryKey: ["/api/crowd/all"],
    queryFn: async () => {
      const res = await fetch("/api/crowd/all");
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate stats
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b: any) => b.bookingStatus === "Confirmed").length;
  const pendingBookings = bookings.filter((b: any) => b.bookingStatus === "Pending").length;
  const totalUsers = users.length;

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

  // Get recent bookings
  const recentBookings = bookings.slice(0, 5);

  const stats = [
    { title: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Total Bookings", value: totalBookings, icon: Calendar, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "Confirmed", value: confirmedBookings, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Pending", value: pendingBookings, icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome to YatraSetu Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Temple-wise Crowd Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              Temple-wise Crowd Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crowdData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No crowd data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temple</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Wait Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Visitors</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crowdData.map((temple: any) => (
                      <tr key={temple._id || temple.templeId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{temple.templeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(temple.status)}>
                            {temple.status || "Unknown"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{temple.currentWaitTime} mins</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{temple.visitorCount}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {temple.timestamp 
                            ? new Date(temple.timestamp).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temple</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Devotees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking: any) => (
                      <tr key={booking._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono">
                          {booking._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-sm">{booking.templeName}</td>
                        <td className="py-3 px-4 text-sm">{booking.visitDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.bookingStatus === 'Confirmed' 
                              ? 'bg-green-100 text-green-700'
                              : booking.bookingStatus === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {booking.bookingStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{booking.numberOfDevotees}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
