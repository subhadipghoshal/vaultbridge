import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import {
	contentDirectory,
	dateStamp,
	displayTitleFromSlug,
	filenameForTitle,
	publicationVaultPath,
	publishedContent,
	scanContent,
} from '../src/lib/content';

function loadLocalEnvironment(): void {
	if (process.env.PUBLISH_VAULT_PATH) {
		return;
	}

	try {
		process.loadEnvFile(resolve(process.cwd(), '.env'));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw error;
		}
	}
}

function usage(): string {
	return [
		'Usage:',
		'  npm run content -- new article [title]',
		'  npm run content -- new project [title]',
		'  npm run content -- validate',
		'  npm run content -- list [--status status]',
		'  npm run content -- preview',
		'  npm run content -- newsletter draft <slug>',
	].join('\n');
}

function templateFor(kind: 'article' | 'project', title: string, slug: string): string {
	const today = dateStamp();
	const common = [
		'---',
		'title: ' + JSON.stringify(title),
		'slug: ' + slug,
		'description: Replace this with a concise description of at least twenty characters.',
		'type: ' + kind,
		'status: draft',
		'topics: []',
		'published: false',
		'newsletter: false',
		'created: ' + today,
		'updated: ' + today,
		'source_notes: []',
	];

	if (kind === 'project') {
		common.push('featured: false');
	}

	const sections =
		kind === 'article'
			? ['# Hook', '', '# Context', '', '# Main argument', '', '# Tradeoffs', '', '# Conclusion', '']
			: [
					'# Context',
					'',
					'# Problem',
					'',
					'# Constraints',
					'',
					'# Architecture',
					'',
					'# Key decisions',
					'',
					'# Tradeoffs',
					'',
					'# Impact',
					'',
					'# Lessons',
					'',
				];

	return [...common, '---', '', ...sections].join('\n');
}

async function createContent(kind: 'article' | 'project', requestedTitle?: string): Promise<void> {
	const vaultPath = publicationVaultPath();
	const fallback = kind === 'article' ? 'untitled-article' : 'untitled-project';
	const slug = filenameForTitle(requestedTitle || '', fallback);
	const title = requestedTitle?.trim() || displayTitleFromSlug(slug);
	const directory = contentDirectory(vaultPath, kind);
	const destination = join(directory, slug + '.md');

	await mkdir(directory, { recursive: true });
	await writeFile(destination, templateFor(kind, title, slug), { encoding: 'utf8', flag: 'wx' });
	console.log('Created ' + destination);
}

async function validateContent(): Promise<void> {
	const entries = await scanContent(publicationVaultPath());
	const publicCount = publishedContent(entries).length;
	console.log('Validated ' + entries.length + ' content file(s); ' + publicCount + ' marked for publication.');
}

async function listContent(arguments_: string[]): Promise<void> {
	const statusIndex = arguments_.indexOf('--status');
	const status = statusIndex === -1 ? undefined : arguments_[statusIndex + 1];

	if (statusIndex !== -1 && !status) {
		throw new Error('The --status option requires a lifecycle value.');
	}

	const entries = await scanContent(publicationVaultPath());
	const matchingEntries = entries.filter((entry) => !status || entry.metadata.status === status);

	for (const entry of matchingEntries) {
		console.log(
			entry.metadata.type +
				'\t' +
				entry.metadata.status +
				'\t' +
				(entry.metadata.published ? 'public' : 'private') +
				'\t' +
				entry.metadata.slug,
		);
	}
}

async function createNewsletterDraft(slug: string | undefined): Promise<void> {
	if (!slug) {
		throw new Error('Provide the article slug: npm run content -- newsletter draft <slug>');
	}

	const entry = (await scanContent(publicationVaultPath())).find(
		(candidate) => candidate.metadata.type === 'article' && candidate.metadata.slug === slug,
	);

	if (!entry) {
		throw new Error('No article exists with slug "' + slug + '".');
	}

	if (!entry.metadata.newsletter) {
		throw new Error('Set newsletter: true in the article before creating a newsletter draft.');
	}

	const outputDirectory = join(process.cwd(), 'newsletter-drafts');
	await mkdir(outputDirectory, { recursive: true });
	const outputPath = join(outputDirectory, slug + '.md');
	const output = ['# ' + entry.metadata.title, '', entry.body, ''].join('\n');
	await writeFile(outputPath, output, 'utf8');
	console.log('Created local newsletter draft at ' + outputPath + '. No email was sent.');
}

function preview(): Promise<void> {
	return new Promise((resolvePreview, rejectPreview) => {
		const child = spawn('npm', ['run', 'dev'], { cwd: process.cwd(), stdio: 'inherit' });

		child.once('error', rejectPreview);
		child.once('exit', (code) => {
			if (code === 0) {
				resolvePreview();
				return;
			}

			rejectPreview(new Error('Preview process exited with code ' + (code ?? 'unknown') + '.'));
		});
	});
}

async function main(): Promise<void> {
	loadLocalEnvironment();
	const [command, ...arguments_] = process.argv.slice(2);

	if (command === 'new') {
		const [kind, ...titleParts] = arguments_;
		if (kind !== 'article' && kind !== 'project') {
			throw new Error('Choose article or project.\n\n' + usage());
		}
		await createContent(kind, titleParts.join(' '));
		return;
	}

	if (command === 'validate') {
		await validateContent();
		return;
	}

	if (command === 'list') {
		await listContent(arguments_);
		return;
	}

	if (command === 'preview') {
		await preview();
		return;
	}

	if (command === 'newsletter' && arguments_[0] === 'draft') {
		await createNewsletterDraft(arguments_[1]);
		return;
	}

	throw new Error(usage());
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
