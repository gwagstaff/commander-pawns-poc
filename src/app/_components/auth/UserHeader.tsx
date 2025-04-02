"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import Image from "next/image";

interface UserHeaderProps {
  session: Session;
}

export function UserHeader({ session }: UserHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold">Commander & Pawns</h1>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User avatar"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-sm text-gray-300">{session.user.name}</span>
        </div>
        <button
          onClick={() => void signOut()}
          className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
} 