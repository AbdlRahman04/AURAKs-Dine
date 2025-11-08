import StudentHeader from '@/components/student/StudentHeader';
import MenuBrowser from '@/components/student/MenuBrowser';
import Footer from '@/components/Footer';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />
      <div className="flex-grow">
        <MenuBrowser />
      </div>
      <Footer />
    </div>
  );
}
