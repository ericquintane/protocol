// Render a filled NetP protocol as Markdown suitable for inclusion as a paper appendix.

export interface Protocol {
  schema_version?: string;
  dataset_doi?: string;
  overview?: any;
  data_collection?: any;
  nodes?: any[];
  ties?: any[];
  statistics?: any[];
  additional_information?: string;
}

function escape(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (Array.isArray(value)) return value.map(escape).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function row(label: string, value: unknown): string | null {
  if (value == null || value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;
  return `| ${escape(label)} | ${escape(value)} |`;
}

function table(rows: (string | null)[]): string {
  const filtered = rows.filter((r): r is string => r != null);
  if (filtered.length === 0) return "_(no information recorded for this section)_";
  return ["| Field | Value |", "| ----- | ----- |", ...filtered].join("\n");
}

export function serializeProtocolToMarkdown(p: Protocol): string {
  const out: string[] = [];
  const title = p.overview?.description ?? "Network description (NetP)";
  out.push(`# Network Protocol — ${title}`);
  out.push("");
  if (p.dataset_doi) out.push(`**Dataset DOI:** ${p.dataset_doi}`, "");
  if (p.schema_version) out.push(`_Filled against NetP schema v${p.schema_version}._`, "");

  // Overview
  out.push("## Overview");
  const overview = p.overview ?? {};
  const dataType = overview.data_type ?? {};
  const dates = overview.dates ?? {};
  const geo = overview.geographic_location ?? {};
  out.push(
    table([
      row("Description", overview.description),
      row("Temporal", dataType.temporal),
      row("Variability", dataType.variability),
      row("Mode", overview.mode),
      row("Number of waves", overview.number_of_waves),
      row("Number of relationships", overview.number_of_relationships),
      row("Initial date", dates.initial_date),
      row("Final date", dates.final_date),
      row("Wave dates", dates.wave_dates),
      row("Country", geo.country),
      row("Region", geo.region),
      row("City", geo.city),
      row("Associated publication", overview.associated_publication)
    ])
  );
  out.push("");

  // Data collection
  out.push("## Data collection");
  const dc = p.data_collection ?? {};
  out.push(
    table([
      row("Source of data", dc.source_of_data),
      row("Details", dc.details),
      row("Method", dc.method)
    ])
  );
  out.push("");

  // Nodes
  out.push("## Nodes");
  const nodes = p.nodes ?? [];
  nodes.forEach((n, i) => {
    if (nodes.length > 1) out.push(`### Mode ${i + 1}`);
    out.push(
      table([
        row("General typology", n.general_typology),
        row("Detailed typology", n.detailed_typology),
        row("Network boundary", n.network_boundary),
        row("Node exclusion", n.node_exclusion),
        row("Node transformation", n.node_transformation)
      ])
    );
    out.push("");
  });

  // Ties
  out.push("## Ties");
  const ties = p.ties ?? [];
  ties.forEach((t) => {
    const label = t.label ?? "(unnamed)";
    const generalDetailed = [t.general_typology, t.detailed_typology].filter(Boolean).join(" / ");
    out.push(`### Relationship: ${label} (${generalDetailed})`);
    const weight = t.weight ?? {};
    out.push(
      table([
        row("Direction", t.direction),
        row("Self-links allowed", t.self_links),
        row("Weighted", weight.has_weight),
        row("Weight represents", weight.represents),
        row("Weight range", weight.range),
        row("Weight unit", weight.unit),
        row("Transformation", t.transformation),
        row("Maximum outdegree", t.maximum_outdegree),
        row("Name generator", t.name_generator),
        row("Type of name generator", t.type_of_name_generator),
        row("Name interpreter", t.name_interpreter)
      ])
    );
    out.push("");
  });

  // Statistics
  out.push("## Statistics");
  const stats = p.statistics ?? [];
  stats.forEach((s) => {
    out.push(`### ${s.relationship ?? "(unnamed)"}, wave ${s.wave ?? 1}`);
    out.push(
      table([
        row("Wave date", s.wave_date),
        row("Network size", s.network_size),
        row("Response rate", s.response_rate),
        row("Number of ties", s.number_of_ties),
        row("Density", s.density),
        row("Average path length", s.average_path_length),
        row("Average degree", s.average_degree),
        row("Number of isolates", s.number_of_isolates),
        row("Clustering coefficient", s.clustering_coefficient),
        row("Degree centralization", s.degree_centralization),
        row("Reciprocity", s.reciprocity),
        row("Indegree centralization", s.indegree_centralization),
        row("Outdegree centralization", s.outdegree_centralization),
        row("Number of new ties", s.number_of_new_ties),
        row("Number of lost ties", s.number_of_lost_ties)
      ])
    );
    out.push("");
  });

  // Additional information
  if (p.additional_information && p.additional_information.trim()) {
    out.push("## Additional information");
    out.push(p.additional_information.trim());
    out.push("");
  }

  out.push("---");
  out.push(
    `_Generated with the [NetP web app](https://ericquintane.github.io/protocol/). Schema: [protocol.schema.json](https://github.com/ericquintane/protocol/blob/main/schema/protocol.schema.json)._`
  );

  return out.join("\n");
}
