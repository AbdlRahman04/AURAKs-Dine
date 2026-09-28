import { Button } from "@/components/ui/button";
import { Clock, ShoppingBag, TrendingUp, Utensils, ArrowUpRight, ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import aurakLogo from "@/assets/aurak-logo.png";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!page || reduceMotion || !("IntersectionObserver" in window)) return;

    const revealItems = page.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -36px 0px" });

    page.classList.add("landing-motion-ready");
    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      page.classList.remove("landing-motion-ready");
    };
  }, []);

  return (
    <div ref={pageRef} className="public-shell landing-page min-h-screen">
      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-shell landing-hero-grid">
            <div className="landing-hero-copy" data-scroll-reveal>
              <div className="landing-brand-lockup">
              <img src={aurakLogo} alt={language === "ar" ? "شعار AURAK'S Dine" : "AURAK's Dine logo"} />
                <span>AURAK'S Dine</span>
              </div>
              <p className="landing-kicker">{t("landingKicker")}</p>
              <h1 id="landing-title">{t("landingTitle")}</h1>
              <p className="landing-hero-description">
                {t("landingDescription")}
              </p>
              <div className="landing-hero-actions">
                <Button size="lg" onClick={() => setLocation('/menu')} data-testid="button-browse-menu">
                  {t("browseMenu")}
                  <ArrowUpRight aria-hidden="true" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation('/register')} data-testid="button-register">
                  {t("createAccount")}
                </Button>
                <Button size="lg" variant="ghost" className="landing-signin-link" onClick={() => setLocation('/login')} data-testid="button-login">
                  {t("signIn")}
                </Button>
              </div>
              <p className="landing-hero-note">{t("landingAccessNote")}</p>
              <a className="landing-scroll-link" href="#process-title">
                {t("seeHowItWorks")}
                <ArrowDown aria-hidden="true" />
              </a>
              <dl className="landing-value-list" aria-label={t("landingValueTitle")}>
                <div>
                  <dt>{t("landingValueSteps")}</dt>
                  <dd>{t("landingValueStepsDescription")}</dd>
                </div>
                <div>
                  <dt>{t("landingValuePickup")}</dt>
                  <dd>{t("landingValuePickupDescription")}</dd>
                </div>
                <div>
                  <dt>{t("landingValueUpdates")}</dt>
                  <dd>{t("landingValueUpdatesDescription")}</dd>
                </div>
              </dl>
            </div>
            <figure className="landing-hero-media" data-scroll-reveal>
              <img src="/menu-images/Shakshuka.jpg" alt={language === "ar" ? "شكشوكة تقدم مع خبز عربي دافئ" : "Shakshuka served with warm pita"} />
              <figcaption>
                <span>{t("todayAt")}</span>
                <strong>{t("freshMeals")}</strong>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="landing-benefits landing-shell" aria-labelledby="benefits-title">
          <div className="landing-section-heading" data-scroll-reveal>
            <p className="landing-kicker">{t("whyOrderOnline")}</p>
            <h2 id="benefits-title">{t("lunchMadeEasy")}</h2>
            <p>{t("orderBenefits")}</p>
          </div>
          <div className="landing-benefit-grid">
            <article className="landing-benefit landing-benefit-featured" data-scroll-reveal data-testid="card-feature-skip-queue">
              <span className="landing-benefit-icon"><Clock aria-hidden="true" /></span>
              <h3>{t("skipQueue")}</h3>
              <p>{t("skipQueueDescription")}</p>
            </article>
            <article className="landing-benefit" data-scroll-reveal data-testid="card-feature-easy-ordering">
              <span className="landing-benefit-icon"><ShoppingBag aria-hidden="true" /></span>
              <h3>{t("orderYourWay")}</h3>
              <p>{t("orderYourWayDescription")}</p>
            </article>
            <article className="landing-benefit" data-scroll-reveal data-testid="card-feature-track-order">
              <span className="landing-benefit-icon"><Utensils aria-hidden="true" /></span>
              <h3>{t("knowWhenToCollect")}</h3>
              <p>{t("trackOrderDescription")}</p>
            </article>
            <article className="landing-benefit landing-benefit-accent" data-scroll-reveal data-testid="card-feature-reduce-waste">
              <span className="landing-benefit-icon"><TrendingUp aria-hidden="true" /></span>
              <h3>{t("helpKitchenPlan")}</h3>
              <p>{t("reduceWasteDescription")}</p>
            </article>
          </div>
        </section>

        <section className="landing-process" aria-labelledby="process-title">
          <div className="landing-shell landing-process-grid">
            <div className="landing-section-heading" data-scroll-reveal>
              <p className="landing-kicker">{t("howItWorks")}</p>
              <h2 id="process-title">{t("fourSimpleSteps")}</h2>
              <p>{t("orderJourney")}</p>
            </div>
            <div className="landing-process-list">
              {[
                { step: 1, title: t("browseMenuStep"), description: t("browseMenuStepDescription") },
                { step: 2, title: t("accountBeforeCartStep"), description: t("accountBeforeCartStepDescription") },
                { step: 3, title: t("choosePickupStep"), description: t("choosePickupStepDescription") },
                { step: 4, title: t("payAndPickupStep"), description: t("payAndPickupStepDescription") },
              ].map((item) => (
                <div key={item.step} className="landing-process-item" data-scroll-reveal data-testid={`step-${item.step}`}>
                  <span>{String(item.step).padStart(2, '0')}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta landing-shell" aria-labelledby="cta-title">
          <div className="landing-cta-inner" data-scroll-reveal>
            <div>
              <p className="landing-kicker">{t("readyWhenYouAre")}</p>
              <h2 id="cta-title">{t("startNextMeal")}</h2>
              <p>{t("landingAccessNote")}</p>
            </div>
            <Button size="lg" variant="secondary" onClick={() => setLocation('/menu')} data-testid="button-cta-browse-menu">
              {t("browseMenu")}
              <ArrowUpRight aria-hidden="true" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
