import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import NotFound from "@/components/not-found/not-found";
import { getServerUser } from "@/utils/auth-server-fn";
import { supabase } from "@/utils/supabase";
import StoreDevtools from "../lib/demo-store-devtools";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (typeof window === "undefined") {
      // サーバー: Cookie からセッションを読む
      const user = await getServerUser();
      return { auth: user };
    }
    // クライアント: ブラウザの Cookie からセッションを読む
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { auth: session?.user ?? null };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LinkPulse",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            StoreDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
