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

export type ScribbleMenuProps = {
  scribblingPen: ScribblingPen;
  setScribblingPen: React.Dispatch<React.SetStateAction<ScribblingPen>>;
  room: RoomType;
};
