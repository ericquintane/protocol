import { useMemo, useState } from "react";
import Graph from "graphology";
import {
  parseEdgelist,
  computeStats,
  roundStats,
  type ComputedStats,
  type Direction,
  type Mode
} from "../lib/compute-stats";

interface TieDef {
  label?: string;
  direction?: Direction;
}

interface Props {
  ties: TieDef[];
  mode: Mode;
  numberOfWaves: number;
  onInsert: (stats: ComputedStats, relationship: string, wave: number) => void;
}

export default function EdgelistUploader({ ties, mode, numberOfWaves, onInsert }: Props) {
  const relationshipOptions = useMemo(
    () => ties.filter((t) => t.label && t.label.trim()).map((t) => t.label as string),
    [ties]
  );
  const [relationship, setRelationship] = useState<string>(relationshipOptions[0] ?? "");
  const [wave, setWave] = useState<number>(1);
  const [direction, setDirection] = useState<Direction>(() => {
    const initial = ties.find((t) => t.label === relationshipOptions[0]);
    return initial?.direction ?? "undirected";
  });
  const [extraIsolates, setExtraIsolates] = useState<number>(0);
  const [forceHeader, setForceHeader] = useState<"auto" | "yes" | "no">("auto");
  const [csvText, setCsvText] = useState<string>("");
  const [stats, setStats] = useState<ComputedStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function handleRelationshipChange(label: string) {
    setRelationship(label);
    const t = ties.find((x) => x.label === label);
    if (t?.direction) setDirection(t.direction);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    setCsvText(text);
    setError(null);
    setInfo(`Loaded ${file.name} (${text.length.toLocaleString()} chars).`);
  }

  function handleCompute() {
    setError(null);
    setInfo(null);
    if (!csvText.trim()) {
      setError("Provide an edgelist (paste below or upload a CSV).");
      return;
    }
    try {
      const hasHeader = forceHeader === "auto" ? undefined : forceHeader === "yes";
      const graph: Graph = parseEdgelist(csvText, { direction, mode, hasHeader });
      const skipped = graph.getAttribute("skippedRows") as number | undefined;

      for (let i = 0; i < extraIsolates; i++) {
        const key = mode === "two-mode" ? `m1:__isolate_${i}` : `__isolate_${i}`;
        graph.addNode(key, mode === "two-mode" ? { mode: 1 } : {});
      }

      const raw = computeStats(graph, { direction, mode });
      const rounded = roundStats(raw, 4);
      setStats(rounded);
      const messages = [`Parsed: ${graph.order} nodes, ${graph.size} edges.`];
      if (skipped) messages.push(`Skipped ${skipped} row(s) (empty, self-loop, or duplicate).`);
      if (extraIsolates > 0) messages.push(`Added ${extraIsolates} isolate(s) not in the edgelist.`);
      setInfo(messages.join(" "));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function handleInsert() {
    if (!stats || !relationship) return;
    onInsert(stats, relationship, wave);
    setInfo(`Inserted stats into '${relationship}' wave ${wave}.`);
  }

  return (
    <fieldset>
      <legend>Compute statistics from an edgelist</legend>
      <p style={{ marginTop: 0, color: "var(--color-muted)", fontSize: "0.9rem" }}>
        Upload a CSV with at least two columns (source, target). Optional third column is treated
        as edge weight. The Statistics section for the chosen relationship and wave will be filled
        with the computed values. Isolated nodes not present in the edgelist can be added with the
        "extra isolates" input.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1rem" }}>
        <label>
          Relationship
          <select
            value={relationship}
            onChange={(e) => handleRelationshipChange(e.target.value)}
            disabled={relationshipOptions.length === 0}
          >
            {relationshipOptions.length === 0 && <option value="">(no relationships defined yet)</option>}
            {relationshipOptions.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Wave
          <select value={wave} onChange={(e) => setWave(Number(e.target.value))}>
            {Array.from({ length: Math.max(1, numberOfWaves) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Wave {n}
              </option>
            ))}
          </select>
        </label>

        <label>
          Direction
          <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
            <option value="undirected">undirected</option>
            <option value="directed">directed</option>
          </select>
        </label>

        <label>
          Header row
          <select value={forceHeader} onChange={(e) => setForceHeader(e.target.value as "auto" | "yes" | "no")}>
            <option value="auto">auto-detect</option>
            <option value="yes">first row is a header</option>
            <option value="no">no header</option>
          </select>
        </label>

        <label>
          Extra isolates
          <input
            type="number"
            min={0}
            value={extraIsolates}
            onChange={(e) => setExtraIsolates(Math.max(0, Number(e.target.value)))}
          />
        </label>

        <label>
          CSV file
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      <label style={{ display: "block", marginTop: "0.75rem" }}>
        Or paste edgelist directly
        <textarea
          rows={5}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="from,to&#10;A,B&#10;A,C&#10;B,D"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </label>

      <div className="actions">
        <button type="button" onClick={handleCompute}>
          Compute statistics
        </button>
        <button
          type="button"
          className="secondary"
          onClick={handleInsert}
          disabled={!stats || !relationship}
        >
          Insert into selected entry
        </button>
      </div>

      {error && <div className="errors" style={{ marginTop: "0.5rem" }}>{error}</div>}
      {info && (
        <div style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>{info}</div>
      )}
      {stats && (
        <details open style={{ marginTop: "0.75rem" }}>
          <summary>Computed statistics</summary>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </details>
      )}
    </fieldset>
  );
}
