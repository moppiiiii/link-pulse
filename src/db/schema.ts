import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  url: text("url").unique(),
  source: text("source"),
  sources: text("sources").array(),
  category: text("category"),
  categories: text("categories").array(),
  topic: text("topic"),
  topics: text("topics").array(),
  sourceId: text("source_id"),
  sourceIds: text("source_ids").array(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isFavorite: boolean("is_favorite"),
  isRead: boolean("is_read"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const articleAiSummaries = pgTable("article_ai_summaries", {
  articleId: text("article_id")
    .primaryKey()
    .references(() => articles.id),
  summary: text("summary"),
  keyPoints: text("key_points").array(),
  whyItMatters: text("why_it_matters"),
  targetAudience: text("target_audience"),
  impactLevel: text("impact_level"),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Relations
export const articlesRelations = relations(articles, ({ one }) => ({
  aiSummary: one(articleAiSummaries, {
    fields: [articles.id],
    references: [articleAiSummaries.articleId],
  }),
}));

export const articleAiSummariesRelations = relations(
  articleAiSummaries,
  ({ one }) => ({
    article: one(articles, {
      fields: [articleAiSummaries.articleId],
      references: [articles.id],
    }),
  })
);
