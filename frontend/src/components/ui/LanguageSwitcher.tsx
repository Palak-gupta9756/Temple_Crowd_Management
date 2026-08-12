import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          aria-label={t("common.selectLanguage")}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLang.nativeLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={
              i18n.language === lang.code
                ? "font-semibold text-primary"
                : ""
            }
          >
            <span className="mr-2">{lang.nativeLabel}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {lang.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
