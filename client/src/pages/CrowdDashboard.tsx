import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CrowdStatusCard } from "@/components/dashboard/CrowdStatusCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

const weeklyData = [
  { name: "Mon", visitors: 4000 },
  { name: "Tue", visitors: 3000 },
  { name: "Wed", visitors: 2000 },
  { name: "Thu", visitors: 2780 },
  { name: "Fri", visitors: 1890 },
  { name: "Sat", visitors: 8390 },
  { name: "Sun", visitors: 9490 },
];

export default function CrowdDashboard() {
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CrowdStatusCard 
                  templeName="Somnath" 
                  currentWaitTime={15} 
                  status="Low" 
                  nextAarti="7:00 PM" 
                  prediction="Stable"
                />
                <CrowdStatusCard 
                  templeName="Dwarka" 
                  currentWaitTime={45} 
                  status="Moderate" 
                  nextAarti="7:30 PM" 
                  prediction="Rising"
                />
                <CrowdStatusCard 
                  templeName="Ambaji" 
                  currentWaitTime={10} 
                  status="Low" 
                  nextAarti="7:00 PM" 
                  prediction="Stable"
                />
                <CrowdStatusCard 
                  templeName="Pavagadh" 
                  currentWaitTime={90} 
                  status="High" 
                  nextAarti="N/A" 
                  prediction="Peaking"
                />
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
                        <BarChart data={weeklyData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="visitors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Plan Your Visit</CardTitle>
                    <CardDescription>Select a date to see crowd predictions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Calendar mode="single" className="rounded-md border w-full flex justify-center" />
                     <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Predicted Load:</span>
                          <span className="font-bold text-green-600">Low (Weekday)</span>
                        </div>
                        <Button className="w-full">Set Alert for this Date</Button>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
                <p className="text-muted-foreground">Detailed historical analytics module coming soon.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
