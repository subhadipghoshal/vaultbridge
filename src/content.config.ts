import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { pathToFileURL } from 'node:url';
import { articleMetadataSchema, projectMetadataSchema, publicationVaultPath } from './lib/content';

const vaultPath = publicationVaultPath();

const blog = defineCollection({
	loader: glob({
		base: pathToFileURL(vaultPath + '/writing/blog/'),
		pattern: '**/*.md',
	}),
	schema: articleMetadataSchema,
});

const projects = defineCollection({
	loader: glob({
		base: pathToFileURL(vaultPath + '/portfolio/projects/'),
		pattern: '**/*.md',
	}),
	schema: projectMetadataSchema,
});

export const collections = { blog, projects };
