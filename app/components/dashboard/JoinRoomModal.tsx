import React, { useState } from "react";
import { joinScribbleRoom } from "@/app/services/scribbling-room.service";
import { cherryBombOne } from "@/app/ui/fonts";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

type Props = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  loadUserDrawingRooms: () => Promise<void>;
  session: Session | null;
};

export default function JoinRoomModal(props: Props) {
  const router = useRouter();
  const { show, setShow } = props;
  const [roomId, setRoomId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isJoiningRoom, setIsJoiningRoom] = useState<boolean>(false);

  async function handleJoinRoom() {
    setIsJoiningRoom(true);
    try {
      const res = await joinScribbleRoom(roomId, password);

      if (res.success) {
        router.push(`/room/${res.room.id}`);
      } else {
        toast.error(
          "Failed to join room. Please ensure that the details entered are correct."
        );
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("An error occurred while trying to join the room.");
    } finally {
      setIsJoiningRoom(false);
    }
  }

  return (
    <>
      {show && (
        <div className="fixed w-full inset-0 ">
          <div
            className="absolute bg-black/50 w-full h-full"
            onClick={() => !isJoiningRoom && setShow(false)}
          />
          <div className="flex justify-center items-center h-screen">
            <form
              className="bg-white relative z-10 flex flex-col gap-5 p-5 rounded-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom();
              }}
              autoComplete="off"
            >
              <h2 className="text-slate-700 text-xl text-center">
                Join a{" "}
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
                  placeholder="Scribble Room ID"
                  className="border border-slate-300 py-2.5 px-3 rounded-xl"
                  onChange={(e) => setRoomId(e.target.value)}
                  value={roomId}
                  required
                  name="scribble-room-id"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  className="border border-slate-300 py-2.5 px-3 rounded-xl justify-between"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  autoComplete="new-password"
                  name="scribble-room-password"
                />
              </div>

              <button
                className={`font-semibold text-lg px-2 py-2 rounded-full gap-1 bg-blue-600 text-white hover:bg-blue-500 ${cherryBombOne.className}`}
                type="submit"
                disabled={isJoiningRoom}
              >
                {isJoiningRoom ? "Please wait..." : "Scribble!"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
