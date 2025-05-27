'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from "next-auth/react";
import { redirect } from '@/navigation';

export default function MathPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect({ href: "/auth/signin", locale: "en" });
    },
  });
  
  const t = useTranslations('math');

  if (status === "loading") {
    return <div>{t('common.loading')}</div>;
  }

  const games = [
    { type: 'multiplication', color: 'bg-purple-500' },
    { type: 'addition', color: 'bg-green-500' },
    { type: 'subtraction', color: 'bg-red-500' }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      <p className="text-xl mb-8">{t('selectGame')}</p>
      <div className="flex gap-4 flex-wrap justify-center">
        {games.map((game) => (
          <Link
            key={game.type}
            href={`/math/game?type=${game.type}`}
            className={`${game.color} text-white p-8 rounded-lg hover:opacity-90 transition-opacity cursor-pointer text-2xl w-64 text-center`}
          >
            <h2 className="font-bold mb-2">{t(`games.${game.type}.title`)}</h2>
            <p className="text-sm">{t(`games.${game.type}.description`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}