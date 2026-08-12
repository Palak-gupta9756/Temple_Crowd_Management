import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Link } from "wouter";
import { User, Mail, Phone, Calendar, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full max-w-md" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 pt-24 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t("common.loginRequired")}</CardTitle>
              <CardDescription>
                {t("profile.loginDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full">{t("common.loginBtn")}</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">{t("profile.title")}</h1>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>{t("profile.devotee")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("profile.email")}</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("profile.phone")}</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Link href="/my-bookings">
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("profile.viewBookings")}
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("profile.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
