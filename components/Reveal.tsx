"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Reveal({
  as: Tag = "section",
  className = "",
  children,
}: {
  as?: "section" | "div";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`${className} reveal`.trim()}>
      {children}
    </Tag>
  );
}
