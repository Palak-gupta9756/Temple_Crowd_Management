import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CrowdDashboard from "@/pages/CrowdDashboard";
import AiPlanner from "@/pages/AiPlanner";
import TemplesPage from "@/pages/Temples";
import TempleDetail from "@/pages/TempleDetail";
import BookingsPage from "@/pages/Bookings";
import ProfilePage from "@/pages/Profile";
import CameraDetection from "@/pages/CameraDetection";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { 
  AdminDashboard, 
  AdminBookings, 
  AdminUsers, 
  AdminTemples,
  AdminFestivals,
  AdminRoutes,
  AdminParking,
  AdminEmergency,
  AdminLostFound
} from "@/pages/admin";
// Phase 2 Pages
import FestivalCalendar from "@/pages/FestivalCalendar";
import TempleRoutes from "@/pages/TempleRoutes";
import ParkingManagement from "@/pages/ParkingManagement";
// Phase 3 Pages
import EmergencyAlert from "@/pages/EmergencyAlert";
import MedicalEmergency from "@/pages/MedicalEmergency";
import LostAndFound from "@/pages/LostAndFound";
// Phase 4 Pages
import VirtualDarshan from "@/pages/VirtualDarshan";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={CrowdDashboard} />
      <Route path="/ai-planner" component={AiPlanner} />
      <Route path="/temples" component={TemplesPage} />
      <Route path="/temples/:id" component={TempleDetail} />
      <Route path="/bookings" component={BookingsPage} />
      <Route path="/my-bookings" component={BookingsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/camera-detection" component={CameraDetection} />
      {/* Phase 2 Routes */}
      <Route path="/festivals" component={FestivalCalendar} />
      <Route path="/routes" component={TempleRoutes} />
      <Route path="/parking" component={ParkingManagement} />
      {/* Phase 3 Routes */}
      <Route path="/emergency" component={EmergencyAlert} />
      <Route path="/medical" component={MedicalEmergency} />
      <Route path="/lost-found" component={LostAndFound} />
      {/* Phase 4 Routes */}
      <Route path="/virtual-darshan" component={VirtualDarshan} />
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/temples" component={AdminTemples} />
      {/* Admin - Planning Module */}
      <Route path="/admin/festivals" component={AdminFestivals} />
      <Route path="/admin/routes" component={AdminRoutes} />
      <Route path="/admin/parking" component={AdminParking} />
      {/* Admin - Safety Module */}
      <Route path="/admin/emergency" component={AdminEmergency} />
      <Route path="/admin/lost-found" component={AdminLostFound} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
