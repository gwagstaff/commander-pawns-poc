"use client";

import { useState } from "react";

interface Territory {
  id: string;
  name: string;
  ownerId: string | null;
  troops: number;
  xPosition: number;
  yPosition: number;
}

// Mock data for POC
const mockTerritories: Territory[] = [
  { id: "1", name: "Alpha", ownerId: "commander1", troops: 10, xPosition: 0.2, yPosition: 0.3 },
  { id: "2", name: "Beta", ownerId: "commander2", troops: 8, xPosition: 0.4, yPosition: 0.2 },
  { id: "3", name: "Gamma", ownerId: null, troops: 5, xPosition: 0.3, yPosition: 0.5 },
  { id: "4", name: "Delta", ownerId: "commander1", troops: 12, xPosition: 0.6, yPosition: 0.4 },
  { id: "5", name: "Epsilon", ownerId: null, troops: 6, xPosition: 0.7, yPosition: 0.6 },
];

interface StrategicMapProps {
  gameId: string;
}

export function StrategicMap({ gameId }: StrategicMapProps) {
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [attackTarget, setAttackTarget] = useState<Territory | null>(null);

  const handleTerritoryClick = (territory: Territory) => {
    if (!selectedTerritory) {
      setSelectedTerritory(territory);
    } else if (territory.id !== selectedTerritory.id) {
      // Check if territories are adjacent (simplified for POC)
      setAttackTarget(territory);
    } else {
      setSelectedTerritory(null);
      setAttackTarget(null);
    }
  };

  const handleAttack = () => {
    if (!selectedTerritory || !attackTarget) return;
    
    // TODO: Implement attack logic via tRPC
    console.log(`Attacking from ${selectedTerritory.name} to ${attackTarget.name}`);
    
    setSelectedTerritory(null);
    setAttackTarget(null);
  };

  return (
    <div className="relative bg-white/5 rounded-lg p-4 h-[600px]">
      <h2 className="text-2xl font-bold mb-4">Strategic Map</h2>
      
      {/* Territory markers */}
      <div className="relative w-full h-full">
        {mockTerritories.map((territory) => (
          <button
            key={territory.id}
            onClick={() => handleTerritoryClick(territory)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full 
              ${territory.ownerId === "commander1" ? "bg-blue-500" : 
                territory.ownerId === "commander2" ? "bg-red-500" : "bg-gray-500"}
              ${selectedTerritory?.id === territory.id ? "ring-4 ring-yellow-400" : ""}
              ${attackTarget?.id === territory.id ? "ring-4 ring-purple-400" : ""}
              hover:opacity-90 transition-all`}
            style={{
              left: `${territory.xPosition * 100}%`,
              top: `${territory.yPosition * 100}%`,
            }}
          >
            <div className="text-center">
              <div className="font-bold">{territory.name}</div>
              <div className="text-sm">{territory.troops}</div>
            </div>
          </button>
        ))}

        {/* Attack action */}
        {selectedTerritory && attackTarget && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleAttack}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Attack {attackTarget.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 