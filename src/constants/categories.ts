import * as z from "zod";

/**
 * カテゴリを取得するための SQL クエリ
 */
export const GET_CATEGORIES_QUERY = "id,name,label,enabled";

/**
 * カテゴリのレスポンススキーマ
 */
export const CategoriesListResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  label: z.string(),
  enabled: z.boolean(),
});
