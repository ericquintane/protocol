import Graph from "graphology";
import Papa from "papaparse";

export type Direction = "directed" | "undirected";
export type Mode = "one-mode" | "two-mode";

export interface ParseOptions {
  direction: Direction;
  mode: Mode;
  hasHeader?: boolean; // auto-detected if undefined
}

export interface ComputedStats {
  network_size: number[];
  number_of_ties: number;
  density: number;
  average_path_length?: number;
  average_degree: number[];
  number_of_isolates: number;
  clustering_coefficient?: number;
  degree_centralization?: number;
  reciprocity?: number;
  indegree_centralization?: number;
  outdegree_centralization?: number;
}

/**
 * Parse a CSV edgelist into a graphology graph.
 * - Expects at least two columns: source (from), target (to).
 * - An optional third column is treated as edge weight if numeric.
 * - Headers are detected automatically unless `hasHeader` is set explicitly.
 * - Two-mode graphs prefix node keys with `m1:` and `m2:` so the same string can appear in both modes.
 * - Self-loops are dropped silently.
 * - Duplicate edges (same source/target in undirected, or same direction in directed) are dropped silently.
 */
export function parseEdgelist(csv: string, opts: ParseOptions): Graph {
  const parsed = Papa.parse<string[]>(csv.trim(), { skipEmptyLines: true });
  const rows = parsed.data;
  if (!rows.length) throw new Error("Edgelist is empty.");

  let startIdx = 0;
  if (opts.hasHeader === true) {
    startIdx = 1;
  } else if (opts.hasHeader === undefined) {
    const first = rows[0] ?? [];
    if (first.length >= 2) {
      const looksLikeHeader = first
        .slice(0, 2)
        .every((c) => typeof c === "string" && /[a-zA-Z]/.test(c) && !/^\d+(\.\d+)?$/.test(c.trim()));
      if (looksLikeHeader) startIdx = 1;
    }
  }

  const graph =
    opts.direction === "directed"
      ? new Graph({ type: "directed", allowSelfLoops: false, multi: false })
      : new Graph({ type: "undirected", allowSelfLoops: false, multi: false });

  let skipped = 0;

  for (let i = startIdx; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) {
      skipped++;
      continue;
    }
    const from = String(row[0] ?? "").trim();
    const to = String(row[1] ?? "").trim();
    const weightStr = row[2] != null ? String(row[2]).trim() : "";
    if (!from || !to) {
      skipped++;
      continue;
    }

    const fromKey = opts.mode === "two-mode" ? `m1:${from}` : from;
    const toKey = opts.mode === "two-mode" ? `m2:${to}` : to;
    if (fromKey === toKey) {
      skipped++;
      continue;
    }

    if (!graph.hasNode(fromKey)) {
      graph.addNode(fromKey, opts.mode === "two-mode" ? { mode: 1 } : {});
    }
    if (!graph.hasNode(toKey)) {
      graph.addNode(toKey, opts.mode === "two-mode" ? { mode: 2 } : {});
    }

    if (graph.hasEdge(fromKey, toKey)) {
      skipped++;
      continue;
    }

    const weight = weightStr && !Number.isNaN(Number(weightStr)) ? Number(weightStr) : 1;
    graph.addEdge(fromKey, toKey, { weight });
  }

  graph.setAttribute("skippedRows", skipped);
  return graph;
}

function bfsDistancesDirected(graph: Graph, source: string): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(source, 0);
  const queue: string[] = [source];
  while (queue.length) {
    const node = queue.shift()!;
    const d = dist.get(node)!;
    for (const n of graph.outNeighbors(node)) {
      if (!dist.has(n)) {
        dist.set(n, d + 1);
        queue.push(n);
      }
    }
  }
  return dist;
}

function bfsDistancesUndirected(graph: Graph, source: string): Map<string, number> {
  const dist = new Map<string, number>();
  dist.set(source, 0);
  const queue: string[] = [source];
  while (queue.length) {
    const node = queue.shift()!;
    const d = dist.get(node)!;
    for (const n of graph.neighbors(node)) {
      if (!dist.has(n)) {
        dist.set(n, d + 1);
        queue.push(n);
      }
    }
  }
  return dist;
}

/**
 * Compute basic statistics for a graphology graph.
 *
 * Conventions:
 * - "number of ties" is edges for undirected and arcs for directed (matches the protocol's
 *   definition).
 * - Density: edges / max possible edges; max possible = N(N-1)/2 (undirected, one-mode),
 *   N(N-1) (directed, one-mode), N1·N2 (two-mode).
 * - Average degree: 2·edges/N (undirected), edges/N (directed), edges/Ni per mode (two-mode).
 * - Average path length: mean BFS distance over all reachable ordered pairs (i,j) with i≠j.
 *   Computed using directed BFS for directed graphs.
 * - Clustering coefficient: Watts-Strogatz local clustering averaged over nodes with degree ≥ 2.
 *   Reported for one-mode graphs only.
 * - Degree centralization (Freeman 1979): Σ(max-d_i)/(N-1)(N-2) for undirected, Σ(max-d_i)/(N-1)² for directed in/out so values stay in [0,1].
 * - Reciprocity: proportion of arcs whose reverse arc is also present (mutual / total).
 */
export function computeStats(graph: Graph, opts: { direction: Direction; mode: Mode }): ComputedStats {
  const isDirected = opts.direction === "directed";
  const isTwoMode = opts.mode === "two-mode";

  let networkSize: number[];
  if (isTwoMode) {
    let m1 = 0;
    let m2 = 0;
    graph.forEachNode((_, attrs) => {
      if (attrs.mode === 1) m1++;
      else if (attrs.mode === 2) m2++;
    });
    networkSize = [m1, m2];
  } else {
    networkSize = [graph.order];
  }

  const numberOfTies = graph.size;

  let maxPossibleTies: number;
  if (isTwoMode) {
    maxPossibleTies = networkSize[0] * networkSize[1];
  } else if (isDirected) {
    maxPossibleTies = graph.order * (graph.order - 1);
  } else {
    maxPossibleTies = (graph.order * (graph.order - 1)) / 2;
  }
  const density = maxPossibleTies > 0 ? numberOfTies / maxPossibleTies : 0;

  let averageDegree: number[];
  if (isTwoMode) {
    averageDegree = [
      networkSize[0] > 0 ? numberOfTies / networkSize[0] : 0,
      networkSize[1] > 0 ? numberOfTies / networkSize[1] : 0
    ];
  } else if (isDirected) {
    averageDegree = [graph.order > 0 ? numberOfTies / graph.order : 0];
  } else {
    averageDegree = [graph.order > 0 ? (2 * numberOfTies) / graph.order : 0];
  }

  let numberOfIsolates = 0;
  graph.forEachNode((node) => {
    if (graph.degree(node) === 0) numberOfIsolates++;
  });

  let avgPathLength: number | undefined;
  let totalPaths = 0;
  let totalDistance = 0;
  graph.forEachNode((source) => {
    const dist = isDirected ? bfsDistancesDirected(graph, source) : bfsDistancesUndirected(graph, source);
    for (const [target, d] of dist) {
      if (target !== source && d < Infinity) {
        totalDistance += d;
        totalPaths++;
      }
    }
  });
  if (totalPaths > 0) avgPathLength = totalDistance / totalPaths;

  let clustering: number | undefined;
  if (!isTwoMode && graph.order > 2) {
    let sum = 0;
    let count = 0;
    graph.forEachNode((node) => {
      const neighborSet = new Set<string>();
      if (isDirected) {
        for (const n of graph.outNeighbors(node)) neighborSet.add(n);
        for (const n of graph.inNeighbors(node)) neighborSet.add(n);
      } else {
        for (const n of graph.neighbors(node)) neighborSet.add(n);
      }
      const neighbors = Array.from(neighborSet);
      const k = neighbors.length;
      if (k < 2) return;
      let triangles = 0;
      for (let i = 0; i < neighbors.length; i++) {
        for (let j = i + 1; j < neighbors.length; j++) {
          const a = neighbors[i];
          const b = neighbors[j];
          if (graph.hasEdge(a, b) || graph.hasEdge(b, a)) triangles++;
        }
      }
      const possible = (k * (k - 1)) / 2;
      sum += triangles / possible;
      count++;
    });
    if (count > 0) clustering = sum / count;
  }

  let degreeCent: number | undefined;
  let indegCent: number | undefined;
  let outdegCent: number | undefined;
  let reciprocity: number | undefined;

  if (!isTwoMode) {
    const N = graph.order;
    if (isDirected) {
      const inDegs: number[] = [];
      const outDegs: number[] = [];
      graph.forEachNode((node) => {
        inDegs.push(graph.inDegree(node));
        outDegs.push(graph.outDegree(node));
      });
      if (inDegs.length > 0 && N >= 2) {
        const maxIn = Math.max(...inDegs);
        const maxOut = Math.max(...outDegs);
        const sumIn = inDegs.reduce((acc, d) => acc + (maxIn - d), 0);
        const sumOut = outDegs.reduce((acc, d) => acc + (maxOut - d), 0);
        const denom = (N - 1) * (N - 1);
        indegCent = denom > 0 ? sumIn / denom : undefined;
        outdegCent = denom > 0 ? sumOut / denom : undefined;
      }
      let mutual = 0;
      graph.forEachEdge((_edge, _attrs, source, target) => {
        if (graph.hasEdge(target, source)) mutual++;
      });
      reciprocity = numberOfTies > 0 ? mutual / numberOfTies : undefined;
    } else {
      const degs: number[] = [];
      graph.forEachNode((node) => degs.push(graph.degree(node)));
      if (degs.length > 0 && N >= 3) {
        const maxDeg = Math.max(...degs);
        const sumDiff = degs.reduce((acc, d) => acc + (maxDeg - d), 0);
        const denom = (N - 1) * (N - 2);
        degreeCent = denom > 0 ? sumDiff / denom : undefined;
      }
    }
  }

  return {
    network_size: networkSize,
    number_of_ties: numberOfTies,
    density,
    average_path_length: avgPathLength,
    average_degree: averageDegree,
    number_of_isolates: numberOfIsolates,
    clustering_coefficient: clustering,
    degree_centralization: degreeCent,
    reciprocity,
    indegree_centralization: indegCent,
    outdegree_centralization: outdegCent
  };
}

/** Round numbers to a sensible number of significant digits for display. */
export function roundStats(stats: ComputedStats, digits = 4): ComputedStats {
  const round = (n: number | undefined) =>
    n == null ? undefined : Number(n.toFixed(digits));
  return {
    network_size: stats.network_size,
    number_of_ties: stats.number_of_ties,
    density: Number(stats.density.toFixed(digits)) as number,
    average_path_length: round(stats.average_path_length),
    average_degree: stats.average_degree.map((d) => Number(d.toFixed(digits))),
    number_of_isolates: stats.number_of_isolates,
    clustering_coefficient: round(stats.clustering_coefficient),
    degree_centralization: round(stats.degree_centralization),
    reciprocity: round(stats.reciprocity),
    indegree_centralization: round(stats.indegree_centralization),
    outdegree_centralization: round(stats.outdegree_centralization)
  };
}
