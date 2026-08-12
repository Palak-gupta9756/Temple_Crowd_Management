import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TempleCard } from "@/components/temples/TempleCard";
import { temples } from "@/data/temples";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function TemplesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredTemples = temples.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
              {t("temples.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("temples.subtitle")}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="max-w-xl mx-auto mb-12 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t("temples.searchPlaceholder")} 
                className="pl-10 bg-card/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTemples.map((temple) => (
              <TempleCard key={temple.id} temple={temple} />
            ))}
          </div>

          {filteredTemples.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>{t("temples.noResults")}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
