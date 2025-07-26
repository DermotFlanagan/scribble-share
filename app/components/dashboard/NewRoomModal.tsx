import React, { useState } from "react";
import { createScribbleRoom } from "@/app/services/scribbling-room.service";
import clsx from "clsx";
import { cherryBombOne } from "@/app/ui/fonts";
import { Session } from "@supabase/supabase-js";

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  loadUserDrawingRooms: () => Promise<void>;
  session: Session | null;
};

export default function NewRoomModal(props: Props) {
  const { session, show, setShow, loadUserDrawingRooms } = props;
  const [roomName, setRoomName] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [isPasswordProtected, setIsPasswordProtected] =
    useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  async function handleCreateRoom() {
    if (!session?.user?.id) {
      return;
    }
    setIsCreatingRoom(true);
    const newRoom = await createScribbleRoom(
      roomName,
      session?.user?.id,
      isPublic,
      isPasswordProtected,
      isPasswordProtected ? password : null
    );
    loadUserDrawingRooms();
    window.location.href = `/room/${newRoom![0].id}`;
    setIsCreatingRoom(false);
  }

  return (
    <>
      {show && (
        <div className="fixed w-full inset-0 ">
          <div
            className="absolute bg-black/50 w-full h-full "
            onClick={() => !isCreatingRoom && setShow(false)}
          />
          <div className="flex justify-center items-center h-screen ">
            <form
              className="bg-white relative z-10 flex flex-col gap-5 p-5 rounded-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateRoom();
              }}
            >
              <h2 className="text-slate-700 text-xl text-center">
                Create new{" "}
                <span
                  className={`${cherryBombOne.className} text-blue-500 text-2xl mx-1`}
                >
                  Scribble
                </span>{" "}
                room
              </h2>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="My Scribble Room"
                  className="border border-slate-300 py-2.5 px-3 rounded-xl"
                  onChange={(e) => setRoomName(e.target.value)}
                  value={roomName}
                  required
                  maxLength={16}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-1 items-center text-slate-700 text-md justify-between">
                <label>Public?</label>
                <input
                  type="checkbox"
                  placeholder="Room Name"
                  className="border border-slate-300 rounded "
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              </div>

              <div className="flex gap-1 items-center text-slate-700 text-md justify-between">
                <label className={clsx(isPublic ? "" : " text-gray-200")}>
                  Password Protected?
                </label>
                <input
                  type="checkbox"
                  className={clsx(
                    "border border-slate-300 rounded ml-2",
                    isPublic ? "" : "opacity-30 cursor-not-allowed"
                  )}
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  disabled={!isPublic}
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  className={clsx(
                    "border border-slate-300 py-2.5 px-3 rounded-xl justify-between",
                    isPasswordProtected ? "" : "opacity-30 cursor-not-allowed"
                  )}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  required
                  disabled={!isPasswordProtected || !isPublic}
                />
              </div>

              <button
                className={`font-semibold text-lg px-2 py-2 rounded-full gap-1 bg-blue-600 text-white hover:bg-blue-500 ${cherryBombOne.className}`}
                type="submit"
                disabled={isCreatingRoom}
              >
                {isCreatingRoom ? "Please wait..." : "Scribble!"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
