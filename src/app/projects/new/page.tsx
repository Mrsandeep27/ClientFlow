"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { formatCurrency, generateSlug, generateAccessCode } from "@/lib/utils";
import type { Project, ScopeItem, Milestone } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Client
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");
  const [gstin, setGstin] = useState("");
  const [clientPan, setClientPan] = useState("");

  // Project
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [revisions, setRevisions] = useState(3);
  const [techStack, setTechStack] = useState("Next.js, React, TypeScript, PostgreSQL");
  const [scope, setScope] = useState<ScopeItem[]>([
    { id: nanoid(), item: "", description: "", sacCode: "998313", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [discount, setDiscount] = useState(0);

  // Milestones
  const [m1pct, setM1pct] = useState(40);
  const [m2pct, setM2pct] = useState(30);
  const [m3pct, setM3pct] = useState(30);

  // Notes
  const [notes, setNotes] = useState("");

  const subtotal = scope.reduce((s, i) => s + i.amount, 0);
  const finalAmount = subtotal - discount;

  function updateScope(id: string, field: keyof ScopeItem, value: string | number) {
    setScope((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      })
    );
  }

  function addScopeItem() {
    setScope((prev) => [...prev, { id: nanoid(), item: "", description: "", sacCode: "998313", quantity: 1, rate: 0, amount: 0 }]);
  }

  function removeScopeItem(id: string) {
    setScope((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSave() {
    if (!businessName || !contactName || !email || !phone || !projectTitle || finalAmount <= 0) {
      alert("Please fill: Business Name, Contact Name, Email, Phone, Project Title, and valid amounts");
      return;
    }
    setSaving(true);

    const invoiceNumber = await db.getNextInvoiceNumber();
    const now = new Date().toISOString();
    const id = nanoid();

    const milestones: Milestone[] = [
      { id: nanoid(), label: "Advance Payment", percent: m1pct, amount: Math.round((finalAmount * m1pct) / 100), status: "pending" },
      { id: nanoid(), label: "Milestone Payment (Design Approval)", percent: m2pct, amount: Math.round((finalAmount * m2pct) / 100), status: "pending" },
      { id: nanoid(), label: "Final Payment (On Delivery)", percent: m3pct, amount: Math.round((finalAmount * m3pct) / 100), status: "pending" },
    ];

    const project: Project = {
      id,
      createdAt: now,
      updatedAt: now,
      status: "active",
      invoiceNumber,
      client: {
        businessName, contactName, designation, email, phone, whatsapp: whatsapp || phone,
        address: { line1: addrLine1, city, state, pincode }, gstin, pan: clientPan,
      },
      project: {
        title: projectTitle, description: projectDesc,
        scope, totalAmount: subtotal, discount, finalAmount,
        startDate, deliveryDate,
        revisionsIncluded: revisions,
        techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
      },
      milestones,
      documents: {
        contract: { status: "not_generated" },
        welcome: { status: "not_generated" },
        invoice: { status: "not_generated", number: invoiceNumber },
        portal: { enabled: true, slug: generateSlug(businessName), accessCode: generateAccessCode() },
        thankyou: { status: "not_generated" },
      },
      communication: [],
      notes,
    };

    await db.projects.add(project);
    router.push(`/projects/${id}`);
  }

  return (
    <div className="page-container" style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <nav style={{ marginBottom: 20 }}>
        <Link href="/" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
        New Project
      </h1>
      <p style={{ color: "#71717a", marginBottom: 28, fontSize: 14 }}>
        Fill this once. All 5 documents will auto-generate from this data.
      </p>

      {/* CLIENT SECTION */}
      <Section title="01 · Client Information">
        <Grid cols={2}>
          <Field label="Business Name *" value={businessName} onChange={setBusinessName} placeholder="e.g., Sharma Traders" />
          <Field label="Contact Person *" value={contactName} onChange={setContactName} placeholder="e.g., Rajesh Sharma" />
          <Field label="Designation" value={designation} onChange={setDesignation} placeholder="e.g., Owner / CEO" />
          <Field label="Email *" value={email} onChange={setEmail} type="email" />
          <Field label="Phone *" value={phone} onChange={setPhone} placeholder="+91 ..." />
          <Field label="WhatsApp (if different)" value={whatsapp} onChange={setWhatsapp} />
        </Grid>
        <div style={{ marginTop: 12 }}>
          <Field label="Address Line 1" value={addrLine1} onChange={setAddrLine1} placeholder="Shop/Building, Street" />
        </div>
        <Grid cols={3}>
          <Field label="City" value={city} onChange={setCity} />
          <Field label="State" value={state} onChange={setState} />
          <Field label="Pincode" value={pincode} onChange={setPincode} />
        </Grid>
        <Grid cols={2}>
          <Field label="GSTIN (if any)" value={gstin} onChange={setGstin} />
          <Field label="PAN (if shared)" value={clientPan} onChange={setClientPan} />
        </Grid>
      </Section>

      {/* PROJECT SECTION */}
      <Section title="02 · Project Details">
        <Field label="Project Title *" value={projectTitle} onChange={setProjectTitle} placeholder="e.g., Business website with WhatsApp catalog" />
        <Field label="Description" value={projectDesc} onChange={setProjectDesc} multiline placeholder="Short description of what will be built" />
        <Grid cols={3}>
          <Field label="Start Date" value={startDate} onChange={setStartDate} type="date" />
          <Field label="Target Delivery" value={deliveryDate} onChange={setDeliveryDate} type="date" />
          <Field label="Revisions Included" value={String(revisions)} onChange={(v) => setRevisions(Number(v))} type="number" />
        </Grid>
        <Field label="Tech Stack (comma-separated)" value={techStack} onChange={setTechStack} />
      </Section>

      {/* SCOPE */}
      <Section title="03 · Scope & Pricing">
        <div className="scope-table-wrapper">
        <div className="scope-table-row" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, display: "grid", gridTemplateColumns: "1fr 90px 70px 110px 110px 40px", gap: 10 }}>
          <div>Item</div><div>SAC</div><div>Qty</div><div>Rate</div><div>Amount</div><div></div>
        </div>
        {scope.map((s) => (
          <div key={s.id} className="scope-table-row" style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 110px 110px 40px", gap: 10, marginBottom: 8 }}>
            <input style={inputStyle()} value={s.item} onChange={(e) => updateScope(s.id, "item", e.target.value)} placeholder="Service name" />
            <input style={inputStyle()} value={s.sacCode} onChange={(e) => updateScope(s.id, "sacCode", e.target.value)} />
            <input style={inputStyle()} type="number" value={s.quantity} onChange={(e) => updateScope(s.id, "quantity", Number(e.target.value))} />
            <input style={inputStyle()} type="number" value={s.rate} onChange={(e) => updateScope(s.id, "rate", Number(e.target.value))} />
            <input style={{ ...inputStyle(), background: "#fafafa", fontFamily: "IBM Plex Mono, monospace" }} readOnly value={s.amount} />
            <button onClick={() => removeScopeItem(s.id)} style={{ padding: "8px", border: "1px solid #e4e4e7", borderRadius: 4, background: "#fff", color: "#dc2626" }}>×</button>
          </div>
        ))}
        </div>
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

      {/* MILESTONES */}
      <Section title="04 · Payment Milestones">
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12 }}>
          Default: 40-30-30 (advance / design approval / delivery). Adjust percentages if needed.
        </div>
        <Grid cols={3}>
          <MilestoneField label="Advance %" pct={m1pct} amount={Math.round((finalAmount * m1pct) / 100)} onChange={setM1pct} />
          <MilestoneField label="Milestone %" pct={m2pct} amount={Math.round((finalAmount * m2pct) / 100)} onChange={setM2pct} />
          <MilestoneField label="Final %" pct={m3pct} amount={Math.round((finalAmount * m3pct) / 100)} onChange={setM3pct} />
        </Grid>
        {m1pct + m2pct + m3pct !== 100 && (
          <div style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>⚠ Milestones must add to 100% (current: {m1pct + m2pct + m3pct}%)</div>
        )}
      </Section>

      {/* NOTES */}
      <Section title="05 · Internal Notes">
        <Field label="Private notes (not shown to client)" value={notes} onChange={setNotes} multiline placeholder="Any special instructions, stakeholders, reference links..." />
      </Section>

      {/* ACTIONS */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32, paddingBottom: 40 }}>
        <Link href="/" style={{ padding: "12px 24px", borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", color: "#0f172a", textDecoration: "none", fontSize: 14 }}>
          Cancel
        </Link>
        <button onClick={handleSave} disabled={saving} style={{ padding: "12px 28px", borderRadius: 6, background: "#0f172a", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Creating..." : "Create Project →"}
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

function Field({
  label, value, onChange, type = "text", placeholder, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#3f3f46", marginBottom: 5, letterSpacing: "-0.005em" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...inputStyle(), minHeight: 70, resize: "vertical", width: "100%" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle(), width: "100%" }}
        />
      )}
    </div>
  );
}

function MilestoneField({ label, pct, amount, onChange }: { label: string; pct: number; amount: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#3f3f46", marginBottom: 5 }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="number" value={pct} onChange={(e) => onChange(Number(e.target.value))} style={{ ...inputStyle(), width: 70 }} />
        <div style={{ flex: 1, padding: "8px 12px", background: "#f8fafc", borderRadius: 4, fontSize: 13, fontFamily: "IBM Plex Mono, monospace", color: "#3f3f46" }}>
          {formatCurrency(amount)}
        </div>
      </div>
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
