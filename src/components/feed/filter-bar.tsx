import { ArrowUpDown, Eye, List, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { SortMode, ViewMode } from "@/hooks/use-feed-store";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}

export function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  viewMode,
  onViewModeChange,
  sortMode,
  onSortModeChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-14 z-40 border-b border-border bg-background md:top-14">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <ScrollArea className="w-full max-w-[calc(100%-140px)] md:max-w-none">
          <div className="flex items-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange("all")}
              className={cn(
                "h-8 shrink-0 text-sm",
                selectedCategory === "all" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.name ? "secondary" : "ghost"
                }
                size="sm"
                onClick={() => onCategoryChange(category.name)}
                className={cn(
                  "h-8 shrink-0 text-sm",
                  selectedCategory === category.name &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {category.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>

        <div className="flex shrink-0 items-center gap-1 pl-4">
          <div className="hidden items-center rounded-md border border-border md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("all")}
              className={cn(
                "h-8 rounded-r-none border-r border-border px-3",
                viewMode === "all" && "bg-secondary",
              )}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">All articles</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("unread")}
              className={cn(
                "h-8 rounded-none border-r border-border px-3",
                viewMode === "unread" && "bg-secondary",
              )}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Unread articles</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("favorites")}
              className={cn(
                "h-8 rounded-l-none px-3",
                viewMode === "favorites" && "bg-secondary",
              )}
            >
              <Star className="h-4 w-4" />
              <span className="sr-only">Favorite articles</span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                <ArrowUpDown className="h-4 w-4" />
                <span className="sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortModeChange("newest")}>
                <span
                  className={cn(
                    sortMode === "newest" && "font-medium text-primary",
                  )}
                >
                  Newest first
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortModeChange("oldest")}>
                <span
                  className={cn(
                    sortMode === "oldest" && "font-medium text-primary",
                  )}
                >
                  Oldest first
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile view mode */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 md:hidden">
        <Button
          variant={viewMode === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("all")}
          className="h-8 text-xs"
        >
          <List className="mr-1 h-3 w-3" />
          All
        </Button>
        <Button
          variant={viewMode === "unread" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("unread")}
          className="h-8 text-xs"
        >
          <Eye className="mr-1 h-3 w-3" />
          Unread
        </Button>
        <Button
          variant={viewMode === "favorites" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("favorites")}
          className="h-8 text-xs"
        >
          <Star className="mr-1 h-3 w-3" />
          Favorites
        </Button>
      </div>
    </div>
  );
}
