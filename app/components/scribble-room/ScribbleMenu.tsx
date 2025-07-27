import React, { useEffect, useState } from "react";
import { ScribblingPen } from "@/app/lib/types/scribble.types";
import {
  Eraser,
  MessageSquare,
  Palette,
  Pen,
  SlidersHorizontal,
  Trash,
} from "lucide-react";
import { RoomType } from "@/app/lib/types/room.types";

const COLOUR_PALETTE = [
  "#ff0000",
  "#800000",
  "#ff8000",
  "#7c3e00",
  "#ffff00",
  "#797900",
  "#00FF00",
  "#008000",
  "#40e0d0",
  "#248379",
  "#0000FF",
  "#000081",
  "#9d00ff",
  "#500081",
  "#ff00b3",
  "#88005f",
  "#000000",
  "#808080",
];

const colourMap: Record<string, string> = {
  "#ff0000": "bg-red-500",
  "#800000": "bg-red-900",
  "#ff8000": "bg-orange-400",
  "#7c3e00": "bg-orange-900",
  "#ffff00": "bg-yellow-400",
  "#797900": "bg-yellow-900",
  "#00FF00": "bg-green-400",
  "#008000": "bg-green-800",
  "#40e0d0": "bg-cyan-300",
  "#248379": "bg-cyan-800",
  "#0000FF": "bg-blue-500",
  "#000081": "bg-blue-900",
  "#9d00ff": "bg-purple-500",
  "#500081": "bg-purple-900",
  "#ff00b3": "bg-pink-400",
  "#88005f": "bg-pink-900",
  "#000000": "bg-black",
  "#808080": "bg-gray-500",
};

interface ScribbleMenuProps {
  scribblingPen: ScribblingPen;
  setScribblingPen: (
    pen: ScribblingPen | ((prev: ScribblingPen) => ScribblingPen)
  ) => void;
  room: RoomType;
  isRoomOwner: boolean;
  onClearCanvas: (roomId: string) => Promise<void>;
}

export default function ScribbleMenu(props: ScribbleMenuProps) {
  const { scribblingPen, setScribblingPen, room, isRoomOwner, onClearCanvas } =
    props;

  const [isEraserActive, setIsEraserActive] = useState<boolean>(false);
  const [isPenActive, setIsPenActive] = useState<boolean>(true);
  const [previousColour, setPreviousColour] = useState("");
  const [showPalette, setShowPalette] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [isCustomColour, setIsCustomColour] = useState<boolean>(false);
  const [showThicknessSlider, setShowThicknessSlider] =
    useState<boolean>(false);

  useEffect(() => {
    setIsCustomColour(!COLOUR_PALETTE.includes(scribblingPen.colour));
  }, [scribblingPen.colour]);

  const toggleEraser = () => {
    if (!isEraserActive) {
      setPreviousColour(scribblingPen.colour);
      setScribblingPen((prevState: ScribblingPen) => ({
        ...prevState,
        colour: "#ffffff",
      }));
      setIsPenActive(false);
      setIsEraserActive(true);
    } else {
      setScribblingPen((prevState: ScribblingPen) => ({
        ...prevState,
        colour: previousColour,
      }));
      setIsPenActive(true);
      setIsEraserActive(false);
    }
  };

  function handlePenClick() {
    if (isPenActive) return;

    setScribblingPen((prev: ScribblingPen) => ({
      ...prev,
      colour: previousColour || "#000000",
    }));
    setIsPenActive(true);
    setIsEraserActive(false);
  }

  function handleColourSelect(colour: string) {
    console.log("Selected color:", colour);
    console.log("Current color:", scribblingPen.colour);

    setScribblingPen((prev: ScribblingPen) => ({
      ...prev,
      colour,
    }));
    setIsEraserActive(false);
    setIsPenActive(true);
  }

  const handleClearCanvas = () => {
    onClearCanvas(room.id);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-20 flex flex-row justify-between items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="relative">
          <button
            onMouseEnter={() => setShowPalette(true)}
            onClick={() => setShowPalette((prev) => !prev)}
            className={`h-10 w-10 rounded-full text-white shadow-md flex items-center justify-center hover:bg-gray-200 transition
            ${colourMap[scribblingPen.colour] || "text-black"}`}
          >
            <Palette className="w-5 h-5 text-black" />
          </button>

          {showPalette && (
            <div
              onMouseLeave={() => setShowPalette(false)}
              className="absolute bottom-14 left-0 bg-white rounded-lg p-2 flex flex-col grow shrink gap-2 shadow-md"
            >
              {COLOUR_PALETTE.map((colour) => (
                <div
                  key={colour}
                  className="h-6 w-6 rounded-sm border cursor-pointer transition hover:scale-90 duration-100"
                  style={{ backgroundColor: colour }}
                  onClick={() => {
                    handleColourSelect(colour);
                    setShowPalette(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handlePenClick}
          className={`cursor-pointer h-10 w-10 rounded-full shadow-md flex items-center justify-center transition hover:bg-gray-200 ${
            isPenActive ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Pen className="w-5 h-5 text-black" />
        </button>

        <button
          onClick={() => setShowThicknessSlider((prev) => !prev)}
          className={`cursor-pointer h-10 w-10 rounded-full md:hidden shadow-md flex items-center justify-center transition hover:bg-gray-200 ${
            showThicknessSlider ? "bg-gray-300" : "bg-white"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 text-black" />
        </button>

        {showThicknessSlider && (
          <div className="absolute bottom-14 left-0 bg-white rounded-lg p-2 flex flex-col grow shrink gap-2 shadow-md">
            <input
              id="scribble-size"
              type="range"
              min={0}
              max={50}
              step={5}
              value={scribblingPen.size}
              onChange={(e) =>
                setScribblingPen((prev: ScribblingPen) => ({
                  ...prev,
                  size: parseInt(e.target.value),
                }))
              }
              className="w-full"
              onMouseUp={() => setShowThicknessSlider(false)}
              onTouchEnd={() => setShowThicknessSlider(false)}
            />
          </div>
        )}

        <button
          onClick={toggleEraser}
          className={`cursor-pointer h-10 w-10 rounded-full shadow-md flex items-center justify-center transition hover:bg-gray-200 ${
            isEraserActive ? "bg-gray-300" : "bg-white"
          }`}
        >
          <Eraser className="w-5 h-5 text-black" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-200 transition"
          >
            <MessageSquare className="w-5 h-5 text-black" />
          </button>

          {showChat && (
            <div className="absolute bottom-14 left-0 bg-white rounded-lg p-2 flex flex-col grow shrink gap-2 shadow-md"></div>
          )}
        </div>
      </div>

      {isRoomOwner && (
        <button
          className="h-10 w-10 rounded-full bg-red-500 shadow-md flex items-center justify-center hover:bg-red-700 transition"
          onClick={handleClearCanvas}
        >
          <Trash className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
