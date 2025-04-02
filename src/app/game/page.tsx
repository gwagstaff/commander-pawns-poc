import { auth } from "~/server/auth";
import { GameLobby } from "../_components/game/GameLobby";
import { LoginPrompt } from "../_components/auth/LoginPrompt";
import { UserHeader } from "../_components/auth/UserHeader";

export default async function GamePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        {session ? (
          <>
            <UserHeader session={session} />
            <GameLobby />
          </>
        ) : (
          <LoginPrompt />
        )}
      </div>
    </main>
  );
} 