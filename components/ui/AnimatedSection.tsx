"use client";

import { ReactNode } from "react";
import { useInViewAnimation } from "@/lib/hooks/useInViewAnimation";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "fade-in" | "slide-up" | "slide-left" | "slide-right";
  delay?: number;
  threshold?: number;
  rootMargin?: string;
  respectReducedMotion?: boolean;
}

export function AnimatedSection({
  children,
  className = "",
  animation = "slide-up",
  delay = 0,
  threshold = 0.1,
  rootMargin = "0px 0px -100px 0px",
  respectReducedMotion = true,
}: AnimatedSectionProps) {
  const { ref, isInView, isInitialized, hasReducedMotion } = useInViewAnimation(
    {
      threshold,
      rootMargin,
      triggerOnce: true,
      initialDelay: delay,
    }
  );

  // Validate animation type and provide fallback
  const validAnimations = ["fade-in", "slide-up", "slide-left", "slide-right"];
  const validatedAnimation = validAnimations.includes(animation)
    ? animation
    : "fade-in";

  if (
    process.env.NODE_ENV === "development" &&
    !validAnimations.includes(animation)
  ) {
    console.warn(
      `Invalid animation type "${animation}". Falling back to "fade-in".`
    );
  }

  // Determine classes based on state
  const getAnimationClasses = () => {
    // If reduced motion is preferred and we respect it, show content immediately
    if (respectReducedMotion && hasReducedMotion) {
      return "";
    }

    // Apply initial state immediately when component mounts
    if (!isInitialized || !isInView) {
      return `animate-initial-${validatedAnimation}`;
    }

    // Apply animation when in view
    return `animate-${validatedAnimation}`;
  };

  const animationClasses = getAnimationClasses();

  return (
    <div ref={ref} className={`${animationClasses} ${className}`}>
      {children}
    </div>
  );
}
