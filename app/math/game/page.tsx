"use client";
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GameContent from './GameContent';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('GamePage');
  return {
    title: 'Math Game',
    description: 'Interactive math game for learning',
  };
}

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('Common');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">{t('loading')}</div>;
  }

  if (status === 'authenticated') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">{t('loading')}</div>}>
        <GameContent />
      </Suspense>
    );
  }

  return null;
}