import { Link } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Display */}
        <div className="relative mb-8">
          <div className="text-[150px] font-bold leading-none text-primary/10 select-none">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          <br />
          Please check the URL or return to the home page.
        </p>

        {/* Actions */}
        <div className="flex justify-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-muted-foreground mt-8">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-xs">
            /
          </kbd>{" "}
          to search from home
        </p>
      </div>
    </div>
  );
}
