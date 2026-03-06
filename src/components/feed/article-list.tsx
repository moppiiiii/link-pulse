import { Inbox } from "lucide-react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./article-card";

interface ArticleListProps {
  articles: Article[];
  onFavoriteToggle: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  isRefreshing: boolean;
}

export function ArticleList({
  articles,
  onFavoriteToggle,
  onMarkAsRead,
  isRefreshing,
}: ArticleListProps) {
  if (isRefreshing && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading articles...
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Inbox className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No articles found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onFavoriteToggle={onFavoriteToggle}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
