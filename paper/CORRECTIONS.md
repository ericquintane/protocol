# Corrections to apply when revising the paper draft

Issues caught during the schema/example encoding pass (2026-05-28). To be folded into the next manuscript revision.

## 1. Padgett marriage network tie count

**Location:** Example 1 table in `PROTOCOL_IDEA_DRAFT.docx`, Statistics section, "Number of Ties" row.

**Current text:** "Number of Ties: 40"

**Correct value:** 20 (undirected edges).

**Why:** The Padgett marriage network in UCINET is undirected with 16 nodes. The reported density of 0.167 implies `ties / (16 · 15 / 2) = 20 / 120 = 0.167`. The figure of 40 corresponds to the arc count (i.e. each undirected edge counted in both directions), which is the convention for directed networks. The protocol's "Number of Ties" field is defined as edges for undirected networks and arcs for directed networks, so 20 is correct here.

**Action:** Update the value in the example table; consider adding a footnote clarifying the edges-vs-arcs convention.

## 2. Tie typology levels mixed across docx examples

**Location:** Example 1 table, Ties section, "Type of Relationship" rows.

**Current text:**
- General: "Kinship"
- Detailed: "Marriage"

**Issue:** "Kinship" is a second-level subcategory under Borgatti et al. (2009)'s top-level category "Social relations". The protocol distinguishes top-level and second-level typologies; the docx example collapses them, which would make the protocol's two-level structure look optional.

**Recommended encoding (as adopted in `examples/padgett-marriage.json`):**
- General: "social relations"
- Detailed: "marriage (kinship)"

**Action:** Update the example table to use Borgatti's four top-level categories consistently. Add the parenthetical-subcategory convention to the protocol description.

## 3. Filled examples that report "Can't tell" for fields

**Observation:** The original filled examples for Brennecke, Tröster, etc. record "Can't tell" or "NA" for fields like Date and Geographic Location when the source articles do not report them.

**Decision:** The schema now accepts the literal string `unknown` for date fields. The honest signal that information is missing is part of the protocol's value proposition — surfacing what *isn't* reported in published articles. The paper should call this out as a feature: filled protocols expose missing information rather than hiding it under handwave language.

**Action:** Add a short subsection in the paper noting that the protocol legitimises and standardises the reporting of *missing* information, with `unknown` as the canonical placeholder.
