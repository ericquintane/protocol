# Coding template

For each article, record one of the four values below per NetP field (see `paper/review/methodology.md` for definitions):

`reported` · `partial` · `not reported` · `not applicable`

Use the same field names as in `schema/protocol.schema.json` to make aggregation trivial.

## Article identification

- `doi` — DOI of the article.
- `journal` — short name (e.g. `Social Networks`, `Network Science`).
- `year` — publication year.
- `volume`, `issue`, `pages` — bibliographic details.
- `authors` — first author et al.
- `title`.
- `included` — `yes` / `no` (with a `exclusion_reason` if `no`).

## Overview section

- `description` — Is there a one-line description of the network? (Look in the abstract and the first methods paragraph.)
- `temporal` — Is the network identified as cross-sectional or longitudinal?
- `variability` — Univariate or multivariate?
- `mode` — One-mode or two-mode?
- `number_of_waves` — Reported explicitly for longitudinal data?
- `number_of_relationships` — Reported explicitly for multivariate data?
- `dates_initial`, `dates_final`, `wave_dates` — Date or year of data collection given?
- `geographic_location` — Country (and region/city where relevant) reported?
- `associated_publication` — DOI/citation of the primary publication clear?

## Data collection

- `source_of_data` — Survey, archival, observation, etc. — explicitly named?
- `details` — Enough detail to understand the source?
- `method` — For non-archival data, is the collection method (online survey, interview, etc.) reported?

## Nodes

- `general_typology` — Top-level category of nodes (individuals, organisations, etc.).
- `detailed_typology` — Specific node type (students, cows, airports).
- `network_boundary` — Inclusion criteria stated?
- `node_exclusion` — Any post-boundary exclusion rules reported?
- `node_transformation` — Aggregations or other manipulations reported?

## Ties (record per relationship)

- `general_typology` — Borgatti top-level category clearly identifiable?
- `detailed_typology` — Specific tie type given?
- `direction` — Directed/undirected reported?
- `self_links` — Allowed or not, reported?
- `weight` — Reported, with what they represent, their range, and unit?
- `transformation` — Dichotomisation, symmetrisation, aggregation rules reported?
- `maximum_outdegree` — Any limit on outgoing ties reported?
- `name_generator` — Exact wording of the question reported?
- `type_of_name_generator` — Roster vs. free recall reported?
- `name_interpreter` — Exact wording reported?

## Statistics

- `network_size` — Reported.
- `response_rate` — For survey data, reported?
- `number_of_ties` — Reported.
- `density`, `average_path_length`, `average_degree`, `number_of_isolates`, `clustering_coefficient`, `degree_centralization`, `reciprocity`, `indegree_centralization`, `outdegree_centralization` — Each reported, partial, etc.
- `number_of_new_ties`, `number_of_lost_ties` — For longitudinal data, reported?

## Notes

- `notes` — Free-text field for anything that doesn't fit the above (e.g. ambiguities, where in the article the information was found, observations relevant to the paper).
