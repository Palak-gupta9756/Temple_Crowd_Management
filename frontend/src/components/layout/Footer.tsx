import { Sun, MapPin, Phone, Mail, Heart } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
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
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><a className="hover:text-primary transition-colors">{t("footer.home")}</a></Link></li>
              <li><Link href="/temples"><a className="hover:text-primary transition-colors">{t("footer.temples")}</a></Link></li>
              <li><Link href="/dashboard"><a className="hover:text-primary transition-colors">{t("footer.liveStatus")}</a></Link></li>
              <li><Link href="/ai-planner"><a className="hover:text-primary transition-colors">{t("footer.aiAssistant")}</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">{t("footer.templesSection")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/temples/somnath"><a className="hover:text-primary transition-colors">{t("footer.somnath")}</a></Link></li>
              <li><Link href="/temples/dwarka"><a className="hover:text-primary transition-colors">{t("footer.dwarka")}</a></Link></li>
              <li><Link href="/temples/ambaji"><a className="hover:text-primary transition-colors">{t("footer.ambaji")}</a></Link></li>
              <li><Link href="/temples/pavagadh"><a className="hover:text-primary transition-colors">{t("footer.pavagadh")}</a></Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Bareilly Tourism Board,<br />Bareilly, Uttar Pradesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+91 9837570095</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>help@yatrasetu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="flex items-center gap-1">
            {t("footer.madeWith")} <Heart className="w-4 h-4 text-red-500 fill-current" /> {t("footer.forDevotees")}
          </p>
        </div>
      </div>
    </footer>
  );
}
