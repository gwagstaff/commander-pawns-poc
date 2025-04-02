"use client";

import { useState } from "react";

interface CreateGameFormProps {
  onCancel: () => void;
}

export function CreateGameForm({ onCancel }: CreateGameFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    maxCommanders: 4,
    maxPawns: 100,
    mapType: "CLASSIC",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement game creation logic
    console.log("Create game", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-lg shadow-lg space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Game Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxCommanders" className="block text-sm font-medium mb-1">
            Max Commanders
          </label>
          <input
            type="number"
            id="maxCommanders"
            value={formData.maxCommanders}
            onChange={(e) => setFormData({ ...formData, maxCommanders: parseInt(e.target.value) })}
            min={2}
            max={4}
            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label htmlFor="maxPawns" className="block text-sm font-medium mb-1">
            Max Pawns
          </label>
          <input
            type="number"
            id="maxPawns"
            value={formData.maxPawns}
            onChange={(e) => setFormData({ ...formData, maxPawns: parseInt(e.target.value) })}
            min={4}
            max={1000}
            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="mapType" className="block text-sm font-medium mb-1">
          Map Type
        </label>
        <select
          id="mapType"
          value={formData.mapType}
          onChange={(e) => setFormData({ ...formData, mapType: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        >
          <option value="CLASSIC">Classic</option>
          <option value="SMALL">Small</option>
          {/* Add more map types as needed */}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          Create Game
        </button>
      </div>
    </form>
  );
} 