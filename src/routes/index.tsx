import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { FeedDashboard } from "@/components/feed/feed-dashboard";
import { ArticleSchema } from "@/lib/types";
import { supabase } from "../utils/supabase";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { data } = await supabase
      .from("articles")
      .select(
        "id,title,description,url,source,published_at,category,is_favorite,is_read",
      );
    const result = z.array(ArticleSchema).safeParse(data ?? []);
    if (!result.success) {
      console.error("Article validation failed:", result.error);
      return { articles: [] };
    }
    return { articles: result.data };
  },
  component: App,
});

function App() {
  const { articles } = Route.useLoaderData();
  console.log(articles);
  return <FeedDashboard articles={articles} />;
}
