import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import GamePageClient from '@/components/math/GamePage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('GamePage');
  return {
    title: t('metaTitle') || 'Math Game',
    description: t('metaDescription') || 'Interactive math game for learning',
  };
}

export default function GamePage() {
  // The Server Component now renders the Client Component
  return <GamePageClient />;
}