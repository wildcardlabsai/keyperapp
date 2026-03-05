import { useState, useEffect, useRef, useCallback } from "react";

const WORDS = ["Trust.", "Control.", "Secure.", "Automate."];
const VISIBLE_MS = 2500;
const EXIT_MS = 400;
const PAUSE_MS = 200;
const CYCLE_MS = VISIBLE_MS + EXIT_MS + PAUSE_MS;

type Phase = "visible" | "exiting" | "paused" | "entering";

const RotatingWord = () => {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("visible");
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const advance = useCallback(() => {
    if (prefersReduced.current) return;

    // exit
    setPhase("exiting");

    setTimeout(() => {
      // pause – hide word
      setPhase("paused");

      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setPhase("entering");

        // after entry animation finishes → visible
        setTimeout(() => setPhase("visible"), EXIT_MS);
      }, PAUSE_MS);
    }, EXIT_MS);
  }, []);

  useEffect(() => {
    if (prefersReduced.current) return;
    const id = setInterval(advance, CYCLE_MS);
    return () => clearInterval(id);
  }, [advance]);

  const style: React.CSSProperties =
    phase === "exiting"
      ? { opacity: 0, transform: "translateY(-10px)", transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease` }
      : phase === "paused"
        ? { opacity: 0, transform: "translateY(10px)", transition: "none" }
        : phase === "entering"
          ? { opacity: 1, transform: "translateY(0)", transition: `opacity ${EXIT_MS}ms ease, transform ${EXIT_MS}ms ease` }
          : { opacity: 1, transform: "translateY(0)", transition: "none" };

  return (
    <span className="inline-block relative align-bottom" style={{ minHeight: "1.15em" }}>
      <span className="text-gradient inline-block" style={style}>
        {WORDS[index]}
      </span>
    </span>
  );
};

export default RotatingWord;
