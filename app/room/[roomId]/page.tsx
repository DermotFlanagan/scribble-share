"use client";

import Navbar from "@/app/components/Navbar";
import { fetchScribbleRoomById } from "@/app/services/scribbling-room.service";
import { fetchUserById, getUserSession } from "@/app/services/user.service";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BoardContainer from "@/app/components/scribble-room/BoardContainer";
import Spinner from "@/app/ui/Spinner";
import { Session } from "@supabase/supabase-js";
import { User } from "@/app/lib/types/room.types";
import { RoomType } from "@/app/lib/types/room.types";

export default function ScribbleRoomPage() {
  const { roomId } = useParams();
  const [owner, setOwner] = useState<User | undefined>(undefined);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scribblersCount, setScribblersCount] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const session = await getUserSession();
      setSession(session);

      const rooms = await fetchScribbleRoomById(roomId as string);
      if (!rooms || rooms.length === 0) {
        window.location.href = "/dashboard";
        return;
      }
      const currentRoom = rooms[0];

      const canEnterRoom =
        currentRoom.isPublic || currentRoom.owner === session?.user?.id;

      if (!canEnterRoom) {
        window.location.href = "/dashboard";
        return;
      }

      const requirePassword =
        !session?.user?.id &&
        currentRoom.isPublic &&
        currentRoom.isPasswordProtected;
      if (requirePassword) {
        window.location.href = `/room/${roomId}/password`;
        return;
      }

      setRoom(currentRoom);
      setIsLoading(false);

      const ownerData = await fetchUserById(currentRoom.owner);
      setOwner(ownerData.user || undefined);
    }

    loadData();
  }, [roomId]);

  if (isLoading) {
    return (
      <main className="h-screen flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="h-screen flex items-center justify-center">
        <div>Room not found.</div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      <Navbar
        session={session}
        owner={owner}
        room={room}
        isRoom
        isLoadingRoom={isLoading}
        scribblersCount={scribblersCount.length}
      />
      <BoardContainer
        room={room}
        onScribblersCountChange={setScribblersCount}
      />
    </main>
  );
}
