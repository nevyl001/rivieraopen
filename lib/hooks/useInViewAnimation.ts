"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialDelay?: number;
}

interface UseInViewAnimationReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isInView: boolean;
  isInitialized: boolean;
  hasReducedMotion: boolean;
}

export function useInViewAnimation(
  options: UseInViewAnimationOptions = {}
): UseInViewAnimationReturn {
  const {
    threshold = 0.1,
    rootMargin = "0px 0px -100px 0px",
    triggerOnce = true,
    initialDelay = 0,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasReducedMotion, setHasReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setHasReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setHasReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mark as initialized once the element is available
    setIsInitialized(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (initialDelay > 0) {
            setTimeout(() => {
              setIsInView(true);
            }, initialDelay);
          } else {
            setIsInView(true);
          }

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, initialDelay]);

  return { ref, isInView, isInitialized, hasReducedMotion };
}
