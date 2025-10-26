import StudentHeader from '@/components/student/StudentHeader';
import MenuBrowser from '@/components/student/MenuBrowser';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />
      <MenuBrowser />
    </div>
  );
}
