import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Users, MapPin, X, User, CreditCard, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Devotee {
  name: string;
  age: number;
  gender: string;
  photoUrl: string;
  idProof: {
    idType: string;
    idNumber: string;
    idFileUrl: string;
  };
}

interface Booking {
  _id: string;
  templeId: string;
  templeName: string;
  darshanType: string;
  visitDate: string;
  timeSlot: string;
  numberOfDevotees: number;
  purpose: string;
  bookingStatus: string;
  createdAt: string;
  devotees?: Devotee[];
  qrCode?: string;
}

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { t } = useTranslation();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500";
      case "Pending":
        return "bg-yellow-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t("common.loginRequired")}</CardTitle>
              <CardDescription>
                {t("bookings.loginDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">{t("common.loginBtn")}</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">{t("bookings.title")}</h1>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{t("bookings.noBookings")}</p>
              <Link href="/temples">
                <Button>Browse Temples</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card 
                key={booking._id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedBooking(booking)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {booking.templeName}
                      </CardTitle>
                      <CardDescription>{booking.purpose}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.bookingStatus)}>
                        {booking.bookingStatus}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.visitDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.numberOfDevotees} {t("bookings.devotees")}</span>
                    </div>
                    <div>
                      <Badge variant="outline">{booking.darshanType} Darshan</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedBooking?.templeName}
              </DialogTitle>
              <DialogDescription>
                Booking Details - {selectedBooking?.purpose}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh] pr-4">
              {selectedBooking && (
                <div className="space-y-6">
                  {/* Booking Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Visit Date</p>
                      <p className="font-medium">{selectedBooking.visitDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Slot</p>
                      <p className="font-medium">{selectedBooking.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Darshan Type</p>
                      <p className="font-medium">{selectedBooking.darshanType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(selectedBooking.bookingStatus)}>
                        {selectedBooking.bookingStatus}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Devotees Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Devotees ({selectedBooking.devotees?.length || 0})
                    </h3>
                    
                    <div className="space-y-6">
                      {selectedBooking.devotees?.map((devotee, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {devotee.name}
                            </CardTitle>
                            <CardDescription>
                              {devotee.age} years • {devotee.gender}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Photo */}
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Photo</p>
                                <div className="w-32 h-40 rounded-lg overflow-hidden border bg-muted">
                                  {devotee.photoUrl ? (
                                    <img 
                                      src={devotee.photoUrl} 
                                      alt={`${devotee.name}'s photo`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* ID Proof */}
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  ID Proof ({devotee.idProof?.idType})
                                </p>
                                <div className="space-y-2">
                                  <p className="text-sm flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span className="font-mono">{devotee.idProof?.idNumber}</span>
                                  </p>
                                  {devotee.idProof?.idFileUrl && (
                                    <div className="w-48 h-32 rounded-lg overflow-hidden border bg-muted">
                                      <img 
                                        src={devotee.idProof.idFileUrl} 
                                        alt={`${devotee.name}'s ID`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* QR Code if available */}
                  {selectedBooking.qrCode && (
                    <>
                      <Separator />
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4">Booking QR Code</h3>
                        <div className="inline-block p-4 bg-white rounded-lg">
                          <img 
                            src={selectedBooking.qrCode} 
                            alt="Booking QR Code"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
