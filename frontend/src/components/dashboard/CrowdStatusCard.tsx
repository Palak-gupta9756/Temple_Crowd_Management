import { cn } from "@/lib/utils";
import { Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface CrowdStatusCardProps {
  templeId: string;
  templeName: string;
  currentWaitTime: number;
  visitorCount?: number;
  status: "Low" | "Moderate" | "High" | "Very High";
  nextAarti: string;
  prediction?: string;
}

export function CrowdStatusCard({ templeId, templeName, currentWaitTime, visitorCount, status, nextAarti, prediction: initialPrediction }: CrowdStatusCardProps) {
  const [prediction, setPrediction] = useState(initialPrediction || "Loading prediction...");

  const { data: history } = useQuery({
    queryKey: ["crowdHistory", templeId],
    queryFn: async () => {
      const res = await fetch(`/api/crowd/${templeId}/history?hours=24`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch(`/api/crowd/${templeId}/prediction`);
        if (res.ok) {
          const data = await res.json();
          setPrediction(data.prediction);
        }
      } catch (error) {
        console.error("Failed to fetch prediction:", error);
      }
    }
    if (!initialPrediction) {
      fetchPrediction();
    }
  }, [templeId, initialPrediction]);

  // Process history data - group by hour for better visualization
  const hourlyData = (() => {
    if (!history || history.length === 0) {
      return [
        { time: "6 AM", visitors: 0 },
        { time: "9 AM", visitors: 0 },
        { time: "12 PM", visitors: 0 },
        { time: "3 PM", visitors: 0 },
        { time: "6 PM", visitors: 0 },
        { time: "9 PM", visitors: 0 },
      ];
    }

    // Group by hour and average
    const hourMap: Record<number, number[]> = {};
    history.forEach((h: any) => {
      const date = new Date(h.timestamp);
      const hour = date.getHours();
      if (!hourMap[hour]) hourMap[hour] = [];
      hourMap[hour].push(h.visitorCount);
    });

    // Get last 24 hours, group by hour
    const now = new Date();
    const dataPoints: Array<{ time: string; visitors: number; hour: number }> = [];
    
    for (let i = 23; i >= 0; i--) {
      const checkHour = (now.getHours() - i + 24) % 24;
      const visitors = hourMap[checkHour] 
        ? Math.round(hourMap[checkHour].reduce((a, b) => a + b, 0) / hourMap[checkHour].length)
        : 0;
      
      const timeLabel = checkHour === 0 ? "12 AM" :
                        checkHour < 12 ? `${checkHour} AM` :
                        checkHour === 12 ? "12 PM" :
                        `${checkHour - 12} PM`;
      
      dataPoints.push({ time: timeLabel, visitors, hour: checkHour });
    }

    // Return last 12 hours for cleaner display
    return dataPoints.slice(-12);
  })();

  const statusColor = 
    status === "Low" ? "text-green-600 bg-green-50 border-green-200" :
    status === "Moderate" ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
    "text-red-600 bg-red-50 border-red-200";

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-heading font-bold text-foreground">{templeName}</CardTitle>
            <p className="text-sm text-muted-foreground">Live Crowd Analytics</p>
          </div>
          <Badge variant="outline" className={cn("font-bold", statusColor)}>
            {status} Traffic
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-accent/50 p-3 rounded-xl border border-accent">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Current</span>
            </div>
            <p className="text-2xl font-bold text-primary">{visitorCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">visitors</p>
          </div>

          <div className="bg-accent/50 p-3 rounded-xl border border-accent">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Wait</span>
            </div>
            <p className="text-2xl font-bold text-primary">{currentWaitTime}</p>
            <p className="text-xs text-muted-foreground">mins</p>
          </div>
          
          <div className="bg-accent/50 p-3 rounded-xl border border-accent">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Aarti</span>
            </div>
            <p className="text-lg font-bold text-foreground">{nextAarti}</p>
          </div>
        </div>

        <div className="h-32 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`color${templeName.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value) => value > 999 ? `${(value/1000).toFixed(1)}k` : `${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid hsl(var(--border))', 
                  backgroundColor: 'hsl(var(--card))',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                formatter={(value: number) => [`${value} visitors`, 'Visitors']}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color${templeName.replace(/\s+/g, '')})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              }}
            >
              {prediction}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
