import { ArrowUpRight, Clock3, Utensils } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MenuHero() {
  const { language, t } = useLanguage();

  return (
    <section className="menu-hero" aria-labelledby="menu-hero-title">
      <div className="menu-shell menu-hero-grid">
        <div className="menu-hero-copy">
          <p className="menu-kicker">AURAK&apos;S Dine</p>
          <h1 id="menu-hero-title">{t("menuHeroTitle")}</h1>
          <p className="menu-hero-description">
            {t("menuHeroDescription")}
          </p>

          <a className="menu-hero-link" href="#menu-browser">
            {t("menuHeroBrowse")}
            <ArrowUpRight aria-hidden="true" />
          </a>

          <div className="menu-hero-notes" aria-label={t("menuHighlights")}>
            <span>
              <Utensils aria-hidden="true" />
              {t("mealVariety")}
            </span>
            <span>
              <Clock3 aria-hidden="true" />
              {t("orderAheadPickup")}
            </span>
          </div>
        </div>

        <figure className="menu-hero-image">
          <img
            src="/menu-images/Shakshuka.jpg"
            alt={language === "ar" ? "شكشوكة تقدم مع خبز عربي دافئ" : "Shakshuka served with warm pita"}
            width="1280"
            height="960"
            fetchPriority="high"
          />
          <figcaption>{t("menuHeroCaption")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
