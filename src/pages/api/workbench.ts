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

export default api({
	async GET() {
		return {
			cs: commaSeparated.safeParse('alistair,smith,alex,katt,colin,hacks'),
			json: json.safeParse('{"a":1,"b":2}'),
			optionalNumber: optionalNumber.safeParse('42'),
			optionalNumber2: optionalNumber.safeParse(undefined),
			optionalNumber3: optionalNumber.safeParse(null),
			optionalNumber4: optionalNumber.safeParse(''),
		};
	},
});
