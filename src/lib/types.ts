import { z } from "zod";

export const ArticleSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string(),
    source: z.string(),
    published_at: z.string(),
    category: z.string(),
    is_favorite: z.boolean(),
    is_read: z.boolean(),
  })
  .transform((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    source: row.source,
    publishedAt: row.published_at,
    category: row.category,
    isFavorite: row.is_favorite,
    isRead: row.is_read,
  }));

export type Article = z.infer<typeof ArticleSchema>;

export interface Category {
  id: string;
  name: string;
  label: string;
  enabled: boolean;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  enabled: boolean;
}
