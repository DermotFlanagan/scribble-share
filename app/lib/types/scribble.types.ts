import { RoomType } from "./room.types";

export interface Point {
  x: number;
  y: number;
}

export interface ScribbleStroke {
  id: string;
  userId: string;
  points: Point[];
  color: string;
  size: number;
  timestamp: string;
}

export interface ScribblingPen {
  colour: string;
  size: number;
}

export interface ScribbleMenuProps {
  scribblingPen: ScribblingPen;
  setScribblingPen: (
    pen: ScribblingPen | ((prev: ScribblingPen) => ScribblingPen)
  ) => void;
  room: RoomType;
  isRoomOwner: boolean;
  onClearCanvas: (roomId: string) => Promise<void>;
}
