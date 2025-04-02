import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';

type WeaponMode = 'LASER_ENERGY' | 'MISSILES' | 'POINT_DEFENSE';

// Mock battle data structure (will be replaced with real data from backend)
interface BattleUnit {
  id: string;
  commanderId: string;
  controlledBy: string | null; // null means AI controlled
  shipType: 'FIGHTER' | 'FRIGATE';
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  maxSpeed: number;
  acceleration: number;
  health: number;
  shields: number;
  plannedActions?: {
    moveTarget?: [number, number, number];
    moveSpeed?: number; // 0-1, relative to maxSpeed
    attackTargetId?: string;
    weaponMode?: WeaponMode;
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
      velocity: [0, 0, 0],
      maxSpeed: 2,
      acceleration: 0.5,
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
      velocity: [0, 0, 0],
      maxSpeed: 2,
      acceleration: 0.5,
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
  // Calculate ship orientation based on velocity or planned movement
  const shipRotation = unit.plannedActions?.moveTarget
    ? [0, Math.atan2(
        unit.plannedActions.moveTarget[0] - unit.position[0],
        unit.plannedActions.moveTarget[2] - unit.position[2]
      ), 0] as [number, number, number]
    : unit.velocity && unit.velocity.some(v => v !== 0)
      ? [0, Math.atan2(unit.velocity[0], unit.velocity[2]), 0] as [number, number, number]
      : unit.rotation;

  return (
    <group position={unit.position} rotation={shipRotation}>
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

      {/* Movement preview during planning phase */}
      {unit.plannedActions?.moveTarget && (
        <group>
          {/* Movement path line */}
          <line>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([
                  0, 0, 0, // Start at local origin
                  // Convert target to local space
                  unit.plannedActions.moveTarget[0] - unit.position[0],
                  unit.plannedActions.moveTarget[1] - unit.position[1],
                  unit.plannedActions.moveTarget[2] - unit.position[2]
                ]), 3]}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={unit.plannedActions.moveSpeed === 1 ? '#3b82f6' : '#60a5fa'} 
              linewidth={2} 
              transparent 
              opacity={0.8}
            />
          </line>
          
          {/* Target point indicator */}
          <mesh position={[
            unit.plannedActions.moveTarget[0] - unit.position[0],
            unit.plannedActions.moveTarget[1] - unit.position[1],
            unit.plannedActions.moveTarget[2] - unit.position[2]
          ]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial 
              color={unit.plannedActions.moveSpeed === 1 ? '#3b82f6' : '#60a5fa'} 
              transparent 
              opacity={0.5} 
            />
          </mesh>

          {/* Movement speed indicator */}
          <Html position={[
            (unit.plannedActions.moveTarget[0] - unit.position[0]) / 2,
            1,
            (unit.plannedActions.moveTarget[2] - unit.position[2]) / 2
          ]}>
            <div className="pointer-events-none bg-black/50 px-2 py-1 rounded text-white text-xs text-center">
              {Math.round((unit.plannedActions.moveSpeed ?? 1) * 100)}%
            </div>
          </Html>
        </group>
      )}
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

function DirectionalControl({ 
  onSelectDirection,
  selectedAngle,
  onPreview,
}: { 
  onSelectDirection: (angle: number | null) => void;
  selectedAngle: number | null;
  onPreview: (angle: number | null) => void;
}) {
  const controlSize = 120;
  const centerPoint = controlSize / 2;
  const [previewAngle, setPreviewAngle] = useState<number | null>(null);
  const [verticalSpeed, setVerticalSpeed] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - centerPoint;
    const y = e.clientY - rect.top - centerPoint;
    const distance = Math.sqrt(x * x + y * y);
    
    // Only register clicks within the circle
    if (distance <= controlSize / 2) {
      const angle = Math.atan2(y, x);
      onSelectDirection(angle);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - centerPoint;
    const y = e.clientY - rect.top - centerPoint;
    const distance = Math.sqrt(x * x + y * y);
    
    // Only preview if within the circle
    if (distance <= controlSize / 2) {
      const angle = Math.atan2(y, x);
      setPreviewAngle(angle);
      onPreview(angle);
    } else {
      setPreviewAngle(null);
      onPreview(null);
    }
  };

  const handleMouseLeave = () => {
    setPreviewAngle(null);
    onPreview(null);
  };

  const handleVerticalControl = (speed: number) => {
    setVerticalSpeed(speed);
    // Convert vertical speed to angle (up = -90°, down = 90°)
    const angle = speed > 0 ? -Math.PI/2 : speed < 0 ? Math.PI/2 : null;
    onSelectDirection(angle);
  };

  const renderDirectionIndicator = () => {
    if (selectedAngle === null) return null;
    const radius = controlSize / 2 - 10;
    const x = Math.cos(selectedAngle) * radius + centerPoint;
    const y = Math.sin(selectedAngle) * radius + centerPoint;

    return (
      <div 
        className="absolute w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1.5 -translate-y-1.5"
        style={{ left: `${x}px`, top: `${y}px` }}
      />
    );
  };

  const renderPreviewIndicator = () => {
    if (previewAngle === null) return null;
    const radius = controlSize / 2 - 10;
    const x = Math.cos(previewAngle) * radius + centerPoint;
    const y = Math.sin(previewAngle) * radius + centerPoint;

    return (
      <div 
        className="absolute w-2 h-2 bg-blue-300 rounded-full transform -translate-x-1 -translate-y-1"
        style={{ left: `${x}px`, top: `${y}px` }}
      />
    );
  };

  const renderSpeedRings = () => {
    const rings = [0.25, 0.5, 0.75, 1];
    return rings.map((speed) => (
      <div
        key={speed}
        className="absolute border border-blue-500/20 rounded-full"
        style={{
          width: `${controlSize * speed}px`,
          height: `${controlSize * speed}px`,
          left: `${centerPoint - (controlSize * speed) / 2}px`,
          top: `${centerPoint - (controlSize * speed) / 2}px`,
        }}
      />
    ));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Vertical controls */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => handleVerticalControl(1)}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verticalSpeed === 1 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          ↑
        </button>
        <button
          onClick={() => handleVerticalControl(0)}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verticalSpeed === 0 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          •
        </button>
        <button
          onClick={() => handleVerticalControl(-1)}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            verticalSpeed === -1 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          ↓
        </button>
      </div>

      {/* Horizontal control */}
      <div 
        className="relative bg-gray-800 rounded-full cursor-pointer"
        style={{ width: controlSize, height: controlSize }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Speed rings */}
        {renderSpeedRings()}
        
        {/* Direction markers */}
        <div className="absolute inset-0">
          {/* North indicator triangle */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-3">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-b-[12px] border-b-blue-500 border-r-[8px] border-r-transparent" />
          </div>
          
          {/* Cardinal directions */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-xs font-bold">N</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            <div className="text-gray-400 text-xs font-bold">E</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-start pl-2">
            <div className="text-gray-400 text-xs font-bold">W</div>
          </div>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <div className="text-gray-400 text-xs font-bold">S</div>
          </div>
        </div>
        
        {/* Center point */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-gray-500 rounded-full transform -translate-x-1 -translate-y-1" />
        
        {/* Selected direction indicator */}
        {renderDirectionIndicator()}
        
        {/* Preview direction indicator */}
        {renderPreviewIndicator()}
      </div>
    </div>
  );
}

function BattleControls({ 
  selectedUnit,
  onPlanMove,
  onPlanAttack,
  selectedSpeed,
  onSpeedSelect,
}: { 
  selectedUnit: BattleUnit | null;
  onPlanMove: (angle: number | null, speed: number) => void;
  onPlanAttack: (targetId: string, weaponMode: WeaponMode) => void;
  selectedSpeed: number;
  onSpeedSelect: (speed: number) => void;
}) {
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null);

  const handleDirectionSelect = (angle: number | null) => {
    setSelectedAngle(angle);
    onPlanMove(angle, selectedSpeed);
  };

  const handleDirectionPreview = (angle: number | null) => {
    // Preview the movement without committing to it
    if (angle !== null) {
      onPlanMove(angle, selectedSpeed);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg text-white">
      <div className="text-sm font-bold mb-2">Unit Controls</div>
      <div className="space-y-4">
        {/* Movement Controls */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Movement Speed</div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button 
              onClick={() => onSpeedSelect(1)} 
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                selectedSpeed === 1 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              100%
            </button>
            <button 
              onClick={() => onSpeedSelect(0.75)} 
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                selectedSpeed === 0.75 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              75%
            </button>
            <button 
              onClick={() => onSpeedSelect(0.5)} 
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                selectedSpeed === 0.5 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              50%
            </button>
            <button 
              onClick={() => onSpeedSelect(0.25)} 
              className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                selectedSpeed === 0.25 ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              25%
            </button>
          </div>

          {/* Directional Control */}
          <DirectionalControl
            onSelectDirection={handleDirectionSelect}
            selectedAngle={selectedAngle}
            onPreview={handleDirectionPreview}
          />
        </div>

        {/* Weapon Controls */}
        <div>
          <div className="text-xs text-gray-400 mb-2">Weapons</div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onPlanAttack('unit2', 'LASER_ENERGY')} 
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center justify-center"
            >
              <span className="mr-1">⚡</span> Lasers
            </button>
            <button 
              onClick={() => onPlanAttack('unit2', 'MISSILES')} 
              className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center justify-center"
            >
              <span className="mr-1">🚀</span> Missiles
            </button>
          </div>
        </div>

        {/* Movement Speed Indicator */}
        {selectedUnit?.plannedActions?.moveSpeed && (
          <div className="text-xs text-gray-400">
            Speed: {Math.round(selectedUnit.plannedActions.moveSpeed * 100)}%
          </div>
        )}
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
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1);

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
            // Process movement and update positions
            const updatedUnits = prev.units.map(unit => {
              if (!unit.plannedActions?.moveTarget) return unit;

              // Calculate movement vector
              const dx = unit.plannedActions.moveTarget[0] - unit.position[0];
              const dy = unit.plannedActions.moveTarget[1] - unit.position[1];
              const dz = unit.plannedActions.moveTarget[2] - unit.position[2];
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

              // Calculate new velocity based on acceleration and max speed
              const targetSpeed = (unit.plannedActions.moveSpeed ?? 1) * unit.maxSpeed;
              const newVelocity: [number, number, number] = [
                (dx / distance) * targetSpeed,
                (dy / distance) * targetSpeed,
                (dz / distance) * targetSpeed
              ];

              // Update position based on velocity
              const newPosition: [number, number, number] = [
                unit.position[0] + newVelocity[0],
                unit.position[1] + newVelocity[1],
                unit.position[2] + newVelocity[2]
              ];

              return {
                ...unit,
                position: newPosition,
                velocity: newVelocity,
                plannedActions: undefined // Clear planned actions after execution
              };
            });

            return {
              ...prev,
              turnPhase: 'PLANNING',
              timeRemaining: 15,
              currentTurn: prev.currentTurn + 1,
              units: updatedUnits
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

  const handlePlanMove = useCallback((angle: number | null, speed: number) => {
    if (!selectedUnit) return;

    // Calculate target position based on angle and speed
    const targetPosition: [number, number, number] = [
      // For vertical movement (angle = ±π/2), we only move in Y
      angle === -Math.PI/2 ? selectedUnit.position[0] : // Up
      angle === Math.PI/2 ? selectedUnit.position[0] :  // Down
      selectedUnit.position[0] + Math.sin(angle ?? 0) * speed * selectedUnit.maxSpeed, // Horizontal X
      
      // For vertical movement, we move in Y
      angle === -Math.PI/2 ? selectedUnit.position[1] + speed * selectedUnit.maxSpeed : // Up
      angle === Math.PI/2 ? selectedUnit.position[1] - speed * selectedUnit.maxSpeed :  // Down
      selectedUnit.position[1], // Horizontal Y
      
      // For vertical movement (angle = ±π/2), we only move in Z
      angle === -Math.PI/2 ? selectedUnit.position[2] : // Up
      angle === Math.PI/2 ? selectedUnit.position[2] :  // Down
      selectedUnit.position[2] + Math.cos(angle ?? 0) * speed * selectedUnit.maxSpeed, // Horizontal Z
    ];

    setBattle(prev => ({
      ...prev,
      units: prev.units.map(unit => 
        unit.id === selectedUnit.id 
          ? { 
              ...unit, 
              plannedActions: { 
                ...unit.plannedActions, 
                moveTarget: targetPosition,
                moveSpeed: speed 
              }
            }
          : unit
      ),
    }));
  }, [selectedUnit, selectedSpeed]);

  const handlePlanAttack = useCallback((targetId: string, weaponMode: WeaponMode) => {
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
      
      <Canvas 
        camera={{ position: [0, 10, 20], fov: 60 }} 
        gl={{ antialias: true }}
      >
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
        selectedSpeed={selectedSpeed}
        onSpeedSelect={setSelectedSpeed}
      />
    </div>
  );
} 