import { cherryBombOne } from "./fonts";

export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-0">
      <div className="w-16 h-16 border-12 border-t-transparent border-blue-600 rounded-full animate-spin mx-auto" />
      <h1 className={`text-blue-600 text-xl ${cherryBombOne.className}`}>
        Loading...
      </h1>
    </div>
  );
}
