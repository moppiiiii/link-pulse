import { createServerFn } from "@tanstack/react-start";
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
} from "@/lib/supabase-query";
import { createSupabaseServerClient } from "@/utils/supabase-server";

const schema = createSupabaseSchema({
  "@select/articles": select({
    output: z.array(ArticlesListResponseSchema),
    select: GET_ARTICLES_QUERY,
  }),
  "@select/categories": select({
    output: z.array(CategoriesListResponseSchema),
    select: GET_CATEGORIES_QUERY,
  }),
});

export const fetchIndexData = createServerFn().handler(async () => {
  const client = createSupabaseClient({
    client: createSupabaseServerClient(),
    schema,
  });

  const [articlesResult, categoriesResult] = await Promise.all([
    client("@select/articles", undefined),
    client("@select/categories", undefined),
  ]);

  return {
    articles: articlesResult.unwrapOr([]),
    categories: categoriesResult.unwrapOr([]),
  };
});
