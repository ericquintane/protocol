# NetP — Network Protocol

A standard protocol for describing social network datasets, plus the source for a web app that helps researchers fill it.

## Status

Pre-release, in active development. Target submission of the companion paper to *Network Science* (Cambridge): August–September 2026.

## What's here

- [`schema/protocol.schema.json`](schema/protocol.schema.json) — JSON Schema (draft 2020-12) defining the protocol fields, types, and validation rules. The single source of truth for both the form and any downstream tooling.
- [`examples/`](examples/) — Worked examples of filled protocols (currently Padgett's Florentine families, univariate and multivariate).
- [`examples/source/`](examples/source/) — Original Excel filled-out protocols used while developing the schema.
- [`tests/invalid/`](tests/invalid/) — Negative test fixtures the schema must reject.
- [`scripts/validate.mjs`](scripts/validate.mjs) — Node script that validates all examples and runs negative tests.
- [`paper/drafts/`](paper/drafts/) — Original docx drafts of the article and protocol description.
- [`references/`](references/) — Bibliography for the paper and test cases.
- [`PLAN.md`](PLAN.md) — Implementation plan (app + paper).

## Validate the schema

```bash
npm install
node scripts/validate.mjs
```

Expected output: all examples pass, all invalid fixtures fail.

## License

(To be chosen — likely MIT for code, CC-BY 4.0 for the protocol content. See [`PLAN.md`](PLAN.md).)
