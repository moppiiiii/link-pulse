import * as z from "zod";
import {
  ArticlesListResponseSchema,
  GET_ARTICLES_QUERY,
} from "@/constants/articles";
import {
  CategoriesListResponseSchema,
  GET_CATEGORIES_QUERY,
} from "@/constants/categories";
import {
  createSupabaseClient,
  createSupabaseSchema,
  select,
  update,
} from "@/lib/supabase-query";
import { supabase as supabaseClient } from "@/utils/supabase";

const schema = createSupabaseSchema({
  "@select/articles": select({
    output: z.array(ArticlesListResponseSchema),
    select: GET_ARTICLES_QUERY,
  }),
  "@update/articles": update({
    input: z.object({
      is_favorite: z.boolean().optional(),
      is_read: z.boolean().optional(),
    }),
  }),
  "@select/categories": select({
    output: z.array(CategoriesListResponseSchema),
    select: GET_CATEGORIES_QUERY,
  }),
  "@update/categories": update({
    input: z.object({
      enabled: z.boolean(),
    }),
  }),
});

export const $supabase = createSupabaseClient({
  client: supabaseClient,
  schema,
});
