import tailwind from 'bun-plugin-tailwind';

// Build plugins of `bun bake`. Pages in app/pages use its default framework: React, with the
// project's own `react` and `react-dom`.
export default {
	plugins: [tailwind],
};
