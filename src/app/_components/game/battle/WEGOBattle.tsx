import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';

// Mock battle data structure (will be replaced with real data from backend)
interface BattleUnit {
  id: string;
  commanderId: string;
  controlledBy: string | null; // null means AI controlled
  shipType: 'FIGHTER' | 'FRIGATE';
  position: [number, number, number];
  rotation: [number, number, number];
  health: number;
  shields: number;
  plannedActions?: {
    moveTarget?: [number, number, number];
    attackTargetId?: string;
    weaponMode?: 'LASER_ENERGY' | 'MISSILES' | 'POINT_DEFENSE';
  };
}

interface BattleState {
  id: string;
  attackingCommanderId: string;
  defendingCommanderId: string;
  currentTurn: number;
  turnPhase: 'PLANNING' | 'ANIMATION';
  timeRemaining: number;
  units: BattleUnit[];
}

// Mock initial battle state
const mockBattleState: BattleState = {
  id: 'battle1',
  attackingCommanderId: 'commander1',
  defendingCommanderId: 'commander2',
  currentTurn: 1,
  turnPhase: 'PLANNING',
  timeRemaining: 15,
  units: [
    {
      id: 'unit1',
      commanderId: 'commander1',
      controlledBy: 'player1',
      shipType: 'FIGHTER',
      position: [0, 0, -5],
      rotation: [0, 0, 0],
      health: 100,
      shields: 50,
    },
    {
      id: 'unit2',
      commanderId: 'commander2',
      controlledBy: null,
      shipType: 'FIGHTER',
      position: [0, 0, 5],
      rotation: [0, Math.PI, 0],
      health: 100,
      shields: 50,
    },
  ],
};

function BattleUnit({ unit, isSelected, onSelect }: { 
  unit: BattleUnit; 
  isSelected: boolean;
  onSelect: (unit: BattleUnit) => void;
}) {
  return (
    <group position={unit.position} rotation={unit.rotation}>
      {/* Basic ship mesh */}
      <mesh onClick={() => onSelect(unit)}>
        <coneGeometry args={[0.5, 2, 8]} />
        <meshStandardMaterial 
          color={unit.commanderId === 'commander1' ? '#3b82f6' : '#ef4444'} 
          emissive={isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>
      
      {/* Health/shields indicator */}
      <Html position={[0, 2, 0]}>
        <div className="pointer-events-none bg-black/50 px-2 py-1 rounded text-white text-xs text-center min-w-[80px]">
          <div>HP: {unit.health}</div>
          <div>Shield: {unit.shields}</div>
        </div>
      </Html>
    </group>
  );
}

function BattleTopBar({ battle }: { battle: BattleState }) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white z-10">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h2 className="text-xl font-bold">Space Battle</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="px-3 py-1 bg-blue-900/50 rounded">
                Turn {battle.currentTurn}
              </div>
              <div className="px-3 py-1 bg-purple-900/50 rounded">
                {battle.turnPhase} Phase
              </div>
              <div className="px-3 py-1 bg-red-900/50 rounded">
                {battle.timeRemaining}s
              </div>
            </div>
          </div>
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
            Retreat
          </button>
        </div>
      </div>
    </div>
  );
}

function BattleControls({ 
  selectedUnit,
  onPlanMove,
  onPlanAttack,
}: { 
  selectedUnit: BattleUnit | null;
  onPlanMove: (position: [number, number, number]) => void;
  onPlanAttack: (targetId: string, weaponMode: BattleUnit['plannedActions']['weaponMode']) => void;
}) {
  if (!selectedUnit) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg text-white">
      <div className="text-sm font-bold mb-2">Unit Controls</div>
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-400 mb-1">Movement</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onPlanMove([0, 0, -2])} 
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Forward
            </button>
            <button 
              onClick={() => onPlanMove([2, 0, 0])} 
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Right
            </button>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Weapons</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => onPlanAttack('unit2', 'LASER_ENERGY')} 
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Lasers
            </button>
            <button 
              onClick={() => onPlanAttack('unit2', 'MISSILES')} 
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              Missiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WEGOBattle({ 
  onBattleEnd 
}: { 
  onBattleEnd: () => void;
}) {
  const [battle, setBattle] = useState<BattleState>(mockBattleState);
  const [selectedUnit, setSelectedUnit] = useState<BattleUnit | null>(null);

  // Simulated turn timer
  useEffect(() => {
    const timer = setInterval(() => {
      setBattle(prev => {
        if (prev.timeRemaining <= 0) {
          // Switch phases or process turn
          if (prev.turnPhase === 'PLANNING') {
            return {
              ...prev,
              turnPhase: 'ANIMATION',
              timeRemaining: 5, // Animation phase is shorter
            };
          } else {
            return {
              ...prev,
              turnPhase: 'PLANNING',
              timeRemaining: 15,
              currentTurn: prev.currentTurn + 1,
            };
          }
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePlanMove = useCallback((position: [number, number, number]) => {
    if (!selectedUnit) return;
    setBattle(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, plannedActions: { ...unit.plannedActions, moveTarget: position } }
          : unit
      ),
    }));
  }, [selectedUnit]);

  const handlePlanAttack = useCallback((targetId: string, weaponMode: BattleUnit['plannedActions']['weaponMode']) => {
    if (!selectedUnit) return;
    setBattle(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === selectedUnit.id 
          ? { ...unit, plannedActions: { ...unit.plannedActions, attackTargetId: targetId, weaponMode } }
          : unit
      ),
    }));
  }, [selectedUnit]);

  return (
    <div className="fixed inset-0 bg-black">
      <BattleTopBar battle={battle} />
      
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }} gl={{ antialias: true }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={30}
          minDistance={5}
        />

        {battle.units.map(unit => (
          <BattleUnit
            key={unit.id}
            unit={unit}
            isSelected={selectedUnit?.id === unit.id}
            onSelect={setSelectedUnit}
          />
        ))}
      </Canvas>

      <BattleControls
        selectedUnit={selectedUnit}
        onPlanMove={handlePlanMove}
        onPlanAttack={handlePlanAttack}
      />
    </div>
  );
} 