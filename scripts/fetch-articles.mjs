// Pull candidate articles from OpenAlex for the article review.
//
// Usage:
//   node scripts/fetch-articles.mjs                # both journals, 2022-2026
//   node scripts/fetch-articles.mjs --journal social-networks --from 2024 --to 2025
//
// Writes to paper/review/articles-openalex.csv. This is a *candidate list* — you still need to
// screen each article against the inclusion criteria. See paper/review/methodology.md.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");

const JOURNAL_IDS = {
  "social-networks": "S26186134", // OpenAlex source id for Social Networks (Elsevier)
  "network-science": "S2530642067" // OpenAlex source id for Network Science (Cambridge)
};

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--") && i + 1 < arr.length) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const journals = args.journal ? [args.journal] : Object.keys(JOURNAL_IDS);
const fromYear = parseInt(args.from ?? "2022", 10);
const toYear = parseInt(args.to ?? "2026", 10);

const rows = [];
const headers = [
  "doi",
  "journal",
  "year",
  "volume",
  "issue",
  "pages",
  "authors",
  "title"
];

for (const journal of journals) {
  const sourceId = JOURNAL_IDS[journal];
  if (!sourceId) {
    console.error(`Unknown journal: ${journal}. Known: ${Object.keys(JOURNAL_IDS).join(", ")}`);
    process.exit(1);
  }
  let cursor = "*";
  let totalForJournal = 0;
  while (cursor) {
    const url = new URL("https://api.openalex.org/works");
    url.searchParams.set(
      "filter",
      `primary_location.source.id:${sourceId},publication_year:${fromYear}-${toYear},type:article`
    );
    url.searchParams.set("per-page", "200");
    url.searchParams.set("cursor", cursor);
    url.searchParams.set("mailto", "eric@quintane.net");
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`OpenAlex request failed: ${res.status} ${res.statusText}`);
      console.error(await res.text());
      process.exit(1);
    }
    const data = await res.json();
    for (const work of data.results ?? []) {
      const doi = (work.doi ?? "").replace("https://doi.org/", "");
      const authors = (work.authorships ?? [])
        .map((a) => a.author?.display_name ?? "")
        .filter(Boolean)
        .join("; ");
      rows.push({
        doi,
        journal,
        year: work.publication_year,
        volume: work.biblio?.volume ?? "",
        issue: work.biblio?.issue ?? "",
        pages: [work.biblio?.first_page, work.biblio?.last_page].filter(Boolean).join("-"),
        authors,
        title: (work.title ?? "").replace(/[\r\n]+/g, " ")
      });
      totalForJournal++;
    }
    cursor = data.meta?.next_cursor;
    if (!data.results?.length) break;
  }
  console.log(`Fetched ${totalForJournal} articles from ${journal} (${fromYear}-${toYear}).`);
}

function csvEscape(s) {
  const v = String(s ?? "");
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const csv = [
  headers.join(","),
  ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(","))
].join("\n");

const outDir = join(root, "paper", "review");
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "articles-openalex.csv");
await writeFile(outPath, csv + "\n", "utf8");
console.log(`Wrote ${rows.length} rows to ${outPath}`);
