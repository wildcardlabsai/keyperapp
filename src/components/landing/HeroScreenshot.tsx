import { useRef, useState, useCallback, useEffect } from "react";
import dashboardPreview from "@/assets/dashboard-preview.png";

const HeroScreenshot = ({ visible }: { visible: boolean }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovering, setIsHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height;
      setTilt({
        rotateX: (0.5 - y) * 8,   // -4 to +4
        rotateY: (x - 0.5) * 12,  // -6 to +6
        scale: 1.01,
      });
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* Cyan glow behind */}
      <div className="absolute w-[560px] h-[400px] -z-10 rounded-full bg-accent/20 blur-3xl opacity-30 pointer-events-none" />

      <div
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-sm p-3 transition-all duration-700 ease-[cubic-bezier(.21,1.02,.73,1)] hover:shadow-[0_25px_90px_rgba(0,0,0,0.75)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:opacity-40 before:z-10 after:absolute after:inset-0 after:pointer-events-none after:rounded-2xl after:bg-gradient-to-br after:from-white/10 after:via-transparent after:to-transparent after:opacity-30 after:z-10 motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:transition-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{
          transitionDelay: visible ? "420ms" : "0ms",
          transform: reducedMotion
            ? undefined
            : `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})${visible ? "" : " translateY(24px)"}`,
          transition: isHovering
            ? "transform 150ms ease-out"
            : "transform 250ms ease-out, opacity 700ms cubic-bezier(.21,1.02,.73,1)",
        }}
      >
        <img
          src={dashboardPreview}
          alt="Keyper dashboard showing API keys management interface"
          className="w-full h-auto rounded-xl object-cover"
          loading="eager"
        />
      </div>
    </div>
  );
};

export default HeroScreenshot;
