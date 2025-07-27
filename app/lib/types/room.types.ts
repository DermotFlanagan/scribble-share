import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { Point, ScribblingPen } from "./scribble.types";
import { ScribbleStroke } from "./scribble.types";

export interface BoardContainerProps {
  room: RoomType;
  onScribblersCountChange?: (count: string[]) => void;
  hideTools?: boolean;
}

export interface BoardProps {
  scribblingPen: ScribblingPen;
  setScribblingPen: (
    pen: ScribblingPen | ((prev: ScribblingPen) => ScribblingPen)
  ) => void;
  room: RoomType;
  onScribblersCountChange?: (users: string[]) => void;
  hideTools?: boolean;
  session: Session | null;
  isAuthenticated: boolean;
  channel: RealtimeChannel | null;
  canvasState: CanvasState;
  setCanvasState: React.Dispatch<React.SetStateAction<CanvasState>>;
  broadcastStrokeStart: (stroke: ScribbleStroke) => void;
  broadcastStrokeUpdate: (strokeId: string, points: Point[]) => void;
  broadcastStrokeEnd: (strokeId: string) => void;
  sendMousePosition: (userId: string, x: number, y: number) => void;
}

export interface CanvasState {
  strokes: ScribbleStroke[];
  currStroke: ScribbleStroke | null;
  isScribbling: boolean;
}

export type RoomType = {
  id: string;
  name: string;
  owner?: User;
  created_at: string;
  isPublic: boolean;
  isPasswordProtected?: boolean;
};

export type User = {
  id: string;
  email: string;
  user_metadata: {
    userName: string;
    userColor?: string;
  };
};
