import {z} from 'zod';
import {api} from '../../server/api';

function coerce<
	AOut,
	ADef extends z.ZodTypeDef,
	AIn,
	TOut,
	BOut,
	BDef extends z.ZodTypeDef,
>(
	a: z.Schema<AOut, ADef, AIn>,
	transform: (value: AOut) => TOut,
	b: z.Schema<BOut, BDef, TOut>,
): z.ZodEffects<z.ZodType<AOut, ADef, AIn>, BOut, AIn> {
	return a.transform(value => b.parse(transform(value)));
}

function refine<
	AOut,
	ADef extends z.ZodTypeDef,
	AIn,
	BOut,
	BDef extends z.ZodTypeDef,
>(a: z.Schema<AOut, ADef, AIn>, b: z.Schema<BOut, BDef, AOut>) {
	return coerce(a, v => v, b);
}

const numeric = (apply?: (schema: z.ZodNumber) => z.ZodNumber) =>
	coerce(
		z.string().or(z.number()),
		value => (typeof value === 'string' ? parseInt(value, 10) : value),
		apply ? apply(z.number()) : z.number(),
	);

const commaSeparated = coerce(
	z.string(),
	value => value.split(','),
	z.array(z.any()),
);

const commaSeparatedNums = refine(commaSeparated, z.array(numeric()));

const json = coerce(
	z.string(),
	value => JSON.parse(value) as unknown,
	z.unknown(),
);

const optionalNumber = coerce(
	z.string().optional(),
	value => (value ? parseInt(value, 10) : 20),
	z.number().min(20).optional(),
);

const numericSchema = numeric(s => s.min(2).max(14)).optional();

// Poor because this is inferred to `string | number` when really it will *always* be a numerical output
// this is because the transformer doesn't copy type information across
const stringOrNum = z.transformer(z.string().or(z.number()), {
	type: 'transform',
	transform: value => (typeof value === 'string' ? parseInt(value, 10) : value),
});

export default api({
	async GET() {
		return {
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

			commaSeparated: commaSeparated.parse('10,100,1000,not a number,also not'),
			commaSeparatedNums: commaSeparatedNums.parse('10,100,1000'),
		};
	},
});
