import type {ThemeRegistrationRaw} from 'shiki';

// Custom warm themes matching the site palette (cream paper, stone grays,
// terracotta/amber/olive accents). One light, one dark; the Highlighter emits
// both and globals.css swaps them via prefers-color-scheme.

export const paperLight: ThemeRegistrationRaw = {
	name: 'paper-light',
	type: 'light',
	colors: {'editor.background': '#fdfcf9', 'editor.foreground': '#44403c'},
	settings: [
		{settings: {foreground: '#44403c', background: '#fdfcf9'}},
		{
			scope: ['comment', 'punctuation.definition.comment', 'quote'],
			settings: {foreground: '#a29d90', fontStyle: 'italic'},
		},
		{
			scope: [
				'keyword',
				'storage',
				'storage.type',
				'storage.modifier',
				'keyword.control',
				'keyword.operator.new',
			],
			settings: {foreground: '#9a3412'},
		},
		{scope: ['keyword.operator'], settings: {foreground: '#78716c'}},
		{scope: ['entity.name.tag'], settings: {foreground: '#9a3412'}},
		{
			scope: ['punctuation.definition.tag', 'meta.tag', 'meta.preprocessor'],
			settings: {foreground: '#a29d90'},
		},
		{scope: ['string', 'string.quoted', 'meta.embedded'], settings: {foreground: '#6d7030'}},
		{
			scope: ['constant.numeric', 'constant.character', 'constant.language', 'support.constant'],
			settings: {foreground: '#b45309'},
		},
		{scope: ['entity.name.function', 'support.function'], settings: {foreground: '#6f4a0e'}},
		{
			scope: [
				'entity.name.type',
				'support.type',
				'support.class',
				'entity.name.class',
				'entity.other.attribute-name',
			],
			settings: {foreground: '#b0512f'},
		},
		{
			scope: ['support.type.property-name', 'meta.object-literal.key'],
			settings: {foreground: '#8a3e1d'},
		},
		{
			scope: ['variable', 'variable.other', 'variable.parameter'],
			settings: {foreground: '#57534e'},
		},
		{
			scope: ['string.regexp', 'constant.character.escape'],
			settings: {foreground: '#a4432a'},
		},
		{scope: ['punctuation'], settings: {foreground: '#78716c'}},
		{
			scope: ['entity.name.section', 'markup.heading'],
			settings: {foreground: '#9a3412', fontStyle: 'bold'},
		},
		{scope: ['markup.underline.link'], settings: {foreground: '#9a3412'}},
		{scope: ['emphasis'], settings: {fontStyle: 'italic'}},
		{scope: ['strong'], settings: {fontStyle: 'bold'}},
	],
};

export const paperDark: ThemeRegistrationRaw = {
	name: 'paper-dark',
	type: 'dark',
	colors: {'editor.background': '#1d1915', 'editor.foreground': '#d6d3d1'},
	settings: [
		{settings: {foreground: '#d6d3d1', background: '#1d1915'}},
		{
			scope: ['comment', 'punctuation.definition.comment', 'quote'],
			settings: {foreground: '#78716c', fontStyle: 'italic'},
		},
		{
			scope: [
				'keyword',
				'storage',
				'storage.type',
				'storage.modifier',
				'keyword.control',
				'keyword.operator.new',
			],
			settings: {foreground: '#fdba74'},
		},
		{scope: ['keyword.operator'], settings: {foreground: '#a8a29e'}},
		{scope: ['entity.name.tag'], settings: {foreground: '#fdba74'}},
		{
			scope: ['punctuation.definition.tag', 'meta.tag', 'meta.preprocessor'],
			settings: {foreground: '#8a8378'},
		},
		{scope: ['string', 'string.quoted', 'meta.embedded'], settings: {foreground: '#b3bd6d'}},
		{
			scope: ['constant.numeric', 'constant.character', 'constant.language', 'support.constant'],
			settings: {foreground: '#e8a75c'},
		},
		{scope: ['entity.name.function', 'support.function'], settings: {foreground: '#f2e2ba'}},
		{
			scope: [
				'entity.name.type',
				'support.type',
				'support.class',
				'entity.name.class',
				'entity.other.attribute-name',
			],
			settings: {foreground: '#e59077'},
		},
		{
			scope: ['support.type.property-name', 'meta.object-literal.key'],
			settings: {foreground: '#dfa088'},
		},
		{
			scope: ['variable', 'variable.other', 'variable.parameter'],
			settings: {foreground: '#d6d3d1'},
		},
		{
			scope: ['string.regexp', 'constant.character.escape'],
			settings: {foreground: '#e08563'},
		},
		{scope: ['punctuation'], settings: {foreground: '#8a847a'}},
		{
			scope: ['entity.name.section', 'markup.heading'],
			settings: {foreground: '#fdba74', fontStyle: 'bold'},
		},
		{scope: ['markup.underline.link'], settings: {foreground: '#fdba74'}},
		{scope: ['emphasis'], settings: {fontStyle: 'italic'}},
		{scope: ['strong'], settings: {fontStyle: 'bold'}},
	],
};
