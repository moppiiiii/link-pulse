import { useCallback, useMemo, useState } from "react";
import {
  defaultCategories,
  defaultSources,
  mockArticles,
} from "@/lib/mock-data";
import type { Article, Category, FeedSource } from "@/lib/types";

export type ViewMode = "all" | "unread" | "favorites";
export type SortMode = "newest" | "oldest";

export function useFeedStore(initialArticles: Article[] = mockArticles) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [sources, setSources] = useState<FeedSource[]>(defaultSources);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleFavorite = useCallback((articleId: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? { ...article, isFavorite: !article.isFavorite }
          : article,
      ),
    );
  }, []);

  const markAsRead = useCallback((articleId: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, isRead: true } : article,
      ),
    );
  }, []);

  const toggleCategoryEnabled = useCallback((categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat,
      ),
    );
  }, []);

  const toggleSourceEnabled = useCallback((sourceId: string) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === sourceId
          ? { ...source, enabled: !source.enabled }
          : source,
      ),
    );
  }, []);

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // In a real app, this would fetch new articles from RSS feeds
    setArticles((prev) => {
      const newArticle: Article = {
        id: `new-${Date.now()}`,
        title: "Breaking: New Framework Released with Revolutionary Features",
        description:
          "A new JavaScript framework has just been released, promising to solve all the problems you never knew you had.",
        url: "https://example.com/new-framework",
        source: "Hacker News",
        publishedAt: new Date().toISOString(),
        category: "frontend",
        isFavorite: false,
        isRead: false,
      };
      return [newArticle, ...prev];
    });
    setIsRefreshing(false);
  }, []);

  const filteredArticles = useMemo(() => {
    const enabledCategories = categories
      .filter((c) => c.enabled)
      .map((c) => c.name);

    return articles
      .filter((article) => {
        // Category filter
        if (
          selectedCategory !== "all" &&
          article.category !== selectedCategory
        ) {
          return false;
        }
        // Only show articles from enabled categories
        if (!enabledCategories.includes(article.category)) {
          return false;
        }
        // View mode filter
        if (viewMode === "unread" && article.isRead) {
          return false;
        }
        if (viewMode === "favorites" && !article.isFavorite) {
          return false;
        }
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query) ||
            article.source.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return sortMode === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [articles, categories, selectedCategory, viewMode, sortMode, searchQuery]);

  const stats = useMemo(() => {
    const enabledCategories = categories
      .filter((c) => c.enabled)
      .map((c) => c.name);
    const visibleArticles = articles.filter((a) =>
      enabledCategories.includes(a.category),
    );
    return {
      total: visibleArticles.length,
      unread: visibleArticles.filter((a) => !a.isRead).length,
      favorites: visibleArticles.filter((a) => a.isFavorite).length,
    };
  }, [articles, categories]);

  const enabledCategories = useMemo(
    () => categories.filter((c) => c.enabled),
    [categories],
  );

  return {
    articles: filteredArticles,
    categories,
    sources,
    enabledCategories,
    selectedCategory,
    viewMode,
    sortMode,
    searchQuery,
    isRefreshing,
    stats,
    setSelectedCategory,
    setViewMode,
    setSortMode,
    setSearchQuery,
    toggleFavorite,
    markAsRead,
    toggleCategoryEnabled,
    toggleSourceEnabled,
    refreshFeed,
  };
}
