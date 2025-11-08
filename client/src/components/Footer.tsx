import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  
  const currentYear = new Date().getFullYear();
  
  const footerText = {
    en: {
      rights: "All rights reserved",
      developed: "Developed for AURAK Software Engineering Project",
      contact: "Contact Support"
    },
    ar: {
      rights: "جميع الحقوق محفوظة",
      developed: "مطور لمشروع هندسة البرمجيات في جامعة عجمان",
      contact: "اتصل بالدعم"
    }
  };
  
  const text = footerText[language] || footerText.en;
  
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AURAK'S Dine. {text.rights}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {text.developed}
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              {text.contact}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

