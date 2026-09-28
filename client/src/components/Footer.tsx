import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerText = {
    en: {
      rights: "All rights reserved",
      developed: "Developed for AURAK Software Engineering Project",
      contact: "Contact Support",
    },
    ar: {
      rights: "جميع الحقوق محفوظة",
      developed: "مطوّر لمشروع هندسة البرمجيات في جامعة عجمان",
      contact: "اتصل بالدعم",
    },
  };

  const text = footerText[language] || footerText.en;

  return (
    <footer className="student-footer mt-auto">
      <div className="menu-shell student-footer-inner">
        <div>
          <p className="student-footer-brand">AURAK&apos;S Dine</p>
          <p className="student-footer-copy">
            © {currentYear} AURAK&apos;S Dine. {text.rights}
          </p>
        </div>
        <div className="student-footer-meta">
          <p>{text.developed}</p>
          <p>{text.contact}</p>
        </div>
      </div>
    </footer>
  );
}
