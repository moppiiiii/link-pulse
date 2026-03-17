import { Clock, ExternalLink, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  onFavoriteToggle: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const categoryColors: Record<string, string> = {
  frontend: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  backend: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  devops: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  ai: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  career: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  security: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ArticleCard({
  article,
  onFavoriteToggle,
  onMarkAsRead,
}: ArticleCardProps) {
  const [relativeTime, setRelativeTime] = useState<string>("");

  useEffect(() => {
    setRelativeTime(formatRelativeTime(article.publishedAt));
  }, [article.publishedAt]);

  const handleClick = () => {
    onMarkAsRead(article.id);
    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className={cn(
        "group relative border-b border-border p-4 transition-colors hover:bg-secondary/50 md:p-6",
        article.isRead && "opacity-60",
      )}
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-normal capitalize",
                categoryColors[article.category] ||
                  "bg-muted text-muted-foreground",
              )}
            >
              {article.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {article.source}
            </span>
            <span className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {relativeTime}
            </span>
            {!article.isRead && (
              <span className="flex h-2 w-2 rounded-full bg-primary" />
            )}
          </div>

          <button
            type="button"
            onClick={handleClick}
            className="block text-left"
          >
            <h2
              className={cn(
                "mb-2 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary md:text-lg",
                article.isRead && "text-muted-foreground",
              )}
            >
              {article.title}
            </h2>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {article.description}
            </p>
          </button>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFavoriteToggle(article.id)}
            className={cn(
              "h-8 w-8 transition-colors",
              article.isFavorite
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Star
              className={cn("h-4 w-4", article.isFavorite && "fill-current")}
            />
            <span className="sr-only">
              {article.isFavorite
                ? "Remove from favorites"
                : "Add to favorites"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open article</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
