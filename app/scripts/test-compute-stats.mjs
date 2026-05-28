// Verify the compute-stats implementation against the known Padgett marriage network.
// Run from app/: node scripts/test-compute-stats.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvPath = join(__dirname, "..", "public", "edgelists", "padgett-marriage.csv");

const { parseEdgelist, computeStats, roundStats } = await import("../src/lib/compute-stats.ts");

const csv = await readFile(csvPath, "utf8");
const graph = parseEdgelist(csv, { direction: "undirected", mode: "one-mode" });

// Padgett has 16 families but the edgelist only contains 15; Pucci is an isolate.
// Add Pucci as an isolated node so the stats match the canonical reference.
if (!graph.hasNode("Pucci")) graph.addNode("Pucci", {});

const stats = roundStats(computeStats(graph, { direction: "undirected", mode: "one-mode" }), 3);
console.log("Padgett marriage stats (after adding Pucci as isolate):");
console.log(JSON.stringify(stats, null, 2));

const expected = {
  network_size: 16,
  number_of_ties: 20,
  density: 0.167,
  average_degree: 2.5,
  number_of_isolates: 1
};

const pass = (label, actual, exp, tol = 0.01) => {
  const ok = Math.abs(Number(actual) - Number(exp)) < tol;
  console.log(`  ${ok ? "OK  " : "FAIL"} ${label}: actual=${actual} expected=${exp}`);
  return ok;
};

let allPass = true;
allPass = pass("network_size", stats.network_size[0], expected.network_size) && allPass;
allPass = pass("number_of_ties", stats.number_of_ties, expected.number_of_ties) && allPass;
allPass = pass("density", stats.density, expected.density) && allPass;
allPass = pass("average_degree", stats.average_degree[0], expected.average_degree) && allPass;
allPass = pass("number_of_isolates", stats.number_of_isolates, expected.number_of_isolates) && allPass;

// Path length, clustering, centralization should be in plausible ranges.
allPass = pass("average_path_length", stats.average_path_length, 2.486, 0.2) && allPass;
allPass = pass("clustering_coefficient", stats.clustering_coefficient, 0.218, 0.1) && allPass;
allPass = pass("degree_centralization", stats.degree_centralization, 0.267, 0.1) && allPass;

process.exit(allPass ? 0 : 1);
