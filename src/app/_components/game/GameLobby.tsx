"use client";
import { useState } from "react";
import { GameList } from "./GameList";
import { CreateGameForm } from "./CreateGameForm";

export function GameLobby() {
  const [showCreateGame, setShowCreateGame] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Game Lobby</h2>
        <button
          onClick={() => setShowCreateGame(!showCreateGame)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          {showCreateGame ? "Cancel" : "Create Game"}
        </button>
      </div>

      {showCreateGame ? (
        <CreateGameForm onCancel={() => setShowCreateGame(false)} />
      ) : (
        <GameList />
      )}
    </div>
  );
} 