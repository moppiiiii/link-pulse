"use client";

import { ExternalLink, FolderOpen, Rss, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category, FeedSource } from "@/lib/types";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  sources: FeedSource[];
  onToggleCategory: (id: string) => void;
  onToggleSource: (id: string) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  categories,
  sources,
  onToggleCategory,
  onToggleSource,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:items-center md:pt-0">
      <Button
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-border bg-card shadow-lg md:max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Customize your feed preferences
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <div className="border-b border-border px-4">
            <TabsList className="h-12 w-full justify-start gap-4 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="categories"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="sources"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Rss className="mr-2 h-4 w-4" />
                Sources
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="max-h-[60vh] md:max-h-[50vh]">
            <TabsContent value="categories" className="m-0 p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Enable or disable categories to filter your feed
              </p>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <span className="font-medium text-foreground">
                        {category.label}
                      </span>
                    </Label>
                    <Switch
                      id={`category-${category.id}`}
                      checked={category.enabled}
                      onCheckedChange={() => onToggleCategory(category.id)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="m-0 p-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Manage your RSS feed sources
              </p>
              <div className="space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor={`source-${source.id}`}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <span className="font-medium text-foreground">
                          {source.name}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {source.category}
                        </Badge>
                      </Label>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View feed
                      </a>
                    </div>
                    <Switch
                      id={`source-${source.id}`}
                      checked={source.enabled}
                      onCheckedChange={() => onToggleSource(source.id)}
                    />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <Rss className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-foreground">
                  Add Custom Feed
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coming soon - add your own RSS/Atom feeds
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Changes are saved automatically
            </p>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
