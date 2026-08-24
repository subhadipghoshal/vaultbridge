# Personal knowledge and publishing platform

## Decision

Use two separate vaults and one separate website project.

    ~/vaults/personal
        Private knowledge, research, journals, and working notes.

    ~/vaults/publish
        Portfolio projects, articles, newsletter-ready writing, templates, and provenance links.

    This repository
        Astro presentation layer and local content tooling.

The website reads only the publish vault. It never discovers files from the personal vault.

## Current vertical slice

The first public surface is a portfolio website. It includes a homepage, portfolio index,
portfolio case-study pages, writing archive, blog routes, metadata, RSS, sitemap, responsive
typography, source validation, and a local-only newsletter-draft command.

The content path is:

    Publish-vault Markdown
          ↓
    YAML validation
          ↓
    Astro content collections
          ↓
    Explicit published filter
          ↓
    Static portfolio and blog pages

## Content model

Portfolio projects and case studies require:

    title, slug, description, type, status, topics, published, newsletter,
    created, updated, source_notes, featured

Articles require the same fields except featured.

Lifecycle status is descriptive. Only published: true exposes content publicly.

## Linkage layer

Publish-vault frontmatter can record a private origin:

    source_notes:
      - vault: personal
        file: Tech/example-research.md

This is an author-facing pointer only. The site never resolves, reads, or renders it. Promotion
from private research to public writing is deliberate rather than an automatic sync.

## Deliberately postponed

- A newsletter provider and any email sending.
- A public digital garden for investigations.
- Automatic deployment.
- Asset processing and image galleries.
- Search, comments, analytics, memberships, and a database.

## Next implementation phase

1. Replace the starter identity in .env with your name and real domain.
2. Add real projects from the publish-vault project template.
3. Review and explicitly publish an article when ready.
4. Choose a deployment target once the site identity and content are ready.
