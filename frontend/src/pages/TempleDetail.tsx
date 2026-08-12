import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { temples } from "@/data/temples";
import { MapPin, Clock, Calendar, Users, Info, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { CrowdStatusCard } from "@/components/dashboard/CrowdStatusCard";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function TempleDetail() {
  const [, params] = useRoute("/temples/:id");
  const templeId = params?.id;
  const temple = temples.find(t => t.id === templeId);
  const { t } = useTranslation();

  const { data: crowdData } = useQuery({
    queryKey: ["crowdData", templeId],
    queryFn: async () => {
      if (!templeId) return null;
      const res = await fetch(`/api/crowd/${templeId}`);
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (!temple) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t("templeDetail.notFound")}</h1>
            <Link href="/temples">
              <Button>{t("templeDetail.backToTemples")}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const templesAarti = {
    somnath: "7:00 PM",
    dwarka: "7:30 PM",
    ambaji: "7:00 PM",
    pavagadh: "N/A",
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/temples">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("templeDetail.backToTemples")}
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative h-96 rounded-2xl overflow-hidden">
                <img 
                  src={temple.image} 
                  alt={temple.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="font-heading font-bold text-4xl mb-2">{temple.name}</h1>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{temple.location}</span>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t("templeDetail.about")} {temple.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{temple.description}</p>
                  <div>
                    <h3 className="font-bold mb-2">History</h3>
                    <p className="text-muted-foreground leading-relaxed">{temple.history}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timings & Aarti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Temple Timings</p>
                      <p className="text-muted-foreground">{temple.timings}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Aarti Times</p>
                    <div className="flex flex-wrap gap-2">
                      {temple.aartiTimes.map((time, idx) => (
                        <Badge key={idx} variant="secondary">{time}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {temple.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {crowdData && (
                <CrowdStatusCard
                  templeId={temple.id}
                  templeName={crowdData.templeName}
                  currentWaitTime={crowdData.currentWaitTime}
                  status={crowdData.status}
                  nextAarti={templesAarti[temple.id as keyof typeof templesAarti] || "N/A"}
                />
              )}

              {/* Weather Widget */}
              <WeatherWidget templeId={temple.id} templeName={temple.name} />

              <Card>
                <CardHeader>
                  <CardTitle>{t("templeDetail.bookDarshan")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingDialog templeId={temple.id} templeName={temple.name}>
                    <Button className="w-full" size="lg">
                      {t("templeDetail.bookDarshan")}
                    </Button>
                  </BookingDialog>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("home.planYourVisit")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/festivals">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t("nav.festivalCalendar")}
                    </Button>
                  </Link>
                  <Link href="/routes">
                    <Button variant="outline" className="w-full justify-start">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t("nav.templeRoutes")}
                    </Button>
                  </Link>
                  <Link href="/parking">
                    <Button variant="outline" className="w-full justify-start">
                      <Info className="w-4 h-4 mr-2" />
                      {t("nav.smartParking")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

