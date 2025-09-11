import {posts} from '../../src/blog/posts';
import {api} from '../../src/server/api';

const filtered = posts.filter(post => !post.hidden);

export default api({GET: async () => filtered});
