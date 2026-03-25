import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings/all"],
    queryFn: async () => {
      const res = await fetch("/api/bookings/all");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/all"] });
      toast({ title: "Success", description: "Booking status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-500">Manage all darshan bookings</p>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temple</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Devotees</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking: any) => (
                      <tr key={booking._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                          {booking._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{booking.templeName}</td>
                        <td className="py-3 px-4 text-sm">{booking.visitDate}</td>
                        <td className="py-3 px-4 text-sm">{booking.timeSlot}</td>
                        <td className="py-3 px-4 text-sm">{booking.numberOfDevotees}</td>
                        <td className="py-3 px-4">{getStatusBadge(booking.bookingStatus)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.bookingStatus === "Pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    id: booking._id, 
                                    status: "Confirmed" 
                                  })}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updateStatusMutation.mutate({ 
                                    id: booking._id, 
                                    status: "Cancelled" 
                                  })}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="font-mono font-medium">{selectedBooking._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(selectedBooking.bookingStatus)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Temple</p>
                    <p className="font-medium">{selectedBooking.templeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Darshan Type</p>
                    <p className="font-medium">{selectedBooking.darshanType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visit Date</p>
                    <p className="font-medium">{selectedBooking.visitDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium">{selectedBooking.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purpose</p>
                    <p className="font-medium">{selectedBooking.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Number of Devotees</p>
                    <p className="font-medium">{selectedBooking.numberOfDevotees}</p>
                  </div>
                </div>

                {/* Devotees */}
                <div>
                  <h3 className="font-semibold mb-3">Devotee Information</h3>
                  <div className="space-y-3">
                    {selectedBooking.devotees?.map((devotee: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex gap-4">
                          {/* Photo */}
                          {devotee.photoUrl && (
                            <img 
                              src={devotee.photoUrl} 
                              alt={devotee.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{devotee.name}</p>
                            <p className="text-sm text-gray-500">
                              {devotee.age} years • {devotee.gender}
                            </p>
                            <p className="text-sm text-gray-500">
                              {devotee.idProof?.idType}: {devotee.idProof?.idNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
