'use client';

import { Suspense } from 'react';
import GameContent from './GameContent';
import { useSession } from "next-auth/react";
import { redirect } from '@/navigation';
import { useTranslations } from 'next-intl';

export default function GamePage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect({ href: "/auth/signin", locale: "en" });
    },
  });
  
  const t = useTranslations('common');

  if (status === "loading") {
    return <div>{t('loading')}</div>;
  }

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <GameContent />
    </Suspense>
  );
}