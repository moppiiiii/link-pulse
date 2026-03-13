import { useCallback, useMemo, useState } from "react";
import { $supabase } from "@/lib/supabase";
import type { Article, Category } from "@/lib/types";

export type ViewMode = "all" | "unread" | "favorites";
export type SortMode = "newest" | "oldest";

export function useFeedStore(
  initialArticles: Article[],
  initialCategories: Category[],
) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleFavorite = useCallback((articleId: string) => {
    // Optimistic update
    setArticles((prev) => {
      const article = prev.find((a) => a.id === articleId);
      if (!article) return prev;
      const nextValue = !article.isFavorite;

      // Persist to Supabase (fire-and-forget)
      $supabase("@update/articles", {
        data: { is_favorite: nextValue },
        match: { id: articleId },
      }).then((result) => {
        result.mapErr((error) => {
          console.error("Failed to update favorite:", error.message);
          // Revert optimistic update on failure
          setArticles((current) =>
            current.map((a) =>
              a.id === articleId ? { ...a, isFavorite: article.isFavorite } : a,
            ),
          );
        });
      });

      return prev.map((a) =>
        a.id === articleId ? { ...a, isFavorite: nextValue } : a,
      );
    });
  }, []);

  const markAsRead = useCallback((articleId: string) => {
    // Optimistic update
    setArticles((prev) => {
      const article = prev.find((a) => a.id === articleId);
      if (!article || article.isRead) return prev;

      // Persist to Supabase (fire-and-forget)
      $supabase("@update/articles", {
        data: { is_read: true },
        match: { id: articleId },
      }).then((result) => {
        result.mapErr((error) => {
          console.error("Failed to mark as read:", error.message);
          // Revert optimistic update on failure
          setArticles((current) =>
            current.map((a) =>
              a.id === articleId ? { ...a, isRead: false } : a,
            ),
          );
        });
      });

      return prev.map((a) => (a.id === articleId ? { ...a, isRead: true } : a));
    });
  }, []);

  const toggleCategoryEnabled = useCallback((categoryId: string) => {
    setCategories((prev) => {
      const category = prev.find((c) => c.id === categoryId);
      if (!category) return prev;
      const nextValue = !category.enabled;

      // Persist to Supabase (fire-and-forget)
      $supabase("@update/categories", {
        data: { enabled: nextValue },
        match: { id: categoryId },
      }).then((result) => {
        result.mapErr((error) => {
          console.error("Failed to update category:", error.message);
          // Revert optimistic update on failure
          setCategories((current) =>
            current.map((c) =>
              c.id === categoryId ? { ...c, enabled: category.enabled } : c,
            ),
          );
        });
      });

      return prev.map((c) =>
        c.id === categoryId ? { ...c, enabled: nextValue } : c,
      );
    });
  }, []);

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    const result = await $supabase("@select/articles", undefined);
    result.map((articles) => setArticles(articles));
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
    refreshFeed,
  };
}
