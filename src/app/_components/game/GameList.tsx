"use client";

import { GameListItem } from "./GameListItem";

// Mock data for development
const mockGames = [
  {
    id: "1",
    name: "Test Game 1",
    status: "WAITING",
    maxCommanders: 4,
    maxPawns: 100,
    mapType: "CLASSIC",
  },
  {
    id: "2",
    name: "Active Battle",
    status: "ACTIVE",
    maxCommanders: 2,
    maxPawns: 50,
    mapType: "SMALL",
  },
] as const;

export function GameList() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {mockGames.map((game) => (
          <GameListItem key={game.id} game={game} />
        ))}
      </div>
      
      {mockGames.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No games available. Create one to get started!
        </div>
      )}
    </div>
  );
} 