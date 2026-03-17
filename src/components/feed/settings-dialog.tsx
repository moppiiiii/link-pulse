import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onToggleCategory: (id: string) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  categories,
  onToggleCategory,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 animate-in fade-in duration-200 md:items-center md:pt-0">
      <button
        type="button"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
      >
        <span className="sr-only">Close</span>
      </button>
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-border bg-card shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 md:max-h-[85vh] md:slide-in-from-bottom-0 md:zoom-in-95">
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
