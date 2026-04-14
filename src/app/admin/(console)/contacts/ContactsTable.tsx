"use client";

import { useState, useTransition } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteContact } from "../../actions";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this contact message?")) return;
    startTransition(async () => {
      await deleteContact(id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #1E1A2E" }}>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Name</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Email</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <>
              <tr
                key={c.id}
                className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid #1E1A2E" }}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3" style={{ color: "#9A90A8" }}>{c.email}</td>
                <td className="px-4 py-3" style={{ color: "#6E6479" }}>
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {expanded === c.id ? <ChevronUp size={14} style={{ color: "#6E6479" }} /> : <ChevronDown size={14} style={{ color: "#6E6479" }} />}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      disabled={pending}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      title="Delete"
                    >
                      <Trash2 size={14} style={{ color: "#E05252" }} />
                    </button>
                  </div>
                </td>
              </tr>
              {expanded === c.id && (
                <tr key={`${c.id}-msg`} style={{ borderBottom: "1px solid #1E1A2E" }}>
                  <td colSpan={4} className="px-4 py-4" style={{ background: "#0D0B14" }}>
                    <div className="text-sm whitespace-pre-wrap" style={{ color: "#9A90A8" }}>{c.message}</div>
                  </td>
                </tr>
              )}
            </>
          ))}
          {contacts.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "#6E6479" }}>
                No contact messages yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
