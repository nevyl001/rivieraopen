"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PassportAccordionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PassportAccordion({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: PassportAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-[#222] pt-3 lg:pt-6">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left lg:pointer-events-none"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#444] lg:mt-1">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#555] transition-transform duration-200 lg:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className={`mt-2 lg:mt-4 ${open ? "block" : "hidden lg:block"}`}>
        {children}
      </div>
    </section>
  );
}
