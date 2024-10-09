import {api} from '../../server/api';

export default api({GET: async () => Date.now()});
