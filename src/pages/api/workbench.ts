import {z} from 'zod';
import {api} from '../../server/api';

function coerce<AOut, ADef, AIn, TOut, BOut, BDef>(
	a: z.Schema<AOut, ADef, AIn>,
	transform: (value: AOut) => TOut,
	b: z.Schema<BOut, BDef, TOut>,
) {
	return a.transform(transform).transform(value => b.parse(value));
}

const commaSeparated = coerce(
	z.string(),
	value => value.split(','),
	z.array(z.string()),
);

const json = coerce(
	z.string(),
	value => JSON.parse(value) as unknown,
	z.unknown(),
);

const optionalNumber = coerce(
	z.string().optional(),
	value => (value ? parseInt(value, 10) : 20),
	z.number().min(20),
);

const numeric = (apply: (schema: z.ZodNumber) => z.ZodNumber) =>
	coerce(
		z.string().or(z.number()),
		value => (typeof value === 'string' ? parseInt(value, 10) : value),
		apply(z.number()),
	);

const numericSchema = numeric(s => s.min(2).max(14)).optional();

const stringOrNum = z.transformer(z.string().or(z.number()), {
	type: 'transform',
	transform: value => (typeof value === 'string' ? parseInt(value, 10) : value),
});

export default api({
	async GET() {
		return {
			cs: commaSeparated.parse('alistair,smith,alex,katt,colin,hacks'),
			json: json.parse('{"a":1,"b":2}'),

			stringOrNum1: stringOrNum.parse('1'),
			stringOrNum2: stringOrNum.parse('2'),
			stringOrNum11: stringOrNum.parse(1),
			stringOrNum12: stringOrNum.parse(2),

			optionalNumber: optionalNumber.parse('42'),
			optionalNumber2: optionalNumber.parse(undefined),
			optionalNumber3: optionalNumber.safeParse(null),
			optionalNumber4: optionalNumber.parse(''),

			numeric2: numericSchema.parse('2'),
			numeric3: numericSchema.parse('13'),
		};
	},
});
