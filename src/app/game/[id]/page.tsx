"use client";

import { useParams } from "next/navigation";
import { StrategicMap3D } from "~/app/_components/game/strategic/StrategicMap3D";
import { GameInfo } from "~/app/_components/game/strategic/GameInfo";

export default function GamePage() {
  const params = useParams();
  const gameId = params?.id as string;

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white flex items-center justify-center">
        <div className="text-2xl">Loading game...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar with game info */}
          <div className="lg:col-span-1">
            <GameInfo gameId={gameId} />
          </div>
          
          {/* Main strategic map */}
          <div className="lg:col-span-2">
            <StrategicMap3D gameId={gameId} />
          </div>
        </div>
      </div>
    </main>
  );
} 