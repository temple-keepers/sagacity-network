"use client";

import { useState, useTransition } from "react";
import { Save, ChevronDown, ChevronRight } from "lucide-react";
import { updateTemplate } from "../../actions";
import { useRouter } from "next/navigation";

const BAND_COLORS: Record<string, string> = {
  "Digitally At Risk": "#E05252",
  "Early Stage": "#E09B3D",
  "Developing": "#A668D0",
  "Advanced": "#3DBE8F",
};

interface Template {
  band: string;
  email_number: number;
  subject: string;
  preview: string;
  body: string;
}

export default function TemplateEditor({ grouped }: { grouped: Record<string, Template[]> }) {
  const [openBand, setOpenBand] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<{ subject: string; preview: string; body: string }>({ subject: "", preview: "", body: "" });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const startEdit = (t: Template) => {
    const key = `${t.band}-${t.email_number}`;
    setEditing(key);
    setForm({ subject: t.subject, preview: t.preview, body: t.body });
    setSaved(false);
  };

  const handleSave = (band: string, emailNumber: number) => {
    startTransition(async () => {
      await updateTemplate(band, emailNumber, form);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([band, templates]) => {
        const isOpen = openBand === band;
        const color = BAND_COLORS[band] ?? "#9A90A8";
        return (
          <div key={band} className="rounded-xl border" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
            <button
              onClick={() => setOpenBand(isOpen ? null : band)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown size={16} style={{ color }} /> : <ChevronRight size={16} style={{ color }} />}
                <span className="font-medium" style={{ color }}>{band}</span>
                <span className="text-xs" style={{ color: "#6E6479" }}>{templates.length} emails</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t" style={{ borderColor: "#1E1A2E" }}>
                {templates.map((t) => {
                  const key = `${t.band}-${t.email_number}`;
                  const isEditing = editing === key;

                  return (
                    <div key={key} className="border-b last:border-0 px-5 py-4" style={{ borderColor: "#1E1A2E" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Email #{t.email_number}</span>
                        {!isEditing && (
                          <button
                            onClick={() => startEdit(t)}
                            className="text-xs px-3 py-1 rounded-lg transition-colors hover:bg-white/5"
                            style={{ color: "#A668D0" }}
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "#6E6479" }}>Subject</label>
                            <input
                              value={form.subject}
                              onChange={(e) => setForm({ ...form, subject: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: "#0D0B14", border: "1px solid #1E1A2E", color: "#F0ECF4" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "#6E6479" }}>Preview</label>
                            <input
                              value={form.preview}
                              onChange={(e) => setForm({ ...form, preview: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: "#0D0B14", border: "1px solid #1E1A2E", color: "#F0ECF4" }}
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase tracking-wider mb-1" style={{ color: "#6E6479" }}>Body</label>
                            <textarea
                              value={form.body}
                              onChange={(e) => setForm({ ...form, body: e.target.value })}
                              rows={10}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
                              style={{ background: "#0D0B14", border: "1px solid #1E1A2E", color: "#F0ECF4" }}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSave(t.band, t.email_number)}
                              disabled={pending}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                              style={{ background: "var(--gradient-purple)" }}
                            >
                              <Save size={14} />
                              {pending ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                              style={{ color: "#6E6479" }}
                            >
                              Cancel
                            </button>
                            {saved && <span className="text-xs" style={{ color: "#3DBE8F" }}>Saved!</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs space-y-1" style={{ color: "#9A90A8" }}>
                          <div><span style={{ color: "#6E6479" }}>Subject:</span> {t.subject}</div>
                          <div><span style={{ color: "#6E6479" }}>Preview:</span> {t.preview}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
