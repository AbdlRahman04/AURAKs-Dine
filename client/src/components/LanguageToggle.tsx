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
      aria-label={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">{language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}</span>
    </Button>
  );
}
