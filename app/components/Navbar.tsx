"use client";

import Link from "next/link";
import React, { useState } from "react";
import { coiny, vividly } from "../ui/fonts";
import clsx from "clsx";
import { Power } from "lucide-react";
import toast from "react-hot-toast";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/initSupabase";
import { RoomType } from "../lib/types/room.types";

type User = {
  id: string;
  email: string;
  user_metadata: {
    userName: string;
    userColor?: string;
  };
};

type Props = {
  session: Session | null;
  owner?: User;
  isRoom?: boolean;
  room?: RoomType;
  isLoadingRoom?: boolean;
  scribblersCount?: number;
};

function Navbar(props: Props) {
  const { session, owner, isRoom, room, isLoadingRoom, scribblersCount } =
    props;
  const shouldShowRoomName = isRoom && room?.name;
  const shouldShowRoomVisibilityBadge = isRoom && !isLoadingRoom;
  const isRoomOwner = owner?.id === session?.user.id;
  const [showDetails, setShowDetails] = useState(false);
  const isLoggedIn = !!session?.user;

  async function handleLogout() {
    const q = confirm("Are you sure you want to log out?");
    if (!q) return;

    try {
      await supabase.auth.signOut({ scope: "local" });
      localStorage.clear();
      sessionStorage.clear();

      window.location.replace("/");
    } catch (error) {
      console.error("Logout error: ", error);
    }
  }

  function copyRoomId() {
    if (!room?.id) return;

    navigator.clipboard.writeText(room.id);
    toast.success("Room ID copied to clipboard!", {
      position: "top-center",
      duration: 2000,
    });
  }

  return (
    <nav className="bg-white z-20 border-b-1 border-dashed border-blue-200 w-full p-2">
      <div className="mx-auto flex justify-between items-center">
        <section className="flex gap-2 items-center">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className={`text-2xl font-semibold md:text-4xl text-blue-500 ${vividly.className}`}
          >
            ScribbleShare
          </Link>
        </section>

        {shouldShowRoomName && (
          <div
            className="relative flex flex-col items-center cursor-pointer"
            onMouseEnter={() => setShowDetails(true)}
            onMouseLeave={() => setShowDetails(false)}
            onClick={copyRoomId}
          >
            <h3
              className={`text-blue-500 ${coiny.className} text-center justify-center text-sm md:text-lg`}
            >
              {room?.name}
            </h3>
            {showDetails && (
              <div className="absolute top-full mt-2 bg-white p-4 border rounded shadow-lg z-50 whitespace-nowrap mb-2">
                {owner && (
                  <div className="lg:flex pointer-events-none">
                    <h3 className="text-black">
                      Owned by{" "}
                      <span className="text-blue-500">
                        {owner?.user_metadata?.userName}
                      </span>
                      {isRoomOwner && (
                        <span className="text-blue-500">(You)</span>
                      )}
                    </h3>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 justify-between">
                  {scribblersCount ? (
                    <div className="flex gap-2">
                      <h3 className={`${coiny.className} text-md`}>
                        <span className="text-blue-500">{scribblersCount}</span>{" "}
                        scribblers
                      </h3>
                    </div>
                  ) : null}
                  {shouldShowRoomVisibilityBadge && (
                    <div className="flex gap-2">
                      <span
                        className={clsx(
                          "rounded-full text-xs font-medium bg-green-100 py-1 px-2",
                          room?.isPublic
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        )}
                      >
                        {room?.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {session && (
            <>
              <h3 className="text-white-500 font-bold">
                {session?.user?.user_metadata?.userName}
              </h3>
            </>
          )}
          <div
            className={`h-10 w-10 overflow-hidden rounded-full items-center justify-center flex hover:text-white cursor-pointer transition-colors duration-300`}
            style={{
              background:
                session?.user?.user_metadata?.userColor &&
                /^#[0-9A-Fa-f]{6}$/.test(
                  session?.user?.user_metadata?.userColor
                )
                  ? session?.user?.user_metadata?.userColor
                  : "#3B82F6",
            }}
            onClick={handleLogout}
          >
            <Power />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
