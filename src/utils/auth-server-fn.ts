import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "./supabase-server";

export const getServerUser = createServerFn().handler(async () => {
  const serverClient = createSupabaseServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();
  return user ?? null;
});
