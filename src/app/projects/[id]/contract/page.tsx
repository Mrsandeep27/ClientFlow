"use client";

import { use, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDateLong, numberToIndianWords } from "@/lib/utils";
import { DocShell } from "@/components/DocShell";
import { DEFAULT_VENDOR } from "@/lib/types";

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const [vendor, setVendor] = useState(DEFAULT_VENDOR);

  useEffect(() => {
    db.getVendor().then(setVendor);
  }, []);

  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  async function saveDraft() {
    await db.projects.update(id, {
      documents: { ...project!.documents, contract: { status: "draft", generatedAt: new Date().toISOString() } },
      updatedAt: new Date().toISOString(),
    });
    alert("Saved as draft");
  }

  const today = formatDateLong(new Date());

  return (
    <DocShell backHref={`/projects/${id}`} title="Client Contract" subtitle={project.invoiceNumber} onGenerate={saveDraft}>
      <div className="doc-page-wrapper" style={{ padding: "30px 20px" }}>
        <div className="doc-a4" style={{
          maxWidth: "210mm", margin: "0 auto", background: "#fff", padding: "20mm 18mm",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minHeight: "297mm",
          fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#0f172a", lineHeight: 1.5,
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 16, borderBottom: "2px solid #0f172a" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
              SERVICE AGREEMENT
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, color: "#71717a", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Contract № {project.invoiceNumber} · Dated {today}
            </div>
          </div>

          {/* Parties */}
          <Section label="Parties to the Agreement">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 8 }}>
              <Party
                tag="Service Provider (First Party)"
                name={vendor.name}
                business={vendor.businessName}
                lines={[
                  `${vendor.address.line1}, ${vendor.address.line2 ?? ""}`,
                  `${vendor.address.city}, ${vendor.address.state} ${vendor.address.pincode}`,
                  `PAN: ${vendor.pan}`,
                  `UDYAM: ${vendor.udyam}`,
                  `Email: ${vendor.email}`,
                  `Phone: ${vendor.phone}`,
                ]}
              />
              <Party
                tag="Client (Second Party)"
                name={project.client.contactName}
                business={project.client.businessName}
                lines={[
                  `${project.client.address.line1}`,
                  `${project.client.address.city}, ${project.client.address.state} ${project.client.address.pincode}`,
                  project.client.gstin ? `GSTIN: ${project.client.gstin}` : "",
                  project.client.pan ? `PAN: ${project.client.pan}` : "",
                  `Email: ${project.client.email}`,
                  `Phone: ${project.client.phone}`,
                ].filter(Boolean)}
              />
            </div>
          </Section>

          {/* Recitals */}
          <Section label="1. Recitals">
            <p>
              WHEREAS, the Second Party ({project.client.businessName}) desires to engage the First Party for
              the development of <strong>{project.project.title}</strong>, and WHEREAS the First Party has the
              necessary skills, experience and resources to perform these services, the parties hereby agree
              to the terms set forth below.
            </p>
          </Section>

          {/* Scope */}
          <Section label="2. Scope of Work">
            <p style={{ marginBottom: 8 }}>{project.project.description || "As detailed below."}</p>
            <div style={{ background: "#fafafa", padding: 10, borderRadius: 4, border: "1px solid #e4e4e7" }}>
              {project.project.scope.map((s, i) => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 8, padding: "4px 0", borderBottom: i < project.project.scope.length - 1 ? "1px dashed #e4e4e7" : "none", fontSize: 9.5 }}>
                  <span style={{ color: "#71717a" }}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{s.item}</strong>
                    {s.description && <div style={{ fontSize: 9, color: "#71717a" }}>{s.description}</div>}
                  </div>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{formatCurrency(s.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 9, color: "#3f3f46" }}>
              <strong>Tech Stack:</strong> {project.project.techStack.join(", ")}
            </div>
          </Section>

          {/* Timeline */}
          <Section label="3. Timeline">
            <p>
              <strong>Start Date:</strong> {formatDateLong(project.project.startDate)}<br />
              <strong>Target Delivery:</strong> {project.project.deliveryDate ? formatDateLong(project.project.deliveryDate) : "To be confirmed"}<br />
              <strong>Revisions Included:</strong> {project.project.revisionsIncluded} (additional revisions billable separately)
            </p>
          </Section>

          {/* Payment */}
          <Section label="4. Payment Terms">
            <p style={{ marginBottom: 8 }}>
              Total project fee: <strong>{formatCurrency(project.project.finalAmount)}</strong> ({numberToIndianWords(project.project.finalAmount)}).
              Payable in the following milestones:
            </p>
            <div style={{ background: "#fafafa", padding: 10, borderRadius: 4, border: "1px solid #e4e4e7" }}>
              {project.milestones.map((m, i) => (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "50px 1fr auto", gap: 8, padding: "4px 0", borderBottom: i < project.milestones.length - 1 ? "1px dashed #e4e4e7" : "none", fontSize: 9.5 }}>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{m.percent}%</span>
                  <span>{m.label}</span>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{formatCurrency(m.amount)}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 8, fontSize: 9.5 }}>
              Payments to be made via bank transfer (NEFT/RTGS/UPI) to the account specified in invoices.
              Late payments beyond 45 days attract interest at 3× RBI bank rate per the MSMED Act, 2006.
            </p>
          </Section>

          {/* IP */}
          <Section label="5. Intellectual Property">
            <p>
              All source code, designs, and deliverables shall remain the property of the First Party until
              <strong> final payment has been received in full</strong>. Upon receipt of final payment, full
              intellectual property rights, including source code, transfer to the Second Party with perpetual,
              worldwide rights to use, modify, and distribute the delivered work.
            </p>
          </Section>

          {/* Confidentiality */}
          <Section label="6. Confidentiality">
            <p>
              Both parties agree to maintain strict confidentiality of any proprietary business information,
              customer data, credentials, or trade secrets disclosed during the course of this engagement. This
              obligation survives termination of this agreement.
            </p>
          </Section>

          {/* Warranty */}
          <Section label="7. Warranty &amp; Support">
            <p>
              The First Party shall provide <strong>30 days of complimentary bug-fix support</strong> from the
              date of final delivery. This covers defects but excludes new feature requests. Post-warranty support
              is available at mutually agreed rates.
            </p>
          </Section>

          {/* Termination */}
          <Section label="8. Termination">
            <p>
              Either party may terminate this agreement with 15 days written notice. Upon termination: (a) the
              Second Party shall pay for all work completed up to the termination date; (b) the First Party shall
              deliver work completed to date; (c) confidentiality obligations survive.
              <br /><br />
              If no work has commenced, the advance payment is refundable within 7 days of project start.
            </p>
          </Section>

          {/* Force Majeure */}
          <Section label="9. Force Majeure">
            <p>
              Neither party shall be liable for delays caused by events beyond reasonable control, including
              but not limited to natural disasters, pandemics, government actions, internet/power outages, or
              labor strikes.
            </p>
          </Section>

          {/* Governing law */}
          <Section label="10. Governing Law &amp; Jurisdiction">
            <p>
              This agreement is governed by the laws of India, including the Indian Contract Act 1872 and the
              Information Technology Act 2000. Any disputes shall first be attempted to be resolved through
              mutual discussion, failing which they shall be subject to the exclusive jurisdiction of courts
              at <strong>Mumbai, Maharashtra</strong>.
            </p>
          </Section>

          {/* GST Note */}
          <Section label="11. Taxation">
            <p>
              GST is not currently applicable as the First Party operates under the MSME threshold
              (annual turnover below Rs. 20 Lakh). TDS may be deducted by the Second Party at 10% under Section
              194J of the Income Tax Act 1961, with Form 16A issued for refund claim.
            </p>
          </Section>

          {/* Signatures */}
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "2px solid #0f172a", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ fontSize: 9, color: "#71717a", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 28, fontFamily: "IBM Plex Mono, monospace" }}>
                First Party (Service Provider)
              </div>
              <div style={{ borderBottom: "1px solid #0f172a", minHeight: 40, marginBottom: 6 }} />
              <div style={{ fontWeight: 600, fontSize: 11 }}>{vendor.name}</div>
              <div style={{ fontSize: 9, color: "#71717a", fontFamily: "IBM Plex Mono, monospace" }}>Date: _______________</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#71717a", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 28, fontFamily: "IBM Plex Mono, monospace" }}>
                Second Party (Client)
              </div>
              <div style={{ borderBottom: "1px solid #0f172a", minHeight: 40, marginBottom: 6 }} />
              <div style={{ fontWeight: 600, fontSize: 11 }}>{project.client.contactName}</div>
              <div style={{ fontSize: 9, color: "#71717a" }}>{project.client.businessName}</div>
              <div style={{ fontSize: 9, color: "#71717a", fontFamily: "IBM Plex Mono, monospace" }}>Date: _______________</div>
            </div>
          </div>
        </div>
      </div>
    </DocShell>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 8.5, color: "#71717a", letterSpacing: 1.5,
        textTransform: "uppercase", fontWeight: 500, marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 10, color: "#0f172a", lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function Party({ tag, name, business, lines }: { tag: string; name: string; business: string; lines: string[] }) {
  return (
    <div>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 7.5, color: "#71717a", letterSpacing: 1.2,
        textTransform: "uppercase", fontWeight: 500, marginBottom: 4,
      }}>
        {tag}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 9, color: "#3f3f46", marginBottom: 4 }}>{business}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 8.5, color: "#3f3f46", fontFamily: "IBM Plex Mono, monospace", lineHeight: 1.5 }}>{l}</div>
      ))}
    </div>
  );
}
