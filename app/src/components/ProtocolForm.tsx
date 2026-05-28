import { useEffect, useMemo, useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import schema from "../../../schema/protocol.schema.json";
import EdgelistUploader from "./EdgelistUploader";
import { serializeProtocolToMarkdown } from "../lib/serialize-md";
import type { ComputedStats, Direction, Mode } from "../lib/compute-stats";

const uiSchema: UiSchema = {
  "ui:submitButtonOptions": { norender: true },
  dataset_doi: { "ui:placeholder": "10.xxxx/xxxxx (filled after registration)" },
  overview: {
    description: { "ui:widget": "textarea", "ui:options": { rows: 2 } }
  },
  data_collection: {
    details: { "ui:widget": "textarea" },
    method: { "ui:widget": "textarea", "ui:options": { rows: 2 } }
  },
  nodes: {
    items: {
      network_boundary: { "ui:widget": "textarea" },
      node_exclusion: { "ui:widget": "textarea" },
      node_transformation: { "ui:widget": "textarea" }
    }
  },
  ties: {
    items: {
      transformation: { "ui:widget": "textarea" },
      name_generator: { "ui:widget": "textarea", "ui:options": { rows: 2 } },
      name_interpreter: { "ui:widget": "textarea", "ui:options": { rows: 2 } }
    }
  },
  additional_information: { "ui:widget": "textarea", "ui:options": { rows: 4 } }
};

const STORAGE_KEY = "netp:draft";
const PRINT_KEY = "netp:print-preview";
const KNOWN_EXAMPLES = new Set([
  "padgett-marriage",
  "padgett-multivariate",
  "brennecke",
  "troester"
]);

type FormData = Record<string, any> | undefined;

function loadDraft(): FormData {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveDraft(data: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota or private mode */
  }
}

function download(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function basePath(): string {
  return (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
}

async function fetchExample(slug: string): Promise<FormData> {
  const res = await fetch(`${basePath()}/examples/${slug}.json`);
  if (!res.ok) throw new Error(`Could not load example: ${slug}`);
  return await res.json();
}

export default function ProtocolForm() {
  const [formData, setFormData] = useState<FormData>(() => loadDraft());

  // Handle ?load=<slug> on first render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("load");
    if (slug && KNOWN_EXAMPLES.has(slug)) {
      fetchExample(slug)
        .then((data) => {
          setFormData(data);
          saveDraft(data);
          // Strip the query param so reloads don't keep loading the example.
          const url = new URL(window.location.href);
          url.searchParams.delete("load");
          window.history.replaceState({}, "", url.toString());
        })
        .catch(() => {
          // ignore; user can load via button
        });
    }
  }, []);

  const tiesForUploader = useMemo(() => {
    const ties: any[] = Array.isArray(formData?.ties) ? formData!.ties : [];
    return ties.map((t) => ({ label: t.label, direction: t.direction as Direction | undefined }));
  }, [formData]);

  const modeForUploader = useMemo<Mode>(
    () => (formData?.overview?.mode === "two-mode" ? "two-mode" : "one-mode"),
    [formData]
  );

  const numberOfWavesForUploader = useMemo(
    () => Number(formData?.overview?.number_of_waves) || 1,
    [formData]
  );

  const handleInsertStats = (stats: ComputedStats, relationship: string, wave: number) => {
    setFormData((prev) => {
      const next = { ...(prev ?? {}) };
      const existing: any[] = Array.isArray(next.statistics) ? [...next.statistics] : [];
      const entry: Record<string, unknown> = {
        relationship,
        wave,
        network_size: stats.network_size,
        number_of_ties: stats.number_of_ties,
        density: stats.density,
        average_degree: stats.average_degree,
        number_of_isolates: stats.number_of_isolates
      };
      if (stats.average_path_length != null) entry.average_path_length = stats.average_path_length;
      if (stats.clustering_coefficient != null)
        entry.clustering_coefficient = stats.clustering_coefficient;
      if (stats.degree_centralization != null)
        entry.degree_centralization = stats.degree_centralization;
      if (stats.reciprocity != null) entry.reciprocity = stats.reciprocity;
      if (stats.indegree_centralization != null)
        entry.indegree_centralization = stats.indegree_centralization;
      if (stats.outdegree_centralization != null)
        entry.outdegree_centralization = stats.outdegree_centralization;

      const idx = existing.findIndex(
        (e) => e.relationship === relationship && Number(e.wave) === Number(wave)
      );
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...entry };
      } else {
        existing.push(entry);
      }
      next.statistics = existing;
      saveDraft(next);
      return next;
    });
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(formData ?? {}, null, 2);
    download("netp-protocol.json", json, "application/json");
  };

  const handleDownloadMarkdown = () => {
    const md = serializeProtocolToMarkdown(formData ?? {});
    download("netp-protocol.md", md, "text/markdown");
  };

  const handleOpenPrintView = () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(PRINT_KEY, JSON.stringify(formData ?? {}));
    } catch {
      /* ignore */
    }
    window.open(`${basePath()}/print`, "_blank", "noopener");
  };

  const handleLoadExample = async (slug: string) => {
    try {
      const data = await fetchExample(slug);
      setFormData(data);
      saveDraft(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const handleReset = () => {
    if (!confirm("Discard the current draft?")) return;
    setFormData(undefined);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <div className="note">
        <strong>How to use.</strong> Fill the form below. Your draft is saved automatically in your
        browser (nothing is sent anywhere). When you are done, download the filled protocol as
        JSON, Markdown, or a print-ready PDF. If you have an edgelist for the network, the
        Statistics section can be computed from it automatically.
      </div>

      <div className="actions">
        <button type="button" onClick={() => handleLoadExample("padgett-marriage")}>
          Load: Padgett (marriage)
        </button>
        <button type="button" onClick={() => handleLoadExample("padgett-multivariate")}>
          Load: Padgett (multivariate)
        </button>
        <button type="button" onClick={() => handleLoadExample("brennecke")}>
          Load: Brennecke
        </button>
        <button type="button" onClick={() => handleLoadExample("troester")}>
          Load: Tröster
        </button>
        <button type="button" className="secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      <EdgelistUploader
        ties={tiesForUploader}
        mode={modeForUploader}
        numberOfWaves={numberOfWavesForUploader}
        onInsert={handleInsertStats}
      />

      <Form
        schema={schema as RJSFSchema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        onChange={(e) => {
          setFormData(e.formData);
          saveDraft(e.formData);
        }}
        showErrorList="bottom"
        liveValidate={false}
      />

      <div className="actions">
        <button type="button" onClick={handleDownloadJson}>
          Download JSON
        </button>
        <button type="button" onClick={handleDownloadMarkdown}>
          Download Markdown
        </button>
        <button type="button" onClick={handleOpenPrintView}>
          Open print view (PDF)
        </button>
      </div>
    </>
  );
}
