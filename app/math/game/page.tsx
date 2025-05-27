"use client";
import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GameContent from './GameContent';

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (status === 'authenticated') {
    return (
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading game...</div>}>
        <GameContent />
      </Suspense>
    );
  }

  return null;
}