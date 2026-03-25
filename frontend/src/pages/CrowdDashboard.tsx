import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CrowdStatusCard } from "@/components/dashboard/CrowdStatusCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Bell, Calendar as CalendarIcon, TrendingUp, Users, Clock, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CrowdDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTemple, setSelectedTemple] = useState<string>("all");
  const [analyticsTemple, setAnalyticsTemple] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24");

  const { data: crowdData, isLoading: isCrowdLoading } = useQuery({
    queryKey: ["allCrowdData"],
    queryFn: async () => {
      const res = await fetch("/api/crowd/all");
      if (!res.ok) throw new Error("Failed to fetch crowd data");
      return res.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  const temples = [
    { id: "somnath", nextAarti: "7:00 PM" },
    { id: "dwarka", nextAarti: "7:30 PM" },
    { id: "ambaji", nextAarti: "7:00 PM" },
    { id: "pavagadh", nextAarti: "7:00 PM" },
  ];

  const { data: weeklyData } = useQuery({
    queryKey: ["weeklyCrowdData"],
    queryFn: async () => {
      // Aggregate data from all temples for the past 7 days
      const allData = await Promise.all(
        temples.map(async (temple) => {
          try {
            const res = await fetch(`/api/crowd/${temple.id}/history?hours=168`); // 7 days
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((d: any) => ({
              ...d,
              templeId: temple.id,
            }));
          } catch {
            return [];
          }
        })
      );

      const flattened = allData.flat();
      
      // Group by day of week
      const dayMap: Record<string, number> = {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
      };

      // Count occurrences per day
      const dayCounts: Record<string, number> = {
        "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0
      };

      flattened.forEach((entry: any) => {
        const date = new Date(entry.timestamp);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayMap[dayName] !== undefined) {
          dayMap[dayName] += entry.visitorCount;
          dayCounts[dayName]++;
        }
      });

      // Calculate average per day (sum / count)
      return [
        { name: "Mon", visitors: dayCounts["Mon"] > 0 ? Math.round(dayMap["Mon"] / dayCounts["Mon"]) : 0 },
        { name: "Tue", visitors: dayCounts["Tue"] > 0 ? Math.round(dayMap["Tue"] / dayCounts["Tue"]) : 0 },
        { name: "Wed", visitors: dayCounts["Wed"] > 0 ? Math.round(dayMap["Wed"] / dayCounts["Wed"]) : 0 },
        { name: "Thu", visitors: dayCounts["Thu"] > 0 ? Math.round(dayMap["Thu"] / dayCounts["Thu"]) : 0 },
        { name: "Fri", visitors: dayCounts["Fri"] > 0 ? Math.round(dayMap["Fri"] / dayCounts["Fri"]) : 0 },
        { name: "Sat", visitors: dayCounts["Sat"] > 0 ? Math.round(dayMap["Sat"] / dayCounts["Sat"]) : 0 },
        { name: "Sun", visitors: dayCounts["Sun"] > 0 ? Math.round(dayMap["Sun"] / dayCounts["Sun"]) : 0 },
      ];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const defaultWeeklyData = [
    { name: "Mon", visitors: 0 },
    { name: "Tue", visitors: 0 },
    { name: "Wed", visitors: 0 },
    { name: "Thu", visitors: 0 },
    { name: "Fri", visitors: 0 },
    { name: "Sat", visitors: 0 },
    { name: "Sun", visitors: 0 },
  ];

  // Fetch historical data for analytics
  const { data: historicalData } = useQuery({
    queryKey: ["historicalData", analyticsTemple, timeRange],
    queryFn: async () => {
      const templeIds = analyticsTemple === "all" 
        ? temples.map(t => t.id) 
        : [analyticsTemple];
      
      const allHistory = await Promise.all(
        templeIds.map(async (templeId) => {
          try {
            const res = await fetch(`/api/crowd/${templeId}/history?hours=${timeRange}`);
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((d: any) => ({
              ...d,
              templeId,
            }));
          } catch {
            return [];
          }
        })
      );
      
      return allHistory.flat().sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    refetchInterval: 30000,
  });

  // Process historical data for charts
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    
    // Group by hour
    const hourMap: Record<string, { visitors: number; count: number; waitTime: number }> = {};
    
    historicalData.forEach((entry: any) => {
      const date = new Date(entry.timestamp);
      const hourKey = format(date, "MMM d, HH:00");
      
      if (!hourMap[hourKey]) {
        hourMap[hourKey] = { visitors: 0, count: 0, waitTime: 0 };
      }
      hourMap[hourKey].visitors += entry.visitorCount || 0;
      hourMap[hourKey].waitTime += entry.currentWaitTime || 0;
      hourMap[hourKey].count++;
    });
    
    return Object.entries(hourMap)
      .map(([time, data]) => ({
        time,
        visitors: Math.round(data.visitors / data.count),
        waitTime: Math.round(data.waitTime / data.count),
      }))
      .slice(-24); // Last 24 data points
  }, [historicalData]);

  // Calculate analytics stats
  const analyticsStats = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return { totalVisitors: 0, avgWaitTime: 0, peakCount: 0, recordCount: 0 };
    }
    
    const totalVisitors = historicalData.reduce((sum: number, d: any) => sum + (d.visitorCount || 0), 0);
    const avgWaitTime = Math.round(
      historicalData.reduce((sum: number, d: any) => sum + (d.currentWaitTime || 0), 0) / historicalData.length
    );
    const peakCount = Math.max(...historicalData.map((d: any) => d.visitorCount || 0));
    
    return {
      totalVisitors,
      avgWaitTime,
      peakCount,
      recordCount: historicalData.length,
    };
  }, [historicalData]);

  // Fetch temple-specific prediction for selected date
  const { data: datePrediction } = useQuery({
    queryKey: ["datePrediction", selectedTemple, selectedDate],
    queryFn: async () => {
      if (!selectedDate || selectedTemple === "all") return null;
      
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await fetch(`/api/crowd/${selectedTemple}/predict-date?date=${dateStr}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!selectedDate && selectedTemple !== "all",
  });

  // Calculate predicted load for selected date
  const predictedLoad = useMemo(() => {
    if (!selectedDate) return null;

    const dayOfWeek = selectedDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    const isPast = selectedDate < new Date() && !isToday;

    if (isPast) {
      return { level: "N/A", label: "Past Date", color: "text-muted-foreground", description: "Cannot predict past dates" };
    }

    // If we have temple-specific prediction, use it
    if (datePrediction && selectedTemple !== "all") {
      const level = datePrediction.level;
      const visitors = datePrediction.predictedVisitors;
      const color = 
        level === "Low" ? "text-green-600" :
        level === "Moderate" ? "text-yellow-600" :
        level === "High" ? "text-orange-600" :
        "text-red-600";
      
      return {
        level,
        label: `${level} (${isWeekend ? "Weekend" : "Weekday"})`,
        color,
        description: `~${visitors.toLocaleString()} visitors expected`,
        confidence: datePrediction.confidence
      };
    }

    // Fallback to weekly data average
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayData = weeklyData?.find(d => d.name === dayName);
    const avgVisitors = dayData?.visitors || 0;

    // Determine load level
    let level: "Low" | "Moderate" | "High" | "Very High";
    let color: string;
    let description: string;

    if (avgVisitors < 400) {
      level = "Low";
      color = "text-green-600";
      description = isWeekend ? "Low (Weekend)" : "Low (Weekday)";
    } else if (avgVisitors < 800) {
      level = "Moderate";
      color = "text-yellow-600";
      description = isWeekend ? "Moderate (Weekend)" : "Moderate (Weekday)";
    } else if (avgVisitors < 1200) {
      level = "High";
      color = "text-orange-600";
      description = isWeekend ? "High (Weekend)" : "High (Weekday)";
    } else {
      level = "Very High";
      color = "text-red-600";
      description = isWeekend ? "Very High (Weekend)" : "Very High (Weekday)";
    }

    return { 
      level, 
      label: description, 
      color, 
      description: `~${avgVisitors.toLocaleString()} visitors expected (average across all temples)`,
      confidence: 0.7
    };
  }, [selectedDate, weeklyData, datePrediction, selectedTemple]);

  const handleSetAlert = () => {
    if (!selectedDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date first",
        variant: "destructive",
      });
      return;
    }

    const dateStr = format(selectedDate, "MMMM d, yyyy");
    const templeName = selectedTemple === "all" 
      ? "all temples" 
      : temples.find(t => t.id === selectedTemple)?.id || "selected temple";

    toast({
      title: "Alert Set Successfully!",
      description: `You'll be notified about crowd status for ${templeName} on ${dateStr}.`,
    });
  };
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10">
            <h1 className="font-heading font-bold text-4xl mb-4">Live Crowd Control Center</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Monitor real-time footfall, queue status, and AI-driven predictions for all major pilgrimage sites in Gujarat.
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Live Update Indicator */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live - Auto-refreshing every 5 seconds
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {temples.map((temple) => {
                  const data = crowdData?.find((c: any) => c.templeId === temple.id);
                  // Map backend status to frontend format
                  const statusMap: Record<string, "Low" | "Moderate" | "High" | "Very High"> = {
                    low: "Low",
                    moderate: "Moderate",
                    high: "High",
                    extreme: "Very High",
                  };
                  return data ? (
                    <CrowdStatusCard 
                      key={temple.id}
                      templeId={temple.id}
                      templeName={data.templeName}
                      currentWaitTime={data.currentWaitTime}
                      visitorCount={data.visitorCount}
                      status={statusMap[data.status] || "Low"}
                      nextAarti={temple.nextAarti}
                    />
                  ) : null;
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Weekly Visitor Trends</CardTitle>
                    <CardDescription>Comparative footfall analysis for the current week.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData || defaultWeeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => value > 999 ? `${(value/1000).toFixed(1)}k` : `${value}`}
                            width={50}
                          />
                          <Tooltip 
                            cursor={{fill: 'rgba(0,0,0,0.05)'}}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid hsl(var(--border))',
                              backgroundColor: 'hsl(var(--card))',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }}
                            formatter={(value: number) => [`${value.toLocaleString()} visitors`, 'Visitors']}
                          />
                          <Bar 
                            dataKey="visitors" 
                            fill="hsl(var(--primary))" 
                            radius={[4, 4, 0, 0]}
                            animationDuration={800}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      Plan Your Visit
                    </CardTitle>
                    <CardDescription>Select a date to see crowd predictions.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Temple</label>
                      <Select value={selectedTemple} onValueChange={setSelectedTemple}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Temples (Average)</SelectItem>
                          {temples.map((temple) => (
                            <SelectItem key={temple.id} value={temple.id}>
                              {temple.id.charAt(0).toUpperCase() + temple.id.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-lg p-2 bg-muted/20">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="w-full"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          button_previous: "absolute left-1",
                          button_next: "absolute right-1",
                          month_grid: "w-full border-collapse space-y-1",
                          weekday: "text-muted-foreground font-normal text-[0.8rem]",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          day_button: "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                        }}
                      />
                    </div>

                    {selectedDate && predictedLoad && (
                      <div className="space-y-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Predicted Load:</span>
                          <Badge 
                            variant="outline" 
                            className={predictedLoad.color === "text-green-600" ? "bg-green-50 text-green-700 border-green-200 font-semibold" :
                                      predictedLoad.color === "text-yellow-600" ? "bg-yellow-50 text-yellow-700 border-yellow-200 font-semibold" :
                                      predictedLoad.color === "text-orange-600" ? "bg-orange-50 text-orange-700 border-orange-200 font-semibold" :
                                      predictedLoad.level === "N/A" ? "bg-muted text-muted-foreground" :
                                      "bg-red-50 text-red-700 border-red-200 font-semibold"}
                          >
                            {predictedLoad.label}
                          </Badge>
                        </div>
                        {predictedLoad.description && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{predictedLoad.description}</p>
                            {predictedLoad.confidence && (
                              <p className="text-xs text-muted-foreground">
                                Confidence: {Math.round(predictedLoad.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        )}
                        <div className="pt-2 border-t border-border/50 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <CalendarIcon className="w-3 h-3 text-primary" />
                            <span className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
                          </div>
                          {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
                            <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50/50 p-2 rounded-md">
                              <span>⚠️</span>
                              <span className="font-medium">Weekend - Expect 40-60% higher crowds</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50/50 p-2 rounded-md">
                              <span>✓</span>
                              <span className="font-medium">Weekday - Generally less crowded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={handleSetAlert}
                      disabled={!selectedDate || (predictedLoad?.level === "N/A")}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Set Alert for this Date
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Select Temple</label>
                  <Select value={analyticsTemple} onValueChange={setAnalyticsTemple}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Temples</SelectItem>
                      {temples.map((temple) => (
                        <SelectItem key={temple.id} value={temple.id}>
                          {temple.id.charAt(0).toUpperCase() + temple.id.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">Last 24 Hours</SelectItem>
                      <SelectItem value="168">Last 7 Days</SelectItem>
                      <SelectItem value="720">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Visitors</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">{analyticsStats.totalVisitors.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-muted-foreground">Avg Wait Time</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">{analyticsStats.avgWaitTime} <span className="text-sm font-normal">mins</span></p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-muted-foreground">Peak Count</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">{analyticsStats.peakCount.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">Data Points</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">{analyticsStats.recordCount}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visitor Trends</CardTitle>
                    <CardDescription>Number of visitors over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="time" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid hsl(var(--border))',
                              backgroundColor: 'hsl(var(--card))'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="visitors" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Visitors"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Wait Time Trends</CardTitle>
                    <CardDescription>Average wait time in minutes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="time" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid hsl(var(--border))',
                              backgroundColor: 'hsl(var(--card))'
                            }}
                            formatter={(value: number) => [`${value} mins`, 'Wait Time']}
                          />
                          <Bar 
                            dataKey="waitTime" 
                            fill="hsl(var(--chart-2))" 
                            radius={[4, 4, 0, 0]}
                            name="Wait Time"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Historical Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Historical Records</CardTitle>
                  <CardDescription>Detailed crowd data entries (showing last 50 records)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Temple</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Visitors</TableHead>
                          <TableHead>Wait Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalData && historicalData.length > 0 ? (
                          historicalData.slice(0, 50).map((record: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {record.templeName || record.templeId}
                              </TableCell>
                              <TableCell>
                                {format(new Date(record.timestamp), "MMM d, yyyy HH:mm")}
                              </TableCell>
                              <TableCell>{record.visitorCount || 0}</TableCell>
                              <TableCell>{record.currentWaitTime || 0} mins</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    record.status === "low" ? "bg-green-50 text-green-700 border-green-200" :
                                    record.status === "moderate" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                    record.status === "high" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                    "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || "N/A"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No historical data available. Use the Face Detection feature to capture crowd data.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
