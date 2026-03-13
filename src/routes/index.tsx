import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { FeedDashboard } from "@/components/feed/feed-dashboard";
import { $supabase } from "@/lib/supabase";
import {
  SupabaseQueryError,
  SupabaseValidationError,
} from "@/lib/supabase-query";
import { supabase } from "@/utils/supabase";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async () => {
    const [articlesResult, categoriesResult] = await Promise.all([
      $supabase("@select/articles", undefined),
      $supabase("@select/categories", undefined),
    ]);

    const articles = articlesResult.match(
      (data) => data,
      (error) => {
        if (error instanceof SupabaseQueryError) {
          console.error("Supabase query error:", error.message, error.code);
        } else if (error instanceof SupabaseValidationError) {
          console.error("Validation error:", error.issues);
        }
        return [];
      },
    );

    const categories = categoriesResult.match(
      (data) => data,
      (error) => {
        if (error instanceof SupabaseQueryError) {
          console.error("Supabase query error:", error.message, error.code);
        } else if (error instanceof SupabaseValidationError) {
          console.error("Validation error:", error.issues);
        }
        return [];
      },
    );

    return { articles, categories };
  },
  pendingComponent: () => <div>Loading...</div>,
  component: App,
});

function App() {
  const { articles, categories } = Route.useLoaderData();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await router.invalidate();
  };

  return (
    <FeedDashboard
      articles={articles}
      categories={categories}
      onLogout={handleLogout}
    />
  );
}
