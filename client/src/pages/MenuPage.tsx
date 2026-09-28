import StudentHeader from "@/components/student/StudentHeader";
import MenuBrowser from "@/components/student/MenuBrowser";
import Footer from "@/components/Footer";
import MenuHero from "@/components/student/MenuHero";

export default function MenuPage() {
  return (
    <div className="student-menu student-page-shell min-h-screen flex flex-col">
      <StudentHeader />
      <main id="main-content" className="flex-1">
        <MenuHero />
        <MenuBrowser />
      </main>

      <Footer />
    </div>
  );
}
