import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function Home() {
  // Redirect to the game page
  redirect("/game");
}
