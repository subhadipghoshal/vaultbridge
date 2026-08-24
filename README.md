# Vaultbridge

This Astro website renders only explicitly published content from the separate publish vault:

    ~/vaults/publish

Your private knowledge vault remains outside the website boundary:

    ~/vaults/personal

## Use it now

1. Open the publish path above as a separate Obsidian vault.
2. Edit the featured project in portfolio/projects.
3. Set your name and eventual domain in .env.
4. Start the site with npm run dev.

## Author content

    npm run content -- new project "Project title"
    npm run content -- new article "Article title"
    npm run content -- validate
    npm run content -- list --status ready

Only documents with published: true appear in the static website.

## Verify before publishing

    npm test
    npm run check
    npm run build

The newsletter command only writes a local Markdown draft. It never sends email.
