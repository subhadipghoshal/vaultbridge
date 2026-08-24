import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';

export const lifecycleStatuses = [
	'idea',
	'draft',
	'review',
	'ready',
	'published',
	'archived',
] as const;

const commonMetadataSchema = z.object({
	title: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case slug.'),
	description: z.string().min(20).max(180),
	status: z.enum(lifecycleStatuses),
	topics: z.array(z.string().min(1)).default([]),
	published: z.boolean().default(false),
	newsletter: z.boolean().default(false),
	created: z.coerce.date(),
	updated: z.coerce.date(),
	source_notes: z
		.array(
			z.object({
				vault: z.string().min(1),
				file: z.string().min(1),
			}),
		)
		.default([]),
});

export const articleMetadataSchema = commonMetadataSchema.extend({
	type: z.literal('article'),
});

export const projectMetadataSchema = commonMetadataSchema.extend({
	type: z.enum(['project', 'case-study']),
	featured: z.boolean().default(false),
});

export const contentMetadataSchema = z.discriminatedUnion('type', [
	articleMetadataSchema,
	projectMetadataSchema,
]);

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
export type ContentKind = ContentMetadata['type'];

export interface ContentFile {
	body: string;
	filePath: string;
	metadata: ContentMetadata;
}

export class ContentValidationError extends Error {
	constructor(
		public readonly filePath: string,
		message: string,
	) {
		super(message);
		this.name = 'ContentValidationError';
	}
}

export function publicationVaultPath(environment = process.env): string {
	const vaultPath = environment.PUBLISH_VAULT_PATH;

	if (!vaultPath) {
		throw new Error(
			'PUBLISH_VAULT_PATH is required. Copy .env.example to .env and set it to the publish vault.',
		);
	}

	return resolve(vaultPath);
}

export function contentDirectory(vaultPath: string, kind: 'article' | 'project'): string {
	return kind === 'article'
		? join(vaultPath, 'writing', 'blog')
		: join(vaultPath, 'portfolio', 'projects');
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function markdownFiles(directory: string): Promise<string[]> {
	if (!(await fileExists(directory))) {
		return [];
	}

	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				return markdownFiles(entryPath);
			}

			return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
		}),
	);

	return files.flat();
}

export async function readContentFile(filePath: string): Promise<ContentFile> {
	const source = await readFile(filePath, 'utf8');
	const parsed = matter(source);
	const result = contentMetadataSchema.safeParse(parsed.data);

	if (!result.success) {
		const issueList = result.error.issues
			.map((issue) => issue.path.join('.') + ': ' + issue.message)
			.join('; ');
		throw new ContentValidationError(filePath, issueList);
	}

	return {
		body: parsed.content.trim(),
		filePath,
		metadata: result.data,
	};
}

export async function scanContent(vaultPath: string): Promise<ContentFile[]> {
	const directories = [
		contentDirectory(vaultPath, 'article'),
		contentDirectory(vaultPath, 'project'),
	];
	const files = (await Promise.all(directories.map(markdownFiles))).flat();
	return Promise.all(files.map(readContentFile));
}

export function publishedContent(entries: ContentFile[]): ContentFile[] {
	return entries.filter((entry) => entry.metadata.published === true);
}

export function filenameForTitle(title: string, fallbackPrefix: string): string {
	const slug = title
		.toLocaleLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return slug || fallbackPrefix + '-' + new Date().toISOString().replace(/[:.]/g, '-');
}

export function displayTitleFromSlug(slug: string): string {
	return slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export function dateStamp(date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

export function sourceLabel(filePath: string): string {
	return basename(filePath, '.md');
}
