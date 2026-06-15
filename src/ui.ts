// Shared Tailwind class presets for the old-web / retro theme. Everything is
// Tailwind utilities with `dark:` variants (system dark mode) — no hand-rolled
// CSS framework. Compose with clsx in components.

export const wrap = 'mx-auto w-full max-w-[1000px] px-3';

// boxes (sidebar widgets, panels)
export const box = 'mb-3.5 border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900';
export const boxHd =
	'border-b border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-bold lowercase tracking-wide text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
export const boxBd =
	'p-2.5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_a]:text-sky-700 [&_a:hover]:underline dark:[&_a]:text-sky-400';

export const sectionTitle =
	'mb-2 text-xs font-bold lowercase tracking-wide text-zinc-500 dark:text-zinc-400';

export const link = 'text-sky-700 hover:underline dark:text-sky-400';

// tag pills
export const tag =
	'inline-block rounded-[2px] bg-sky-100 px-1.5 py-px text-[11px] leading-normal text-sky-800 hover:bg-sky-200 hover:no-underline dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900';

// reddit-style listing
export const listing = 'border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900';
export const thing =
	'flex items-stretch gap-3 border-b border-zinc-200 p-3 last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40';
export const thingVote =
	'flex w-[34px] shrink-0 select-none flex-col items-center leading-none text-zinc-500 dark:text-zinc-400';
export const arrow =
	'cursor-pointer appearance-none border-0 bg-transparent p-0.5 text-[13px] leading-none text-zinc-300 hover:text-[#f48024] dark:text-zinc-600';
export const thingScore = 'my-0.5 text-[15px] font-bold text-zinc-700 dark:text-zinc-200';
export const thingEntry = 'min-w-0 flex-1';
export const thingTitle =
	'text-base font-semibold text-sky-700 visited:text-purple-800 hover:underline dark:text-sky-400 dark:visited:text-purple-400';
export const thingExcerpt = 'my-1 text-[13px] text-zinc-600 dark:text-zinc-400';
export const thingTagline =
	'flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400';

export const breadcrumb =
	'mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400';

// key/value rows inside boxes
export const pinrow = 'mb-2 flex items-start gap-2.5 last:mb-0';
export const pinrowK = 'w-16 shrink-0 pt-px text-[11px] text-zinc-500 dark:text-zinc-400';

export const banner =
	'border border-zinc-300 border-l-4 border-l-[#f48024] bg-white px-4 py-3.5 text-[13px] dark:border-zinc-700 dark:bg-zinc-900';

// 88x31 button wall
export const btnWall = 'flex flex-wrap gap-[5px] leading-none';
export const b88 =
	'block h-[31px] w-[88px] border border-black shadow-[1px_1px_0_rgba(0,0,0,0.3)] [image-rendering:pixelated] hover:brightness-110';
