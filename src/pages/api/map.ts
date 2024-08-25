import {NextkitError} from 'nextkit';
import {api} from '../../server/api';

export default api({
    GET: async ({ctx}) => {
        const lanyard = await ctx.lanyard.get();

        if (!lanyard.kv.location) {
            throw new NextkitError(404, 'No location found');
        }

        return {
            location: lanyard.kv.location
        };
    },
});