import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PilgrimAssistant } from "@/components/ai/PilgrimAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";

export default function AiPlanner() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-24 relative overflow-hidden">
         {/* Decorative background elements */}
         <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
               <Bot className="w-8 h-8" />
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">Yatra Sahayak AI</h1>
            <p className="text-xl text-muted-foreground">
              Your personal spiritual guide. Ask about temple timings, best routes, accommodation, or historical significance.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
               <PilgrimAssistant />
            </div>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-4 h-4 text-primary" /> Suggested Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Is Somnath crowded right now?",
                    "Best route from Ahmedabad to Dwarka?",
                    "Book a wheelchair at Ambaji",
                    "History of Pavagadh temple",
                    "Nearest Dharamshala to Dwarka"
                  ].map((prompt, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      className="w-full justify-start text-left h-auto py-3 whitespace-normal text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {prompt}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Start chatting with the AI to build your pilgrimage plan.
                  </p>
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
