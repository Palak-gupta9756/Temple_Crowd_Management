import { Sun, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Sun className="w-5 h-5 fill-current" />
              </div>
              <span className="font-heading font-bold text-xl">
                Yatra<span className="text-primary">Setu</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Simplifying spiritual journeys with AI-powered crowd management and smart planning for Gujarat's holiest pilgrimages.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><a className="hover:text-primary transition-colors">Home</a></Link></li>
              <li><Link href="/temples"><a className="hover:text-primary transition-colors">Temples</a></Link></li>
              <li><Link href="/dashboard"><a className="hover:text-primary transition-colors">Live Status</a></Link></li>
              <li><Link href="/ai-planner"><a className="hover:text-primary transition-colors">AI Assistant</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Temples</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/temples?id=somnath"><a className="hover:text-primary transition-colors">Somnath Mahadev</a></Link></li>
              <li><Link href="/temples?id=dwarka"><a className="hover:text-primary transition-colors">Dwarkadhish</a></Link></li>
              <li><Link href="/temples?id=ambaji"><a className="hover:text-primary transition-colors">Ambaji Mata</a></Link></li>
              <li><Link href="/temples?id=pavagadh"><a className="hover:text-primary transition-colors">Pavagadh Shakti Peeth</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Gujarat Tourism Board,<br />Gandhinagar, Gujarat</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+91 1800-233-7951</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>help@yatrasetu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 YatraSetu. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for Devotees
          </p>
        </div>
      </div>
    </footer>
  );
}
