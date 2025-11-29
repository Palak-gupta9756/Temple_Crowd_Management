import { Link } from "wouter";
import { MapPin, Clock, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Temple } from "@/data/temples";

interface TempleCardProps {
  temple: Temple;
}

export function TempleCard({ temple }: TempleCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-border/60">
      <div className="relative h-56 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img 
          src={temple.image} 
          alt={temple.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-4 left-4 z-20 text-white">
          <h3 className="font-heading font-bold text-xl mb-1">{temple.name}</h3>
          <div className="flex items-center gap-1 text-sm opacity-90">
            <MapPin className="w-3 h-3" /> {temple.location}
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {temple.features.slice(0, 2).map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-normal">
              {feature}
            </Badge>
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
          {temple.description}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
          <Clock className="w-3 h-3 text-primary" />
          <span>{temple.timings}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 mt-auto flex gap-3">
        <Link href={`/temples/${temple.id}`}>
          <Button variant="default" className="w-full flex-1">
            View Details
          </Button>
        </Link>
        <Button variant="outline" size="icon">
          <Info className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
