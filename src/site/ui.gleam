//// Shared Tailwind class presets for the plain-text theme: one narrow centered
//// column, warm paper tones, serif headings, no boxes or chrome. Everything is
//// Tailwind utilities with `dark:` variants (system dark mode).
//// `src/ui.ts` re-exports these until the TSX that uses them moves.

pub const wrap = "mx-auto w-full max-w-[650px] px-4"

/// page/section headings
pub const page_title = "font-serif text-4xl font-semibold tracking-[-0.01em] text-stone-900 dark:text-stone-100"

pub const box_hd = "mb-3 text-[13px] font-semibold tracking-wide text-stone-400 dark:text-stone-500"

/// muted inline text (dates, metadata)
pub const muted = "text-stone-400 dark:text-stone-500"

/// post listing: a plain list
pub const listing = "m-0 list-none p-0"

pub const thing = "mb-2.5 last:mb-0"
