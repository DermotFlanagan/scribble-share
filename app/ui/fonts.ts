import { Coiny } from "next/font/google";
import { Cherry_Bomb_One } from "next/font/google";
import localFont from "next/font/local";

export const vividly = localFont({
  src: "../../public/fonts/Vividly-Regular.otf",
  weight: "400",
  style: "normal",
});

export const coiny = Coiny({
  weight: ["400"],
  subsets: ["latin"],
});

export const cherryBombOne = Cherry_Bomb_One({
  weight: ["400"],
  subsets: ["latin"],
});
