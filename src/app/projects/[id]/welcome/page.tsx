"use client";

import { use, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatDateLong } from "@/lib/utils";
import { DocShell } from "@/components/DocShell";
import { DEFAULT_VENDOR } from "@/lib/types";

export default function WelcomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const [vendor, setVendor] = useState(DEFAULT_VENDOR);

  useEffect(() => { db.getVendor().then(setVendor); }, []);
  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  async function saveDraft() {
    await db.projects.update(id, {
      documents: { ...project!.documents, welcome: { status: "draft", generatedAt: new Date().toISOString() } },
    });
    alert("Saved");
  }

  function copyWhatsApp() {
    const msg = `Hello ${project!.client.contactName} ji 🙏

Thank you for choosing ${vendor.businessName} for your ${project!.project.title}. I'm excited to work together.

📋 Next Steps:
1. You'll receive the formal Contract PDF
2. Pay 40% advance to start (Rs. ${Math.round((project!.project.finalAmount * 40) / 100).toLocaleString("en-IN")})
3. Share your brand assets (logo, photos, content)
4. We'll have a 15-min kickoff call

💳 Bank Details:
A/c: ${vendor.bankDetails.accountNumber}
IFSC: ${vendor.bankDetails.ifsc}
Name: ${vendor.bankDetails.accountName}
UPI: ${vendor.bankDetails.upi}

📅 Timeline: ${formatDateLong(project!.project.startDate)} → ${project!.project.deliveryDate ? formatDateLong(project!.project.deliveryDate) : "TBC"}

📞 Single point of contact: ${vendor.name} · ${vendor.phone}
(Reply to me directly here anytime 9 AM–9 PM)

Looking forward to this!

— ${vendor.name}
${vendor.businessName}
UDYAM: ${vendor.udyam}`;
    navigator.clipboard.writeText(msg);
    alert("WhatsApp message copied to clipboard!");
  }

  return (
    <DocShell backHref={`/projects/${id}`} title="Welcome Message" subtitle={project.invoiceNumber} onGenerate={saveDraft}>
      <div style={{ padding: "20px 20px" }}>
        {/* Actions above doc */}
        <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 14px", display: "flex", gap: 10 }}>
          <button onClick={copyWhatsApp} style={{
            padding: "10px 18px", background: "#25d366", color: "#fff",
            border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            📱 Copy WhatsApp Version
          </button>
          <div style={{ fontSize: 12, color: "#71717a", alignSelf: "center" }}>
            The PDF below is for formal email. The WhatsApp version is short for messaging.
          </div>
        </div>

        <div style={{
          maxWidth: "210mm", margin: "0 auto", background: "#fff", padding: "20mm 22mm",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minHeight: "297mm",
          fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#0f172a", lineHeight: 1.6,
        }}>
          {/* Letterhead */}
          <div style={{ marginBottom: 30, paddingBottom: 16, borderBottom: "2px solid #0f172a", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
                {vendor.businessName}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, color: "#71717a", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                Full-Stack Web &amp; Software Development · Mumbai
              </div>
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a", textAlign: "right" }}>
              {formatDateLong(new Date())}
            </div>
          </div>

          <div style={{ fontSize: 13, marginBottom: 20 }}>
            Dear <strong>{project.client.contactName}</strong>,
          </div>

          <p style={{ marginBottom: 14 }}>
            Thank you for choosing <strong>{vendor.businessName}</strong> to build your
            <strong> {project.project.title}</strong>. I'm genuinely excited to work with
            <strong> {project.client.businessName}</strong> and help bring this project to life.
          </p>

          <p style={{ marginBottom: 14 }}>
            This welcome packet contains everything you need to know about our workflow over the next few weeks.
            Please read through it — it will save us both a lot of back-and-forth.
          </p>

          {/* Timeline */}
          <SectionBlock title="What Happens Next (Your 7-Day Roadmap)">
            <Step n="01" title="Day 1 — Contract & Advance">
              You'll receive the formal contract (separate PDF) along with the first invoice for the advance payment ({Math.round((project.project.finalAmount * 40) / 100).toLocaleString("en-IN")}). Review, sign, and pay to lock the project on your calendar.
            </Step>
            <Step n="02" title="Day 2 — Asset Submission">
              Share required assets with me via WhatsApp or email (see the checklist below).
            </Step>
            <Step n="03" title="Day 3 — Kickoff Call (15 min)">
              Quick call to align on goals, design preferences, and any special requirements.
            </Step>
            <Step n="04" title="Day 4-7 — Initial Designs">
              I'll send the first design preview. You'll have {project.project.revisionsIncluded} rounds of revisions included.
            </Step>
          </SectionBlock>

          {/* Assets checklist */}
          <SectionBlock title="What I Need From You">
            <p style={{ marginBottom: 8 }}>Please send the following within 48 hours so we stay on schedule:</p>
            <ul style={{ paddingLeft: 18, fontSize: 10.5 }}>
              <li>Business logo (PNG/SVG) — original file if possible</li>
              <li>Brand colors (if any) and preferred fonts</li>
              <li>Product/service photos (high resolution)</li>
              <li>Content: services offered, pricing, about us, contact info</li>
              <li>Reference websites you like (2-3 examples)</li>
              <li>Any existing website login credentials (if replacing old site)</li>
              <li>Team member names, roles, photos (if showing on site)</li>
              <li>Testimonials from 2-3 happy customers (if available)</li>
            </ul>
          </SectionBlock>

          {/* Working together */}
          <SectionBlock title="How We'll Work Together">
            <ul style={{ paddingLeft: 18, fontSize: 10.5 }}>
              <li><strong>Communication:</strong> WhatsApp for quick updates, email for files/approvals, call for decisions.</li>
              <li><strong>Working hours:</strong> 9:00 AM to 9:00 PM IST, Monday–Saturday. Sunday reserved for family.</li>
              <li><strong>Response time:</strong> Within 24 hours on weekdays, usually under 4 hours during work hours.</li>
              <li><strong>Progress updates:</strong> Every 2-3 days via WhatsApp. Weekly written summary by email.</li>
              <li><strong>Your point of contact:</strong> Me directly — no account managers, no handoffs.</li>
            </ul>
          </SectionBlock>

          {/* Payment info */}
          <SectionBlock title="Payment Details (For All Milestones)">
            <div style={{ background: "#fafafa", padding: 12, borderRadius: 4, border: "1px solid #e4e4e7", fontSize: 10, fontFamily: "IBM Plex Mono, monospace", lineHeight: 1.7 }}>
              <div><strong>Account Name:</strong> {vendor.bankDetails.accountName}</div>
              <div><strong>Bank:</strong> {vendor.bankDetails.bankName}</div>
              <div><strong>Account №:</strong> {vendor.bankDetails.accountNumber}</div>
              <div><strong>IFSC:</strong> {vendor.bankDetails.ifsc}</div>
              <div><strong>UPI:</strong> {vendor.bankDetails.upi}</div>
            </div>
            <p style={{ marginTop: 8, fontSize: 10 }}>
              You'll receive a proper GST-compliant invoice before each milestone. Please use bank transfer or
              UPI for all payments. Avoid cash for amounts above Rs. 10,000 (tax regulations).
            </p>
          </SectionBlock>

          {/* FAQ */}
          <SectionBlock title="Quick FAQ">
            <FAQ q="What if I need changes mid-project?">
              {project.project.revisionsIncluded} revision rounds are included at each stage. Extra revisions or scope changes are billable separately — I'll always quote before doing extra work.
            </FAQ>
            <FAQ q="Who owns the code?">
              You do — once the final payment is received. Until then, intellectual property remains with me (as per the contract).
            </FAQ>
            <FAQ q="What if something breaks after launch?">
              I provide 30 days of free bug-fix support. After that, annual maintenance plans are available (starting Rs. 3,000/month).
            </FAQ>
            <FAQ q="Can I pause the project?">
              Yes — with 7 days' notice. Unused advance is refundable within the first 7 days if no work has started.
            </FAQ>
          </SectionBlock>

          <p style={{ marginTop: 20 }}>
            If you have any questions now, just reply to this email or WhatsApp me directly. Otherwise, I'll
            see the advance payment soon and we can begin.
          </p>

          <p style={{ marginTop: 14 }}>
            Looking forward to building something great together.
          </p>

          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontStyle: "italic", color: "#3f3f46" }}>
              {vendor.name}
            </div>
            <div style={{ fontSize: 10, color: "#71717a", marginTop: 2 }}>
              Proprietor · {vendor.businessName}
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a", marginTop: 6, letterSpacing: 0.3 }}>
              {vendor.phone} · {vendor.email}<br />
              UDYAM: {vendor.udyam} · PAN: {vendor.pan}
            </div>
          </div>
        </div>
      </div>
    </DocShell>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#0f172a",
        letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
        paddingBottom: 4, borderBottom: "1px solid #e4e4e7",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, marginBottom: 10 }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, color: "#71717a", paddingTop: 2 }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>{q}</div>
      <div style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
