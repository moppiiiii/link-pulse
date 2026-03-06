"use client";

import { Kbd } from "@/components/ui/kbd";

export function KeyboardHints() {
  return (
    <div className="hidden items-center justify-center gap-6 border-t border-border bg-secondary/30 px-4 py-2 text-xs text-muted-foreground md:flex">
      <span className="flex items-center gap-1.5">
        <Kbd>/</Kbd>
        <span>Search</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Kbd>R</Kbd>
        <span>Refresh</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Kbd>,</Kbd>
        <span>Settings</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Kbd>1-4</Kbd>
        <span>Categories</span>
      </span>
    </div>
  );
}
