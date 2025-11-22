import StudentHeader from "@/components/student/StudentHeader";
import MenuBrowser from "@/components/student/MenuBrowser";
import Footer from "@/components/Footer";
import MenuHero from "@/components/student/MenuHero";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />

      {/* New hero banner section */}
      <MenuHero />

      <div className="flex-grow mt-6">
        <MenuBrowser />
      </div>

      <Footer />
    </div>
  );
}
