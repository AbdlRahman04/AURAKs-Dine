import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      data-testid="button-language-toggle"
      title={language === 'en' ? 'العربية' : 'English'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
