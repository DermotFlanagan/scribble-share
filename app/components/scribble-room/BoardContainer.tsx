import { useState } from "react";
import ScribbleMenu from "./ScribbleMenu";
import WhiteBoard from "./Whiteboard";
import { ScribblingPen } from "@/app/lib/types/scribble.types";
import { BoardContainerProps } from "@/app/lib/types/room.types";

export default function BoardContainer(props: BoardContainerProps) {
  const { room, onScribblersCountChange, hideTools } = props;
  const [scribblingPen, setScribblingPen] = useState<ScribblingPen>({
    colour: "#000000",
    size: 5,
  });

  return (
    <section className="relative flex flex-col xl:flex-row bg-white h-screen">
      <ScribbleMenu
        scribblingPen={scribblingPen}
        setScribblingPen={setScribblingPen}
      />
      <WhiteBoard
        scribblingPen={scribblingPen}
        room={room}
        setScribblingPen={setScribblingPen}
        onScribblersCountChange={onScribblersCountChange}
        hideTools={hideTools}
      />
    </section>
  );
}
