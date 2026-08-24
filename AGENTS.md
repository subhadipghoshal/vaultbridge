## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Repository boundary

- ~/vaults/personal is private knowledge. Never scan, copy, render, validate,
  or publish it from this website.
- The path in PUBLISH_VAULT_PATH is the only content source for this site.
- Only writing/blog and portfolio/projects inside the publish vault are content collections.
- tech/investigations is intentionally outside the portfolio and blog pipeline.
- A document requires published: true before a public route may exist. Missing or invalid
  metadata fails closed.

## Working method

1. Read PLAN.md before materially changing architecture.
2. Keep the publish vault separate from website source.
3. Prefer portable Markdown and YAML frontmatter.
4. Treat source_notes as local provenance only; never render or resolve it in the public site.
5. Avoid client-side JavaScript unless an interaction requires it.

## Newsletter safety

The newsletter command creates local Markdown drafts only. Do not add automatic sending,
provider calls, or API credentials to normal build, preview, or deployment workflows.

## Completion checks

    npm run content -- validate
    npm test
    npm run check
    npm run build
