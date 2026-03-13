## アーキテクチャ: API 実行とファイルルーター設計

このドキュメントは、本リポジトリの API クライアントと TanStack Router の「ファイルルーター(file-based routing)」設計を、他プロジェクトでも再利用しやすい形でまとめたものです。必要に応じてそのまま転用・改変してください。

---

## 概要

- **API クライアント**: `zod` スキーマを単一の宣言的スキーマに集約し、`@{method}/{path}` 形式のキーで型安全な `$fetch` を生成します。実行結果は `neverthrow` の `Result` を返し、成功/失敗の明示的ハンドリングが可能です。
- **ファイルルーター**: TanStack Router のファイルベース構成。`src/routes` 配下に `createFileRoute` を用いたルートを置くと、自動生成された `routeTree.gen.ts` を介して `createRouter` に組み込まれます。`loader`、`pendingComponent`、`staticData` などをルートごとに宣言できます。

---

## API クライアント

### 位置
- 実装: `src/lib/fetch.ts`
- エンドポイント集約: `src/lib/api.ts`

### 基本コンセプト
- 1つの「スキーマオブジェクト」に、全エンドポイントを `@get/...`, `@post/...` のキーで宣言
- キーから HTTP メソッドとパスを抽出し、`params` / `input` / `output` の `zod` スキーマで厳密に型付け
- 実行は `$fetch(path, options)`。`Result<T, ApiError>` を返すため、`.match()` で成功/失敗を明示的に分岐

### 最小例
```ts
// src/lib/api.ts
import * as z from "zod";
import { env } from "@/env";
import { createFetch, createSchema } from "@/lib/fetch";

const schema = createSchema({
  "@get/users": {
    output: z.object({ list: z.array(z.object({ id: z.number(), name: z.string() })) }),
  },
  "@get/users/:id": {
    params: z.object({ id: z.number() }),
    output: z.object({ id: z.number(), name: z.string() }),
  },
  "@post/users": {
    input: z.object({ name: z.string().min(1) }),
    output: z.object({ id: z.number() }),
  },
});

export const $fetch = createFetch({
  baseURL: `${env.VITE_API_URL}/cms/v1`,
  schema,
  credentials: "include", // Cookie を伴う API の場合
});
```

### 使い方
- GET（ボディなし）
```ts
const users = await $fetch("@get/users");
const data = users.match(
  (ok) => ok.list,
  (err) => { throw err; },
);
```

- パスパラメータつき
```ts
await $fetch("@get/users/:id", { params: { id: 123 } });
```

- ボディを持つ POST
```ts
await $fetch("@post/users", { body: { name: "Alice" } });
```

### エラーモデル
- 返り値は `Result<T, ApiError>`。`ApiError` には以下が含まれます:
  - `NetworkError`(HTTP ステータスやレスポンスボディを保持)
  - `ValidationError`(zod による input/output 検証エラー)
  - `FetchError`(その他の例外)

```ts
const res = await $fetch("@get/users");
res.match(
  (data) => data,
  (error) => {
    if (error._tag === "NetworkError" && error.status === 401) {
      // 認証リダイレクトなど
    }
    throw error;
  },
);
```

必要に応じて `resultToPromise` で `throw` する Promise に変換できます（`src/lib/fetch.ts` 参照）。

### スキーマ拡張手順
1. `constants/` に `zod` スキーマを追加（入力/出力）
2. `src/lib/api.ts` の `createSchema({...})` にエンドポイント宣言を追記
3. ルートやフックから `$fetch` を直接呼び出す

> 形式は厳密（例: `@get/...` に `input` は不可）。パスにある `:id` 等は `params` スキーマと一致している必要があります。

---

## ファイルルーター（TanStack Router）

### 位置
- ルート定義: `src/routes/**`
- ルートツリー生成物: `src/routeTree.gen.ts`（自動生成）
- ルーター初期化: `src/main.tsx`
- ルートのルート: `src/routes/__root.tsx`

### 初期化
```tsx
// src/main.tsx
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultErrorComponent: ({ reset }) => null, // 共通エラーハンドリング
});

declare module "@tanstack/react-router" {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} />
);
```

### ルート定義（レイアウト/インデックス/詳細）
```tsx
// レイアウト: src/routes/_dashboard/route.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/_dashboard")({
  component: () => (
    <div>
      {/* 共通レイアウト */}
      <Outlet />
    </div>
  ),
});
```

```tsx
// インデックス: src/routes/_dashboard/index.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_dashboard/")({
  loader: () => { throw redirect({ to: "/inquiries" }); },
  component: () => null,
});
```

```tsx
// 詳細: src/routes/_dashboard/announcements/$announcementId.tsx
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_dashboard/announcements/$announcementId")({
  params: { parse: (p) => ({ announcementId: Number(p.announcementId) }) },
  component: () => { /* ... */ },
});
```

### ローダーと認可（401 の共通パターン）
```tsx
// 例: 一覧でのデータ取得と 401 リダイレクト
import { createFileRoute, redirect } from "@tanstack/react-router";
import { $fetch } from "@/lib/api";
import { NetworkError } from "@/lib/fetch";

export const Route = createFileRoute("/_dashboard/announcements/")({
  loader: async ({ location }) => {
    const res = await $fetch("@get/announcements");
    return res.match(
      (data) => ({ announcements: data.list }),
      (error) => {
        if (error instanceof NetworkError && error.status === 401) {
          throw redirect({ to: "/login", search: { redirect: location.href } });
        }
        throw error;
      },
    );
  },
  pendingComponent: () => <div>Loading...</div>,
  component: function RouteComponent() { /* ... */ },
});
```

### 検索パラメータの検証/整形
```tsx
// src/routes/login.tsx の例
import * as z from "zod";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  search: { middlewares: [stripSearchParams({ redirect: "/inquiries" })] },
  component: () => /* ... */,
});
```

### パターンと規約
- インデックスは末尾スラッシュ付き（`"/path/"`）
- `staticData.breadcrumb` など、パンくず等のメタを `staticData` に持たせる
- データ取得は `loader` に寄せてサーバー通信を集約
- 画面遷移時の再取得は `router.invalidate()` を使用

---

## 他プロジェクトへの移植手順

1) 依存関係の導入（Bun 推奨）
```bash
bun add @tanstack/react-router zod neverthrow
```
必要に応じて `@tanstack/react-router-devtools` も追加。

2) API クライアントを移植
- `src/lib/fetch.ts` をコピー（または自プロジェクトに合わせて作成）
- `src/lib/api.ts` を用意し、`createSchema` と `$fetch` を定義
- `env` の `VITE_API_URL` を設定

3) ルーターを設定
- `src/main.tsx` にて `createRouter` + `routeTree.gen.ts` を読み込み
- `src/routes/**` に `createFileRoute` ベースで画面を配置
- 401 などの認可パターンは上記例を踏襲

4) UI/UX（任意）
- shadcn を使う場合は Bun で追加
```bash
bunx shadcn@latest add button
```

---

## クイックリファレンス

- 新しいエンドポイントを追加するには:
  1. `constants` に `zod` スキーマを追加
  2. `src/lib/api.ts` の `createSchema({...})` に追記
  3. 画面の `loader` やイベントハンドラで `$fetch` を呼ぶ

- 401 時の共通リダイレクト:
```ts
if (error instanceof NetworkError && error.status === 401) {
  throw redirect({ to: "/login", search: { redirect: location.href } });
}
```

- 画面遷移後にデータ再取得:
```ts
await router.invalidate({ sync: true });
```


