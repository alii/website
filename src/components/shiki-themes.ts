import type {ThemeRegistrationRaw} from 'shiki';

// Ports of the highlight.js "lightfair" and "vs2015" themes — the exact ones the
// old react-syntax-highlighter setup used — into Shiki TextMate themes, so the
// code colours stay the same after the migration. highlight.js and TextMate
// tokenise differently, so this reproduces the palette faithfully rather than
// every single token identically.

export const lightfair: ThemeRegistrationRaw = {
	name: 'lightfair',
	type: 'light',
	colors: {'editor.background': '#ffffff', 'editor.foreground': '#444444'},
	settings: [
		{settings: {foreground: '#444444', background: '#ffffff'}},
		{scope: ['comment', 'punctuation.definition.comment', 'quote'], settings: {foreground: '#888888'}},
		{
			scope: [
				'keyword',
				'storage',
				'storage.type',
				'storage.modifier',
				'keyword.control',
				'keyword.operator.new',
				'entity.name.tag.css',
			],
			settings: {foreground: '#444444', fontStyle: 'bold'},
		},
		{scope: ['entity.name.tag'], settings: {foreground: '#01a3a3', fontStyle: 'bold'}},
		{scope: ['punctuation.definition.tag', 'meta.tag', 'meta.preprocessor'], settings: {foreground: '#778899'}},
		{scope: ['string', 'string.quoted', 'meta.embedded'], settings: {foreground: '#4286f4'}},
		{scope: ['constant.numeric', 'constant.character'], settings: {foreground: '#4286f4'}},
		{
			scope: [
				'entity.name.function',
				'entity.name.type',
				'support.type',
				'support.class',
				'entity.name.class',
				'entity.other.attribute-name.id.css',
				'entity.other.attribute-name.class.css',
			],
			settings: {foreground: '#4286f4'},
		},
		{scope: ['entity.name.section', 'markup.heading'], settings: {foreground: '#4286f4', fontStyle: 'bold'}},
		{scope: ['constant.language', 'support.constant'], settings: {foreground: '#62bcbc'}},
		{scope: ['support.function', 'constant.other.symbol', 'keyword.other.unit'], settings: {foreground: '#25c6c6'}},
		{
			scope: [
				'variable',
				'variable.other',
				'string.regexp',
				'constant.character.escape',
				'markup.underline.link',
			],
			settings: {foreground: '#BC6060'},
		},
		{scope: ['emphasis'], settings: {fontStyle: 'italic'}},
		{scope: ['strong'], settings: {fontStyle: 'bold'}},
	],
};

export const vs2015: ThemeRegistrationRaw = {
	name: 'vs2015',
	type: 'dark',
	colors: {'editor.background': '#1E1E1E', 'editor.foreground': '#DCDCDC'},
	settings: [
		{settings: {foreground: '#DCDCDC', background: '#1E1E1E'}},
		{
			scope: ['comment', 'punctuation.definition.comment', 'quote'],
			settings: {foreground: '#57A64A', fontStyle: 'italic'},
		},
		{scope: ['comment.documentation', 'string.documentation'], settings: {foreground: '#608B4E'}},
		{
			scope: [
				'keyword',
				'storage',
				'storage.type',
				'storage.modifier',
				'keyword.control',
				'constant.language',
				'variable.language',
				'support.type.primitive',
				'entity.name.tag',
			],
			settings: {foreground: '#569CD6'},
		},
		{
			scope: ['support.type', 'entity.name.type', 'support.class', 'entity.name.class', 'entity.other.inherited-class'],
			settings: {foreground: '#4EC9B0'},
		},
		{scope: ['constant.numeric', 'constant.character.numeric'], settings: {foreground: '#B8D7A3'}},
		{scope: ['string', 'string.quoted', 'meta.embedded.string'], settings: {foreground: '#D69D85'}},
		{scope: ['string.regexp', 'constant.character.escape'], settings: {foreground: '#9A5334'}},
		{scope: ['variable', 'variable.other'], settings: {foreground: '#BD63C5'}},
		{
			scope: [
				'entity.other.attribute-name',
				'support.type.property-name',
				'meta.object-literal.key',
				'variable.parameter',
			],
			settings: {foreground: '#9CDCFE'},
		},
		{
			scope: ['punctuation.definition.tag', 'meta.tag', 'meta.preprocessor', 'keyword.other.preprocessor'],
			settings: {foreground: '#9B9B9B'},
		},
		{scope: ['entity.name.section', 'markup.heading'], settings: {foreground: '#D7BA7D'}},
		{scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: {foreground: '#DCDCDC'}},
		{scope: ['emphasis'], settings: {fontStyle: 'italic'}},
		{scope: ['strong'], settings: {fontStyle: 'bold'}},
	],
};
