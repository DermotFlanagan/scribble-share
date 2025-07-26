"use client";
import { deleteScribbleRoom } from "@/app/services/scribbling-room.service";
import { RoomType } from "@/app/lib/types/room.types";
import toast from "react-hot-toast";
import { Lock, Trash } from "lucide-react";
import Link from "next/link";
import { coiny } from "@/app/ui/fonts";
import clsx from "clsx";

type Props = RoomType & {
  userId: string;
  reloadRooms: () => void;
};

export function RoomCard({
  id,
  name,
  created_at,
  isPublic,
  userId,
  reloadRooms,
  isPasswordProtected,
}: Props) {
  const createdAtDate = new Date(created_at);

  const formattedDateTime = createdAtDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDeleteRoom(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const confirm = window.confirm(
      "Are you sure you want to delete this Scribble room?"
    );
    if (!confirm) return;

    try {
      await deleteScribbleRoom(id, userId);
      toast.success("Room deleted");

      await reloadRooms();
    } catch (err) {
      toast.error("Failed to delete room");
      console.error(err);
    }
  }

  return (
    <Link
      href={`/room/${id}`}
      className="block w-full hover:-translate-y-5 transition bg-white duration-300 hover:shadow-lg shadow-stone-300 rounded-xl hover:z-10"
    >
      <div className="flex items-start border-dashed border-gray-500 border-2 p-5 rounded-xl justify-between w-full">
        <div className="flex gap-3 flex-col w-full">
          <h2
            className={`font-medium text-lg text-blue-500 capitalize ${coiny.className}`}
          >
            {name}
          </h2>
          <span className="text-xs text-slate-500">
            Created at {formattedDateTime}
          </span>
        </div>
        <div className="flex gap-3 flex-col items-end">
          <div className="flex gap-2 items-center">
            <span
              className={clsx("rounded-full text-xs font-medium py-1 px-2 ", {
                "bg-green-100 text-green-600": isPublic,
                "bg-red-100 text-red-600": !isPublic,
              })}
            >
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {isPasswordProtected && <Lock className="w-5 h-5" />}
            <button
              onClick={handleDeleteRoom}
              className="text-red-500 text-s hover:text-red-700 cursor-pointer"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="block w-full bg-white shadow-stone-200 rounded-xl">
      <div className="flex items-start border-dashed border-slate-200 border-2 p-5 rounded-xl justify-between w-full animate-pulse">
        <div className="flex gap-3 flex-col w-full">
          <div className="h-5 w-3/4 bg-slate-100 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-3 flex-col items-end">
          <div className="h-6 w-16 bg-slate-100 rounded-full" />
          <div className="flex gap-2 items-center">
            <div className="h-5 w-5 bg-slate-100 rounded-md" />
            <div className="h-5 w-5 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
