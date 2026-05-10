import gsap from "gsap";
import { useEffect, useRef } from "react";

export function useGsapPage<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 14, filter: "blur(8px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }
      );
      gsap.fromTo(
        ".gsap-panel",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.045, delay: 0.08 }
      );
    }, ref);

    return () => context.revert();
  }, []);

  return ref;
}
