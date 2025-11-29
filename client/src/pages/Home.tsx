import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CrowdStatusCard } from "@/components/dashboard/CrowdStatusCard";
import { PilgrimAssistant } from "@/components/ai/PilgrimAssistant";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Calendar, Shield } from "lucide-react";
import { Link } from "wouter";

import aiBg from "@assets/generated_images/abstract_ai_technology_meets_spirituality_background.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      
      <main>
        <Hero />

        {/* Live Status Section */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">Live Darshan Status</h2>
                <p className="text-muted-foreground">Real-time crowd analytics to help you plan your visit right now.</p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" className="group">
                  View Full Dashboard <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CrowdStatusCard 
                templeName="Somnath" 
                currentWaitTime={15} 
                status="Low" 
                nextAarti="7:00 PM" 
                prediction="Crowd expected to increase by 5 PM"
              />
              <CrowdStatusCard 
                templeName="Dwarka" 
                currentWaitTime={45} 
                status="Moderate" 
                nextAarti="7:30 PM" 
                prediction="Wait time likely to drop after 8 PM"
              />
              <CrowdStatusCard 
                templeName="Ambaji" 
                currentWaitTime={10} 
                status="Low" 
                nextAarti="7:00 PM" 
                prediction="Ideal time to visit is now"
              />
              <CrowdStatusCard 
                templeName="Pavagadh" 
                currentWaitTime={90} 
                status="High" 
                nextAarti="N/A" 
                prediction="Ropeway queue is very long"
              />
            </div>
          </div>
        </section>

        {/* AI Assistant Feature Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <img src={aiBg} alt="bg" className="w-full h-full object-cover" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <PilgrimAssistant />
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                  <span className="text-lg">🤖</span> AI Powered Planning
                </div>
                <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6 leading-tight">
                  Meet Your Smart <br />
                  <span className="text-primary">Yatra Sahayak</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Not sure when to visit? Have questions about accommodation or rituals? Our AI assistant is trained on historical data and real-time inputs to guide you perfectly.
                </p>
                
                <ul className="space-y-6">
                  {[
                    { icon: Calendar, title: "Smart Scheduling", desc: "Get personalized itineraries based on crowd predictions." },
                    { icon: Map, title: "Route Optimization", desc: "Find the best path to cover multiple temples efficiently." },
                    { icon: Shield, title: "Safety Alerts", desc: "Real-time updates on weather and emergency protocols." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0 text-primary">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground text-center">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-4xl mb-6">Ready for a Divine Experience?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Plan your pilgrimage today with YatraSetu and focus on devotion, not the crowds.
            </p>
            <div className="flex justify-center gap-4">
               <Link href="/ai-planner">
                <Button size="lg" variant="secondary" className="text-lg px-8 rounded-full shadow-xl">
                  Start Planning with AI
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
