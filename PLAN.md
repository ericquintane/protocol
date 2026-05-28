# NetP — Implementation Plan

**Goal.** Ship two artefacts: (1) a public web app for filling the Network Protocol, with code on GitHub; (2) a paper for *Network Science* (Cambridge), targeted submission **August–September 2026**.

**Longer-term vision** (post-paper): backend repository that aggregates submitted protocols so researchers can answer questions like "what is a normal density / centralization / reciprocity for advice networks among ~100-person organizations?" The v1 schema and data format are designed so v2 can adopt them without rework.

---

## Architecture

One schema, two horizons.

```
┌─────────────────────────────────────────────────────────────┐
│  protocol.schema.json     ← single source of truth          │
│  (fields, types, conditional logic, validation rules)       │
└─────────────────────────────────────────────────────────────┘
        │                                            │
        ▼ v1 (paper-time)                            ▼ v2 (post-paper)
┌──────────────────────────┐              ┌──────────────────────────┐
│  Static web app          │              │  Backend repository      │
│  - Quarto site (docs)    │              │  - FastAPI or plumber    │
│  - JS form (interactive) │  ─submits─▶  │  - Postgres / SQLite     │
│  - igraph.js stats       │              │  - Search & compare UI   │
│  - GitHub Pages          │              │  - Network-stat dists    │
└──────────────────────────┘              └──────────────────────────┘
```

The same schema validates form input, drives form rendering, and acts as the contract between client and the (future) backend. No re-writing fields in three places.

---

## v1 deliverable scope (for the paper)

1. **Filled-protocol output** — user downloads a filled protocol as **JSON** (machine-readable), **PDF** (paper appendix), and **Markdown** (drop-in repo readme).
2. **In-browser stats computation** — user pastes or uploads an edgelist (CSV) and the app fills the Statistics section (density, avg path length, avg degree, isolates, clustering, degree/in/out centralization, reciprocity).
3. **Worked examples** — Padgett (uni- and multivariate), Halgin/Campnet, Brennecke, Troester pre-loaded as demos.
4. **Conditional form logic** — e.g. "Number of waves" only appears if Longitudinal; survey-only fields hide for archival data; one-mode hides second-mode entries.
5. **Validation** — required fields flagged; ranges checked (e.g. density ∈ [0,1]); cross-field consistency (e.g. Number of Ties ≤ N·(N−1)).
6. **Permanent URL per filled protocol** — a hash-based shareable link encoding the filled protocol in the URL (no server required for v1). Lets reviewers/readers click straight to the filled protocol from an article.

---

## Phase breakdown

### Phase 1 — Schema (week 1)
- Convert the docx protocol into `protocol.schema.json` (JSON Schema draft 2020-12).
- Encode conditional visibility (`if/then/else`), value enumerations (e.g. node-type taxonomy, tie-type taxonomy from Borgatti 2009), and validation.
- Encode the worked examples as `examples/padgett.json`, `examples/halgin.json`, etc. — these double as fixtures.

### Phase 2 — Static app (weeks 2–4)
- **Framework:** Astro + a JSON-Schema-driven form library (`@rjsf/core` or `JSONForms`). Astro keeps it static-first, ships zero JS where it can, and integrates cleanly with Quarto if we want the docs in Quarto.
- **Stats engine:** `graphology` (mature JS network library) for density, paths, clustering, centralization; or compile R/igraph to WASM via `webR` if we want exact parity with R results. Default to graphology; document any differences in the paper.
- **Outputs:** JSON, PDF (via `@react-pdf/renderer` or print stylesheet), Markdown.
- **Hosting:** GitHub Pages on the `protocol-1` repo (already initialised).

### Phase 3 — Documentation site (weeks 3–5, parallel to phase 2)
- **Quarto site** alongside the app:
  - Protocol description (lifted from `Protocol description 2021.docx`).
  - Field-by-field guide.
  - Worked examples rendered both as filled protocols and as narrative explanations (the Padgett walk-through in `PROTOCOL IDEA DRAFT.docx` is already most of the content).
  - "Cite this protocol" / "Cite the paper".

### Phase 4 — Repo polish (week 5)
- README, license (MIT or CC-BY for content, MIT for code), contribution guide.
- GitHub Actions workflow for: lint schema, run example fixtures through form, build Astro site, deploy to Pages.
- Issue templates inviting researchers to submit examples or propose new fields.

### Phase 5 — Paper for *Network Science* (weeks 4–10, overlapping)
Re-cast `PROTOCOL IDEA DRAFT.docx` into a *Network Science* article. Estimated structure:
1. **Introduction** — transparency/replicability crisis, examples of incomplete reporting in published network articles, gap.
2. **Review of the field** — refresh the 62-article review with 2022–2025 articles in *Social Networks* and *Network Science*; quantify the descriptive heterogeneity.
3. **The protocol** — five sections, design rationale, why these fields and not others.
4. **Development methodology** — the five steps (review, categories, application, expert testing, extension).
5. **Two worked examples** — Padgett (uni- and multivariate); one survey-based example (Brennecke or Troester).
6. **The web app** — companion tool, how to use it, in-browser statistics, persistent URLs.
7. **Toward a network repository** — outline the v2 vision (the "ultimate goal" — comparative meta-statistics across network types and contexts) as a coda.
8. **Conclusion + limitations** (multilevel/multilayer not yet supported, ego-networks, REM data, etc.).

Decisions to revisit during drafting:
- Do we add a *multilevel/multilayer* section to the protocol now, or flag as future work?
- Should we add a "data quality" sub-section to Statistics (e.g. proportion of missing reports for non-symmetric data)?
- Whether to invite co-authors from the testing step (the five experts) as named contributors.

### Phase 6 — v2 backend (post-paper, late 2026 / 2027)
Deliberately out of scope for v1. When you're ready:
- **API:** FastAPI (Python) or plumber (R). FastAPI has the larger web ecosystem; plumber keeps you in R. Either works.
- **DB:** SQLite to start (one file, easy to back up), Postgres later.
- **Endpoints:** submit protocol, search by filters (network type, size range, time period, geography), download all matching protocols, compute distributions of stats conditional on filters.
- **UI:** comparison dashboard showing distributions and percentile of a given network against comparable ones. This is the contribution that makes NetP a research platform, not just a reporting standard.

---

## Open decisions

1. **Multivariate/multilayer scope.** The current draft excludes multilevel/multilayer. Should v1 of the app support them, or stay aligned with the paper's scope?
2. **Co-authorship.** Are you and Claudia the only authors, or do the protocol testers get on the paper?
3. **Where to compute stats.** `graphology` (JS, fast, in-browser, slight numerical differences from igraph) vs. `webR` + igraph (R, exact match, ~30MB initial load). Lean toward graphology and document.
4. **License.** MIT for code is uncontroversial. Content (the protocol itself) likely CC-BY 4.0 so people can include it in their papers.
5. **Domain.** netprotocol.org? networkprotocol.org? something at esmt.org? Or just `quintane.github.io/protocol-1` for now.

---

## Immediate next steps (in order)

1. Drag the assets out of the Dropbox `Protocol` folder into the `protocol-1` repo: PDFs of the example articles into `references/`, Excel filled examples into `examples/source/`, the draft docx into `paper/drafts/`.
2. Draft `protocol.schema.json` (Phase 1).
3. Encode Padgett as `examples/padgett.json` against the schema as a sanity check.
4. Scaffold the Astro app and wire up the schema-driven form.
5. In parallel: start refreshing the 62-article review to cover 2022–2025 for the paper.

Open the conversation about which collaborator (or coding sub-agent) handles the app build vs. the paper drafting; both are large enough to deserve their own focus.
