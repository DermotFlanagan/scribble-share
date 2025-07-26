import Link from "next/link";
import { cherryBombOne } from "./ui/fonts";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1
          className={`text-6xl font-bold text-blue-600 ${cherryBombOne.className}`}
        >
          404
        </h1>
        <p className={`text-xl text-gray-600 mt-4 ${cherryBombOne.className}`}>
          Page Not Found
        </p>
        <Link
          href="/"
          className={`mt-6 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${cherryBombOne.className} text-xl`}
        >
          Send me Home!
        </Link>
      </div>
    </div>
  );
}
