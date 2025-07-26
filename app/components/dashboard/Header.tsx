import { cherryBombOne } from "@/app/ui/fonts";
import clsx from "clsx";
import { AlertTriangle, Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

type Props = {
  session: Session | null;
  setShowCreateRoomModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowJoinModal: React.Dispatch<React.SetStateAction<boolean>>;
  canCreateRoom: boolean;
};

const welcomeMessages = [
  "!\nReady to scribble?",
  "!\nLet's create something amazing!",
  "!\nTime to unleash your creativity!",
  "!\nLet's make some art together!",
  "!\nReady to brainstorm?",
  "!\nLet's show the world what you can do!",
  "!\nI know you're going to make something incredible!",
  "! Stop slacking!",
];

const prefixes = ["Hey, ", "Welcome back, ", "Hello, ", "Hi, "];

const emojis = ["🎨", "🖌️", "🖍️", "📝", "💡", "🌟"];

export default function Header(props: Props) {
  const { session, setShowCreateRoomModal, setShowJoinModal } = props;
  const [message, setMessage] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");

  function getRandomPrefix(prefixes: string[]) {
    const randIdx = Math.floor(Math.random() * prefixes.length);
    return prefixes[randIdx];
  }

  useEffect(() => {
    setPrefix(getRandomPrefix(prefixes));
    setMessage(
      `${welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]} ${
        emojis[Math.floor(Math.random() * emojis.length)]
      }`
    );
  }, [session]);

  return (
    <section className="w-full flex justify-between items-center flex-col md:flex-row md:items-start text-center md:text-left gap-4 p-4 mt-3 mb-0 z-0">
      <h3
        className={`text-slate-600 text-2xl ${cherryBombOne.className} whitespace-pre-line leading-6`}
      >
        {prefix}
        <span className="text-blue-500">
          {session?.user?.user_metadata?.userName}
        </span>
        {message}
      </h3>
      <div className="flex gap-8">
        <button
          className="flex items-center font-semibold px-2.5 py-2 rounded-xl gap-1 bg-blue-500 text-white w-full md:w-auto text-center justify-center md:shadow-custom hover:bg-blue-400 hover:scale-120 cursor-pointer transition duration-300 md:border-b-4 md:border-blue-600 md:border-r-4 "
          onClick={() => setShowJoinModal(true)}
        >
          <Users />
          <span>Join a Room</span>
        </button>
        <button
          className={clsx(
            "flex items-center font-semibold px-2.5 py-2 rounded-xl gap-1 bg-blue-500 text-white transition w-full md:w-auto text-center justify-center md:shadow-custom hover:scale-120 ",
            props.canCreateRoom
              ? "hover:bg-blue-400 cursor-pointer transition duration-300 md:border-b-4 md:border-blue-600 md:border-r-4 "
              : "cursor-not-allowed bg-red-700 hover:bg-red-700 "
          )}
          disabled={!props.canCreateRoom}
          onClick={() => {
            if (!props.canCreateRoom) return;
            setShowCreateRoomModal(true);
          }}
        >
          {props.canCreateRoom ? <Plus /> : ""}
          <span>
            {props.canCreateRoom ? (
              "Create Scribble Room"
            ) : (
              <div className="flex items-center gap-2 text-slate-200">
                <AlertTriangle />
                <span> Maximum rooms reached</span>
                <AlertTriangle />
              </div>
            )}
          </span>
        </button>
      </div>
    </section>
  );
}
