"use client";

import { RefreshCw, Rss, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onSettingsClick: () => void;
  isRefreshing: boolean;
  stats: {
    total: number;
    unread: number;
    favorites: number;
  };
}

export function Header({
  searchQuery,
  onSearchChange,
  onRefresh,
  onSettingsClick,
  isRefreshing,
  stats,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Rss className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              DevFeed
            </span>
          </div>
          <div className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
            <span>
              <span className="font-medium text-foreground">
                {stats.unread}
              </span>{" "}
              unread
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="font-medium text-foreground">{stats.total}</span>{" "}
              total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-64 bg-secondary pl-9 pr-12 text-sm"
            />
            <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">/</Kbd>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="sr-only">Refresh feed</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-9 w-9"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 bg-secondary pl-9 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
