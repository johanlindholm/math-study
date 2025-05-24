"use client";
import { Suspense } from 'react';
import GameContent from './GameContent';

export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading game...</div>}>
      <GameContent />
    </Suspense>
  );
}