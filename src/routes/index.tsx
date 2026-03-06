import { createFileRoute } from "@tanstack/react-router";
import { FeedDashboard } from "@/components/feed/feed-dashboard";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return <FeedDashboard />;
}
