"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageChangerProps {
  language: "pt" | "en";
  setLanguage: (lang: "pt" | "en") => void;
}

export default function LanguageChanger({
  language,
  setLanguage,
}: LanguageChangerProps) {
  const handleChangeLanguage = (lang: "pt" | "en") => {
    setLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          {language === "pt" ? "Português" : "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("pt")}
          className={language === "pt" ? "bg-muted font-medium" : ""}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("en")}
          className={language === "en" ? "bg-muted font-medium" : ""}
        >
          🇺🇸 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}