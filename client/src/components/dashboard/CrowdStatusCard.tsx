import { cn } from "@/lib/utils";
import { Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock Data for Charts
const hourlyData = [
  { time: "6 AM", visitors: 120 },
  { time: "9 AM", visitors: 450 },
  { time: "12 PM", visitors: 800 },
  { time: "3 PM", visitors: 600 },
  { time: "6 PM", visitors: 950 }, // Peak usually at Aarti
  { time: "9 PM", visitors: 300 },
];

interface CrowdStatusCardProps {
  templeName: string;
  currentWaitTime: number;
  status: "Low" | "Moderate" | "High" | "Very High";
  nextAarti: string;
  prediction: string;
}

export function CrowdStatusCard({ templeName, currentWaitTime, status, nextAarti, prediction }: CrowdStatusCardProps) {
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
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-accent/50 p-3 rounded-xl border border-accent">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Wait Time</span>
            </div>
            <p className="text-2xl font-bold text-primary">{currentWaitTime} <span className="text-sm font-normal text-muted-foreground">mins</span></p>
          </div>
          
          <div className="bg-accent/50 p-3 rounded-xl border border-accent">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Next Aarti</span>
            </div>
            <p className="text-xl font-bold text-foreground">{nextAarti}</p>
          </div>
        </div>

        <div className="h-32 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id={`color${templeName}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color${templeName})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p>{prediction}</p>
        </div>
      </CardContent>
    </Card>
  );
}
