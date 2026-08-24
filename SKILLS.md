# Repository skills

## Markdown content modeling

Use plain Markdown for bodies and YAML frontmatter for structured metadata. Content should
remain legible in Obsidian, Neovim, VS Code, GitHub, and another static-site tool.

## Publishing safety

The Astro collections load only two directories in the publish vault:

- writing/blog
- portfolio/projects

The page layer must filter on published === true. Do not replace this with a status-only
filter or broad vault scan.

## Content CLI

The local TypeScript CLI supports:

    npm run content -- new article "Title"
    npm run content -- new project "Title"
    npm run content -- validate
    npm run content -- list --status ready
    npm run content -- preview
    npm run content -- newsletter draft article-slug

Newsletter drafts are local files under newsletter-drafts. They never send email.

## Portfolio case studies

Use these headings when they help a reader understand the work:

    Context
    Problem
    Constraints
    Architecture
    Key decisions
    Tradeoffs
    Impact
    Lessons

## Private-source provenance

source_notes may point back to private research. Keep the published piece self-contained and
never expose its provenance links on the public site.
