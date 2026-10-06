"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  /** Short label shown under the icon on phones/tablets. */
  short?: string;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

/**
 * Tubelight navbar, adapted for Promift (TanStack Start, so plain anchors
 * instead of next/link) and the Promift palette: pine ink glass pill,
 * plaster text, a natural-oak "tube light" on the active item.
 * Desktop: fixed top-centre. Phones: fixed bottom-centre with icons.
 */
export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState("");

  // SSR-safe: pick the active item from the URL once on the client.
  useEffect(() => {
    const { pathname, hash } = window.location;
    const match =
      items.find((i) => i.url !== "/" && i.url === pathname + hash) ??
      items.find((i) => !i.url.includes("#") && i.url === pathname);
    if (match) setActiveTab(match.name);
  }, [items]);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-[60] mb-3 -translate-x-1/2 xl:top-0 xl:bottom-auto xl:mb-0 xl:pt-4",
        className,
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <nav
        aria-label="Primary"
        className="flex items-center gap-1 rounded-full border border-[#BE8C54]/30 bg-[#171C17]/70 px-1 py-1 shadow-lg backdrop-blur-lg sm:gap-2"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.name}
              className={cn(
                "relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-[0.72rem] xl:px-6 xl:py-2 font-semibold uppercase tracking-[0.08em] transition-colors sm:px-6",
                "text-[#EEE3D2]/80 hover:text-[#D9B27F]",
                isActive && "bg-[#EEE3D2]/10 text-[#D9B27F]",
              )}
              style={{ fontFamily: "var(--pf-display, inherit)" }}
            >
              <span className="hidden whitespace-nowrap xl:inline">{item.name}</span>
              <span className="flex flex-col items-center gap-0.5 xl:hidden" aria-hidden="true">
                <Icon size={17} strokeWidth={2.4} />
                <span className="text-[0.55rem] leading-none tracking-[0.06em]">{item.short ?? item.name}</span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-[#BE8C54]/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-[#BE8C54]">
                    <div className="absolute -top-2 -left-2 h-6 w-12 rounded-full bg-[#BE8C54]/25 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-[#BE8C54]/25 blur-md" />
                    <div className="absolute top-0 left-2 h-4 w-4 rounded-full bg-[#BE8C54]/25 blur-sm" />
                  </div>
                </motion.div>
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
