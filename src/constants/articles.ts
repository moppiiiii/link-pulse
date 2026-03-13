import * as z from "zod";

/**
 * 記事を取得するための SQL クエリ
 */
export const GET_ARTICLES_QUERY =
  "id,title,description,url,source,published_at,category,is_favorite,is_read";

/**
 * 記事のエンティティスキーマ
 */
const ArticlesEntitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string(),
  sources: z.array(z.string()),
  category: z.string(),
  categories: z.array(z.string()),
  topic: z.string(),
  topics: z.array(z.string()),
  source_id: z.string(),
  category_ids: z.array(z.string()),
  published_at: z.string(),
  is_favorite: z.boolean(),
  is_read: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ArticlesListResponseSchema = ArticlesEntitySchema.pick({
  id: true,
  title: true,
  description: true,
  url: true,
  source: true,
  category: true,
  is_favorite: true,
  is_read: true,
  published_at: true,
}).transform((row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  url: row.url,
  source: row.source,
  category: row.category,
  isFavorite: row.is_favorite,
  isRead: row.is_read,
  publishedAt: row.published_at,
}));
