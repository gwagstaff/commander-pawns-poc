# Commander & Pawns - Game Development Specification (v2 - WEGO Space Combat)

## Implementation Progress

### Core Systems
- [x] Basic 3D strategic map with star systems
- [x] Territory/system selection and targeting
- [x] Fleet size visualization
- [x] Distance calculation between systems
- [x] User interface with commander stats
- [x] Initial WEGO battle system setup
- [ ] WebSocket integration for real-time updates
- [ ] Battle resolution server logic
- [ ] Database schema implementation
- [ ] AI opponent logic

### Strategic Layer
- [x] Star system representation
- [x] System ownership visualization
- [x] Fleet presence indicators
- [x] System selection mechanics
- [x] Attack target selection
- [x] Battle initiation
- [ ] Resource management
- [ ] Territory control mechanics
- [ ] Victory conditions
- [ ] Strategic AI behavior

### WEGO Battle System
- [x] Basic 3D battle space
- [x] Unit representation
- [x] Planning/Animation phase cycling
- [x] Turn timer implementation
- [x] Basic movement planning
- [x] Basic weapon systems
- [ ] Proper physics-based movement
- [ ] Collision detection
- [ ] Advanced weapon effects
- [ ] Battle resolution mechanics
- [ ] Commander abilities
- [ ] Formation controls

### UI/UX
- [x] Strategic map overlay
- [x] Commander stats display
- [x] Battle phase indicators
- [x] Unit selection interface
- [x] Basic movement controls
- [x] Weapon selection interface
- [ ] Advanced battle UI
- [ ] Formation UI
- [ ] Commander ability UI
- [ ] Battle results screen

## 1. Overview

**Commander & Pawns** is a browser-based multiplayer strategy game blending large-scale, turn-based territory control (similar to Risk, themed as star systems/sectors) with real-time visualized, **simultaneously resolved (WEGO)** tactical space battles. Up to 4 "Commanders" manage strategy and fleets, while potentially hundreds of "Pawns" (other players) pilot individual starfighters/ships, planning maneuvers and attacks in turns, which are then visualized in 3D using Three.js.

## 2. Core Concept & Vision

*   **Hybrid Gameplay:** Combines turn-based strategic map control with WEGO tactical 3D space battles.
*   **Asymmetric Roles:** Distinct gameplay experiences for Commanders (strategy, fleet command, battle support) and Pawns (tactical planning, ship piloting via WEGO).
*   **Player-Driven Battles:** Combat outcomes determined by Pawns' planned actions (maneuvers, targeting, weapon/ability choices) resolved simultaneously each turn.
*   **Scalability:** Designed for variable scales, with the WEGO system mitigating the extreme demands of pure real-time 3D for larger player counts.
*   **Social & Streamer Focus:** Encourages interaction, coordination (or lack thereof), and "clippable moments" from strategic decisions and visualized space battle outcomes.
*   **Theme:** Space Opera / Sci-Fi Fleet Battles.

## 3. Target Platform & Technology Stack

*   **Platform:** Web Browser (Desktop focus initially)
*   **Frontend:** Next.js (React), TypeScript, Tailwind CSS, **Three.js** (for battle visualization)
*   **Backend:** Next.js API Routes, tRPC
*   **Database:** PostgreSQL (via Prisma ORM)
*   **Authentication:** NextAuth.js
*   **Real-time Communication:** Socket.io

## 4. Game Design Details

### 4.1 Game Modes & Flow

*   **Modes:** Standard (2-4 Cmdr, variable Pawns), Small (2 Cmdr, few Pawns/Cmdr), AI (Cmdrs vs AI Pawns).
*   **Flow:**
    1.  **Setup:** Game creation, map selection, Commanders join, Pawns join specific Commander fleets.
    2.  **Strategic Phase:** Commanders take turns on the galactic map: allocate fleets, plan attacks on systems/sectors, manage resources (TBD). Ends when a Commander initiates an attack or ends their turn.
    3.  **Battle Phase (WEGO):** Triggered by attacks. Assigned Pawns control ships.
        *   **Planning Phase:** (e.g., 10-15s) Pawns view the 3D battle space, plan actions (movement vectors, targets, weapon modes, abilities) for the upcoming turn segment. Commander can observe and use CP abilities (potentially queued).
        *   **Commit Phase:** Actions locked in, sent to server.
        *   **Resolution Phase:** Server calculates outcomes of all committed actions simultaneously.
        *   **Animation Phase:** (e.g., 3-5s) Server sends results; clients visualize the resolved actions smoothly using Three.js (ships moving, firing, taking damage). Cycle repeats with the next Planning Phase until battle ends.
    4.  **Resolution Phase (Post-Battle):** Battle outcome determines system/sector control changes, VP awarded. Game returns to Strategic Phase.
    5.  **Game End:** Commander eliminates others, reaches VP target, or has highest VP at time limit.

### 4.2 Commander Mechanics

*   **Role:** Strategic overview, fleet allocation, initiating attacks, battlefield support during WEGO battles.
*   **Resources:** Manages strategic resources (TBD) and generates/spends **Command Points (CP)** during battles.
*   **Strategic Actions:** Allocate fleets, Attack adjacent systems.
*   **Battle Actions (using CP, likely queued during Planning Phase):**
    *   **Directives:** High-level goals (Destroy Target X, Secure Point Y).
    *   **Support Abilities:** Orbital Bombardment, Reinforcement Warp-in, EMP Burst, Target Painting.
    *   **Logistics:** Repair Nanite Cloud, Resupply Zone.
*   **Victory:** Eliminate opponents, VP accumulation (battles won, systems held).

### 4.3 Pawn Mechanics (WEGO Battle Focus)

*   **Role:** Tactical planning and execution via WEGO turns for individual ships.
*   **Joining:** Join a specific Commander's "fleet pool" via lobby. Assigned to ships automatically when their Commander attacks or defends.
*   **Ship Control (Planning Phase):**
    *   View 3D battle space (Three.js).
    *   Plan actions for the *next* resolution phase:
        *   Set movement vector/target destination/formation position.
        *   Select primary target(s).
        *   Queue weapon firing modes (e.g., "Focus Fire Lasers", "Launch Missiles"). Could involve RPS-like choices (Energy vs Shields vs Armor).
        *   Queue special maneuvers or ability activations (e.g., "Evasive Roll", "Boost Engines", "Activate Point Defense").
*   **Combat Factors:** Planned maneuvers vs enemy plans, ship positioning/range achieved during resolution, weapon types vs defenses, targeting priorities, Commander abilities.
*   **Engagement:** Per-battle stats/leaderboards (POC). Focus on understanding the WEGO planning/resolution cycle.

### 4.4 Battle System (WEGO)

*   **Battlefield:** 3D space (rendered by Three.js), potentially with asteroids, nebulae, stations acting as simple obstacles or objectives. No fixed grid.
*   **Turn Structure:** Repeating cycle of Planning -> Commit -> Server Resolution -> Client Animation.
*   **Combat Resolution:** Server calculates simultaneous outcomes based on all players' committed plans for the turn segment, using simplified physics and combat rules.
*   **Visualization:** Client uses Three.js and interpolation (e.g., Tween.js) to smoothly animate the calculated outcomes during the Animation Phase.

## 5. Proof of Concept (POC) Scope & Focus (WEGO Implementation)

The primary goal of the POC is to validate the **WEGO gameplay loop** within a 3D space battle context, ensuring the planning phase is understandable and the animated resolution phase provides engaging feedback for both Pawns and observing Commanders.

**POC Must Demonstrate:**

1.  Basic game setup (2 Commanders).
2.  Commander A can initiate an attack, triggering a `Battle`.
3.  A 3D battle space is rendered using Three.js for participating Pawns and Commanders.
4.  Pawns (or AI substitutes) are assigned to basic 3D ship models. Basic camera controls (orbit/follow) are available.
5.  **WEGO Loop:**
    *   **Planning Phase:** Pawns can, within a timer (e.g., 15s):
        *   Select a target enemy ship.
        *   Set a simple movement target (e.g., click a point in space, or "move towards target").
        *   Choose a basic attack mode (e.g., "Fire Lasers" - potentially with a simple Energy/Shield/Armor RPS choice).
        *   Submit this `TurnPlan` via tRPC.
    *   **Resolution Phase:** Server receives plans, calls `processWEGORound` to calculate ship movement (apply simple velocity vector for turn duration), weapon firing (check range based on resolved positions), and damage based on the queued actions/RPS choice.
    *   **Animation Phase:** Server sends results (new positions, rotations, health changes, who hit whom) via Socket.io (`battle:animation_phase_start`). Clients smoothly animate ships moving, firing basic visual effects (lines for lasers), and showing damage over a short duration (e.g., 4s). The loop then restarts with the next Planning Phase.
6.  Basic AI Pawns can generate and submit a simple `TurnPlan` (e.g., move towards nearest enemy, fire default weapon).
7.  Commanders can view the 3D battle and use one simple queued ability (e.g., "Target Paint" an enemy ship, increasing damage taken in the next resolution).
8.  The battle concludes when one side's ships are eliminated, and a winner is declared via WebSocket.

**POC Exclusions:** Complex strategic layer, advanced physics (inertia, drift), complex ship abilities/customization, large player counts (target 5v5 or 10v10 max for POC), detailed UI/UX polish, advanced 3D effects/models, Commander CP system (can hardcode one ability use).

## 6. Technical Implementation Details (POC - WEGO)

### 6.1 Database Schema (Prisma - `schema.prisma`)

```prisma
// ... User, Game, GamePawn, Territory models remain similar (Territory = Star System) ...

model Battle {
  id            String    @id @default(cuid())
  gameId        String
  game          Game      @relation(fields: [gameId], references: [id])
  // attackingSystemId String // Info only
  // defendingSystemId String // Info only
  attackingCommanderId String
  defendingCommanderId String
  pawns         User[]    @relation("PawnToBattle") // Pawns assigned to this battle
  status        String    @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED
  battlefield   Battlefield?
  winnerId      String?   // Commander User ID who won
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Battlefield {
  id            String    @id @default(cuid())
  battleId      String    @unique
  battle        Battle    @relation(fields: [battleId], references: [id])
  // Define battle space boundaries if needed, or use relative coords
  // width         Int       @default(1000) // Example size unit
  // height        Int       @default(1000)
  // depth         Int       @default(1000)
  units         Unit[]
  currentTurn   Int       @default(0) // WEGO Turn Number
  turnDurationPlanning Int @default(15) // seconds
  turnDurationAnimation Int @default(4)  // seconds
  // commanderData Json?     // Store CP, ability cooldowns etc.
  // environment   Json?     // Positions of asteroids, stations etc.
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Unit {
  id            String    @id @default(cuid())
  battlefieldId String
  battlefield   Battlefield @relation(fields: [battlefieldId], references: [id])
  shipType      String    // FIGHTER, FRIGATE (POC: just one type maybe)
  commanderId   String    // User ID of the commander this unit belongs to
  controlledBy  String?   // User ID of the Pawn controlling, null = AI
  // Current State
  positionX     Float     @default(0.0)
  positionY     Float     @default(0.0)
  positionZ     Float     @default(0.0)
  rotationX     Float     @default(0.0) // Or use Quaternions
  rotationY     Float     @default(0.0)
  rotationZ     Float     @default(0.0)
  velocityX     Float     @default(0.0) // Current velocity
  velocityY     Float     @default(0.0)
  velocityZ     Float     @default(0.0)
  health        Int       @default(100)
  shields       Int       @default(50) // Example secondary health
  // Planned actions for the NEXT turn resolution
  plannedActions Json?    // e.g., { moveTarget: {x,y,z}, attackTargetId: "unit123", weaponMode: "LASER_ENERGY", ability: "EVASIVE_ROLL" }
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

6.2 API Structure (tRPC)

    gameRouter: (Largely unchanged, attackTerritory now initiates a WEGO battle setup)
    battleRouter:
        getBattlefieldState: Fetches current state (unit positions, health etc.) - useful for joining mid-battle or resyncing.
        submitTurnPlan: Pawn submits their plannedActions Json for their unit(s) for the upcoming WEGO turn. Server stores this on the Unit.
        useCommanderAbility: Commander submits their ability use (potentially also stored until the resolution phase).

6.3 Real-time Strategy (Socket.io - WEGO)

    Server Setup: Standard Socket.io setup.
    Rooms: game:${gameId}, battle:${battleId}.
    Key Events:
        server -> client:
            battle:started: Includes battleId, initial Battlefield state (unit starting positions).
            battle:planning_phase_start: Signals start of planning, includes turnDurationPlanning. Clients start timers, enable planning UI.
            battle:resolution_phase_start: (Optional) Simple notification that planning is over, server is calculating.
            battle:animation_phase_start: Crucial event. Sends the results of the resolved turn. Payload includes:
                Array of unit updates: { unitId, newPosition: {x,y,z}, newRotation: {x,y,z}, newHealth, newShields, actionsPerformed: [{ type: "FIRE", targetId: "xyz", damage: 10 }, { type: "MOVE" }] }
                Turn number.
                turnDurationAnimation. Clients use this data to smoothly animate the results.
            battle:ended: Signals battle end, includes winnerId.
        client -> server:
            join-game, join-battle.
            (Actions submitted via tRPC submitTurnPlan).

6.4 Core Logic Outlines (Backend - WEGO)

    Battle Turn Cycle (Server-side loop per battle):
        Emit battle:planning_phase_start. Wait turnDurationPlanning seconds.
        (Optional) Emit battle:resolution_phase_start.
        Call processWEGORound().
        Take the results from processWEGORound.
        Emit battle:animation_phase_start with the results payload. Wait turnDurationAnimation seconds (allows clients time to animate).
        Check if battle ended in processWEGORound. If so, break loop, emit battle:ended. Otherwise, increment turn number and loop back to step 1.
    processWEGORound Function:
        Fetch all Units for the battle and their plannedActions.
        AI Planning: For AI units, call generateAITurnPlan to populate their plannedActions.
        Simulate & Resolve:
            Calculate intended movement paths based on plannedActions and simple physics (e.g., move ship towards moveTarget at maxSpeed for turnDurationPlanning seconds). Store the calculated end position/rotation.
            Determine weapon firing: Based on plannedActions (target, weapon mode), check if target is in range/arc at any point during the calculated movement path (simplification: check range at start/mid/end points).
            Resolve combat: Apply damage based on weapon mode vs target defenses (simple RPS or fixed values). Factor in Commander abilities (e.g., Target Paint).
            Resolve planned abilities.
        Collate Results: Create the results payload detailing actionsPerformed (who moved where, who shot whom, damage dealt, abilities used) and the final newPosition, newRotation, newHealth, newShields for each unit at the end of this turn segment.
        Update Database: Persist the new end-of-turn states for all units.
        Check Win Condition: Determine if one side is eliminated.
        Return the results payload and win condition status.
    Simple AI (generateAITurnPlan): Generate a plannedActions object (e.g., target nearest enemy, move towards them, fire default weapon mode).

6.5 Frontend Components (POC - WEGO)

    PawnBattleView:
        ThreeCanvas: Manages Three.js scene, camera, loading ship models. Renders ships based on current state. Crucially, handles the animation during the Animation Phase using the data from battle:animation_phase_start (e.g., using Tween.js/gsap to move ships from old position to newPosition, trigger particle effects for shots/hits). Displays visual cues for planned moves/targets during Planning Phase.
        PlanningUI: Active during Planning Phase. Shows timer. Allows selecting targets (clicking ships in 3D view), choosing movement destination (click point in space?), selecting weapon mode/ability via buttons. Displays the currently queued plan. Triggers submitTurnPlan tRPC call.
    CommanderBattleOverlay: View of the ThreeCanvas. UI to select and queue Commander abilities.

7. Key Considerations/Challenges (WEGO)

    WEGO Logic Complexity: Correctly resolving simultaneous actions fairly is non-trivial.
    Client-Side Animation: Making the animation phase look smooth, believable, and accurately reflect the resolved actions requires good interpolation and timing.
    3D Performance: Even with WEGO, rendering many 3D objects and effects in the browser needs optimization (model complexity, draw calls, effects).
    UI/UX: Clearly communicating the WEGO phases and planning options to the Pawn is critical.

8. Next Steps (Post-POC)

    Refine WEGO resolution logic and physics.
    Improve 3D assets and effects.
    Expand ship types, weapons, abilities.
    Implement full Commander CP system and abilities.
    Optimize rendering and networking for larger scales.
    Develop strategic layer gameplay.

## Current Implementation Details

### Strategic Map (`StrategicMap3D.tsx`)
- 3D visualization of star systems using Three.js
- Interactive system selection and targeting
- Fleet size visualization using vertical beams
- Distance calculation between systems
- Commander stats and game status in top bar
- Transition to battle system when launching fleet

### Battle System (`WEGOBattle.tsx`)
- WEGO turn structure with Planning (15s) and Animation (5s) phases
- Basic unit representation with health/shields display
- Movement planning with simple directional controls
- Weapon system selection (Lasers/Missiles)
- Turn counter and phase timer
- Unit selection and basic control interface

### Next Implementation Priorities
1. WebSocket integration for real-time battle updates
2. Server-side battle resolution logic
3. Proper unit movement with physics
4. Enhanced weapon systems and effects
5. Commander ability implementation
6. Formation controls and AI behavior

### Known Limitations
- Movement is currently simplified without proper physics
- Weapon systems lack proper range/damage calculations
- No collision detection implemented
- Battle resolution is not properly synchronized
- AI opponents not yet implemented
- Commander abilities not yet available

## Technical Recommendations

1. **WebSocket Implementation**
```typescript
// Recommended WebSocket events
interface BattleEvents {
  'battle:start': { battleId: string, initialState: BattleState };
  'battle:planning_start': { turnNumber: number, duration: number };
  'battle:planning_end': { turnNumber: number };
  'battle:animation_start': { turnNumber: number, resolutions: BattleResolution[] };
  'battle:animation_end': { turnNumber: number };
  'battle:end': { winnerId: string, results: BattleResults };
}
```

2. **Battle Resolution Structure**
```typescript
interface BattleResolution {
  unitId: string;
  newPosition: [number, number, number];
  newRotation: [number, number, number];
  actions: {
    type: 'MOVE' | 'FIRE' | 'ABILITY';
    target?: string;
    damage?: number;
    effect?: string;
  }[];
}
```

3. **Commander Ability System**
```typescript
interface CommanderAbility {
  id: string;
  name: string;
  type: 'OFFENSIVE' | 'DEFENSIVE' | 'UTILITY';
  cpCost: number;
  duration: number;
  effect: {
    type: string;
    value: number;
    radius?: number;
    target?: 'SINGLE' | 'AREA' | 'ALL';
  };
}
```

4. **Formation System**
```typescript
interface Formation {
  id: string;
  name: string;
  pattern: {
    positions: [number, number, number][];
    rotations: [number, number, number][];
  };
  spacing: number;
  modifiers: {
    defense?: number;
    attack?: number;
    mobility?: number;
  };
}
```

These technical specifications should be implemented in order of priority, starting with WebSocket integration for real-time battle coordination.
