# NetP: A Standard Protocol for Describing Social Network Datasets

**Working draft: v0.1, 2026-05-28.** Target submission: *Network Science* (Cambridge University Press), August–September 2026. Replaces `paper/drafts/PROTOCOL_IDEA_DRAFT.docx`. Sections marked **[TODO]** await the refreshed 2022–2026 article review (see `paper/review/`).

---

## Abstract

The growth of empirical social network research has not been accompanied by a uniform way of describing the datasets that fuel it. A review of more than sixty recent articles in *Social Networks* and *Network Science* shows that descriptions of network data are typically incomplete, imprecise, and dispersed across sections of the paper, with substantial heterogeneity in what is reported and how. Such heterogeneity hinders replicability and, more critically, prevents the comparability across studies that would allow the field to develop empirical benchmarks for common network statistics. We propose the Network Protocol (NetP), a structured, standardised template for describing social network datasets. NetP is organised in five sections (overview, data collection, nodes, ties, and statistics) and applies to cross-sectional and longitudinal, one-mode and two-mode, and univariate and multivariate networks. The protocol is encoded as a public JSON Schema, accompanied by a web application that lets researchers fill it interactively, validate their entries, compute the statistics section directly from an uploaded edgelist, and download the filled protocol as an appendix to a paper. We illustrate the protocol with worked examples drawn from canonical and recent datasets, and we outline how a future repository of filled protocols would enable, for the first time, descriptive benchmarks of network statistics across contexts.

**Keywords:** social network analysis; reporting standards; replicability; data description; meta-research.

---

## 1. Introduction

Despite the rapid growth of empirical social network research over the past two decades, the field has not developed a uniform way of describing the network data on which its findings rest. Authors typically report what they consider relevant for the specific argument of their paper, in the format and the level of detail that suit it. Network details are dispersed across abstracts, methods, results, and footnotes, often mixed with article-specific arguments. As a result, the reader who wishes to understand the basic characteristics of an empirical network (its size, density, source, boundary, the wording of the name generators, the manipulations performed on the ties) must reconstruct that description from disparate fragments, when the information is reported at all.

This is problematic for two related reasons. First, replication and reuse of network data require descriptions complete enough to make the network reconstructable. A coauthorship network and a friendship network among employees may share most of their structural properties yet differ in fundamental ways that the abstract description does not surface; without a precise description of nodes, ties, boundaries, and exclusions, those differences remain invisible to the reader. Second, and perhaps more consequentially, the field lacks the descriptive baselines against which it could ask comparative questions. Social network researchers routinely report that a network has a density of 0.05, an average clustering coefficient of 0.3, or a degree centralization of 0.4. Yet they have little basis for assessing whether those values are high, low, or typical for networks of that kind, in that setting, of that size. Comparison across studies is, in practice, impossible, not because the field lacks the analytical tools, but because the descriptions of the datasets are too heterogeneous to support it.

Reporting standards have addressed analogous problems in other fields. Medical trials are reported following CONSORT [@schulz2010consort]; observational epidemiological studies follow STROBE [@vonelm2007strobe]; microarray experiments follow MIAME [@brazma2001miame]; and recent efforts have extended such standards to machine learning datasets, with datasheets [@gebru2021datasheets] and model cards [@mitchell2019model] becoming widely adopted. The common ingredient across these efforts is a structured template that surfaces a minimal, complete description of a piece of empirical work, separate from the substantive contribution of the paper that reports it. Social network research has, to date, lacked such a template.

This article proposes one. The Network Protocol (NetP) is a structured, standardised template for describing the social network datasets used in empirical articles. NetP organises the description into five sections covering an overview of the network, the data collection process, the nodes, the ties, and a minimal set of network statistics. It is designed to apply across the major variants of network data, cross-sectional and longitudinal, one-mode and two-mode, univariate and multivariate. We encode the protocol as a public JSON Schema, which serves as the single source of truth from which a web application is built; researchers can fill the protocol interactively, validate their entries against the schema, compute the statistics section directly from an uploaded edgelist, and download the filled protocol as JSON, Markdown, or PDF for inclusion as a paper appendix.

This article aims to make three contributions. First, it quantifies the heterogeneity of network descriptions across recent empirical articles in *Social Networks* and *Network Science*, providing a baseline against which the adoption of a reporting protocol can be evaluated. Second, it specifies a minimal but complete template for describing social network datasets, balancing completeness against the practical demands of filling such a template alongside a paper. Third, it provides an open, schema-driven web application that makes the protocol immediately usable, demonstrating how a structured reporting protocol can be combined with computational support without imposing additional burden on authors.

We organise the remainder of the article as follows. Section 2 quantifies the reporting gap. Section 3 specifies the protocol, walking through each of its five sections. Section 4 documents the methodology by which the protocol was developed and refined. Section 5 presents three worked examples, a univariate cross-sectional archival network (Padgett's Florentine families), a multivariate cross-sectional survey-based network (Brennecke 2020), and a multivariate longitudinal survey-based network (Tröster et al. 2019). Section 6 describes the companion web application. Section 7 outlines the natural extension of NetP into a public repository that would allow comparative statistics across thousands of filled protocols. Section 8 discusses limitations and the boundaries of what the protocol does and does not aim to cover.

---

## 2. The reporting gap

To document the variability of network descriptions in published research, we conducted a structured review of empirical articles in *Social Networks* and *Network Science*, the two general-interest journals in the field. We sampled an issue from each available volume between 2018 and 2021 in an initial review, and we extended the sample to cover 2022 through early 2026 in a refresh prepared for this article. The review covered every empirical article in each sampled issue. **[TODO: report the final article count, sampling structure, and coverage from `paper/review/`.]**

For each article, we recorded, against the fields of the NetP schema, whether the relevant information was reported, partially reported, or absent. The screening covered the entire article (abstract, methods, results, footnotes, and any supplementary material) rather than the methods section alone, because network descriptions in published articles are typically dispersed. The full procedure is documented in `paper/review/methodology.md`; the coding template is in `paper/review/coding-template.md`.

Three patterns emerge from the review. **[TODO: rewrite this paragraph and the following two once the refreshed review is complete; the patterns below are the ones identified in the 2022 review, to be confirmed or revised against 2022–2026 data.]**

First, descriptions are typically *incomplete*. Across the articles reviewed, no single article reported all fields of the NetP schema. Information about the date of data collection is reported in only a fraction of cases, geographic location in fewer still, and the wording of name generators in a minority of survey-based studies. Network statistics are reported unevenly: size and density appear in almost every article, but average path length, clustering coefficient, and degree centralization are reported far less consistently, even in articles where those statistics would have been informative.

Second, descriptions are typically *imprecise*. The choice of which subset of nodes constitutes the network (the network boundary) is often expressed in general language ("members of the department," "users of the platform") without enough specificity to allow another researcher to reconstruct the same boundary. Node and tie transformations performed in the process of building the final network are routinely under-described: aggregations, dichotomisations, exclusions of non-respondents, and imputation rules appear as brief remarks rather than as explicit specifications.

Third, descriptions are typically *dispersed*. The information that does appear in published articles is rarely concentrated in one place. A reader who wishes to determine, for example, whether a reported friendship network is directed or undirected, whether self-links are allowed, and what name generator was used must often consult three or four sections of the article, sometimes with the help of supplementary materials.

These three problems are not unique to social network research. Other fields have passed through similar reporting crises before standardised templates were adopted [@simera2010transparent]. We do not claim that the heterogeneity we document reflects negligence on the part of authors. It reflects, rather, the absence of a shared template that makes the reporting of network descriptions a routine rather than a discretionary activity.

---

## 3. The NetP protocol

The protocol is designed to provide, in one place, a complete description of a social network dataset. Its design follows three principles. First, it should be *minimal but complete*: every field should answer a specific question that is necessary for someone reading the protocol to understand the network without consulting the paper. Second, it should be *applicable across network types*: cross-sectional and longitudinal, one-mode and two-mode, univariate and multivariate. Third, it should be *fillable in a reasonable amount of time*, on the order of twenty to thirty minutes for an author who already has the relevant information at hand.

The protocol is organised in five sections: an overview, data collection, nodes, ties, and statistics, together with an additional information section for any remaining context. Some fields apply to all networks; others apply only to specific variants (for example, the number of waves applies only to longitudinal data, and the name generator applies only to survey-based data). The protocol's schema encodes these conditional applicabilities formally; a filled protocol that violates them is rejected.

### 3.1 Overview

The overview gives a reader a sense of the network's content, type, shape, and complexity. It contains eight elements: a one-line *description of the network*, the *data type* (cross-sectional or longitudinal; univariate or multivariate), the *mode* (one-mode or two-mode), the *number of waves* for longitudinal data, the *number of relationships* for multivariate data, the *dates* of data collection, the *geographic location*, and the *associated publication*.

The one-line description anchors the protocol. It should convey the kind of nodes, the kind of ties, the empirical context, and the time frame in a single, specific sentence. A description such as "a network of friendship and advice among academics in a large Italian university" is more useful than the more general "a friendship network", not because the longer version is more eloquent, but because it lets a reader gauge in seconds whether the dataset is relevant to their own work.

### 3.2 Data collection

The data collection section identifies the *source of data*, *details about the source*, and the *data collection method* used to obtain the network. The source field accepts values such as `archival`, `survey`, `observation`, `interview`, `database`, `digital trace`, or `experimental`. The details field captures contextual information: the name of the survey instrument, the archival repository, the specific organisational setting, or any larger project of which the network is a module. The method field, applicable to non-archival sources, records whether the data were collected through an online questionnaire, a pen-and-paper questionnaire, an interview, direct observation, or automated logging.

This section is the part of the protocol most heavily affected by the *imprecise* descriptions we documented in Section 2. By separating the source, its details, and the collection method into distinct fields, the protocol makes it harder to elide what is genuinely a survey-based network with a passing reference to "data we collected."

### 3.3 Nodes

A social network is composed of a set of nodes connected by at least one type of tie [@wassermanfaust1994]. Nodes can be of many different types: individuals, groups of people, organizations, animals, places, words, concepts, events. To structure node descriptions, we adopt a two-level categorisation: a *general typology* and a *detailed typology*. The general typology positions the node in a broad category (`individuals`, `organizations`, `animals`, and so on). The detailed typology specifies the node type within that category (`students`, `clans/families`, `dolphins`, `airports`). We provide an initial list of suggested values but do not enforce them as a strict vocabulary; users are free to use their own categories where the suggested set is insufficient. The two-level structure preserves enough comparability for future search and filtering, while accommodating the empirical variety of node types.

Beyond their type, nodes in a network are bounded by a decision: the *network boundary* defines which entities are eligible for inclusion. Boundaries may be set by membership in an organisation, participation in an event, presence in a set of records, or other criteria. Once a boundary has been set, researchers often exclude additional nodes for practical or theoretical reasons (e.g. non-respondents, isolates, outliers). Finally, nodes may be transformed before analysis, most commonly by aggregating multiple entities into a single node (Malpensa, Bergamo, and Linate airports might be aggregated into a single node representing Milan). The protocol asks for each of these decisions explicitly. They are part of how the final network was constructed and, as such, are part of how it should be replicated.

### 3.4 Ties

Ties are described in parallel to nodes. We build on the typology of Borgatti and colleagues [@borgatti2009network] to classify ties at the top level into *similarities*, *social relations*, *interactions*, and *flows*. Within each, a detailed typology captures specific tie types such as friendship, advice, marriage, co-membership, or email exchange. The four-category top level is treated as a controlled vocabulary in the schema; subcategories that some literatures treat as top-level (such as *kinship* or *affective*) are folded into the appropriate top-level category and recorded as part of the detailed typology, with the subcategory in parentheses ("marriage (kinship)", "friendship (affective)").

The other tie fields make explicit a set of decisions that have a direct bearing on the analysis of the network: *direction* (directed or undirected), *self-links* (whether ties from a node to itself are permitted), *weight* (whether the network is weighted and, if so, what the weights represent, their range, and their unit of measurement), *tie transformations* (dichotomisation, symmetrisation, aggregation across reports, and so on), and *maximum outdegree* (whether the number of outgoing ties per node was capped during data collection). For data obtained from surveys or interviews, three further fields record the *name generator* (the exact phrase used to elicit a list of alters), the *type of name generator* (roster or free recall), and the *name interpreter* (any follow-up question used to obtain tie-level information).

Two design choices warrant explicit mention. First, the protocol does not require an exhaustive specification of tie transformations; it requires that they be reported. The level of detail is left to the author, with the requirement that the description be precise enough for a reader to reproduce the transformation. Second, the protocol distinguishes the *raw* network described by the data collection process from the *final* network that enters the analysis. Every transformation, exclusion, or imputation that intervenes between the two is part of the description.

### 3.5 Statistics

The statistics section reports a minimal set of network measures that characterise the structure of the network. For each (relationship × wave) combination, the protocol asks for the *network size* (number of nodes), the *number of ties*, the *density*, the *average path length*, the *average degree*, the *number of isolates*, and the *clustering coefficient*. For undirected networks the protocol asks for *degree centralization*; for directed networks, for *reciprocity* and for *indegree* and *outdegree centralization*. For longitudinal data, it additionally asks for the *number of new ties* and the *number of lost ties* between consecutive waves. For surveys, it asks for the *response rate*.

Two clarifications matter for comparability. First, the protocol uses the conventional definition that the *number of ties* counts edges in undirected networks and arcs in directed networks. This convention is not universal in the published literature; we have encountered cases in which authors report the arc count for an undirected network, producing a value twice as large as the conventional one. Second, the *average degree* is computed in the standard fashion (twice the number of edges over the number of nodes for undirected networks; the number of arcs over the number of nodes for directed networks; reported separately for each mode in two-mode networks).

We acknowledge that other statistics are widely used and could in principle be included. The choice of a minimal set is deliberate: the protocol aims to describe the structure of a network completely enough to support comparison, not to anticipate every analytical question that might be asked of it. The supplementary statistics that a specific paper relies upon should be reported in that paper.

### 3.6 Conditional applicability

The protocol's fields do not all apply to every network. Cross-sectional data have no waves and no longitudinal statistics. Univariate data have a single tie set. One-mode networks have a single node set. Undirected networks have no reciprocity or in/outdegree centralization. The protocol's JSON Schema encodes these conditional applicabilities so that a filled protocol that violates them (a longitudinal network without a number of waves, a multivariate network with a single tie definition, a two-mode network with only one node set, a weighted network without a specification of what the weight represents) is rejected at validation time. The web application surfaces the appropriate subset of fields to the user based on the choices made earlier in the form.

---

## 4. Protocol development

We developed the protocol in five sequential steps, each refining the version produced by the previous step. The methodology was designed to balance two competing pressures: ensuring that the protocol covers what authors actually report in published articles, and ensuring that it remains minimal enough to be fillable in a reasonable amount of time.

**Step 1. Review of network articles.** We reviewed a sample of empirical articles in *Social Networks* spanning 2018 to 2021, with an additional refresh of 2022 to 2026 in *Social Networks* and *Network Science* for this revision. We chose these two journals because they are the general-interest outlets of the field and span a wide variety of empirical contexts. The review covered every section of each article (abstract, introduction, methods, analysis, results, footnotes, and supplementary materials) and produced a description of what information was reported about the network, in what level of detail, and in what location of the article.

**Step 2. Identifying categories.** From a detailed reading of twenty articles in the initial sample, we compiled a long list of fields that authors reported. Starting from the first article and adding any new field encountered in subsequent ones produced an initial list of twenty-nine fields. We then consolidated overlapping items, removed long-text descriptions in favour of structured fields, and grouped the remaining items into emergent categories: overview, data collection, nodes, and ties. Within each category, we added fields needed to make the category complete (for example, separating the *source of data* from the *details* about it). The result was a first version of the protocol covering the most common type of network: cross-sectional, one-mode, univariate.

**Step 3. Applying the protocol.** We applied the prototype protocol to five additional articles, with the aim of identifying fields that were ambiguous, redundant, or insufficient. This step produced a number of refinements: some fields were split (the *date* field separated into initial date, final date, and per-wave dates), some were merged, and detailed instructions were added to each field's description. The output was a fillable protocol with explicit guidance on how to complete each entry.

**Step 4. Testing the protocol.** We asked five social network researchers, none of whom had been involved in developing the protocol, to apply it to a network of their choice, either a network from a published article or a network they had collected themselves. We collected their filled protocols together with detailed comments on completeness, clarity, and usefulness. Their feedback led to additional refinements: ambiguous field descriptions were rewritten, and several edge cases (notably the treatment of weighted ties and of name generators in roster surveys) were clarified.

**Step 5. Extending the protocol.** The protocol so far was designed for cross-sectional, one-mode, univariate networks, the simplest case. In this step, we extended it to cover longitudinal, two-mode, and multivariate networks, using identical fields and descriptions where possible. We also added the statistics section, drawing on prior work on the minimal set of statistics that characterise an empirical network [@bagrow2022comparing]. The result is the v1 protocol described in Section 3.

---

## 5. Worked examples

This section illustrates the protocol with three filled examples covering distinct combinations of network type and data source. The full JSON-encoded filled protocols are available in the public repository (see Section 6); here we provide a narrative summary that walks the reader through how each section of the protocol was completed.

### 5.1 Padgett's Florentine families: a cross-sectional, archival, univariate network

The marriage network among Renaissance Florentine elite families [@padgett1993robust] is one of the most widely used datasets in social network analysis. The version available in UCINET, drawn from Breiger and Pattison's [@breiger1986cumulated] subsample of sixteen of the ninety-two families originally analysed by Padgett and Ansell, is a small, undirected network with twenty edges.

The overview section records that the network is cross-sectional and univariate, that it is one-mode, that the data span 1394–1434, that the geographic location is Florence (Tuscany, Italy), and that the associated publication is Padgett and Ansell (1993). The data collection section records that the source is archival, with details about the historical records used (in particular Dale Kent's *The Rise of the Medici*); no data collection method is recorded because the data are archival.

The nodes section records the general typology as `groups of people` and the detailed typology as `clans/families`. The network boundary is the criteria used by Padgett and Ansell to identify the Florentine political elite (members speaking in the Consulte e Practiche, members qualifying for scrutiny, or magnate status). The node exclusion records the further restriction to families with at least one marriage or economic relation and active political participation. The node transformation records that data from people sharing a last name were aggregated into a single family node.

The ties section records the general typology as `social relations` and the detailed typology as `marriage (kinship)`. We adopt this resolution because Borgatti et al.'s top-level taxonomy treats kinship as a subcategory of social relations; encoding marriage as a top-level type would conflict with that taxonomy. The ties are undirected, allow no self-links, are unweighted, were not transformed, and have no maximum outdegree limit.

The statistics section records sixteen nodes, twenty undirected edges, a density of 0.167, an average path length of 2.486, an average degree of 2.5, one isolate (the Pucci family), a clustering coefficient of 0.218, and a degree centralization of 0.267. We note that the original draft of this protocol reported a tie count of forty for this network, which corresponds to the directed arc count under a symmetric reading; the conventional undirected edge count is twenty, and we have used the latter throughout.

### 5.2 Brennecke (2020): a cross-sectional, survey-based, multivariate network

Brennecke's [@brennecke2020dissonant] study of problem-solving assistance and difficult relationships in the engineering department of an aerospace manufacturer provides a contemporary, survey-based multivariate example. The overview records that the network is cross-sectional, multivariate (two relationships), one-mode, with no specific dates or geographic location reported in the published article (recorded as `unknown` in the protocol). The data collection records that the source is a survey administered through an online instrument, with details about the empirical setting.

The nodes section records that the nodes are individuals (employees), with the network boundary defined as membership in the engineering department, and that non-respondents (all of whom were of low hierarchical rank) were excluded from the network. The ties section is filled twice, once for each relationship. The first relationship, problem-solving assistance, is categorised as an interaction; the second, difficult relationships, is categorised as a social relation with the detailed typology `difficult relationships (affective)`. Both are directed, allow no self-links, are unweighted, and were transformed by excluding ties to non-respondents. For each relationship, the protocol records the exact name generator used in the survey and the type of generator (a roster of departmental colleagues).

The statistics section is filled separately for each relationship. The problem-solving network has 171 nodes, 1,663 arcs, a density of 0.057, an average degree of 9.725, and a reciprocity of 0.275; the difficult-relationships network has 171 nodes, 413 arcs, a density of 0.014, an average degree of 2.415, and a reciprocity of 0.102. The response rate, 0.72, is recorded once per relationship.

This example illustrates two features of the protocol. First, the cleanness with which a multivariate network is represented: the ties and statistics sections accept multiple entries, one per relationship, without altering the structure of the rest of the protocol. Second, the explicit recording of *unknown* values: the original article does not report the date or geographic location of data collection, and the protocol surfaces this absence rather than letting it disappear. We return to this design choice in Section 8.

### 5.3 Tröster, Parker, van Knippenberg, and Sahlmüller (2019): a longitudinal, survey-based, multivariate network

Tröster and colleagues' [@troster2019coevolution] study of advice and friendship ties across eight Dutch healthcare organisations over three waves illustrates the protocol's coverage of longitudinal data. The overview records that the network is longitudinal with three waves, multivariate with two relationships, and one-mode, with the country recorded as Netherlands and the waves separated by approximately four months. The data collection records the survey method together with details of the eight organisations sampled.

The nodes section records the same node types as in the Brennecke example, with the network boundary defined as membership in any of the eight organisations. The node transformation field records that structural zeros were used in the first wave for individuals who appeared in subsequent waves but not the first. The ties section records two relationships, both directed and unweighted: advice, categorised as an interaction, and friendship, categorised as a social relation with the detailed typology `friendship (affective)`. Each relationship records the exact name generator and an extensive tie transformation: missing network data were imputed using the standard Siena procedure (carrying forward the last available value or imputing zero), and structural zeros were added for ties between individuals in different organisations.

The statistics section is filled separately for each (relationship × wave) combination, producing six entries. For each, the protocol records the network size, the response rate, the number of arcs, the density, and the average degree; for the second and third waves, the protocol additionally records the number of new ties and the number of lost ties relative to the previous wave. The longitudinal change information is reported explicitly rather than left to be inferred from the cross-sectional statistics.

This example illustrates how the protocol scales to longitudinal multivariate data without changing its structure. The same five sections, the same field definitions, and the same validation rules apply. What changes is the number of entries in the ties and statistics arrays.

---

## 6. The NetP web application

The protocol is encoded as a public JSON Schema (`schema/protocol.schema.json`), distributed alongside this paper. The schema serves as the single source of truth for the protocol's field definitions, conditional applicabilities, value constraints, and validation rules. The schema is the basis from which the companion web application (https://ericquintane.github.io/protocol/) is built.

The application is a static, schema-driven form. It renders the protocol as a structured form, validates entries against the schema as the user fills it, saves drafts locally in the browser, and lets the user download the filled protocol as JSON (machine-readable), Markdown (drop-in appendix), or PDF (via the browser's native print-to-PDF). The form is automatically simplified based on the user's choices: longitudinal-only fields appear only when the data are declared longitudinal; survey-only fields appear only when the data source is survey or interview; the second mode appears only when the network is declared two-mode. The form pre-loads the worked examples from Section 5 so that users can inspect, modify, and re-download them.

A central feature of the application is the in-browser computation of the statistics section from an uploaded edgelist. The user uploads a CSV file with at least two columns (source and target), selects the relationship and wave to which the edgelist corresponds, and the application computes the network size, density, average path length, average degree, number of isolates, clustering coefficient, degree centralization (for undirected networks) or reciprocity and in/outdegree centralization (for directed networks). The computed values are inserted into the form's statistics section, where the user can review and edit them before downloading the filled protocol. The computation runs entirely in the browser; no data are uploaded to a server. This design choice has two consequences worth flagging: it preserves data confidentiality (the edgelist never leaves the user's machine), and it enables the application to scale to any number of users without server costs.

All code is open and available on GitHub (https://github.com/ericquintane/protocol). The validation rules are implemented by the same JSON Schema that the application consumes, so that any researcher can validate a filled protocol against the schema independently of the application.

---

## 7. Toward a comparative network repository

A standardised protocol is a precondition for, but not the same thing as, a public repository of filled protocols. The value of a repository would lie in two complementary uses. First, it would enable researchers to *find* networks relevant to their work: a query such as "directed advice networks among employees in organisations of 50–200 individuals, collected between 2010 and 2025" is currently impossible to answer in a systematic way. A repository indexed on the structured fields of NetP would make such queries straightforward. Second, and more consequentially, a repository would enable *comparative* questions about network statistics. Faced with a reported density of 0.05 in an advice network of 100 employees, a researcher would be able to compare it against the distribution of densities in similar networks deposited in the repository, and to assess whether that value is typical, high, or low. Such comparisons are the foundation of meta-research in other empirical fields; social network research has, so far, lacked them.

The technical roadmap from the v1 protocol and application to such a repository is relatively short. A backend service that accepts submissions of filled protocols, stores them in a structured database indexed on the schema's fields, exposes a search interface, and computes comparative distributions of statistics conditional on user-specified filters would build directly on the existing schema and the existing application. The schema, designed from the outset to be machine-readable and to encode the conditional applicability of fields, removes most of the engineering work that would otherwise be required to construct such a repository.

The harder challenge is adoption. A repository of filled protocols becomes useful only when a substantial number of filled protocols have been deposited. The most plausible route to adoption is journal and field-level endorsement: a structured protocol becomes a recommended (or required) submission alongside an empirical network paper, in the same way that data and code deposit has become a recommended practice. We anticipate that the relatively modest burden of filling the protocol (twenty to thirty minutes for an author who has the relevant information at hand, supported by the application's automatic statistics computation) makes such an adoption plausible.

---

## 8. Discussion and limitations

The protocol is, by design, minimal rather than exhaustive. We have prioritised the description of features that are nearly universally relevant to empirical network research, at the cost of features that are relevant to a subset of studies. Three limitations follow from this choice and are worth making explicit.

First, the protocol does not yet cover *multilevel* or *multilayer* networks, in the technical sense in which those terms are used in the recent literature [@kivela2014multilayer]. Multilevel and multilayer networks involve dependencies across types of nodes or across layers of ties that the current schema does not represent. Extending the protocol to cover these cases is a natural next step. We have left it out of the v1 schema both because the conventions in the literature are still consolidating and because adding it now would have increased the complexity of the protocol without serving the majority of empirical applications.

Second, the protocol does not provide specialised fields for *ego-network* data, which differ from full-network data in important ways: the boundary is set per ego, the ties are typically described from the ego's perspective, and the relevant statistics are local rather than global. The v1 protocol can be used to describe an ego-network dataset, but the result is less structured than what a dedicated ego-network protocol would produce. A specialised extension is on the roadmap.

Third, the protocol does not currently handle *relational event* data (sequences of time-stamped interactions among a set of actors) in their native form. The protocol can describe a network that has been aggregated from a sequence of relational events, but the loss of information from aggregation is itself a topic of methodological concern [@stadtfeld2017dynamic; @butts2008rem]. A relational-event extension would record the original event sequence as well as the rules by which it was aggregated, separating description of the events from description of the network derived from them.

Beyond these scope limitations, the design of the protocol involved deliberate tradeoffs that warrant brief discussion. The two-level typology for nodes and ties balances comparability against descriptive freedom: a strict controlled vocabulary would have made cross-protocol search more reliable, while a free-text field would have accommodated unusual node and tie types. The chosen middle ground (a recommended general typology with a free-text detailed typology) privileges the practicality of filling the protocol over the strictness of subsequent search, on the assumption that adoption is the binding constraint. Similarly, the protocol legitimises the explicit reporting of *unknown* values for fields that were not reported in the source article; this is a deliberate design choice that surfaces missing information rather than hiding it, and we expect it to make the structural patterns of under-reporting more visible than they currently are.

---

## 9. Conclusion

The growth of empirical social network research has outpaced the development of a uniform way to describe the datasets on which that research depends. We have proposed NetP, a structured protocol for describing social network datasets, encoded as a public JSON Schema and supported by an open web application. The protocol is minimal but complete, applies across the major variants of network data, and is fillable in a reasonable amount of time. Its adoption would not solve every problem facing empirical network research, but it would address the most pressing one: the absence of a shared template for describing the networks that the field studies. Beyond replicability, a standardised protocol opens the door to a comparative form of meta-research that the field currently lacks. The Network Protocol is a first step.

---

## References

**[TODO: convert to the journal's preferred reference format. Below is a working list of citations referenced above; full bibliographic entries to be added.]**

- Bagrow, J. P., et al. (2022). On comparing social network statistics across datasets. *Applied Network Science*, 7.
- Borgatti, S. P., Mehra, A., Brass, D. J., & Labianca, G. (2009). Network analysis in the social sciences. *Science*, 323(5916), 892–895.
- Brazma, A., et al. (2001). Minimum information about a microarray experiment (MIAME). *Nature Genetics*, 29(4), 365–371.
- Breiger, R. L., & Pattison, P. E. (1986). Cumulated social roles. *Social Networks*, 8(3), 215–256.
- Brennecke, J. (2020). Dissonant ties in intraorganizational networks. *Academy of Management Journal*, 63(3), 743–778.
- Butts, C. T. (2008). A relational event framework for social action. *Sociological Methodology*, 38(1), 155–200.
- Gebru, T., et al. (2021). Datasheets for datasets. *Communications of the ACM*, 64(12), 86–92.
- Kivelä, M., et al. (2014). Multilayer networks. *Journal of Complex Networks*, 2(3), 203–271.
- Mitchell, M., et al. (2019). Model cards for model reporting. *FAccT 2019*, 220–229.
- Padgett, J. F., & Ansell, C. K. (1993). Robust action and the rise of the Medici. *American Journal of Sociology*, 98(6), 1259–1319.
- Schulz, K. F., Altman, D. G., & Moher, D. (2010). CONSORT 2010 Statement. *BMJ*, 340, c332.
- Simera, I., et al. (2010). Transparent and accurate reporting. *Journal of Internal Medicine*, 267(5), 444–456.
- Stadtfeld, C., Hollway, J., & Block, P. (2017). Dynamic network actor models. *Sociological Methodology*, 47(1), 1–40.
- Tröster, C., Parker, A., van Knippenberg, D., & Sahlmüller, B. (2019). The coevolution of social networks and thoughts of quitting. *Academy of Management Journal*, 62(1), 22–43.
- von Elm, E., et al. (2007). The STROBE statement. *Annals of Internal Medicine*, 147(8), 573–577.
- Wasserman, S., & Faust, K. (1994). *Social network analysis*. Cambridge University Press.

---

## Appendices

**Appendix A. Full v1 NetP schema.** Reproduced from `schema/protocol.schema.json`.

**Appendix B. Worked example: Padgett (univariate).** Reproduced from `examples/padgett-marriage.json`.

**Appendix C. Worked example: Brennecke (multivariate).** Reproduced from `examples/brennecke.json`.

**Appendix D. Worked example: Tröster et al. (longitudinal).** Reproduced from `examples/troester.json`.

**[TODO: include the schema, examples, and review tables either inline or as supplementary materials depending on the journal's preference.]**
