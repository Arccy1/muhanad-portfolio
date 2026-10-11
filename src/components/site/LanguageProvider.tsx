"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Lang, translate } from "@/lib/i18n";

type Ctx = { lang: Lang; dir: "ltr" | "rtl"; t: (key: string) => string; setLang: (lang: Lang) => void };

const LanguageContext = createContext<Ctx>({
  lang: "en",
  dir: "ltr",
  t: (key) => key,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mwm-lang");
      if (saved === "ar" || saved === "en") apply(saved);
    } catch {
      /* private mode */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (next: Lang) => {
    setLangState(next);
    const dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem("mwm-lang", next);
    } catch {
      /* ignore */
    }
  };

  const setLang = useCallback((next: Lang) => apply(next), []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
