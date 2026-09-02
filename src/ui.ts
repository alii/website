// The class presets live in src/site/ui.gleam now. This re-export keeps the
// TSX that has not moved yet compiling.
export {
	box_hd as boxHd,
	listing,
	muted,
	page_title as pageTitle,
	thing,
	wrap,
} from '@gleam/website/site/ui.mjs';
