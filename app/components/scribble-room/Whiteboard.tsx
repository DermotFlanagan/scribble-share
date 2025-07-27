import React, { useEffect, useRef, useCallback } from "react";
import {
  loadRoomStrokes,
  saveStroke,
} from "@/app/services/scribbling-room.service";
import { fetchUserById } from "@/app/services/user.service";
import clsx from "clsx";
import { vividly } from "@/app/ui/fonts";
import { ScribbleStroke } from "@/app/lib/types/scribble.types";
import { BoardProps } from "@/app/lib/types/room.types";

interface CursorPayload {
  userId: string;
  x: number;
  y: number;
}

export default function WhiteBoard(props: BoardProps) {
  const {
    room,
    scribblingPen,
    setScribblingPen,
    hideTools,
    session,
    isAuthenticated,
    channel,
    canvasState,
    setCanvasState,
    broadcastStrokeStart,
    broadcastStrokeUpdate,
    broadcastStrokeEnd,
    sendMousePosition,
  } = props;

  const boardAreaRef = useRef<HTMLDivElement>(null);
  const createdCursorsRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isEraserActive = scribblingPen.colour === "#ffffff";

  const createUserMouseCursor = async (_userId: string): Promise<void> => {
    if (createdCursorsRef.current.includes(_userId)) {
      return;
    }

    const existingCursorDiv = document.getElementById(_userId + "-cursor");
    if (existingCursorDiv) {
      return;
    }

    const cursorDiv = document.createElement("div");

    const svgElem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgElem.setAttribute("width", "16");
    svgElem.setAttribute("height", "16");
    svgElem.setAttribute("fill", "currentColor");
    svgElem.setAttribute("class", "bi bi-cursor-fill");
    svgElem.setAttribute("viewBox", "0 0 16 16");

    const pathElem = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathElem.setAttribute(
      "d",
      "M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"
    );

    svgElem.appendChild(pathElem);

    cursorDiv.id = _userId + "-cursor";
    cursorDiv.classList.add("h-4", "w-4", "absolute", "z-50", "-scale-x-100");
    const { user } = await fetchUserById(_userId);

    const userColor = user?.user_metadata?.userColor;
    if (userColor && /^#[0-9A-Fa-f]{6}$/.test(userColor)) {
      cursorDiv.style.color = userColor;
    } else {
      cursorDiv.style.color = "#000000";
    }

    cursorDiv.appendChild(svgElem);
    if (boardAreaRef.current) {
      boardAreaRef.current.appendChild(cursorDiv);
    } else {
      console.warn("boardAreaRef.current is null, cannot append cursor");
    }

    createdCursorsRef.current.push(_userId);
  };

  const receivedCursorPosition = useCallback((payload: CursorPayload) => {
    const { userId: _userId, x, y } = payload || {};
    const cursorDiv = document.getElementById(_userId + "-cursor");

    if (cursorDiv) {
      cursorDiv.style.left = x + "px";
      cursorDiv.style.top = y + "px";
    } else {
      createUserMouseCursor(_userId);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isAuthenticated && channel && session?.user?.id) {
        const container = document.querySelector("#container");
        const containerOffset = container!.getBoundingClientRect();

        const relativeX = e.clientX - containerOffset.left;
        const relativeY = e.clientY - containerOffset.top;

        sendMousePosition(session.user.id, relativeX, relativeY);
      }
    };

    boardAreaRef?.current?.addEventListener("mousemove", handleMouseMove);

    return () => {
      boardAreaRef?.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isAuthenticated, channel, session?.user?.id, sendMousePosition]);

  useEffect(() => {
    if (channel) {
      channel.on("broadcast", { event: "cursor" }, (payload) => {
        receivedCursorPosition(payload.payload);
      });
    }
  }, [channel, receivedCursorPosition]);

  useEffect(() => {
    if (room.id) {
      loadRoomStrokes(room.id).then((res) => {
        if (res.success) {
          setCanvasState((prev) => ({
            ...prev,
            strokes: res.data,
          }));
        }
      });
    }
  }, [room.id, setCanvasState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sketch = document.querySelector("#sketch")!;
    const sketchStyle = getComputedStyle(sketch);
    canvas.width = parseInt(sketchStyle.getPropertyValue("width"));
    canvas.height = parseInt(sketchStyle.getPropertyValue("height"));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function renderAllStrokes() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStrokes();
    }

    function drawStrokes() {
      if (!ctx) return;

      canvasState.strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });

      if (canvasState.currStroke && canvasState.currStroke.points.length > 1) {
        const stroke = canvasState.currStroke;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    }

    function getCanvasOffset() {
      const rect = canvas!.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    }

    function getPointFromEvent(e: MouseEvent | Touch) {
      const canvasOffset = getCanvasOffset();
      return {
        x: e.clientX - canvasOffset.left,
        y: e.clientY - canvasOffset.top,
      };
    }

    function handleMouseDown(e: MouseEvent) {
      if (hideTools || !session?.user?.id || !channel) return;

      const point = getPointFromEvent(e);
      const newStroke: ScribbleStroke = {
        id: `${session.user.id}-${Date.now()}-${Math.random()}`,
        userId: session.user.id,
        points: [point],
        color: scribblingPen.colour,
        size: scribblingPen.size,
        timestamp: new Date().toISOString(),
      };

      setCanvasState((prev) => ({
        ...prev,
        currStroke: newStroke,
        isScribbling: true,
      }));

      broadcastStrokeStart(newStroke);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvasState.isScribbling || !canvasState.currStroke || !channel)
        return;

      const point = getPointFromEvent(e);
      const updatedPoints = [...canvasState.currStroke.points, point];

      setCanvasState((prev) => ({
        ...prev,
        currStroke: prev.currStroke
          ? {
              ...prev.currStroke,
              points: updatedPoints,
            }
          : null,
      }));

      broadcastStrokeUpdate(canvasState.currStroke.id, updatedPoints);
    }

    function handleMouseUp() {
      if (!canvasState.isScribbling || !canvasState.currStroke || !channel)
        return;

      const completedStroke = canvasState.currStroke;

      setCanvasState((prev) => ({
        ...prev,
        strokes: [...prev.strokes, prev.currStroke!],
        currStroke: null,
        isScribbling: false,
      }));

      broadcastStrokeEnd(canvasState.currStroke.id);

      saveStroke({
        stroke_id: completedStroke.id,
        room_id: room.id,
        user_id: completedStroke.userId,
        points: completedStroke.points,
        color: completedStroke.color,
        size: completedStroke.size,
      }).then((res) => {
        console.log("Save stroke res: ", res);
      });
    }

    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      if (hideTools || !session?.user?.id || !channel) return;

      const point = getPointFromEvent(e.touches[0]);
      const newStroke: ScribbleStroke = {
        id: `${session.user.id}-${Date.now()}-${Math.random()}`,
        userId: session.user.id,
        points: [point],
        color: scribblingPen.colour,
        size: scribblingPen.size,
        timestamp: new Date().toISOString(),
      };

      setCanvasState((prev) => ({
        ...prev,
        currStroke: newStroke,
        isScribbling: true,
      }));

      broadcastStrokeStart(newStroke);
    }

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!canvasState.isScribbling || !canvasState.currStroke || !channel)
        return;

      const point = getPointFromEvent(e.touches[0]);
      const updatedPoints = [...canvasState.currStroke.points, point];

      setCanvasState((prev) => ({
        ...prev,
        currStroke: prev.currStroke
          ? {
              ...prev.currStroke,
              points: updatedPoints,
            }
          : null,
      }));

      broadcastStrokeUpdate(canvasState.currStroke.id, updatedPoints);
    }

    function handleTouchEnd() {
      if (!canvasState.isScribbling || !canvasState.currStroke || !channel)
        return;

      const completedStroke = canvasState.currStroke;

      setCanvasState((prev) => ({
        ...prev,
        strokes: [...prev.strokes, prev.currStroke!],
        currStroke: null,
        isScribbling: false,
      }));

      broadcastStrokeEnd(canvasState.currStroke.id);

      saveStroke({
        stroke_id: completedStroke.id,
        room_id: room.id,
        user_id: completedStroke.userId,
        points: completedStroke.points,
        color: completedStroke.color,
        size: completedStroke.size,
      });
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchmove", handleTouchMove);

    renderAllStrokes();

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [
    room?.id,
    canvasState,
    scribblingPen,
    session?.user?.id,
    channel,
    hideTools,
    setCanvasState,
    broadcastStrokeStart,
    broadcastStrokeUpdate,
    broadcastStrokeEnd,
  ]);

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -2 : 2;
    setScribblingPen((prev) => {
      let newSize = prev.size + delta;
      if (newSize < 0) newSize = 1;
      if (newSize > 50) newSize = 50;
      return { ...prev, size: newSize };
    });
  }

  return (
    <div
      className={clsx(
        "my-auto w-full h-full p-2",
        isEraserActive
          ? "cursor-[url('/cursors/eraser.cur'),_pointer]"
          : "cursor-[url('/cursors/pen.cur'),_pointer]"
      )}
      onWheel={handleWheel}
    >
      <div className="w-full h-full relative" id="sketch" ref={boardAreaRef}>
        <div className="absolute top-2 right-2 z-50">
          <div>
            <h1
              className={`${vividly.className} text-blue-500 text-4xl opacity-40`}
            >
              ScribbleShare
            </h1>
          </div>
        </div>

        <div id="container" className="w-full h-full">
          <canvas
            className="w-full h-full touch-none select-none"
            id="board"
            ref={canvasRef}
          ></canvas>
        </div>
      </div>
    </div>
  );
}
