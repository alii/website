import {api} from '../../src/server/api';

export default api({GET: async () => Date.now()});
