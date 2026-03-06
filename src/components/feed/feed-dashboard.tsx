"use client";

import { useCallback, useEffect, useState } from "react";
import { useFeedStore } from "@/hooks/use-feed-store";
import { ArticleList } from "./article-list";
import { FilterBar } from "./filter-bar";
import { Header } from "./header";
import { KeyboardHints } from "./keyboard-hints";
import { SettingsDialog } from "./settings-dialog";

export function FeedDashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    articles,
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
  } = useFeedStore();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        // Allow Escape to blur the input
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case "/":
          e.preventDefault();
          document
            .querySelector<HTMLInputElement>('input[type="search"]')
            ?.focus();
          break;
        case "r":
        case "R":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            refreshFeed();
          }
          break;
        case ",":
          e.preventDefault();
          setSettingsOpen(true);
          break;
        case "Escape":
          setSettingsOpen(false);
          break;
        case "1":
          e.preventDefault();
          setSelectedCategory("all");
          break;
        case "2":
          e.preventDefault();
          if (enabledCategories[0])
            setSelectedCategory(enabledCategories[0].name);
          break;
        case "3":
          e.preventDefault();
          if (enabledCategories[1])
            setSelectedCategory(enabledCategories[1].name);
          break;
        case "4":
          e.preventDefault();
          if (enabledCategories[2])
            setSelectedCategory(enabledCategories[2].name);
          break;
      }
    },
    [refreshFeed, setSelectedCategory, enabledCategories],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refreshFeed}
        onSettingsClick={() => setSettingsOpen(true)}
        isRefreshing={isRefreshing}
        stats={stats}
      />

      <FilterBar
        categories={enabledCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl">
          <ArticleList
            articles={articles}
            onFavoriteToggle={toggleFavorite}
            onMarkAsRead={markAsRead}
            isRefreshing={isRefreshing}
          />
        </div>
      </main>

      <KeyboardHints />

      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        categories={categories}
        sources={sources}
        onToggleCategory={toggleCategoryEnabled}
        onToggleSource={toggleSourceEnabled}
      />
    </div>
  );
}
