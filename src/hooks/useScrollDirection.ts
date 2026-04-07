import { useEffect, useState, useRef } from "react";

type ScrollDirection = "up" | "down";

const THRESHOLD = 10;

export function useScrollDirection(): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("up");
  const lastY = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    function handleScroll() {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;

        if (y < 50) {
          setDirection("up");
          lastY.current = y;
          return;
        }

        const diff = y - lastY.current;

        if (diff > THRESHOLD) {
          setDirection("down");
          lastY.current = y;
        } else if (diff < -THRESHOLD) {
          setDirection("up");
          lastY.current = y;
        }
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return direction;
}
