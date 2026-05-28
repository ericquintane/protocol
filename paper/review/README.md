# Article review

The motivation section of the paper rests on a review of empirical social-network articles showing that descriptions of network data are typically incomplete, imprecise, and dispersed. This directory holds the methodology, codebook, and screening sheet for that review.

## Status

- **Original review (Q1 2022):** 62 articles from *Social Networks* journal, sampled across volumes from 2018–2021. Findings summarised in `paper/drafts/PROTOCOL_IDEA_DRAFT.docx`.
- **Refresh (planned for 2026):** Extend to 2022–2026 and add a second journal (*Network Science*) so the review spans both interdisciplinary outlets. Target: an additional ~60 articles. The refresh should also rescreen a small set of the original 62 against the v1 NetP schema to demonstrate how often each protocol field is reported.

## Contents

- [`methodology.md`](methodology.md) — sampling strategy and screening procedure.
- [`coding-template.md`](coding-template.md) — what to record for each article.
- [`articles.csv`](articles.csv) — the screening sheet. One row per article.

## Pulling a candidate list

```bash
# from the repo root
node scripts/fetch-articles.mjs
# or for a single journal/year range:
node scripts/fetch-articles.mjs --journal social-networks --from 2024 --to 2025
```

Writes `paper/review/articles-openalex.csv` with candidate articles from OpenAlex. You still need to screen each against the inclusion criteria; this is just the starting list.
