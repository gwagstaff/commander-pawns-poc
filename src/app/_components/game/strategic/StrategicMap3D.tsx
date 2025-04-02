import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import { useState, useCallback } from 'react';
import { type Territory } from '~/types/game';
import { WEGOBattle } from '../battle/WEGOBattle';

// Mock user data for POC
const mockUser = {
  id: "commander1",
  name: "Commander Shepard",
  rank: "Fleet Admiral",
  stats: {
    systems: 3,
    totalFleetSize: 30,
    victories: 5,
  }
};

// Mock data representing star systems for POC
const mockTerritories: Territory[] = [
  { id: "1", name: "Alpha Centauri", ownerId: "commander1", troops: 10, xPosition: 0.2, yPosition: 0.3 },
  { id: "2", name: "Sirius Prime", ownerId: "commander2", troops: 8, xPosition: 0.4, yPosition: 0.2 },
  { id: "3", name: "Neutral Zone", ownerId: null, troops: 5, xPosition: 0.3, yPosition: 0.5 },
  { id: "4", name: "Nova Station", ownerId: "commander1", troops: 12, xPosition: 0.6, yPosition: 0.4 },
  { id: "5", name: "Deep Space", ownerId: null, troops: 6, xPosition: 0.7, yPosition: 0.6 },
];

interface StrategicMap3DProps {
  gameId: string;
}

function StarSystem({ 
  territory,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: { 
  territory: Territory;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (t: Territory) => void;
  onHover: (t: Territory | null) => void;
}) {
  // Scale positions for space representation
  const position = [
    territory.xPosition * 20 - 10,
    0,
    territory.yPosition * 20 - 10
  ] as const;

  // Fleet size determines system glow intensity
  const fleetSize = territory.troops * 0.1;
  const baseColor = territory.ownerId === "commander1" ? "#3b82f6" : 
                   territory.ownerId === "commander2" ? "#ef4444" : 
                   "#6b7280";

  return (
    <group>
      {/* Star system representation */}
      <group position={[position[0], 0, position[2]]}>
        {/* Central star */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color={isSelected ? "#ffd700" : isHovered ? "#ffffff" : baseColor}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Glow effect */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial
            color={baseColor}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Fleet presence indicator */}
        <mesh position={[0, fleetSize / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, fleetSize, 16]} />
          <meshBasicMaterial
            color={baseColor}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Clickable area */}
        <mesh
          onClick={() => onSelect(territory)}
          onPointerOver={() => onHover(territory)}
          onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial
            visible={false}
          />
        </mesh>
      </group>

      {/* System info label */}
      <Html position={[position[0], 2 + fleetSize, position[2]]}>
        <div className="pointer-events-none bg-black/50 px-2 py-1 rounded text-white text-center min-w-[120px]">
          <div className="font-bold">{territory.name}</div>
          <div>Fleet Size: {territory.troops}</div>
        </div>
      </Html>
    </group>
  );
}

function UserStats() {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 bg-gray-900/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
          {mockUser.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{mockUser.name}</div>
          <div className="text-xs text-gray-400">{mockUser.rank}</div>
        </div>
      </div>
      <div className="h-8 w-px bg-gray-700"></div>
      <div className="flex items-center space-x-4 text-sm">
        <div>
          <div className="text-gray-400 text-xs">Systems</div>
          <div className="font-medium">{mockUser.stats.systems}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Fleet Size</div>
          <div className="font-medium">{mockUser.stats.totalFleetSize}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs">Victories</div>
          <div className="font-medium">{mockUser.stats.victories}</div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ 
  selectedSystem, 
  attackTarget,
  onLaunchFleet 
}: { 
  selectedSystem: Territory | null;
  attackTarget: Territory | null;
  onLaunchFleet: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white z-10">
      <div className="container mx-auto px-4 py-2">
        {/* Top row with user stats */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
          <UserStats />
          <div className="flex items-center space-x-4">
            <div className="text-sm opacity-70">Game ID: {mockTerritories[0].id}</div>
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              Menu
            </button>
          </div>
        </div>
        
        {/* Bottom row with map controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h2 className="text-xl font-bold">Galactic Strategic Map</h2>
            {selectedSystem && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Selected: {selectedSystem.name}</span>
                </div>
                {attackTarget && (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span>Target: {attackTarget.name}</span>
                    </div>
                    <button
                      onClick={onLaunchFleet}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm font-bold"
                    >
                      Launch Fleet
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">
              View Empire
            </button>
            <button className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">
              Fleet Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameBoard() {
  const [selectedSystem, setSelectedSystem] = useState<Territory | null>(null);
  const [hoveredSystem, setHoveredSystem] = useState<Territory | null>(null);
  const [attackTarget, setAttackTarget] = useState<Territory | null>(null);
  const [battleActive, setBattleActive] = useState(false);

  const handleSystemSelect = useCallback((territory: Territory) => {
    if (!selectedSystem) {
      setSelectedSystem(territory);
    } else if (territory.id !== selectedSystem.id) {
      setAttackTarget(territory);
    } else {
      setSelectedSystem(null);
      setAttackTarget(null);
    }
  }, [selectedSystem]);

  const handleLaunchFleet = useCallback(() => {
    if (selectedSystem && attackTarget) {
      console.log(`Initiating WEGO battle from ${selectedSystem.name} to ${attackTarget.name}`);
      setBattleActive(true);
    }
  }, [selectedSystem, attackTarget]);

  const handleBattleEnd = useCallback(() => {
    setBattleActive(false);
    setSelectedSystem(null);
    setAttackTarget(null);
  }, []);

  if (battleActive) {
    return <WEGOBattle onBattleEnd={handleBattleEnd} />;
  }

  return (
    <div className="fixed inset-0 bg-black">
      <TopBar 
        selectedSystem={selectedSystem}
        attackTarget={attackTarget}
        onLaunchFleet={handleLaunchFleet}
      />
      
      <Canvas
        camera={{ position: [0, 20, 20], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          maxDistance={50}
          minDistance={10}
        />

        {mockTerritories.map((territory) => (
          <StarSystem
            key={territory.id}
            territory={territory}
            isSelected={territory.id === selectedSystem?.id}
            isHovered={territory.id === hoveredSystem?.id}
            onSelect={handleSystemSelect}
            onHover={setHoveredSystem}
          />
        ))}

        {selectedSystem && attackTarget && (
          <group>
            <line>
              <bufferGeometry>
                <float32BufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    selectedSystem.xPosition * 20 - 10, 0.1, selectedSystem.yPosition * 20 - 10,
                    attackTarget.xPosition * 20 - 10, 0.1, attackTarget.yPosition * 20 - 10
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#9333ea" linewidth={2} />
            </line>
          </group>
        )}
      </Canvas>

      {/* System Details Overlay */}
      {selectedSystem && attackTarget && (
        <div className="absolute bottom-4 right-4">
          <div className="bg-black/70 p-3 rounded text-white text-sm space-y-1">
            <div className="font-bold border-b border-white/20 pb-1 mb-1">Battle Details</div>
            <div>Fleet Size: {selectedSystem.troops}</div>
            <div>Distance: {Math.round(Math.hypot(
              (selectedSystem.xPosition - attackTarget.xPosition) * 20,
              (selectedSystem.yPosition - attackTarget.yPosition) * 20
            ))} light years</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function StrategicMap3D({ gameId }: StrategicMap3DProps) {
  return <GameBoard />;
} 