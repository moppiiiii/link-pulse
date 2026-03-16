import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { FeedDashboard } from "@/components/feed/feed-dashboard";
import { fetchIndexData } from "@/utils/index-server-fn";
import { supabase } from "@/utils/supabase";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.auth) {
      throw redirect({ to: "/login" });
    }
  },
  loader: () => fetchIndexData(),
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
