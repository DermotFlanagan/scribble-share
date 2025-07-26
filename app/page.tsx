"use client";
import React, { useEffect, useRef } from "react";
import { coiny } from "./ui/fonts";
import Image from "next/image";
import gsap from "gsap";
import Link from "next/link";
import { getUserSession } from "./services/user.service";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/initSupabase";
import HeroSection from "./components/landing/HeroSection";

function Page() {
  const cloudRef = useRef<HTMLDivElement>(null);
  const superStickRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(
    function () {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event == "SIGNED_IN" && session?.user) {
          router.push("/dashboard");
        }
      });

      getUserSession().then((session) => {
        if (session?.user) {
          router.push("/dashboard");
        }
      });

      return () => subscription.unsubscribe();
    },
    [router]
  );

  useEffect(function () {
    gsap.to(cloudRef.current, {
      y: -20,
      repeat: -1,
      yoyo: true,
      duration: 1.2,
      ease: "power1.inOut",
    });

    gsap.to(sunRef.current, {
      y: -10,
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut",
    });

    if (superStickRef.current) {
      const tl = gsap.timeline({
        repeat: -1,
        defaults: { ease: "power1.inOut" },
      });

      tl.to(superStickRef.current, {
        x: -1600,
        duration: 4,
      })
        .to(superStickRef.current, {
          scaleX: -1,
          duration: 0.8,
        })
        .to(superStickRef.current, {
          x: 0,
          scaleX: -1,
          duration: 3,
        })
        .to(superStickRef.current, {
          scaleX: 1,
          duration: 0.5,
        });
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-12 left-260 z-[-1]" ref={sunRef}>
          <Image
            src="/imgs/sun.png"
            width={200}
            height={200}
            alt="sun scribble"
          />
        </div>

        <div ref={superStickRef} className="absolute top-20 right-10">
          <Image
            src="/imgs/super-stick.png"
            width={200}
            height={200}
            alt="superhero scribble"
          />
        </div>

        <div ref={cloudRef} className="absolute top-25 left-270">
          <Image
            src="/imgs/cloud.png"
            width={200}
            height={200}
            alt="cloud scribble"
          />
        </div>

        <div className="absolute top-80 left-120">
          <Image
            src="/imgs/arrow.svg"
            alt="arrow scribble"
            width={400}
            height={400}
          />
        </div>

        {/* <div ref={planeRef} className="absolute top-0 right-0">
          <Image
            src="/imgs/paper-plane.png"
            width={200}
            height={200}
            alt="paper plane scribble"
          />
        </div> */}
      </div>

      <HeroSection
        text="ScribbleShare"
        subText="A free and collaborative online note-making app"
      />

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mt-10">
        <Link
          href={"/login"}
          className={`${coiny.className} px-4 py-2 bg-blue-500 z-10 text-white rounded-xl text-xl cursor-pointer border-b-6 border-r-6 border-blue-600 hover:bg-blue-400 transition hover:scale-120 md:shadow-custom`}
        >
          Log in
        </Link>
        <Link
          href={"/signup"}
          className={`${coiny.className} px-4 py-2 bg-cyan-500 z-10 text-white rounded-xl text-xl cursor-pointer border-b-6 border-r-6 border-cyan-600 hover:bg-cyan-400 transition hover:scale-120 md:shadow-custom`}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default Page;
