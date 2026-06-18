import { useEffect, useRef, useState, type ReactNode } from "react";
import heroVideo from "@/assets/hero-sequence/hero.webm.asset.json";
import heroPoster from "@/assets/hero-sequence/hero-poster.jpg.asset.json";

interface Props {
  children: ReactNode;
}

export function HeroSequence({ children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => setReady(true);
    if (video.readyState >= 2) onReady();
    else video.addEventListener("loadeddata", onReady, { once: true });

    // Best-effort autoplay (some browsers require an explicit play() call)
    const tryPlay = () => {
      void video.play().catch(() => {
        /* autoplay blocked — poster remains visible */
      });
    };
    tryPlay();

    return () => video.removeEventListener("loadeddata", onReady);
  }, [reducedMotion]);

  return (
    <section className="relative isolate -mt-20 overflow-hidden bg-carbon pt-20 text-clean">
      <div className="absolute inset-0 -z-10">
        {reducedMotion ? (
          <img
            src={heroPoster.url}
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <video
            ref={videoRef}
            poster={heroPoster.url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
            className="h-full w-full object-cover"
            style={{
              opacity: ready ? 1 : 0.85,
              transition: "opacity 600ms ease-out",
            }}
          >
            <source src={heroVideo.url} type="video/webm" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/75 to-carbon/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] items-center py-12 sm:py-16">
        {children}
      </div>
    </section>
  );
}
