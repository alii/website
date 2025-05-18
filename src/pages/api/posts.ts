import {posts} from '../../blog/posts';
import {api} from '../../server/api';

const filtered = posts.filter(post => !post.hidden);

export default api({GET: async () => filtered});
