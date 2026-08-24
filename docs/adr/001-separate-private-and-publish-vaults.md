# ADR 001: Separate private and publish vaults

## Status

Accepted.

## Context

The personal knowledge store contains unfinished, private, and sensitive material. A portfolio
and blog need an intentionally small, reviewable public-content source.

## Decision

Keep ~/vaults/personal private. Create ~/vaults/publish as a
separate Obsidian vault for publishable originals. The Astro site reads only the publish vault's
portfolio and blog directories. A source_notes field provides optional author-only provenance.

## Consequences

Private notes cannot become website input through a missed exclusion rule. Publishing requires
an explicit promotion step, which adds small manual effort but keeps the boundary understandable.
The investigation archive is available in the publish vault without becoming portfolio content.
