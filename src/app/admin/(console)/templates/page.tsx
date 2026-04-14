import { getEmailTemplates } from "../../actions";
import TemplateEditor from "./TemplateEditor";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getEmailTemplates();

  // Group by band
  const grouped: Record<string, typeof templates> = {};
  for (const t of templates) {
    if (!grouped[t.band]) grouped[t.band] = [];
    grouped[t.band].push(t);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Email Templates
      </h1>
      <TemplateEditor grouped={grouped} />
    </>
  );
}
