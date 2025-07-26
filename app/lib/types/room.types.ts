import { ScribblingPen } from "./scribble.types";
import { ScribbleStroke } from "./scribble.types";

export interface BoardContainerProps {
  room: RoomType;
  onScribblersCountChange?: (count: string[]) => void;
  hideTools?: boolean;
}

export interface BoardProps {
  room: RoomType;
  scribblingPen: ScribblingPen;
  setScribblingPen: React.Dispatch<React.SetStateAction<ScribblingPen>>;
  onScribblersCountChange?: (count: string[]) => void;
  hideTools?: boolean;
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
