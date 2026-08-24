export const site = {
	title: import.meta.env.SITE_TITLE || 'Your Name',
	description:
		'A portfolio and writing archive built from a deliberately curated Markdown vault.',
};

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

export function readingTime(body: string | undefined): number {
	const words = body ? body.trim().split(/\s+/).filter(Boolean).length : 0;
	return Math.max(1, Math.ceil(words / 220));
}

export function newestFirst<T extends { data: { updated: Date } }>(entries: T[]): T[] {
	return [...entries].sort((left, right) => right.data.updated.getTime() - left.data.updated.getTime());
}
