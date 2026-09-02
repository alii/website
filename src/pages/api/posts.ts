import {posts} from '../../blog/posts';
import {api} from '../../server/api';

const filtered = posts
	.filter(post => !post.hidden)
	.map(post => ({
		name: post.name,
		slug: post.slug,
		date: new Date(post.date).toISOString(),
		hidden: post.hidden,
		excerpt: post.excerpt,
		keywords: post.keywords.toArray(),
	}));

export default api({GET: async () => filtered});
