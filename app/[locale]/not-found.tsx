import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function LocaleNotFound() {
  const t = useTranslations('notFound');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
      <p className="mb-6">{t('message')}</p>
      <Link 
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  );
}