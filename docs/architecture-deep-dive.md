# H2O CMS — 技術アーキテクチャ完全解説

> 対象読者: フロントエンド開発の基礎知識（HTML/CSS/JavaScript）はあるが、このプロジェクトで使われている設計思想やライブラリを初めて学ぶ人
>
> 目的: 「なぜこう作ったのか」という意図・メリットまで含めて、全体を体系的に理解する

---

## 目次

1. [全体アーキテクチャ](#1-全体アーキテクチャ)
2. [型安全なAPIクライアント (`$fetch`)](#2-型安全なapiクライアント-fetch)
3. [Zodスキーマ設計](#3-zodスキーマ設計)
4. [neverthrow — 例外を使わないエラー処理](#4-neverthrow--例外を使わないエラー処理)
5. [TanStack Router — ファイルベースルーティング](#5-tanstack-router--ファイルベースルーティング)
6. [認証フロー](#6-認証フロー)
7. [TanStack Form — 型安全なフォーム管理](#7-tanstack-form--型安全なフォーム管理)
8. [コンポーネント設計](#8-コンポーネント設計)
9. [テスト戦略](#9-テスト戦略)
10. [コード品質ツール](#10-コード品質ツール)
11. [環境変数の型安全管理](#11-環境変数の型安全管理)
12. [日付処理](#12-日付処理)
13. [設計思想まとめ](#13-設計思想まとめ)

---

## 1. 全体アーキテクチャ

### 1.1 ディレクトリ構成と責務

```
src/
├── routes/           # ページとルーティング (TanStack Router)
│   ├── __root.tsx    # アプリ全体のルート（共通レイアウト）
│   ├── login.tsx     # ログインページ
│   └── _dashboard/   # 認証が必要なページ群
│       ├── route.tsx         # ダッシュボードレイアウト（サイドバー等）
│       ├── announcements/    # お知らせ機能
│       │   ├── index.tsx     # 一覧ページ
│       │   ├── new.tsx       # 新規作成ページ
│       │   ├── $announcementId.tsx  # 詳細/編集ページ
│       │   └── -announcement-form/ # このnamespaceだけで使うコンポーネント群
│       │       ├── index.tsx
│       │       ├── schema.ts
│       │       ├── main-content.tsx
│       │       ├── header-actions.tsx
│       │       └── delivery-conditions.tsx
│       └── ... (customers, inquiries, health-guide-barcodes)
│
├── constants/        # Zodスキーマ（型定義 + バリデーション + 変換の一元管理）
│   ├── common.ts     # 共通スキーマ（日付変換、性別、地域など）
│   ├── announcements.ts
│   └── ...
│
├── lib/              # ユーティリティとインフラ
│   ├── fetch.ts      # 型安全なHTTPクライアントの実装
│   ├── api.ts        # エンドポイント定義と$fetchインスタンス
│   ├── mutations.ts  # ミューテーション結果のトースト処理
│   ├── auth-redirect.ts  # 401時のリダイレクト処理
│   ├── dayjs.ts      # 日付ライブラリ設定
│   └── utils.ts      # cn()など汎用ユーティリティ
│
├── hooks/            # カスタムReactフック
│   ├── form.tsx      # useAppForm, withForm (TanStack Form)
│   └── form-context.ts  # フォームのReact Context
│
├── components/       # 再利用可能なUIコンポーネント
│   ├── ui/           # shadcn/ui (基本UIパーツ)
│   ├── form/         # フォームフィールドコンポーネント
│   └── data-table/   # テーブルコンポーネント
│
├── types/            # TypeScript型定義
├── test/             # テストファイル
└── env.ts            # 環境変数の型安全管理
```

### 1.2 データの流れ

```
ブラウザ
  │
  ▼
TanStack Router (ルーティング)
  │ loader()で事前データ取得
  ▼
$fetch (型安全APIクライアント)
  │ リクエスト: Zodでinput/paramsをエンコード
  │ レスポンス: Zodでoutputをデコード+変換
  ▼
バックエンドAPI
  │
  ▼ Result<T, E> (neverthrow)
$fetch
  │
  ▼ unwrapOrRedirect() or handleMutationResult()
コンポーネント (React)
  │ TanStack Form でフォーム状態管理
  │ Zod でバリデーション
  ▼
ユーザーへ表示
```

---

## 2. 型安全なAPIクライアント (`$fetch`)

### 2.1 問題意識：なぜカスタムfetchクライアントが必要か？

一般的な `fetch` 使用例:

```typescript
// ❌ 従来のやり方の問題点
const response = await fetch("/api/announcements/123");
const data = await response.json(); // data は any 型
// - URLのタイポがあってもコンパイルエラーにならない
// - HTTPメソッドを間違えてもわからない
// - レスポンスの型が保証されない
// - エラーハンドリングを忘れやすい
```

このプロジェクトでは、これらの問題を全て解決するカスタムクライアントを構築している。

### 2.2 スキーマ定義 (`src/lib/api.ts`)

```typescript
const announcementFetchSchema = createSchema({
  "@get/announcements": {
    output: AnnouncementsListResponseSchema,   // レスポンスの型・変換
  },
  "@get/announcements/:id": {
    params: z.object({ id: z.number() }),      // URLパラメータの型
    output: AnnouncementDetailResponseSchema,
  },
  "@put/announcements/:id": {
    params: z.object({ id: z.number() }),
    input: AnnouncementUpsertRequestSchema,    // リクエストボディの型・変換
  },
  "@delete/announcements/:id": {
    params: z.object({ id: z.number() }),
  },
});
```

**キーの書式 `@{method}/{path}`:**
- `@get/` → GETリクエスト
- `@post/` → POSTリクエスト
- `@put/` → PUTリクエスト
- `@delete/` → DELETEリクエスト
- `:id` → URLパラメータ（動的セグメント）

### 2.3 使い方

```typescript
// ✅ このプロジェクトでの使い方
const result = await $fetch("@get/announcements/:id", {
  params: { id: 123 },  // TypeScriptが型チェック
});
// result は Result<AnnouncementDetail, ApiError> 型
// → 成功/失敗を必ずハンドリングしなければならない
```

**コンパイル時のメリット:**
- `"@get/announcements/:id"` の文字列は補完される → タイポ不可
- `params` を渡し忘れると型エラー
- `body` をGETリクエストに渡すと型エラー（GET/HEADにはbody不可）
- レスポンスの型が自動的に推論される

### 2.4 内部実装の解説 (`src/lib/fetch.ts`)

#### TypeScript型レベルのバリデーション

```typescript
// URLに /:id がある場合、params は必須
type ValidMethodPath = `@${HttpMethodLower}/${string}`;

// GETとHEADにはinputスキーマを設定できない
type NoBodyMethods = "get" | "head" | "delete";

// CanHaveBody<"@get/users"> → false  (GETはbody不可)
// CanHaveBody<"@post/users"> → true  (POSTはbody可)
type CanHaveBody<Path extends string> =
  ExtractMethod<Path> extends NoBodyMethods ? false : true;
```

これにより、**スキーマ定義の段階でミスをコンパイルエラーとして検出**できる。

#### リクエスト処理フロー

```
1. スキーマキー ("@get/announcements/:id") から
   → メソッド (GET) とパス (/announcements/:id) を抽出

2. paramsスキーマがあれば params を Zod でバリデーション
   → /announcements/:id の :id を実際の値に置換
   → /announcements/123

3. inputスキーマがあれば body を Zod でエンコード
   → Date → ISO文字列 などの変換を実施

4. fetch() を実行

5. レスポンスが ok でなければ NetworkError を返す

6. outputスキーマがあれば レスポンスを Zod でデコード
   → ISO文字列 → Date などの逆変換を実施

7. Result<T, ApiError> として返す
```

#### エラーの3分類

```typescript
class FetchError extends Error {
  // fetchそのものが失敗（ネットワーク断絶など）
  readonly _tag = "FetchError";
}

class ValidationError extends Error {
  // Zodバリデーション失敗（input/output/paramsの型不一致）
  readonly _tag = "ValidationError";
  readonly errors: z.ZodError;
}

class NetworkError extends Error {
  // HTTPステータスが 4xx/5xx
  readonly _tag = "NetworkError";
  readonly status?: number;
  readonly body?: unknown;  // エラーレスポンスボディ
}
```

**`_tag` プロパティ:**
TypeScriptで型の絞り込みに使う文字列リテラル。`instanceof` の代替で、シリアライズ可能・軽量。

```typescript
// エラーの種類によって処理を分けられる
if (error._tag === "NetworkError" && error.status === 401) {
  // ログインページへリダイレクト
}
```

### 2.5 Zod Codecによるデータ変換

このプロジェクトでの特徴的な使い方として、**APIとアプリの間でデータ形式を自動変換**している。

```typescript
// src/constants/common.ts

// APIはISO文字列、アプリ内ではDateオブジェクト
export const isoDatetimeToDateSchema = z.codec(
  z.iso.datetime({ offset: true }),  // API側の型
  z.date(),                           // アプリ側の型
  {
    decode: (isoString) => new Date(isoString),          // GET時: 文字列→Date
    encode: (date) => dayjs(date).tz("Asia/Tokyo").format(), // POST時: Date→文字列
  }
);

// APIはBase64、アプリ内ではプレーンテキスト
export const base64ToTextSchema = z.codec(
  z.string(),  // API側: base64文字列
  z.string(),  // アプリ側: 普通の文字列
  {
    decode: (base64) => new TextDecoder().decode(...),   // GET時: decode
    encode: (text) => btoa(...),                         // POST時: encode
  }
);
```

**これにより:**
- コンポーネントは常に `Date` オブジェクトとして日付を扱える
- APIへの送信時はfetchクライアントが自動でエンコード
- 変換ロジックはスキーマの一箇所にしか存在しない（DRY原則）

---

## 3. Zodスキーマ設計

### 3.1 Zodとは

Zodは**TypeScriptファーストのスキーマ宣言・バリデーションライブラリ**。

従来の問題:
```typescript
// ❌ 型定義とバリデーションが別々に存在
interface Announcement {
  id: number;
  title: string;
}

// バリデーション関数を別途書く必要がある
function validateAnnouncement(data: unknown): Announcement {
  // 型と一致することを手動でチェック...
}
```

Zodなら:
```typescript
// ✅ 型定義とバリデーションが一体
const AnnouncementSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(42),
});

type Announcement = z.infer<typeof AnnouncementSchema>;
// → { id: number; title: string } が自動で導出

const result = AnnouncementSchema.safeParse(unknownData);
if (result.success) {
  result.data; // Announcement 型が保証される
}
```

### 3.2 スキーマ階層設計

このプロジェクトでは、スキーマを**1つのエンティティから複数の目的別スキーマを派生**させている。

```typescript
// src/constants/announcements.ts

// 1. ベースエンティティスキーマ（全フィールドを網羅）
const AnnouncementEntitySchema = z.object({
  id: z.int().brand("AnnouncementId"),  // Branded type
  title: z.string().min(1).max(42),
  body: base64ToTextSchema,             // Codec付きフィールド
  category: AnnouncementCategorySchema,
  publicationPeriod: z.object({
    from: isoDatetimeToDateSchema,
    to: isoDatetimeToDateSchema,
  }),
  status: PublicationStatusSchema,
  deliveryConditions: z.object({ ... }),
  pushNotificationStatus: PushNotificationStatusSchema,
  pushNotificationSentAt: isoDatetimeToDateSchema.nullable(),
  ...TimestampSchema.shape,  // createdAt, updatedAt を展開
});

// 2. 一覧レスポンス（必要なフィールドだけ pick）
export const AnnouncementsListResponseSchema = z.object({
  list: z.array(
    AnnouncementEntitySchema.pick({
      id: true, title: true, category: true,
      publicationPeriod: true, status: true,
      createdAt: true, updatedAt: true,
    })
  ),
});

// 3. 詳細レスポンス（不要なフィールドを omit）
export const AnnouncementDetailResponseSchema = AnnouncementEntitySchema.omit({
  createdAt: true,
  updatedAt: true,
});

// 4. 作成/更新リクエスト（クライアントから送るフィールドだけ pick）
export const AnnouncementUpsertRequestSchema = AnnouncementEntitySchema.pick({
  title: true, body: true, category: true,
  publicationPeriod: true, status: true,
  deliveryConditions: true, pushNotificationSentAt: true,
});
```

**メリット:**
- ベーススキーマが変われば全ての派生スキーマに自動反映
- フィールドの重複定義が不要
- pick/omitによってフロントエンドとAPIの契約が明確になる

### 3.3 Branded Type（ブランド型）

```typescript
id: z.int().brand("AnnouncementId"),
```

**Branded Typeとは:**
TypeScriptでは `number` 型の変数は全て互換性がある。しかしそれは意図しない代入ミスを招く。

```typescript
// ❌ Branded Typeなし
const announcementId: number = 1;
const customerId: number = 2;

function getAnnouncement(id: number) { ... }
getAnnouncement(customerId); // 型エラーにならない！バグの温床
```

```typescript
// ✅ Branded Typeあり
type AnnouncementId = number & { readonly _brand: "AnnouncementId" };
type CustomerId = number & { readonly _brand: "CustomerId" };

function getAnnouncement(id: AnnouncementId) { ... }
getAnnouncement(customerId); // 型エラー！意図しない使い回しを防げる
```

Zodの `.brand()` はこれを簡単に実現する。実行時には通常の数値として動作するが、TypeScriptの型システム上では別の型として扱われる。

### 3.4 列挙型の管理

```typescript
const AnnouncementCategorySchema = z.enum(["PICKUP", "PR", "NORMAL"]);
type AnnouncementCategory = z.infer<typeof AnnouncementCategorySchema>;
// → "PICKUP" | "PR" | "NORMAL"

// UI表示用マッピングもスキーマから型を導出
export const ANNOUNCEMENT_CATEGORY_OPTIONS: Record<
  z.infer<typeof AnnouncementCategorySchema>,  // キーはスキーマから
  { label: string; color: string }
> = {
  PICKUP: { label: "ピックアップ", color: "bg-pink-100 ..." },
  PR: { label: "PR", color: "bg-yellow-100 ..." },
  NORMAL: { label: "標準", color: "bg-blue-100 ..." },
} as const;
```

**メリット:**
- 新しいカテゴリを追加した場合、`ANNOUNCEMENT_CATEGORY_OPTIONS` に対応エントリがないと TypeScript エラー
- UI表示のラベルとAPIの値のマッピングが一元管理される

### 3.5 ZodNestedKeys ユーティリティ型

```typescript
// src/types/utils.ts
export type ZodNestedKeys<T extends ZodRawShape> = {
  [K in keyof T]: K extends string
    ? T[K] extends ZodObject<infer U>
      ? K | `${K}.${ZodNestedKeys<U>}` // ネストしたキーも含む
      : K
    : never;
}[keyof T];
```

使用例:
```typescript
// テーブルのカラムラベル定義で、存在しないキーを指定するとコンパイルエラー
export const ANNOUNCEMENT_LABELS: Pick<
  Record<ZodNestedKeys<typeof AnnouncementsListResponseSchema.shape.list.element.shape>, string>,
  "id" | "title" | "publicationPeriod.from" | ...  // ネストしたキーも型安全に指定可能
> = { ... };
```

---

## 4. neverthrow — 例外を使わないエラー処理

### 4.1 従来の例外処理の問題

```typescript
// ❌ try/catch の問題
async function fetchAnnouncement(id: number) {
  try {
    const response = await fetch(`/api/announcements/${id}`);
    return await response.json();
  } catch (e) {
    // e の型は unknown — どんなエラーか不明
    // エラーハンドリングを忘れてもコンパイルエラーにならない
    console.error(e);
  }
}

// 呼び出し側でエラーハンドリングを忘れても気づかない
const data = await fetchAnnouncement(1);
data.title; // 失敗時は undefined かもしれないが型は any
```

### 4.2 neverthrow の Result 型

```typescript
// ✅ neverthrow のアプローチ
import { ok, err, type Result } from "neverthrow";

// 戻り値の型に「成功 or 失敗」が明示される
async function fetchAnnouncement(id: number): Promise<Result<Announcement, ApiError>> {
  const response = await fetch(`/api/announcements/${id}`);
  if (!response.ok) {
    return err(new NetworkError("Failed", response.status));
  }
  return ok(await response.json());
}

// 呼び出し側はエラーを無視できない
const result = await fetchAnnouncement(1);

// パターン1: match でハンドリング（両方のケースを書かないと型エラー）
result.match(
  (data) => console.log(data.title),  // 成功
  (error) => console.error(error)     // 失敗
);

// パターン2: isOk/isErr でガード
if (result.isOk()) {
  result.value; // Announcement 型が保証される
}
```

### 4.3 このプロジェクトでの使い方

```typescript
// src/lib/mutations.ts
export const handleMutationResult = async <T, E>(
  result: Result<T, E>,
  handlers: {
    successMessage: string;
    errorMessage: string;
    onSuccess?: (value: T) => Promise<void> | void;
    onError?: (error: E) => Promise<void> | void;
  }
): Promise<void> => {
  await result.match(
    async (value) => {
      toast.success(handlers.successMessage);  // 成功トースト
      await handlers.onSuccess?.(value);
    },
    async (error) => {
      toast.error(handlers.errorMessage);      // エラートースト
      await handlers.onError?.(error);
    }
  );
};
```

実際の使用例:
```typescript
// コンポーネント内
const result = await $fetch("@post/announcements", { body });
await handleMutationResult(result, {
  successMessage: "お知らせを作成しました",
  errorMessage: "お知らせの作成に失敗しました",
  onSuccess: async () => {
    await router.navigate({ to: "/announcements" });
  },
});
```

**メリット:**
- トースト表示とナビゲーションのパターンが統一される
- エラー処理を忘れると型エラーが発生する設計
- `onSuccess` / `onError` コールバックで個別処理も柔軟に追加できる

---

## 5. TanStack Router — ファイルベースルーティング

### 5.1 ファイルベースルーティングとは

TanStack Router（v1）はファイルシステムの構造がそのままURLルートになる。

```
src/routes/
├── __root.tsx                          → すべての親 (全画面共通)
├── login.tsx                           → /login
└── _dashboard/
    ├── route.tsx                       → サイドバーなどのレイアウト
    ├── index.tsx                       → /   (ダッシュボードトップ)
    └── announcements/
        ├── route.tsx                   → /announcements の共通レイアウト
        ├── index.tsx                   → /announcements
        ├── new.tsx                     → /announcements/new
        └── $announcementId.tsx         → /announcements/:announcementId
```

**`_dashboard` の先頭アンダースコア:**
URLに含まれないレイアウトグループ。`/announcements` というURLで、`_dashboard/route.tsx` のレイアウト（サイドバー）が適用される。

**`-announcement-form` の先頭ハイフン:**
URLルートとして認識されないプライベートディレクトリ。そのnamespaceだけで使うコンポーネントを置く。

**`$announcementId.tsx` の先頭ドルマーク:**
動的セグメント（パラメータ）。URLの `/announcements/123` の `123` が `announcementId` として取得できる。

### 5.2 Loaderパターン — データ取得の責務分離

```typescript
// src/routes/_dashboard/announcements/index.tsx
export const Route = createFileRoute("/_dashboard/announcements/")({
  loader: async ({ location }) => {
    // ページが表示される「前に」データを取得
    const result = await $fetch("@get/announcements");
    return unwrapOrRedirect(result, location, (data) => ({
      announcements: data.list,
    }));
  },
  component: RouteComponent,
  pendingComponent: () => <IndexFallback />, // ローディング中の表示
});

function RouteComponent() {
  // loaderが返したデータを型安全に取得
  const { announcements } = Route.useLoaderData();
  // コンポーネントはデータ取得ロジックを持たない
  return <DataTable data={announcements} ... />;
}
```

**Loaderのメリット:**
- コンポーネント内に `useEffect` + `useState` でのデータ取得が不要
- ページ遷移の前にデータ取得が完了するため、「データなしの画面」が一瞬表示されない
- データ取得とUI描画の責務が分離される
- `pendingComponent` でローディングUIを宣言的に指定できる

### 5.3 URLパラメータの型安全なパース

```typescript
// src/routes/_dashboard/announcements/$announcementId.tsx
export const Route = createFileRoute("/_dashboard/announcements/$announcementId")({
  params: {
    parse: (params) => ({
      // URLパラメータ (文字列) を数値に変換 + Branded Type を付与
      announcementId: z.coerce.number().brand("AnnouncementId").parse(params.announcementId),
    }),
  },
  loader: async ({ params: { announcementId }, location }) => {
    // announcementId は AnnouncementId 型（ただの number ではない）
    const result = await $fetch("@get/announcements/:id", {
      params: { id: announcementId },
    });
    ...
  },
});
```

URLのパラメータはすべて文字列として渡ってくるが、`parse` 関数で型変換を定義することで、コンポーネント内では正しい型で使える。

### 5.4 検索パラメータのバリデーション

```typescript
// src/routes/login.tsx
export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional(), // ?redirect=/announcements のようなクエリパラメータ
  }),
  search: {
    middlewares: [stripSearchParams({ redirect: fallback })],
    // fallback値と同じ場合はURLからパラメータを除去（URLのクリーンアップ）
  },
});

// コンポーネント内
const search = useSearch({ from: "/login" });
// search.redirect は string | undefined 型（型安全）
```

### 5.5 静的データとパンくずナビ

```typescript
export const Route = createFileRoute("/_dashboard/announcements/$announcementId")({
  staticData: {
    breadcrumb: "お知らせ詳細",  // パンくずナビに使用
  },
  ...
});
```

### 5.6 onError — エラー時の処理

```typescript
export const Route = createFileRoute("/_dashboard/announcements/$announcementId")({
  onError: () => {
    // loaderでエラーが発生したら一覧に戻す
    throw redirect({ to: "/announcements" });
  },
  ...
});
```

---

## 6. 認証フロー

### 6.1 認証の仕組み

このプロジェクトでは**セッションCookieベースの認証**を採用。

```typescript
// src/lib/api.ts
export const $fetch = createFetch({
  baseURL: `${env.VITE_API_URL}/cms/v1`,
  schema,
  credentials: "include", // ← CORSリクエストでもCookieを送信
});
```

`credentials: "include"` を指定することで、クロスオリジンのAPIリクエストでもブラウザが自動的にセッションCookieを付与する。クライアント側でトークンを管理する必要がない。

### 6.2 ログインフロー

```
1. ユーザーがログインIDとパスワードを入力
   ↓
2. $fetch("@post/auth/login", { body: { loginId, password } })
   ↓
3. APIがセッションCookieを Set-Cookie ヘッダーで設定
   ↓
4. router.invalidate() でルーターのキャッシュをクリア
   ↓
5. router.navigate({ to: search.redirect ?? "/inquiries" })
   → 元々アクセスしようとしていたページ、またはデフォルトページへ
```

### 6.3 401リダイレクト — `unwrapOrRedirect`

```typescript
// src/lib/auth-redirect.ts
const handleAuthRedirect = (error: unknown, location: LocationLike) => {
  if (error instanceof NetworkError && error.status === 401) {
    // セッション切れ → ログインページへ
    // search.redirect に現在のURLを保存（ログイン後に戻れる）
    throw redirect({
      to: "/login",
      search: { redirect: location.href },
    });
  }
  throw error; // 401以外は再throwして上位に伝播
};

export const unwrapOrRedirect = <T, E, U>(
  result: Result<T, E>,
  location: LocationLike,
  onSuccess: (value: T) => U
): U =>
  result.match(
    onSuccess,                                   // 成功: データを変換して返す
    (error) => handleAuthRedirect(error, location) // 失敗: 401チェック
  );
```

使用例:
```typescript
// loaderで使う
loader: async ({ location }) => {
  const result = await $fetch("@get/announcements");
  return unwrapOrRedirect(result, location, (data) => ({
    announcements: data.list,
  }));
  // → 成功なら { announcements: [...] }
  // → 401なら自動的にloginページへリダイレクト
  // → その他のエラーは onError で処理
},
```

### 6.4 ダッシュボードレイアウトの認証考慮

```typescript
// src/routes/_dashboard/route.tsx
function RouteComponent() {
  const matchRoute = useMatchRoute();
  const goingToLogin = matchRoute({ to: "/login", pending: true });

  // ログアウト処理中（/loginへの遷移中）はレイアウトを非表示
  // これによりサイドバーが一瞬ちらつくのを防ぐ
  if (goingToLogin) {
    return null;
  }
  return <SidebarProvider>...</SidebarProvider>;
}
```

---

## 7. TanStack Form — 型安全なフォーム管理

### 7.1 フォームの設計構成

```
src/hooks/
├── form-context.ts  # React Contextの生成
└── form.tsx         # useAppForm, withForm の定義とフィールドの登録
```

### 7.2 フォームContextの仕組み

```typescript
// src/hooks/form-context.ts
export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();
```

TanStack Formは**Contextを使ってフォームの状態をフィールドコンポーネントに伝える**。

```
useAppForm() でフォームを作成
  └─ form.AppField でフィールドをレンダリング
       └─ fieldContext でフィールド状態をProvide
            └─ field.TextField でコンポーネントをレンダリング
                 └─ useFieldContext() でフィールド状態をConsume
```

これにより各フィールドコンポーネントはpropsを大量に受け取らず、Contextから必要な情報を取得できる。

### 7.3 カスタムフックの定義

```typescript
// src/hooks/form.tsx
export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,         // <input type="text">
    NumberField,       // 数値入力
    TextAreaField,     // <textarea>
    SelectField,       // ドロップダウン
    RichTextField,     // Tiptapリッチテキストエディタ
    DateTimePickerField,       // 日時選択
    DateTimePickerWithPresetsField, // プリセット付き日時選択
    CheckboxGroupField,        // チェックボックスグループ
    SliderField,       // スライダー
  },
  formComponents: {
    SubscribeButton,   // 送信ボタン
  },
  fieldContext,
  formContext,
});
```

### 7.4 フォームの使い方

```tsx
// ログインフォームの例 (src/routes/login.tsx)
const form = useAppForm({
  defaultValues: { loginId: "", password: "" },
  validationLogic: revalidateLogic(),   // 送信後はリアルタイムバリデーション
  validators: {
    onDynamic: schema,   // 動的バリデーション（入力中/送信時）
  },
  onSubmit: async ({ value }) => {
    const result = await $fetch("@post/auth/login", { body: value });
    // ...
  },
});

return (
  <form onSubmit={async (e) => { e.preventDefault(); await form.handleSubmit(); }}>
    <form.AppField name="loginId">
      {(field) => (
        <field.TextField
          label="ログインID"
          autoComplete="username"
        />
      )}
    </form.AppField>
    <form.AppForm>
      <form.SubscribeButton label="ログイン" submittingLabel="ログイン中..." />
    </form.AppForm>
  </form>
);
```

**`revalidateLogic()` とは:**
TanStack Formのビルトイン設定。最初の送信試行後は入力のたびにリアルタイムバリデーションが走るが、それ以前は送信時のみバリデーションする（UXに配慮した設定）。

### 7.5 フォームスキーマの分離

```typescript
// src/routes/_dashboard/announcements/-announcement-form/schema.ts

// フォーム入力値のバリデーションスキーマ（UI向け）
export const announcementFormSchema = z.object({
  title: z.string()
    .min(1, "タイトルを入力してください")
    .max(ANNOUNCEMENT_TITLE_MAX_LENGTH, `...`),
  body: z.string()
    .refine((c) => !isEditorEmpty(c), "内容を入力してください")
    .refine((c) => !isEditorOverLimit(c, MAX), `...`),
  publicationPeriod: z.object({
    from: z.date().nullable().pipe(z.date({ error: "公開開始日時を選択してください" })),
    to: z.date().nullable().pipe(z.date({ error: "公開終了日時を選択してください" })),
  }),
  ...
}).refine(
  (data) => data.publicationPeriod.from <= data.publicationPeriod.to,
  {
    path: ["publicationPeriod.to"],
    message: "公開終了日時は公開開始日時より前にできません",
  }
);

// Zodから型を導出
type AnnouncementFormInput = z.input<typeof announcementFormSchema>;  // フォームのデフォルト値の型
type AnnouncementFormOutput = z.output<typeof announcementFormSchema>; // バリデーション後の型
```

**`z.input` と `z.output` の違い:**
Zodの変換（`.pipe()`や`.transform()`）を使うと入力と出力の型が異なる。

```typescript
// from は "未入力" の null を許容するが、submit後は必ず Date が入っている
from: z.date().nullable().pipe(z.date())
// input 型: Date | null    (フォームのデフォルト値に null を使える)
// output 型: Date          (バリデーション通過後は null ではない)
```

### 7.6 フィールドコンポーネントの実装

```typescript
// src/components/form/text-field.tsx
export default function TextField({ label, description, ...props }: TextFieldProps) {
  const field = useFieldContext<string | number>(); // Context からフィールド状態を取得

  return (
    <div className="space-y-2">
      <FormLabel label={label} required={props["aria-required"] === "true"} />
      <FormControl>
        <Input
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
      </FormControl>
      <FieldErrors meta={field.state.meta} />  {/* バリデーションエラー表示 */}
    </div>
  );
}
```

**`FormControl` の役割:**
アクセシビリティ属性を自動付与する（`aria-invalid`, `aria-describedby`）。エラーがある場合にスクリーンリーダーへ通知する。

### 7.7 withForm パターン

大きなフォームは複数のコンポーネントに分割されるが、各サブコンポーネントにフォームを渡す方法として `withForm` が使える。

```typescript
// フォームの型情報を保持したまま子コンポーネントを定義
export const DeliveryConditions = withForm({
  props: { form: {} },
  render: ({ form }) => (
    <Card>
      <form.AppField name="deliveryConditions.genders">
        {(field) => <field.CheckboxGroupField ... />}
      </form.AppField>
    </Card>
  ),
});
```

---

## 8. コンポーネント設計

### 8.1 shadcn/ui

shadcn/ui は**コンポーネントのコードをプロジェクトにコピーする**アプローチのUIライブラリ。

```bash
bunx shadcn@latest add button
# → src/components/ui/button.tsx が生成される
```

**特徴:**
- npm installではなくソースコードを直接プロジェクトに追加
- カスタマイズが自由（コードが手元にある）
- Radix UI（アクセシビリティ対応の低レベルUIプリミティブ）をベースに Tailwind でスタイリング
- Biomeのlintから除外（ライブラリコードなので）

### 8.2 cn() ユーティリティ

```typescript
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**`clsx`:** 条件付きクラス名の結合
```typescript
clsx("base", { "text-red": isError, "font-bold": isBold })
// → "base text-red font-bold" (条件が真のものだけ結合)
```

**`tailwind-merge`:** Tailwindクラスの競合解決
```typescript
twMerge("px-2 py-1", "px-4")
// → "py-1 px-4" (同じプロパティは後のもので上書き)
// clsx だけだと "px-2 py-1 px-4" になって両方が適用される問題が起きる
```

### 8.3 DataTableコンポーネント

TanStack Table を使ったデータテーブル。

```typescript
// 使い方
<DataTable
  columns={columns}
  data={announcements}
  rowLink={(row) => ({
    to: "/announcements/$announcementId",
    params: { announcementId: row.id },
  })}
  searchPlaceholder="タイトルで検索"
/>
```

`createColumnHelper` でカラム定義:
```typescript
const columnHelper = createColumnHelper<Announcement>();
const columns = [
  columnHelper.accessor("title", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="タイトル" />,
    enableGlobalFilter: true,  // 検索対象
    enableSorting: false,      // ソート不可
  }),
  columnHelper.accessor("status", {
    filterFn: "arrIncludesSome",  // 複数選択フィルター
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,  // カスタム表示
    meta: {
      options: [...],  // フィルターの選択肢
    },
  }),
];
```

---

## 9. テスト戦略

### 9.1 テスト種別の分離

```javascript
// vitest.config.js
test: {
  projects: [
    {
      name: "unit",
      include: ["src/test/**/*.test.ts"],  // TypeScriptのみ（DOM不要）
    },
    {
      name: "feature",
      include: ["src/test/**/*.test.tsx"],  // ReactコンポーネントのDOM含むテスト
      environment: "happy-dom",
      setupFiles: ["./src/test/setup.ts"],
    },
  ],
}
```

- **unit テスト (`.test.ts`)**: `fetch.ts` の型変換ロジックなど、UIに依存しない純粋な関数
- **feature テスト (`.test.tsx`)**: ルートコンポーネント全体の結合テスト

### 9.2 MSW (Mock Service Worker)

テスト中のAPIをモックする。

```typescript
// src/test/msw/server.ts
export const server = setupServer();  // テスト用にNode.jsで動作

// src/test/setup.ts
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // 未定義のAPIが呼ばれたらエラー → テスト漏れを防ぐ
});
afterEach(() => server.resetHandlers()); // 各テスト後にリセット
afterAll(() => server.close());
```

ハンドラーの定義:
```typescript
// src/test/msw/handlers/announcements.ts
export const announcementsHandlers = {
  list: (data: AnnouncementsListData) =>
    http.get(`${BASE_URL}/announcements`, () => HttpResponse.json(data)),

  listError: (status = 500) =>
    http.get(`${BASE_URL}/announcements`, () => HttpResponse.json(null, { status })),
};
```

**MSWのメリット:**
- 実際のHTTPリクエストをインターセプトするため、アプリのコードを変更せずにテストできる
- ネットワーク層のテストも含まれる（fetchのURL、メソッド、ヘッダーなど）

### 9.3 ルーターテストユーティリティ

```typescript
// テスト用ルートツリーの構築
const routeTree = buildTestRouteTree([
  { path: "/announcements", route: AnnouncementsIndexRoute },
  { path: "/announcements/new", component: () => null },  // 遷移先はnullコンポーネントでOK
  { path: "/login", component: () => null },
]);

// テスト実行
it("redirects to login on 401", async () => {
  server.use(announcementsHandlers.listError(401));

  const { load, router } = renderWithRouter("/announcements", routeTree);
  await load;  // loaderが完了するまで待機

  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/login");
  });
});
```

**`warmupRouteTree` の役割:**
```typescript
beforeAll(async () => {
  server.use(announcementsHandlers.list(announcementsListRaw));
  await warmupRouteTree(routeTree, "/announcements");
});
```

TanStack RouterはRoute定義を初回レンダリング時に初期化する。`warmupRouteTree` はそれを事前に行い、各テストの実行時間を短縮する。

### 9.4 フィクスチャデータ

```typescript
// src/test/fixtures/announcements.ts
// APIが返す生データ形式（Zodの変換前）
export const announcementsListRaw = {
  list: [
    {
      id: 1,
      title: "重要なお知らせ",
      category: "PICKUP",
      publicationPeriod: { from: "2024-01-01T09:00:00+09:00", to: "..." },
      status: "PUBLISHED",
      createdAt: "2024-01-02T10:00:00+09:00",
      updatedAt: "...",
    },
    ...
  ],
};
```

MSWのハンドラーはこのrawデータを返す。アプリ内でZodが変換する部分もテスト対象に含まれる。

---

## 10. コード品質ツール

### 10.1 Biome — オールインワンLinter/Formatter

```jsonc
// biome.jsonc
{
  "extends": [
    "ultracite/biome/core",   // 厳格なベース設定
    "ultracite/biome/remix",  // Remix/React向け
    "ultracite/biome/react"
  ],
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120  // 1行120文字まで
  },
  "javascript": {
    "formatter": { "quoteStyle": "double" }  // ダブルクォート統一
  }
}
```

**主なルール:**
- `noParameterAssign`: 関数の引数への再代入禁止
- `useSelfClosingElements`: 子要素がない場合は自己閉じタグ (`<Foo />`)
- `noUselessElse`: `if (return)` の後の `else` は不要
- `useSortedClasses`: Tailwindクラスを自動ソート
- `noInferrableTypes`: TypeScriptが推論できる型注釈は書かない

**自動修正:**
```bash
bun run biome:fix  # --write --unsafe で安全に自動修正
```

**除外ファイル:**
- `src/routeTree.gen.ts` — 自動生成ファイル（手動編集不可）
- `src/components/ui/*.tsx` — shadcn/uiのコード（外部コードなので）

### 10.2 Knip — 未使用コード検出

```bash
bun run knip  # 未使用のファイル・エクスポート・依存関係を検出
```

**なぜ必要か:**
大規模プロジェクトでは使われなくなったコードが残り続けることがある。定期的に実行することでバンドルサイズの肥大化や混乱を防ぐ。

---

## 11. 環境変数の型安全管理

```typescript
// src/env.ts
import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",  // クライアント側変数のプレフィックス（Viteの仕様）
  client: {
    VITE_API_URL: z.url(),  // URLとして有効であることをZodで検証
  },
  runtimeEnv: import.meta.env,  // Viteの環境変数オブジェクト
  emptyStringAsUndefined: true,  // 空文字はundefined扱い
});
```

**メリット:**
```typescript
// ✅ 型安全な使い方
const apiUrl = env.VITE_API_URL;
// → string 型が保証される（undefinedになることがない）

// ❌ 生のimport.meta.envを使う問題
const apiUrl = import.meta.env.VITE_API_URL;
// → string | undefined → 毎回nullチェックが必要
// → URLとして無効な値が入っていてもコンパイルエラーにならない
```

**アプリ起動時に環境変数の存在と形式を検証するため、デプロイ後に気づく問題を開発時に発見できる。**

---

## 12. 日付処理

### 12.1 dayjs設定

```typescript
// src/lib/dayjs.ts
import dayjsBase from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjsBase.extend(utc);
dayjsBase.extend(timezone);
dayjsBase.tz.setDefault("Asia/Tokyo"); // デフォルトタイムゾーンを東京に

export const dayjs = dayjsBase;
```

**なぜ dayjs か:**
- `Date` オブジェクトのAPIは使いにくい（タイムゾーン操作が煩雑）
- `dayjs` は軽量で、プラグインでタイムゾーン対応を追加できる
- `moment.js` より軽量（イミュータブル設計）

### 12.2 Codec との連携

```typescript
// src/constants/common.ts
export const isoDatetimeToDateSchema = z.codec(
  z.iso.datetime({ offset: true }),
  z.date(),
  {
    decode: (isoString) => new Date(isoString),
    // APIへの送信時は必ず東京時間でエンコード
    encode: (date) => dayjs(date).tz("Asia/Tokyo").format(),
    // → "2024-01-01T09:00:00+09:00"
  }
);
```

---

## 13. 設計思想まとめ

### 13.1 「型で守る」設計

このプロジェクトの最大の特徴は、**ランタイムエラーをできる限りコンパイルエラーに変換する**ことへの徹底したこだわり。

| レイヤー | 守り方 |
|---------|-------|
| 環境変数 | `@t3-oss/env-core` + Zod で起動時検証 |
| APIの型 | `createSchema` + TypeScript型レベル検証 |
| APIのデータ変換 | Zodのcodec（decode/encode） |
| URLパラメータ | TanStack Router の `params.parse` |
| フォーム入力 | TanStack Form + Zod スキーマ |
| エラー処理 | neverthrow の `Result<T, E>` |
| ID型の混同 | Zod Branded Type |

### 13.2 「責務の明確化」

| 役割 | 担当 |
|-----|------|
| データ取得 | loaderパターン |
| データ変換（API↔アプリ） | Zodのcodec |
| フォーム状態管理 | TanStack Form |
| UIロジック | Reactコンポーネント |
| エラー処理 | neverthrow + handleMutationResult |
| 認証リダイレクト | unwrapOrRedirect |
| スタイリング | Tailwind CSS + shadcn/ui |

### 13.3 「コロケーション（局所性）」

関連するコードは近くに置く。

```
routes/_dashboard/announcements/
├── index.tsx       ← 一覧ページ
├── new.tsx         ← 新規作成ページ
├── $announcementId.tsx  ← 詳細/編集ページ
└── -announcement-form/  ← このfeatureだけで使うコンポーネント
    ├── schema.ts        ← フォームのZodスキーマ
    ├── index.tsx        ← フォームの外枠
    ├── main-content.tsx ← フォームの本文エリア
    ├── header-actions.tsx ← 保存・削除ボタン
    └── delivery-conditions.tsx ← 配信条件エリア
```

`constants/` はAPI全体に共通のスキーマ、`-announcement-form/schema.ts` はそのページだけのUIスキーマ、という住み分け。

### 13.4 このプロジェクトから学べる再利用可能なパターン

| パターン | 効果 |
|--------|------|
| `createSchema` + `$fetch` | どんなAPIでも型安全に呼び出せる |
| Zod codec | APIとアプリの型変換を一箇所に集約 |
| neverthrow `Result` | エラーを型として扱い、処理漏れをコンパイルエラーで防ぐ |
| TanStack Router loader | データ取得とUI描画の責務分離 |
| `unwrapOrRedirect` | 認証チェックを loader に組み込む |
| `handleMutationResult` | ミューテーションのトースト+コールバックを統一 |
| Branded Type | 意味の違うIDの型を区別する |
| フォームスキーマ分離 | `z.input` / `z.output` の分離でデフォルト値と送信値の型を使い分ける |
| MSW + ルーターテスト | ページ全体をHTTPモックとともにテストする |

---

*このドキュメントは `/Users/tomohisa.tanaka/Desktop/H2O/h2o_mk_cms` プロジェクトのソースコードを解析して作成されました。*
