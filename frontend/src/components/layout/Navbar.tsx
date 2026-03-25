import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, Sun, Moon, Search, User, LogOut, Camera, CalendarDays, Map, ParkingCircle, ChevronDown, Siren, Heart, Package, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks: { href: string; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { href: "/", label: "Home" },
    { href: "/temples", label: "Temples" },
    { href: "/dashboard", label: "Live Crowd Status" },
    { href: "/ai-planner", label: "Yatra AI Planner" },
    { href: "/virtual-darshan", label: "Virtual Darshan", icon: Video },
  ];

  const planningLinks = [
    { href: "/festivals", label: "Festival Calendar", icon: CalendarDays },
    { href: "/routes", label: "Temple Routes", icon: Map },
    { href: "/parking", label: "Smart Parking", icon: ParkingCircle },
  ];

  const safetyLinks = [
    { href: "/emergency", label: "Emergency Services", icon: Siren },
    { href: "/medical", label: "Medical Assistance", icon: Heart },
    { href: "/lost-found", label: "Lost & Found", icon: Package },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
            <Sun className="w-6 h-6 fill-current" />
          </div>
          <span className="font-heading font-bold text-2xl text-foreground tracking-tight">
            Yatra<span className="text-primary">Setu</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-1 flex items-center gap-1",
                location === link.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.label}
              {location === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          ))}

          {/* Planning Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-1 flex items-center gap-1",
                  ["/festivals", "/routes", "/parking"].includes(location)
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                Plan Your Visit
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {planningLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>
                    <span className="cursor-pointer flex items-center gap-2 w-full">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Safety Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-1 flex items-center gap-1",
                  ["/emergency", "/medical", "/lost-found"].includes(location)
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <Siren className="w-4 h-4 text-red-500" />
                Safety
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {safetyLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>
                    <span className="cursor-pointer flex items-center gap-2 w-full">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : !user ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="default" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : null}

          <BookingDialog>
            <Button variant="default" size="sm" className="rounded-full px-6">
              Book Darshan
            </Button>
          </BookingDialog>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <span className="cursor-pointer flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">
                    <span className="cursor-pointer">My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "text-lg font-medium p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                  location === link.href ? "text-primary bg-accent/50" : "text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                {link.label}
              </a>
            </Link>
          ))}

          {/* Planning Links for Mobile */}
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-xs text-muted-foreground px-2 mb-2">Plan Your Visit</p>
            {planningLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "text-base font-medium p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                    location === link.href ? "text-primary bg-accent/50" : "text-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Safety Links for Mobile */}
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-xs text-muted-foreground px-2 mb-2 flex items-center gap-1">
              <Siren className="w-3 h-3 text-red-500" />
              Safety & Emergency
            </p>
            {safetyLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "text-base font-medium p-2 rounded-md hover:bg-accent transition-colors flex items-center gap-2",
                    location === link.href ? "text-primary bg-accent/50" : "text-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {isLoading ? (
            <div className="w-full h-10 rounded-md bg-muted animate-pulse" />
          ) : !user ? (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Button>
              </Link>
            </div>
          ) : null}

          <BookingDialog>
            <Button className="w-full mt-2">Book Darshan</Button>
          </BookingDialog>

          {user && (
            <>
              <div className="border-t border-border pt-4 mt-2">
                <Link href="/profile">
                  <Button variant="outline" className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link href="/my-bookings">
                  <Button variant="outline" className="w-full mb-2" onClick={() => setIsMobileMenuOpen(false)}>
                    My Bookings
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
