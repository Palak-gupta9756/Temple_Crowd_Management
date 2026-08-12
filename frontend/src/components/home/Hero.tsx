import { ArrowRight, Users, Clock, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// Temple images
const somnathImg = "/images/majestic_somnath_temple_at_sunset_by_the_sea.png";
const dwarkaImg = "/images/grand_dwarkadhish_temple_architecture.png";
const ambajiImg = "/images/ambaji_temple_glowing_at_twilight.png";
const pavagadhImg = "/images/pavagadh_kalika_mata_temple_on_hilltop.png";

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Slider/Image - simplified to Somnath for now with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <img 
          src={somnathImg} 
          alt="Somnath Temple" 
          className="w-full h-full object-cover opacity-90"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t("hero.badge")}
          </div>
          
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-tight mb-6 text-foreground drop-shadow-sm">
            {t("hero.heading1")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              {t("hero.heading2")}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 rounded-full shadow-lg shadow-primary/20">
                {t("hero.checkLiveStatus")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/ai-planner">
              <Button size="lg" variant="outline" className="text-lg px-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 border-primary/20">
                {t("hero.askAI")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Quick Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:grid grid-cols-2 gap-4"
        >
          {[
            { name: "Somnath", img: somnathImg, wait: "15 min", status: t("hero.lowCrowd") },
            { name: "Dwarka", img: dwarkaImg, wait: "45 min", status: t("hero.moderate") },
            { name: "Ambaji", img: ambajiImg, wait: "10 min", status: t("hero.lowCrowd") },
            { name: "Pavagadh", img: pavagadhImg, wait: "90 min", status: t("hero.highCrowd") },
          ].map((temple, idx) => (
            <div key={idx} className="group relative h-48 rounded-2xl overflow-hidden border border-white/10 shadow-xl cursor-pointer hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img src={temple.img} alt={temple.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              
              <div className="absolute bottom-0 left-0 w-full p-4 z-20 text-white">
                <h3 className="font-heading font-bold text-lg">{temple.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 text-xs font-medium bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> {temple.wait}
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-md",
                    temple.status.includes("Low") ? "bg-green-500/80" : 
                    temple.status.includes("Moderate") ? "bg-yellow-500/80" : "bg-red-500/80"
                  )}>
                    {temple.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
