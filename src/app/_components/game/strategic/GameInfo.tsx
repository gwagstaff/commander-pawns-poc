"use client";

interface Commander {
  id: string;
  name: string;
  territories: number;
  troops: number;
}

// Mock data for POC
const mockCommanders: Commander[] = [
  { id: "commander1", name: "Blue Commander", territories: 2, troops: 22 },
  { id: "commander2", name: "Red Commander", territories: 1, troops: 8 },
];

interface GameInfoProps {
  gameId: string;
}

export function GameInfo({ gameId }: GameInfoProps) {
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Game Status</h2>
      
      {/* Commander information */}
      <div className="space-y-4">
        {mockCommanders.map((commander) => (
          <div
            key={commander.id}
            className={`p-3 rounded-lg ${
              commander.id === "commander1" ? "bg-blue-500/20" : "bg-red-500/20"
            }`}
          >
            <div className="font-semibold">{commander.name}</div>
            <div className="text-sm text-gray-300">
              <div>Territories: {commander.territories}</div>
              <div>Total Troops: {commander.troops}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Game actions */}
      <div className="mt-8 space-y-2">
        <button
          onClick={() => console.log("End turn")}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          End Turn
        </button>
        
        <button
          onClick={() => console.log("Surrender")}
          className="w-full px-4 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg transition-colors"
        >
          Surrender
        </button>
      </div>

      {/* Game rules reminder */}
      <div className="mt-8 text-sm text-gray-400">
        <h3 className="font-semibold mb-2">Quick Rules:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Click a territory to select it</li>
          <li>Click another territory to attack</li>
          <li>Adjacent territories only</li>
          <li>End your turn after actions</li>
        </ul>
      </div>
    </div>
  );
} 