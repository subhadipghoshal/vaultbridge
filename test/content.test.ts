import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import {
	ContentValidationError,
	publishedContent,
	scanContent,
} from '../src/lib/content';

const execute = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, '..');

function articleSource(options: {
	slug: string;
	published?: boolean;
	newsletter?: boolean;
	description?: string;
}): string {
	return [
		'---',
		'title: ' + options.slug,
		'slug: ' + options.slug,
		'description: ' + (options.description ?? 'A sufficiently detailed description for this test document.'),
		'type: article',
		'status: ready',
		'topics: []',
		'published: ' + (options.published ?? false),
		'newsletter: ' + (options.newsletter ?? false),
		'created: 2026-08-24',
		'updated: 2026-08-24',
		'source_notes: []',
		'---',
		'',
		'# Test article',
		'',
		'Body for a test article.',
	].join('\n');
}

async function createPublishVault(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'publish-vault-'));
	await mkdir(join(root, 'writing', 'blog'), { recursive: true });
	await mkdir(join(root, 'portfolio', 'projects'), { recursive: true });
	return root;
}

test('only explicitly published content is selected for public output', async (t) => {
	const vault = await createPublishVault();
	t.after(() => rm(vault, { recursive: true, force: true }));

	await writeFile(
		join(vault, 'writing', 'blog', 'public.md'),
		articleSource({ slug: 'public', published: true }),
	);
	await writeFile(
		join(vault, 'writing', 'blog', 'draft.md'),
		articleSource({ slug: 'draft', published: false }),
	);

	const entries = await scanContent(vault);
	assert.deepEqual(
		publishedContent(entries).map((entry) => entry.metadata.slug),
		['public'],
	);
});

test('a private-vault file is never scanned as publishable content', async (t) => {
	const root = await mkdtemp(join(tmpdir(), 'vault-boundary-'));
	const publishVault = join(root, 'publish');
	const privateVault = join(root, 'personal');
	t.after(() => rm(root, { recursive: true, force: true }));

	await mkdir(join(publishVault, 'writing', 'blog'), { recursive: true });
	await mkdir(join(publishVault, 'portfolio', 'projects'), { recursive: true });
	await mkdir(privateVault, { recursive: true });
	await writeFile(join(privateVault, 'PRIVATE-SENTINEL.md'), 'Never publish this private note.');
	await writeFile(
		join(publishVault, 'writing', 'blog', 'public.md'),
		articleSource({ slug: 'public', published: true }),
	);

	const entries = await scanContent(publishVault);
	assert.equal(entries.length, 1);
	assert.equal(entries[0]?.body.includes('PRIVATE-SENTINEL'), false);
});

test('invalid metadata in the publish vault fails closed', async (t) => {
	const vault = await createPublishVault();
	t.after(() => rm(vault, { recursive: true, force: true }));

	await writeFile(
		join(vault, 'writing', 'blog', 'invalid.md'),
		articleSource({ slug: 'Invalid slug' }),
	);

	await assert.rejects(
		() => scanContent(vault),
		(error: unknown) =>
			error instanceof ContentValidationError &&
			error.filePath.endsWith('/invalid.md') &&
			error.message.includes('slug'),
	);
});

test('newsletter drafts are local Markdown files and report no email delivery', async (t) => {
	const vault = await createPublishVault();
	const workingDirectory = await mkdtemp(join(tmpdir(), 'newsletter-draft-'));
	t.after(() => Promise.all([rm(vault, { recursive: true, force: true }), rm(workingDirectory, { recursive: true, force: true })]));

	await writeFile(
		join(vault, 'writing', 'blog', 'newsletter-item.md'),
		articleSource({ slug: 'newsletter-item', newsletter: true }),
	);

	const result = await execute(
		process.execPath,
		[
			'--import',
			join(projectRoot, 'node_modules', 'tsx', 'dist', 'loader.mjs'),
			join(projectRoot, 'scripts', 'content.ts'),
			'newsletter',
			'draft',
			'newsletter-item',
		],
		{
			cwd: workingDirectory,
			env: { ...process.env, PUBLISH_VAULT_PATH: vault },
		},
	);

	const draft = await readFile(join(workingDirectory, 'newsletter-drafts', 'newsletter-item.md'), 'utf8');
	assert.match(result.stdout, /No email was sent/);
	assert.match(draft, /Body for a test article/);
});
