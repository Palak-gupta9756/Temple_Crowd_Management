import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Building2, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  CalendarDays,
  Map,
  ParkingCircle,
  Siren,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/bookings", icon: Calendar, label: "Bookings" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/temples", icon: Building2, label: "Temples" },
];

const planningItems = [
  { path: "/admin/festivals", icon: CalendarDays, label: "Festivals" },
  { path: "/admin/routes", icon: Map, label: "Routes & Zones" },
  { path: "/admin/parking", icon: ParkingCircle, label: "Parking" },
];

const safetyItems = [
  { path: "/admin/emergency", icon: Siren, label: "Emergency Services" },
  { path: "/admin/lost-found", icon: Package, label: "Lost & Found" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-orange-600 text-white p-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <h1 className="text-lg font-bold">YatraSetu Admin</h1>
        <div className="w-6" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transition-transform duration-300
          flex flex-col
        `}>
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <ChevronLeft className="h-5 w-5 text-gray-500" />
                <h1 className="text-xl font-bold text-orange-600">YatraSetu Admin</h1>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.path || 
                (item.path !== "/admin" && location.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${isActive 
                      ? 'bg-orange-100 text-orange-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            {/* Planning Section */}
            <div className="pt-4 mt-4 border-t">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Plan Your Visit
              </p>
              {planningItems.map((item) => {
                const isActive = location === item.path || location.startsWith(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-orange-100 text-orange-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Safety Section */}
            <div className="pt-4 mt-4 border-t">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Safety & Emergency
              </p>
              {safetyItems.map((item) => {
                const isActive = location === item.path || location.startsWith(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                      transition-colors duration-200
                      ${isActive 
                        ? 'bg-red-100 text-red-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User info & logout */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@yatrasetu.com'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
