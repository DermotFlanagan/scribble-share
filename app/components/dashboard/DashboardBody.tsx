"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RoomCard, RoomCardSkeleton } from "./RoomCard";
import NewRoomModal from "./NewRoomModal";
import { fetchUserScribbleRooms } from "@/app/services/scribbling-room.service";
import Header from "./Header";
import Image from "next/image";
import { cherryBombOne } from "@/app/ui/fonts";
import JoinRoomModal from "./JoinRoomModal";
import { Session } from "@supabase/supabase-js";
import { RoomType } from "@/app/lib/types/room.types";

const MAX_ROOMS = 20;

type Props = {
  session: Session | null;
};

export default function DashboardBody(props: Props) {
  const { session } = props;
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  const [rooms, setRooms] = useState<RoomType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateRoomModal, setShowCreateRoomModal] =
    useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  const hasNoScribbleRooms = !loading && rooms?.length === 0;
  const hasScribbleRooms = rooms && rooms!.length > 0;
  const shouldShowRoom = !loading && hasScribbleRooms;

  const numUserRooms = rooms && rooms!.length ? rooms!.length : 0;
  const canCreateRoom = numUserRooms < MAX_ROOMS;

  const loadUserDrawingRooms = useCallback(async () => {
    if (!session?.user?.id) return;
    return fetchUserScribbleRooms(session?.user?.id).then((res) => {
      setRooms(res);
    });
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadUserDrawingRooms().then(() => {
        setLoading(false);
      });
    }
  }, [session?.user?.id, loadUserDrawingRooms]);

  return (
    <div className="max-w-6xl flex flex-col gap-10 mx-auto px-4 pt-10 ">
      {isDashboard && (
        <Header
          session={session}
          setShowCreateRoomModal={setShowCreateRoomModal}
          canCreateRoom={canCreateRoom}
          setShowJoinModal={setShowJoinModal}
        />
      )}

      {hasNoScribbleRooms && (
        <p
          className={`text-black text-center mt-6 ${cherryBombOne.className} text-lg `}
        >
          You have no Scribbles yet. Create a new one to get started!
        </p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {loading && (
          <>
            {Array(5)
              .fill(5)
              .map((_, i) => (
                <RoomCardSkeleton key={i} />
              ))}
          </>
        )}

        {shouldShowRoom && session?.user?.id && (
          <>
            {hasScribbleRooms && (
              <div className="hidden md:block absolute top-53 left-19 z-[-1] cursor-none pointer-events-none">
                <Image
                  src="/stick-figure.png"
                  alt="stick figure"
                  width={400}
                  height={400}
                />
              </div>
            )}
            {rooms?.map(
              ({ id, name, created_at, isPublic, isPasswordProtected }) => (
                <RoomCard
                  key={id}
                  id={id}
                  name={name}
                  created_at={created_at}
                  isPublic={isPublic}
                  userId={session?.user?.id}
                  reloadRooms={loadUserDrawingRooms}
                  isPasswordProtected={isPasswordProtected}
                />
              )
            )}
          </>
        )}
      </section>
      <NewRoomModal
        show={showCreateRoomModal}
        setShow={setShowCreateRoomModal}
        loadUserDrawingRooms={loadUserDrawingRooms}
        session={session}
      />
      <JoinRoomModal
        show={showJoinModal}
        setShow={setShowJoinModal}
        loadUserDrawingRooms={loadUserDrawingRooms}
        session={session}
      />
    </div>
  );
}
