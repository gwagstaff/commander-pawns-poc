"use client";

import { useRouter } from "next/navigation";

interface Game {
  id: string;
  name: string;
  status: "WAITING" | "ACTIVE" | "COMPLETED";
  maxCommanders: number;
  maxPawns: number;
  mapType: string;
}

interface GameListItemProps {
  game: Game;
}

export function GameListItem({ game }: GameListItemProps) {
  const router = useRouter();

  const handleJoinAsCommander = () => {
    // For POC, just navigate to the game page
    router.push(`/game/${game.id}`);
  };

  const handleJoinAsPawn = () => {
    // For POC, just navigate to the game page
    router.push(`/game/${game.id}`);
  };

  return (
    <div className="bg-white/10 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{game.name}</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-300">
            <p>Status: {game.status}</p>
            <p>Map: {game.mapType}</p>
            <p>
              Players: {/* TODO: Add actual commander/pawn counts */}
              {0}/{game.maxCommanders} Commanders, {0}/{game.maxPawns} Pawns
            </p>
          </div>
        </div>
        
        <div className="space-x-2">
          {game.status === "WAITING" && (
            <>
              <button
                onClick={handleJoinAsCommander}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Join as Commander
              </button>
              <button
                onClick={handleJoinAsPawn}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Join as Pawn
              </button>
            </>
          )}
          {game.status === "ACTIVE" && (
            <button
              onClick={handleJoinAsPawn}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Join Battle
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 