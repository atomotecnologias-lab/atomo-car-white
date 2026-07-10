import { useEffect, useRef, useState, type ReactNode } from "react";
import heroPoster from "@/assets/hero-sequence/hero-poster.jpg.asset.json";

interface Props {
  children: ReactNode;
}

// Fontes servidas de /public/assets. Ordem: webm (menor, Chrome/Firefox/Android)
// → mp4 (universal, Safari/iOS). No mobile, versão mais leve.
const DESKTOP_SOURCES = [
  { src: "/assets/hero.webm", type: "video/webm" },
  { src: "/assets/hero.mp4", type: "video/mp4" },
];
const MOBILE_SOURCES = [{ src: "/assets/hero-mobile.mp4", type: "video/mp4" }];

export function HeroSequence({ children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mob = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReducedMotion(rm.matches);
      setIsMobile(mob.matches);
    };
    sync();
    rm.addEventListener("change", sync);
    mob.addEventListener("change", sync);
    return () => {
      rm.removeEventListener("change", sync);
      mob.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    setReady(false);
    const onReady = () => setReady(true);
    if (video.readyState >= 2) onReady();
    else video.addEventListener("loadeddata", onReady, { once: true });

    // Best-effort autoplay (alguns navegadores exigem play() explícito)
    void video.play().catch(() => {
      /* autoplay bloqueado — o poster permanece visível */
    });

    return () => video.removeEventListener("loadeddata", onReady);
  }, [reducedMotion, isMobile]);

  const sources = isMobile ? MOBILE_SOURCES : DESKTOP_SOURCES;

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
            key={isMobile ? "mobile" : "desktop"}
            ref={videoRef}
            poster={heroPoster.url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            className="h-full w-full object-cover"
            style={{
              opacity: ready ? 1 : 0.85,
              transition: "opacity 600ms ease-out",
            }}
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
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
