// Drizzle schema for SQLite / Cloudflare D1.
//
// This is the *shared* finnoybu.com schema — bound by both
// fiction.finnoybu.com (this repo) and memoirs.finnoybu.com (reminiscences
// repo). One user row spans both sites because cookies are set at
// `.finnoybu.com` and both Pages projects bind the same D1.
//
// Shape mirrors the original Supabase schema (reminiscences/supabase/
// migrations/001_initial_schema.sql) — no `book_slug` because chapter
// slugs are globally unique across both sites.

import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from 'drizzle-orm/sqlite-core';

// =============================================================================
// Better Auth tables
// =============================================================================

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// =============================================================================
// App tables — mirror Supabase shapes for parity
// =============================================================================

// Reading progress — one row per (user, chapter). Synced from localStorage
// for logged-in users so they can resume across devices.
export const readingProgress = sqliteTable(
  'reading_progress',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    chapterSlug: text('chapter_slug').notNull(),
    scrollPosition: real('scroll_position').notNull().default(0),
    percent: real('percent').notNull().default(0),
    lastReadAt: integer('last_read_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userChapterUniq: uniqueIndex('reading_progress_user_chapter_uniq').on(
      t.userId,
      t.chapterSlug,
    ),
    userIdx: index('reading_progress_user_idx').on(t.userId),
  }),
);

// Bookmarks — saved positions inside a chapter. Multi-bookmark per chapter.
export const bookmarks = sqliteTable(
  'bookmarks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    chapterSlug: text('chapter_slug').notNull(),
    scrollPosition: real('scroll_position').notNull(),
    selectionStart: integer('selection_start'),  // character offset (paragraph-accurate)
    label: text('label'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index('bookmarks_user_idx').on(t.userId),
    userChapterIdx: index('bookmarks_user_chapter_idx').on(t.userId, t.chapterSlug),
  }),
);

// Annotations — personal notes on a text selection.
export const annotations = sqliteTable(
  'annotations',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    chapterSlug: text('chapter_slug').notNull(),
    textSelection: text('text_selection').notNull(),
    note: text('note').notNull().default(''),
    selectionStart: integer('selection_start'),
    selectionEnd: integer('selection_end'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index('annotations_user_idx').on(t.userId),
    userChapterIdx: index('annotations_user_chapter_idx').on(t.userId, t.chapterSlug),
  }),
);

// Errata reports — readers flagging typos / factual issues / etc.
export const errataReports = sqliteTable(
  'errata_reports',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    chapterSlug: text('chapter_slug').notNull(),
    textSelection: text('text_selection').notNull(),
    description: text('description').notNull(),
    status: text('status').notNull().default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index('errata_user_idx').on(t.userId),
  }),
);

// Purchases — Stripe-backed digital downloads. `product_id` is the catalog
// slug (e.g. `salt-and-silence`, `reminiscences`).
export const purchases = sqliteTable(
  'purchases',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull(),
    stripeSessionId: text('stripe_session_id').notNull().unique(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('usd'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    userIdx: index('purchases_user_idx').on(t.userId),
    userProductIdx: index('purchases_user_product_idx').on(t.userId, t.productId),
  }),
);

// Re-exported types for app use.
export type User = typeof user.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Annotation = typeof annotations.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type ErrataReport = typeof errataReports.$inferSelect;
