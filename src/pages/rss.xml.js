import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../lib/site';

export async function GET(context) {
	const articles = (await getCollection('blog'))
		.filter((entry) => entry.data.published === true)
		.sort((left, right) => right.data.updated.getTime() - left.data.updated.getTime());

	return rss({
		title: site.title + ' — Writing',
		description: site.description,
		site: context.site,
		items: articles.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description,
			pubDate: entry.data.updated,
			link: '/blog/' + entry.data.slug,
		})),
	});
}
