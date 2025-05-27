'use client';

import { useTranslations } from 'next-intl';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { formatTime, formatDate, formatDateTime } = useTimeFormat();
  
  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('language')}</h2>
          <LanguageSwitcher />
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('timeFormat')}</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              {t('timeFormats.12h')}: <span className="font-mono">{formatTime(now)}</span>
            </p>
            <p className="text-sm text-gray-500">
              (This format adjusts based on your selected language)
            </p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('dateFormat')}</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              Current format: <span className="font-mono">{formatDate(now)}</span>
            </p>
            <p className="text-sm text-gray-500">
              (This format adjusts based on your selected language)
            </p>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Date & Time Format</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              Full format: <span className="font-mono">{formatDateTime(now)}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}