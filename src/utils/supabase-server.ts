import { createServerClient } from "@supabase/ssr";
import { getRequest } from "@tanstack/react-start/server";

export function createSupabaseServerClient() {
  return createServerClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          const request = getRequest();
          const cookieHeader = request?.headers.get("cookie") ?? "";
          if (!cookieHeader) return [];
          return cookieHeader.split(";").flatMap((pair: string) => {
            const eqIdx = pair.indexOf("=");
            if (eqIdx === -1) return [];
            return [
              {
                name: pair.slice(0, eqIdx).trim(),
                value: pair.slice(eqIdx + 1).trim(),
              },
            ];
          });
        },
        setAll() {},
      },
    },
  );
}
