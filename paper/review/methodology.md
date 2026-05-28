# Review methodology

## Aim

Quantify, across recent empirical social-network articles, the extent to which the information captured by each NetP field is reported in published descriptions of the network data. The output is two-fold:

1. A descriptive summary that motivates the protocol (the introduction of the paper).
2. A per-field "reporting rate" table that the paper can use to argue which fields are most needed and which are already well-reported.

## Inclusion criteria

- **Journals:** *Social Networks* (Elsevier) and *Network Science* (Cambridge). Add other journals only if needed to balance coverage across disciplines.
- **Years:** 2022–2026 (the refresh). The original 2018–2021 review is summarised separately.
- **Article type:** Empirical articles only. An article is empirical if it analyses or describes at least one real-world social network dataset (not synthetic). Methodological articles, reviews, and editorials are excluded unless they centrally analyse a real network.
- **Network type:** Any social network (one-mode, two-mode, cross-sectional, longitudinal, univariate, multivariate). Inter-organisational and animal social networks are included.

## Sampling

For each journal-year combination, draw a random sample of one full issue/volume (or the equivalent number of articles if the journal does not use issues). All empirical articles in the sampled issue are reviewed, regardless of topic.

## Screening procedure

For each article, two reviewers independently complete the [coding template](coding-template.md). Disagreements are resolved by discussion. Articles where neither reviewer can identify the relevant information for a given field are marked `not reported`.

The review is done against the *full* article (abstract, methods, analysis, footnotes, supplementary material) — not only the methods section, since network descriptions are typically scattered.

## Comparison with the v1 NetP schema

Use the same field labels as `schema/protocol.schema.json`. For each field in the schema, the screening sheet records one of:

- `reported` — the article gives the information unambiguously.
- `partial` — the article gives some of the information; specify what is missing in the notes.
- `not reported` — the article does not provide the information.
- `not applicable` — the article's network type makes the field meaningless (e.g. wave statistics for cross-sectional data).

The proportion `reported / (reported + partial + not reported)` for each field gives the "reporting rate" used in the paper.

## Data outputs

- [`articles.csv`](articles.csv): one row per article. Columns include identifiers (DOI, journal, year, authors, title), inclusion/exclusion decision, and one column per NetP field with the value above.
- Aggregated reporting rates are computed in an R script (to be added).
