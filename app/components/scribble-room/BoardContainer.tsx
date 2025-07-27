import { useState, useEffect, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";
import ScribbleMenu from "./ScribbleMenu";
import WhiteBoard from "./Whiteboard";
import { ScribblingPen, ScribbleStroke } from "@/app/lib/types/scribble.types";
import { BoardContainerProps, CanvasState } from "@/app/lib/types/room.types";
import { Point } from "@/app/lib/types/scribble.types";
import { supabase } from "@/app/lib/initSupabase";
import { getUserSession } from "@/app/services/user.service";
import { clearRoomStrokes } from "@/app/services/scribbling-room.service";
import toast from "react-hot-toast";

export default function BoardContainer(props: BoardContainerProps) {
  const { room, onScribblersCountChange, hideTools } = props;

  const [scribblingPen, setScribblingPen] = useState<ScribblingPen>({
    colour: "#000000",
    size: 5,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    strokes: [],
    currStroke: null,
    isScribbling: false,
  });

  const MOUSE_EVENT = "cursor";
  const STROKE_START_EVENT = "stroke_start";
  const STROKE_END_EVENT = "stroke_end";
  const STROKE_UPDATE_EVENT = "stroke_update";
  const CANVAS_CLEAR_EVENT = "canvas_clear";

  const isRoomOwner = session?.user?.id === room?.owner;

  // Channel event handlers
  const handleIncomingStrokeStart = useCallback(
    (payload: ScribbleStroke) => {
      if (payload.userId !== session?.user?.id) {
        setCanvasState((prev) => ({
          ...prev,
          strokes: [...prev.strokes, payload],
        }));
      }
    },
    [session?.user?.id]
  );

  const handleIncomingStrokeUpdate = useCallback(
    (payload: { strokeId: string; points: Point[] }) => {
      setCanvasState((prev) => ({
        ...prev,
        strokes: prev.strokes.map((stroke) =>
          stroke.id === payload.strokeId
            ? { ...stroke, points: payload.points }
            : stroke
        ),
      }));
    },
    []
  );

  const handleIncomingStrokeEnd = useCallback(
    (payload: { strokeId: string }) => {
      console.log("Stroke complete", payload.strokeId);
    },
    []
  );

  const handleCanvasClear = useCallback(() => {
    setCanvasState({
      strokes: [],
      currStroke: null,
      isScribbling: false,
    });
  }, []);

  const broadcastStrokeStart = useCallback(
    (stroke: ScribbleStroke) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event: STROKE_START_EVENT,
          payload: stroke,
        });
      }
    },
    [channel]
  );

  const broadcastStrokeUpdate = useCallback(
    (strokeId: string, newPoints: Point[]) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event: STROKE_UPDATE_EVENT,
          payload: { strokeId, points: newPoints },
        });
      }
    },
    [channel]
  );

  const broadcastStrokeEnd = useCallback(
    (strokeId: string) => {
      if (channel) {
        channel.send({
          type: "broadcast",
          event: STROKE_END_EVENT,
          payload: { strokeId },
        });
      }
    },
    [channel]
  );

  const sendMousePosition = useCallback(
    (userId: string, x: number, y: number) => {
      if (channel) {
        return channel.send({
          type: "broadcast",
          event: MOUSE_EVENT,
          payload: { userId, x, y },
        });
      }
    },
    [channel]
  );

  const clearCanvas = useCallback(
    async (roomId: string) => {
      if (confirm("Are you sure you want to erase the scribble?")) {
        try {
          setCanvasState({
            strokes: [],
            currStroke: null,
            isScribbling: false,
          });

          if (channel) {
            channel.send({
              type: "broadcast",
              event: CANVAS_CLEAR_EVENT,
              payload: { roomId },
            });
          }

          await clearRoomStrokes(roomId);
          toast.success("Scribble wiped!");
        } catch (error) {
          toast.error("Failed to clear scribble.");
          console.error("Clear canvas error:", error);
        }
      }
    },
    [channel]
  );

  useEffect(() => {
    getUserSession().then((session) => {
      if (session?.user?.id) {
        setSession(session);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && room.id && session?.user?.id) {
      const client = supabase;
      const newChannel = client.channel(`room:${room.id}`, {
        config: {
          presence: {
            key: session?.user?.id,
          },
        },
      });
      setChannel(newChannel);

      newChannel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await newChannel.track({});

          newChannel.on("presence", { event: "sync" }, () => {
            const presenceState = newChannel.presenceState();
            onScribblersCountChange?.(Object.keys(presenceState));
          });
        }
      });

      return () => {
        newChannel.unsubscribe();
      };
    }
  }, [isAuthenticated, room.id, session?.user?.id, onScribblersCountChange]);

  useEffect(() => {
    if (channel) {
      channel
        .on("broadcast", { event: STROKE_START_EVENT }, (payload) => {
          handleIncomingStrokeStart(payload.payload);
        })
        .on("broadcast", { event: STROKE_UPDATE_EVENT }, (payload) => {
          handleIncomingStrokeUpdate(payload.payload);
        })
        .on("broadcast", { event: STROKE_END_EVENT }, (payload) => {
          handleIncomingStrokeEnd(payload.payload);
        })
        .on("broadcast", { event: CANVAS_CLEAR_EVENT }, () => {
          handleCanvasClear();
        });
    }
  }, [
    channel,
    handleIncomingStrokeStart,
    handleIncomingStrokeUpdate,
    handleIncomingStrokeEnd,
    handleCanvasClear,
  ]);

  return (
    <section className="relative flex flex-col xl:flex-row bg-white h-screen">
      <ScribbleMenu
        scribblingPen={scribblingPen}
        setScribblingPen={setScribblingPen}
        room={room}
        isRoomOwner={isRoomOwner}
        onClearCanvas={clearCanvas}
      />
      <WhiteBoard
        scribblingPen={scribblingPen}
        setScribblingPen={setScribblingPen}
        room={room}
        onScribblersCountChange={onScribblersCountChange}
        hideTools={hideTools}
        session={session}
        isAuthenticated={isAuthenticated}
        channel={channel}
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        broadcastStrokeStart={broadcastStrokeStart}
        broadcastStrokeUpdate={broadcastStrokeUpdate}
        broadcastStrokeEnd={broadcastStrokeEnd}
        sendMousePosition={sendMousePosition}
      />
    </section>
  );
}
