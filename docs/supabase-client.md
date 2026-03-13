## アーキテクチャ: Supabase クライアント設計

このドキュメントは、本リポジトリの型安全な Supabase クライアントの設計と使い方をまとめたものです。`$fetch` と同様の宣言的スキーマパターンを Supabase 操作に適用しています。

---

## 概要

- **スキーマ宣言**: `@{operation}/{table}` 形式のキーで全テーブル操作を一箇所に集約し、Zod スキーマで入出力を型付けします。
- **型安全な呼び出し**: キーに応じて `options` の型が自動的に推論されます。
- **Result 型**: 全操作は `neverthrow` の `Result<T, SupabaseError>` を返し、成功/失敗の明示的ハンドリングが必要です。

---

## ファイル構成

| ファイル | 役割 |
|--------|------|
| `src/lib/supabase-query.ts` | ファクトリー実装（`createSupabaseSchema`, `createSupabaseClient`） |
| `src/lib/supabase.ts` | スキーマ定義と `$supabase` インスタンス |
| `src/utils/supabase.ts` | Supabase JS クライアントの初期化 |

---

## スキーマ定義

### キーの書式 `@{operation}/{table}`

| キー形式 | 操作 |
|---------|------|
| `@select/{table}` | SELECT（全件または条件付き取得） |
| `@insert/{table}` | INSERT |
| `@update/{table}` | UPDATE（`.eq()` での条件指定） |
| `@upsert/{table}` | UPSERT |
| `@delete/{table}` | DELETE（`.eq()` での条件指定） |

### 最小例

```ts
// src/lib/supabase.ts
import * as z from "zod";
import { ArticlesListResponseSchema, GET_ARTICLES_QUERY } from "@/constants/articles";
import { createSupabaseClient, createSupabaseSchema } from "@/lib/supabase-query";
import { supabase as supabaseClient } from "@/utils/supabase";

const schema = createSupabaseSchema({
  "@select/articles": {
    output: z.array(ArticlesListResponseSchema), // レスポンスの Zod スキーマ
    select: GET_ARTICLES_QUERY,                  // 取得カラム（省略で "*"）
  },
  "@update/articles": {
    input: z.object({                            // UPDATE payload の Zod スキーマ
      is_favorite: z.boolean().optional(),
      is_read: z.boolean().optional(),
    }),
  },
});

export const $supabase = createSupabaseClient({
  client: supabaseClient,
  schema,
});
```

---

## 使い方

### SELECT（全件取得）

```ts
const result = await $supabase("@select/articles", undefined);
const articles = result.match(
  (data) => data,
  (error) => { throw error; },
);
```

### SELECT（フィルタ付き）

```ts
const result = await $supabase("@select/articles", {
  filter: (query) => query.eq("is_favorite", true).order("published_at", { ascending: false }),
});
```

フィルタ関数は Supabase のクエリビルダーをそのまま受け取るため、
`.eq()`, `.gt()`, `.order()`, `.limit()` など全てのチェーンメソッドが使えます。

### UPDATE

```ts
const result = await $supabase("@update/articles", {
  data: { is_favorite: true },   // UpdateEntry の input スキーマに対して検証される
  match: { id: "article-123" },  // WHERE id = 'article-123'
});
result.match(
  () => console.log("更新成功"),
  (error) => console.error("更新失敗:", error.message),
);
```

### INSERT

```ts
// src/lib/supabase.ts にエントリを追加
"@insert/articles": {
  input: ArticleInsertSchema,
},

// 呼び出し
const result = await $supabase("@insert/articles", {
  data: { title: "新記事", ... },
});
```

### UPSERT

```ts
"@upsert/articles": {
  input: ArticleUpsertSchema,
},

const result = await $supabase("@upsert/articles", {
  data: [{ id: "abc", title: "更新記事", ... }],  // 配列も可
});
```

### DELETE

```ts
"@delete/articles": {},  // エントリは空オブジェクトで可

const result = await $supabase("@delete/articles", {
  match: { id: "article-123" },
});
```

---

## エラーモデル

返り値は `Result<T, SupabaseError>`。`SupabaseError` は以下の 2 種類です：

```ts
class SupabaseQueryError extends Error {
  readonly _tag = "SupabaseQueryError";
  code?: string;    // Supabase エラーコード（例: "PGRST116"）
  details?: unknown; // エラー詳細
}

class SupabaseValidationError extends Error {
  readonly _tag = "SupabaseValidationError";
  issues: z.ZodError; // Zod バリデーション失敗の詳細
}
```

`_tag` プロパティを使って種別を判定できます：

```ts
const result = await $supabase("@select/articles", undefined);
result.match(
  (articles) => articles,
  (error) => {
    if (error._tag === "SupabaseQueryError") {
      console.error("DB エラー:", error.message, error.code);
    } else {
      console.error("バリデーションエラー:", error.issues);
    }
  },
);
```

---

## 楽観的更新パターン

ミューテーション（UPDATE/DELETE）は UI の応答速度を保つため、楽観的更新と組み合わせて使います。
失敗時はローカル状態を元に戻します。

```ts
const toggleFavorite = useCallback((articleId: string) => {
  // 1. ローカル状態を即座に更新
  setArticles((prev) => {
    const article = prev.find((a) => a.id === articleId);
    if (!article) return prev;
    const nextValue = !article.isFavorite;

    // 2. Supabase に非同期で永続化（fire-and-forget）
    $supabase("@update/articles", {
      data: { is_favorite: nextValue },
      match: { id: articleId },
    }).then((result) => {
      result.mapErr((error) => {
        console.error("Failed to update favorite:", error.message);
        // 3. 失敗時はローカル状態を巻き戻す
        setArticles((current) =>
          current.map((a) => (a.id === articleId ? { ...a, isFavorite: article.isFavorite } : a)),
        );
      });
    });

    return prev.map((a) => (a.id === articleId ? { ...a, isFavorite: nextValue } : a));
  });
}, []);
```

---

## スキーマ拡張手順

1. `src/constants/` に対応する Zod スキーマを追加（または既存を拡張）
2. `src/lib/supabase.ts` の `createSupabaseSchema({...})` に操作を追記
3. ルートの `loader` やフックから `$supabase` を呼び出す

---

## クイックリファレンス

- 新しいテーブル操作を追加するには:
  1. `src/constants/` に Zod スキーマを追加
  2. `src/lib/supabase.ts` の `createSupabaseSchema` に `@{op}/{table}` キーで追記
  3. `$supabase` から型補完付きで呼び出す

- フィルタ付き SELECT:
```ts
await $supabase("@select/articles", {
  filter: (q) => q.eq("category", "tech").limit(20),
});
```

- エラー種別の判定:
```ts
if (error._tag === "SupabaseQueryError" && error.code === "PGRST116") {
  // レコードが見つからない
}
```
