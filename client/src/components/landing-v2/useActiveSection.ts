"use client";

import { useEffect, useState } from "react";

export function useActiveSection(selector = "main section[id]", initialSection = "hero") {
  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [selector]);

  return activeSection;
}
