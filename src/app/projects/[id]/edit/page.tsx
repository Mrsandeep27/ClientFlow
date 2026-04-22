"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import type { Project, ScopeItem, Milestone } from "@/lib/types";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Client
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [clientPan, setClientPan] = useState("");

  // Project
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [revisions, setRevisions] = useState(3);
  const [techStack, setTechStack] = useState("");
  const [scope, setScope] = useState<ScopeItem[]>([]);
  const [discount, setDiscount] = useState(0);

  // Milestones (editable)
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Notes
  const [notes, setNotes] = useState("");

  const subtotal = scope.reduce((s, i) => s + i.amount, 0);
  const finalAmount = subtotal - discount;

  useEffect(() => {
    db.projects.get(id).then((p) => {
      if (!p) return;
      setBusinessName(p.client.businessName);
      setContactName(p.client.contactName);
      setDesignation(p.client.designation ?? "");
      setEmail(p.client.email);
      setPhone(p.client.phone);
      setWhatsapp(p.client.whatsapp ?? "");
      setAddrLine1(p.client.address.line1);
      setCity(p.client.address.city);
      setState(p.client.address.state);
      setPincode(p.client.address.pincode);
      setGstin(p.client.gstin ?? "");
      setClientPan(p.client.pan ?? "");

      setProjectTitle(p.project.title);
      setProjectDesc(p.project.description);
      setStartDate(p.project.startDate.slice(0, 10));
      setDeliveryDate(p.project.deliveryDate?.slice(0, 10) ?? "");
      setRevisions(p.project.revisionsIncluded);
      setTechStack(p.project.techStack.join(", "));
      setScope(p.project.scope);
      setDiscount(p.project.discount);
      setMilestones(p.milestones);
      setNotes(p.notes);

      setLoaded(true);
    });
  }, [id]);

  function updateScope(itemId: string, field: keyof ScopeItem, value: string | number) {
    setScope((prev) =>
      prev.map((s) => {
        if (s.id !== itemId) return s;
        const updated = { ...s, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      })
    );
  }

  function addScopeItem() {
    setScope((prev) => [...prev, { id: nanoid(), item: "", description: "", sacCode: "998313", quantity: 1, rate: 0, amount: 0 }]);
  }

  function removeScopeItem(itemId: string) {
    setScope((prev) => prev.filter((s) => s.id !== itemId));
  }

  function updateMilestone(mid: string, field: keyof Milestone, value: string | number) {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== mid) return m;
        const updated = { ...m, [field]: value } as Milestone;
        if (field === "percent") {
          updated.amount = Math.round((finalAmount * Number(value)) / 100);
        }
        return updated;
      })
    );
  }

  function recalcMilestones() {
    setMilestones((prev) =>
      prev.map((m) => ({ ...m, amount: Math.round((finalAmount * m.percent) / 100) }))
    );
  }

  async function handleSave() {
    if (!businessName || !contactName || finalAmount <= 0) {
      alert("Missing required fields or invalid amount");
      return;
    }
    setSaving(true);

    const existing = await db.projects.get(id);
    if (!existing) return;

    const updated: Partial<Project> = {
      client: {
        businessName, contactName, designation, email, phone, whatsapp: whatsapp || phone,
        address: { line1: addrLine1, city, state, pincode }, gstin, pan: clientPan,
      },
      project: {
        title: projectTitle,
        description: projectDesc,
        scope,
        totalAmount: subtotal,
        discount,
        finalAmount,
        startDate,
        deliveryDate,
        revisionsIncluded: revisions,
        techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
      },
      milestones,
      notes,
      updatedAt: new Date().toISOString(),
    };

    await db.projects.update(id, updated);
    router.push(`/projects/${id}`);
  }

  async function handleDelete() {
    if (!confirm("⚠️ DELETE this project permanently? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure? All data + documents will be lost.")) return;
    await db.projects.delete(id);
    router.push("/");
  }

  if (!loaded) return <div style={{ padding: 40 }}>Loading...</div>;

  const milestoneSum = milestones.reduce((s, m) => s + m.percent, 0);

  return (
    <div className="page-container" style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <nav style={{ marginBottom: 20 }}>
        <Link href={`/projects/${id}`} style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
          ← Back to Project
        </Link>
      </nav>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Edit Project
          </h1>
          <p style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>
            Update any field. Changes reflect immediately in all 5 documents.
          </p>
        </div>
        <button onClick={handleDelete} style={{ padding: "8px 14px", background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
          🗑 Delete Project
        </button>
      </div>

      {/* CLIENT */}
      <Section title="01 · Client Information">
        <Grid cols={2}>
          <Field label="Business Name *" value={businessName} onChange={setBusinessName} />
          <Field label="Contact Person *" value={contactName} onChange={setContactName} />
          <Field label="Designation" value={designation} onChange={setDesignation} />
          <Field label="Email *" value={email} onChange={setEmail} type="email" />
          <Field label="Phone *" value={phone} onChange={setPhone} />
          <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} />
        </Grid>
        <Field label="Address Line 1" value={addrLine1} onChange={setAddrLine1} />
        <Grid cols={3}>
          <Field label="City" value={city} onChange={setCity} />
          <Field label="State" value={state} onChange={setState} />
          <Field label="Pincode" value={pincode} onChange={setPincode} />
        </Grid>
        <Grid cols={2}>
          <Field label="GSTIN" value={gstin} onChange={setGstin} />
          <Field label="PAN" value={clientPan} onChange={setClientPan} />
        </Grid>
      </Section>

      {/* PROJECT */}
      <Section title="02 · Project Details">
        <Field label="Project Title *" value={projectTitle} onChange={setProjectTitle} />
        <Field label="Description" value={projectDesc} onChange={setProjectDesc} multiline />
        <Grid cols={3}>
          <Field label="Start Date" value={startDate} onChange={setStartDate} type="date" />
          <Field label="Delivery Date" value={deliveryDate} onChange={setDeliveryDate} type="date" />
          <Field label="Revisions" value={String(revisions)} onChange={(v) => setRevisions(Number(v))} type="number" />
        </Grid>
        <Field label="Tech Stack" value={techStack} onChange={setTechStack} />
      </Section>

      {/* SCOPE - EDITABLE RATES */}
      <Section title="03 · Scope & Pricing (All Rates Editable)">
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, display: "grid", gridTemplateColumns: "1fr 90px 60px 100px 100px 30px", gap: 10 }}>
          <div>Item</div><div>SAC</div><div>Qty</div><div>Rate (Rs.)</div><div>Amount</div><div></div>
        </div>
        {scope.map((s) => (
          <div key={s.id}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 100px 100px 30px", gap: 10, marginBottom: 4 }}>
              <input style={inputStyle()} value={s.item} onChange={(e) => updateScope(s.id, "item", e.target.value)} placeholder="Service name" />
              <input style={inputStyle()} value={s.sacCode} onChange={(e) => updateScope(s.id, "sacCode", e.target.value)} />
              <input style={inputStyle()} type="number" value={s.quantity} onChange={(e) => updateScope(s.id, "quantity", Number(e.target.value))} />
              <input style={{ ...inputStyle(), fontFamily: "IBM Plex Mono, monospace", fontWeight: 500 }} type="number" value={s.rate} onChange={(e) => updateScope(s.id, "rate", Number(e.target.value))} />
              <input style={{ ...inputStyle(), background: "#fafafa", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }} readOnly value={s.amount} />
              <button onClick={() => removeScopeItem(s.id)} style={{ padding: "8px", border: "1px solid #e4e4e7", borderRadius: 4, background: "#fff", color: "#dc2626" }}>×</button>
            </div>
            <input
              style={{ ...inputStyle(), width: "calc(100% - 150px)", marginBottom: 10, fontSize: 11, color: "#71717a" }}
              value={s.description ?? ""}
              onChange={(e) => updateScope(s.id, "description", e.target.value)}
              placeholder="Optional: Sub-description (e.g., pages, features)"
            />
          </div>
        ))}
        <button onClick={addScopeItem} style={{ padding: "8px 14px", border: "1px dashed #71717a", borderRadius: 4, background: "transparent", color: "#71717a", fontSize: 12, marginTop: 4 }}>
          + Add Item
        </button>

        <div style={{ marginTop: 20, padding: 14, background: "#f8fafc", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, alignItems: "center" }}>
            <span>Discount</span>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} style={{ ...inputStyle(), width: 110, fontFamily: "IBM Plex Mono, monospace", textAlign: "right" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #cbd5e1", fontSize: 16, fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>{formatCurrency(finalAmount)}</span>
          </div>
        </div>
      </Section>

      {/* MILESTONES - FULLY EDITABLE */}
      <Section title="04 · Payment Milestones (Fully Editable)">
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Edit label, percentage, and amount for each milestone.</span>
          <button onClick={recalcMilestones} style={{ padding: "5px 12px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>
            ↻ Recalc Amounts from %
          </button>
        </div>
        {milestones.map((m, idx) => (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr 90px 130px 110px", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: "1px dashed #e4e4e7" }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a" }}>{String(idx + 1).padStart(2, "0")}</div>
            <input style={inputStyle()} value={m.label} onChange={(e) => updateMilestone(m.id, "label", e.target.value)} placeholder="Milestone label" />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input style={{ ...inputStyle(), width: "100%" }} type="number" value={m.percent} onChange={(e) => updateMilestone(m.id, "percent", Number(e.target.value))} />
              <span style={{ fontSize: 12, color: "#71717a" }}>%</span>
            </div>
            <input style={{ ...inputStyle(), fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }} type="number" value={m.amount} onChange={(e) => updateMilestone(m.id, "amount", Number(e.target.value))} />
            <select style={{ ...inputStyle(), fontSize: 11, textTransform: "uppercase", fontWeight: 600 }} value={m.status} onChange={(e) => updateMilestone(m.id, "status", e.target.value)}>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        ))}
        {milestoneSum !== 100 && (
          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>⚠ Milestones total {milestoneSum}% (should be 100%)</div>
        )}
      </Section>

      {/* NOTES */}
      <Section title="05 · Internal Notes">
        <Field label="Private notes" value={notes} onChange={setNotes} multiline />
      </Section>

      {/* ACTIONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingBottom: 40 }}>
        <Link href={`/projects/${id}`} style={{ padding: "12px 24px", borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", color: "#0f172a", textDecoration: "none", fontSize: 14 }}>
          Cancel
        </Link>
        <button onClick={handleSave} disabled={saving} style={{ padding: "12px 28px", borderRadius: 6, background: "#0f172a", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: 22 }}>
      <h2 style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18, fontWeight: 500 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  const className = cols === 3 ? "grid-3" : cols === 2 ? "grid-2" : "";
  return (
    <div className={className} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: multiline ? 12 : 0 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#3f3f46", marginBottom: 5 }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...inputStyle(), minHeight: 70, resize: "vertical", width: "100%" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle(), width: "100%" }} />
      )}
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    padding: "8px 12px",
    border: "1px solid #e4e4e7",
    borderRadius: 4,
    fontSize: 13,
    outline: "none",
    background: "#fff",
  };
}
