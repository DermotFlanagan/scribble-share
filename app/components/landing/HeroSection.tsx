import { cherryBombOne, coiny } from "@/app/ui/fonts";

type HeroSectionProps = {
  text: string;
  subText: string;
};

export default function HeroSection({ text, subText }: HeroSectionProps) {
  return (
    <div className="relative flex flex-col items-center justify-center pt-40 z-10 shrink">
      <h1
        className={`${cherryBombOne.className} text-5xl md:text-6xl lg:text-7xl text-blue-700 z-10 mx-auto text-center shrink`}
      >
        {text}
      </h1>
      <p
        className={`text-base sm:text-xl md:text-2xl text-blue-500 mt-5 ${coiny.className} text-center`}
      >
        {subText}
      </p>
    </div>
  );
}
