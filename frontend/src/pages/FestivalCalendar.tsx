import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, parseISO, isWithinInterval, addDays } from "date-fns";
import { CalendarDays, Users, Star, AlertTriangle, Sparkles, MapPin, Clock, TrendingUp } from "lucide-react";
import { temples } from "@/data/temples";

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

export default function FestivalCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTemple, setSelectedTemple] = useState<string>("all");

  // Fetch all festivals
  const { data: festivalsData } = useQuery({
    queryKey: ["festivals"],
    queryFn: async () => {
      const res = await fetch("/api/v2/festivals");
      if (!res.ok) throw new Error("Failed to fetch festivals");
      return res.json();
    },
  });

  // Fetch upcoming festivals
  const { data: upcomingData } = useQuery({
    queryKey: ["upcomingFestivals"],
    queryFn: async () => {
      const res = await fetch("/api/v2/festivals/upcoming?days=90");
      if (!res.ok) throw new Error("Failed to fetch upcoming festivals");
      return res.json();
    },
  });

  // Check festival on selected date
  const { data: dateCheck } = useQuery({
    queryKey: ["festivalCheck", selectedDate, selectedTemple],
    queryFn: async () => {
      if (!selectedDate) return null;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const url = selectedTemple === "all"
        ? `/api/v2/festivals/check?date=${dateStr}`
        : `/api/v2/festivals/check?date=${dateStr}&templeId=${selectedTemple}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to check date");
      return res.json();
    },
    enabled: !!selectedDate,
  });

  const festivals: Festival[] = festivalsData?.data || [];
  const upcomingFestivals: Festival[] = upcomingData?.data || [];

  // Get festivals for a temple
  const getTempleFestivals = (templeId: string) => {
    return festivals.filter(f => f.templeIds.includes(templeId));
  };

  // Filter festivals based on selected temple
  const filteredFestivals = selectedTemple === "all"
    ? festivals
    : getTempleFestivals(selectedTemple);

  // Create date markers for calendar - dates with festivals
  const festivalDates = festivals.map(f => {
    const start = parseISO(f.date);
    const end = f.endDate ? parseISO(f.endDate) : start;
    return { start, end, significance: f.significance };
  });

  const isDateHighlighted = (date: Date) => {
    return festivalDates.some(f => 
      isWithinInterval(date, { start: f.start, end: addDays(f.end, 1) })
    );
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "major": return "bg-red-500";
      case "moderate": return "bg-orange-500";
      case "minor": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case "major": return <Badge className="bg-red-500 text-white">Major</Badge>;
      case "moderate": return <Badge className="bg-orange-500 text-white">Moderate</Badge>;
      case "minor": return <Badge className="bg-blue-500 text-white">Minor</Badge>;
      default: return null;
    }
  };

  const getCrowdImpactBadge = (multiplier: number) => {
    if (multiplier >= 5) return <Badge variant="destructive">Extreme Crowds</Badge>;
    if (multiplier >= 3) return <Badge className="bg-orange-500">High Crowds</Badge>;
    if (multiplier >= 2) return <Badge className="bg-yellow-500 text-black">Moderate Crowds</Badge>;
    return <Badge className="bg-green-500">Normal</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2 flex items-center justify-center gap-2">
            <CalendarDays className="w-10 h-10" />
            Festival Calendar
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Plan your pilgrimage around festivals. Know which days to expect crowds and get special darshan timings.
          </p>
        </div>

        {/* Temple Filter */}
        <div className="flex justify-center mb-8">
          <Select value={selectedTemple} onValueChange={setSelectedTemple}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Temple" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Temples</SelectItem>
              {temples.map(temple => (
                <SelectItem key={temple.id} value={temple.id}>{temple.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upcoming">Upcoming Festivals</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="all">All Festivals</TabsTrigger>
          </TabsList>

          {/* Upcoming Festivals Tab */}
          <TabsContent value="upcoming">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingFestivals.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No upcoming festivals in the next 90 days</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingFestivals.map(festival => (
                  <Card key={festival.id} className="hover:shadow-lg transition-shadow border-l-4" style={{
                    borderLeftColor: festival.significance === "major" ? "#ef4444" : 
                                    festival.significance === "moderate" ? "#f97316" : "#3b82f6"
                  }}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{festival.name}</CardTitle>
                        {getSignificanceBadge(festival.significance)}
                      </div>
                      <CardDescription className="text-orange-600 font-medium">
                        {festival.nameHindi}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <span>
                            {format(parseISO(festival.date), "MMM d, yyyy")}
                            {festival.endDate && ` - ${format(parseISO(festival.endDate), "MMM d, yyyy")}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>
                            {festival.templeIds.map(id => 
                              temples.find(t => t.id === id)?.name || id
                            ).join(", ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          {getCrowdImpactBadge(festival.crowdMultiplier)}
                          <span className="text-sm text-gray-500">
                            ({festival.crowdMultiplier}x normal)
                          </span>
                        </div>

                        {festival.expectedFootfall && (
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span>Expected: {(festival.expectedFootfall / 1000).toFixed(0)}K+ visitors</span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600 mt-2">{festival.description}</p>

                        {festival.specialTimings && (
                          <div className="bg-orange-50 p-3 rounded-lg mt-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                              <Clock className="w-4 h-4" />
                              Special Timings
                            </div>
                            <p className="text-sm text-orange-600 mt-1">{festival.specialTimings}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>Dates with festivals are highlighted</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      festival: (date) => isDateHighlighted(date),
                    }}
                    modifiersStyles={{
                      festival: { 
                        backgroundColor: "#fed7aa",
                        fontWeight: "bold",
                        borderRadius: "4px"
                      },
                    }}
                  />
                </CardContent>
              </Card>

              {/* Date Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                  </CardTitle>
                  <CardDescription>Festival and crowd information</CardDescription>
                </CardHeader>
                <CardContent>
                  {dateCheck ? (
                    <div className="space-y-4">
                      {dateCheck.hasFestival ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <span className="font-semibold text-lg">{dateCheck.festival.name}</span>
                            {getSignificanceBadge(dateCheck.festival.significance)}
                          </div>
                          
                          <p className="text-gray-600">{dateCheck.festival.description}</p>
                          
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <span className="font-medium">Crowd Impact: {dateCheck.crowdImpact.toUpperCase()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Expect {dateCheck.crowdMultiplier}x more visitors than usual
                            </p>
                          </div>

                          {dateCheck.festival.specialTimings && (
                            <div className="bg-orange-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span className="font-medium">Special Timings</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{dateCheck.festival.specialTimings}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-green-500" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">Regular Day</h3>
                          <p className="text-gray-600">No major festivals on this date. Good day for a peaceful darshan!</p>
                          <Badge className="mt-3 bg-green-500">Normal Crowd Expected</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Select a date to see festival information
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Festivals Tab */}
          <TabsContent value="all">
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex gap-4 justify-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Major Festival</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Moderate Festival</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Local/Minor Festival</span>
                </div>
              </div>

              {/* Festival List */}
              <div className="grid gap-3">
                {filteredFestivals.map(festival => (
                  <Card key={festival.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-12 rounded-full ${getSignificanceColor(festival.significance)}`}></div>
                          <div>
                            <h3 className="font-semibold">{festival.name}</h3>
                            <p className="text-sm text-orange-600">{festival.nameHindi}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-gray-500" />
                            {format(parseISO(festival.date), "MMM d")}
                            {festival.endDate && ` - ${format(parseISO(festival.endDate), "MMM d")}`}
                          </div>
                          
                          <div className="flex gap-1">
                            {festival.templeIds.map(id => (
                              <Badge key={id} variant="outline" className="text-xs">
                                {temples.find(t => t.id === id)?.name.split(" ")[0] || id}
                              </Badge>
                            ))}
                          </div>
                          
                          {getCrowdImpactBadge(festival.crowdMultiplier)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
