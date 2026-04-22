"use client";

import { use, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, numberToIndianWords } from "@/lib/utils";
import { DocShell } from "@/components/DocShell";
import { DEFAULT_VENDOR, type Milestone } from "@/lib/types";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const [vendor, setVendor] = useState(DEFAULT_VENDOR);
  const [selectedMilestone, setSelectedMilestone] = useState<string>("all");

  useEffect(() => { db.getVendor().then(setVendor); }, []);
  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  // Determine invoice mode: per-milestone or full
  const mode: "full" | Milestone = selectedMilestone === "all"
    ? "full"
    : project.milestones.find((m) => m.id === selectedMilestone) ?? "full";
  const invoiceAmount = mode === "full" ? project.project.finalAmount : mode.amount;
  const invoiceTitle = mode === "full" ? "Full Invoice" : mode.label;

  async function saveDraft() {
    await db.projects.update(id, {
      documents: { ...project!.documents, invoice: { ...project!.documents.invoice, status: "draft", generatedAt: new Date().toISOString() } },
    });
    alert("Saved");
  }

  return (
    <DocShell backHref={`/projects/${id}`} title="Invoice" subtitle={project.invoiceNumber} onGenerate={saveDraft}>
      <div className="doc-page-wrapper" style={{ padding: "20px 20px" }}>
        {/* Mode selector */}
        <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 14px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "#71717a" }}>Invoice for:</div>
          <select value={selectedMilestone} onChange={(e) => setSelectedMilestone(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e4e4e7", borderRadius: 4, fontSize: 13 }}>
            <option value="all">Full Amount — {formatCurrency(project.project.finalAmount)}</option>
            {project.milestones.map((m) => (
              <option key={m.id} value={m.id}>{m.label} — {formatCurrency(m.amount)}</option>
            ))}
          </select>
        </div>

        <div className="doc-a4" style={{
          maxWidth: "210mm", margin: "0 auto", background: "#fff", padding: "18mm 16mm",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minHeight: "297mm",
          fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#0f172a", lineHeight: 1.4,
        }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "flex-end", paddingBottom: 12, borderBottom: "2px solid #0f172a", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {vendor.businessName}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                Full-Stack Web &amp; Software Development · Mumbai
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 26, fontWeight: 300, letterSpacing: "-0.03em" }}>
                In<strong>voice</strong>
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, color: "#71717a", marginTop: 3 }}>
                {invoiceTitle}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderBottom: "1px solid #e4e4e7", paddingBottom: 10, marginBottom: 14 }}>
            <Meta label="Invoice No." value={project.invoiceNumber} />
            <Meta label="Issue Date" value={formatDate(new Date())} />
            <Meta label="Due Date" value={formatDate(new Date(Date.now() + 14 * 86400000))} />
            <Meta label="Currency" value="INR" />
          </div>

          {/* Addresses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, paddingBottom: 12, borderBottom: "1px solid #e4e4e7", marginBottom: 14 }}>
            <Addr
              label="Billed From"
              name={vendor.name}
              sub={`Proprietor · ${vendor.businessName}`}
              lines={[
                `${vendor.address.line1}, ${vendor.address.city} ${vendor.address.pincode}`,
              ]}
              tags={[
                `PAN · ${vendor.pan}   UDYAM · ${vendor.udyam}`,
                `Tel · ${vendor.phone}   ✉ ${vendor.email}`,
              ]}
            />
            <Addr
              label="Billed To"
              name={project.client.businessName}
              sub={`${project.client.contactName}${project.client.designation ? ` · ${project.client.designation}` : ""}`}
              lines={[
                `${project.client.address.line1}, ${project.client.address.city}, ${project.client.address.state} ${project.client.address.pincode}`,
              ]}
              tags={[
                project.client.gstin ? `GSTIN · ${project.client.gstin}` : "",
                project.client.pan ? `PAN · ${project.client.pan}` : "",
                `Tel · ${project.client.phone}   ✉ ${project.client.email}`,
              ].filter(Boolean)}
            />
          </div>

          {/* Items */}
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, display: "grid", gridTemplateColumns: "28px 1fr 70px 50px 90px 100px", gap: 10, borderBottom: "1px solid #0f172a", paddingBottom: 6 }}>
            <div>#</div><div>Description</div><div style={{ textAlign: "center" }}>SAC</div><div style={{ textAlign: "right" }}>Qty</div><div style={{ textAlign: "right" }}>Rate</div><div style={{ textAlign: "right" }}>Amount</div>
          </div>
          {mode === "full" ? (
            project.project.scope.map((s, i) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 50px 90px 100px", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a" }}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 500 }}>{s.item}</div>
                  {s.description && <div style={{ fontSize: 7.5, color: "#71717a", marginTop: 1 }}>{s.description}</div>}
                </div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, textAlign: "center", color: "#3f3f46" }}>{s.sacCode}</div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", color: "#3f3f46" }}>{s.quantity}</div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", color: "#3f3f46" }}>{s.rate.toLocaleString("en-IN")}</div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", fontWeight: 600 }}>{s.amount.toLocaleString("en-IN")}</div>
              </div>
            ))
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 70px 50px 90px 100px", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a" }}>01</div>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 500 }}>{mode.label}</div>
                <div style={{ fontSize: 7.5, color: "#71717a", marginTop: 1 }}>{mode.percent}% of project "{project.project.title}"</div>
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, textAlign: "center", color: "#3f3f46" }}>998311</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", color: "#3f3f46" }}>1</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", color: "#3f3f46" }}>{mode.amount.toLocaleString("en-IN")}</div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, textAlign: "right", fontWeight: 600 }}>{mode.amount.toLocaleString("en-IN")}</div>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, marginTop: 14, marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>
                Amount in Words
              </div>
              <div style={{ fontSize: 10, fontStyle: "italic", color: "#0f172a" }}>
                " {numberToIndianWords(invoiceAmount)} "
              </div>
            </div>
            <div style={{ border: "1px solid #e4e4e7", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 14px", fontSize: 9.5, color: "#71717a", borderBottom: "1px solid #f1f5f9" }}>
                <span>Subtotal</span>
                <span style={{ fontFamily: "IBM Plex Mono, monospace" }}>Rs. {invoiceAmount.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 12 }}>
                <span>Total Payable</span>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em" }}>Rs. {invoiceAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "10px 0", borderTop: "1px solid #e4e4e7", borderBottom: "1px solid #e4e4e7", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>
                Bank Details
              </div>
              <PayRow k="Account" v={vendor.bankDetails.accountName} />
              <PayRow k="Bank" v={vendor.bankDetails.bankName} />
              <PayRow k="Account №" v={vendor.bankDetails.accountNumber} />
              <PayRow k="IFSC" v={vendor.bankDetails.ifsc} />
              <PayRow k="UPI" v={vendor.bankDetails.upi} highlight />
            </div>
            {mode === "full" && (
              <div>
                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>
                  Payment Schedule
                </div>
                {project.milestones.map((m) => (
                  <div key={m.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr auto", gap: 8, alignItems: "center", padding: "3px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, fontWeight: 600 }}>{m.percent}%</div>
                    <div style={{ fontSize: 8.5, color: "#3f3f46" }}>{m.label}</div>
                    <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, fontWeight: 500 }}>{formatCurrency(m.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terms */}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 20, paddingBottom: 10, borderBottom: "1px solid #e4e4e7", marginBottom: 14 }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, lineHeight: 1.3 }}>
              Terms &amp;<br />Conditions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <TermItem k="MSMED" v="Payment within 45 days; interest at 3× RBI rate on delay." />
              <TermItem k="IP" v="Full code ownership transfers on final payment." />
              <TermItem k="Support" v="30 days of complimentary bug fixes included." />
              <TermItem k="Refund" v="Advance refundable within 7 days if work not commenced." />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 300 }}>Thank you<span style={{ color: "#dc2626" }}>.</span></div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1, marginTop: 5 }}>
                Looking forward to the partnership
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontStyle: "italic", borderBottom: "1px solid #0f172a", paddingBottom: 2, minWidth: 150, marginBottom: 4 }}>
                {vendor.name}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>
                Authorized Signatory · <strong style={{ color: "#0f172a" }}>{vendor.name}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ paddingRight: 12 }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 6.5, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 8.5, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function Addr({ label, name, sub, lines, tags }: { label: string; name: string; sub: string; lines: string[]; tags: string[] }) {
  return (
    <div>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 6.5, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 1 }}>{name}</div>
      <div style={{ fontSize: 8, color: "#71717a", marginBottom: 4 }}>{sub}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 8.5, color: "#3f3f46", lineHeight: 1.4 }}>{l}</div>
      ))}
      {tags.length > 0 && (
        <div style={{ marginTop: 4, fontFamily: "IBM Plex Mono, monospace", fontSize: 6.8, color: "#71717a" }}>
          {tags.map((t, i) => <div key={i} style={{ marginBottom: 1 }}>{t}</div>)}
        </div>
      )}
    </div>
  );
}

function PayRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10, fontSize: 7.8, padding: "1px 0" }}>
      <span style={{ color: "#71717a" }}>{k}</span>
      <span style={{ color: highlight ? "#059669" : "#0f172a", fontWeight: highlight ? 700 : 500, fontFamily: "IBM Plex Mono, monospace" }}>{v}</span>
    </div>
  );
}

function TermItem({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "55px 1fr", gap: 6, fontSize: 7.5 }}>
      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 6.8, fontWeight: 500, color: "#0f172a", textTransform: "uppercase", letterSpacing: 0.7, paddingTop: 1 }}>{k}</span>
      <span style={{ color: "#3f3f46", lineHeight: 1.35 }}>{v}</span>
    </div>
  );
}
