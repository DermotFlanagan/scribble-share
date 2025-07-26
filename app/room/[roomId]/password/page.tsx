"use client";

import { joinScribbleRoom } from "@/app/services/scribbling-room.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function ScribbleRoomPasswordPage() {
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { roomId } = useParams<{ roomId: string }>();

  async function handleEnterPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!roomId) {
      toast.error("Room ID required");
      return;
    }
    setIsLoading(true);
    try {
      const res = await joinScribbleRoom(roomId, password);
      if (res.success) {
        router.push(`/room/${roomId}`);
      } else {
        toast.error("Incorrect password");
      }
    } catch (err) {
      toast.error("An error occurred while joining the room");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleEnterPassword}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <label htmlFor="room-password" className="text-lg font-semibold">
          Enter Scribble Room Password
        </label>
        <input
          type="password"
          value={password}
          id="room-password"
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          placeholder="Password"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join Room"}
        </button>
      </form>
    </main>
  );
}
