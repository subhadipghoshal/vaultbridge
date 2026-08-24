// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const environment = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

if (environment.PUBLISH_VAULT_PATH) {
	process.env.PUBLISH_VAULT_PATH = environment.PUBLISH_VAULT_PATH;
}

export default defineConfig({
	site: environment.SITE_URL || 'http://localhost:4321',
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
	},
});
