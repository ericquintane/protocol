import { useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import schema from "../../../schema/protocol.schema.json";

const uiSchema: UiSchema = {
  "ui:submitButtonOptions": { norender: true },
  dataset_doi: { "ui:placeholder": "10.xxxx/xxxxx (filled after registration)" },
  overview: {
    description: {
      "ui:widget": "textarea",
      "ui:options": { rows: 2 }
    }
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

function loadDraft(): Record<string, unknown> | undefined {
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

export default function ProtocolForm() {
  const [formData, setFormData] = useState<Record<string, unknown> | undefined>(() => loadDraft());

  const handleDownloadJson = () => {
    const json = JSON.stringify(formData ?? {}, null, 2);
    download("netp-protocol.json", json, "application/json");
  };

  const handleLoadExample = async (slug: string) => {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const res = await fetch(`${base}/examples/${slug}.json`);
    if (!res.ok) {
      alert(`Could not load example: ${slug}`);
      return;
    }
    const data = await res.json();
    setFormData(data);
    saveDraft(data);
  };

  const handleReset = () => {
    if (!confirm("Discard the current draft?")) return;
    setFormData(undefined);
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <div className="note">
        <strong>Pre-release.</strong> The form below renders the v1 NetP schema and lets you
        download a filled protocol as JSON. Markdown/PDF export, in-browser network statistics
        from edgelist upload, and a shareable URL are coming.
      </div>

      <div className="actions">
        <button type="button" onClick={() => handleLoadExample("padgett-marriage")}>
          Load example: Padgett (marriage)
        </button>
        <button type="button" onClick={() => handleLoadExample("padgett-multivariate")}>
          Load example: Padgett (multivariate)
        </button>
        <button type="button" onClick={() => handleLoadExample("brennecke")}>
          Load example: Brennecke
        </button>
        <button type="button" onClick={() => handleLoadExample("troester")}>
          Load example: Tröster
        </button>
        <button type="button" className="secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

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
          Download as JSON
        </button>
        <button type="button" className="secondary" disabled title="Coming soon">
          Download as Markdown
        </button>
        <button type="button" className="secondary" disabled title="Coming soon">
          Download as PDF
        </button>
      </div>
    </>
  );
}
