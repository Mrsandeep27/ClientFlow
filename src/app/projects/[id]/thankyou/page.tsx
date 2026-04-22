"use client";

import { use, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { DocShell } from "@/components/DocShell";
import { DEFAULT_VENDOR } from "@/lib/types";

export default function ThankYouPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useLiveQuery(() => db.projects.get(id), [id]);
  const [vendor, setVendor] = useState(DEFAULT_VENDOR);

  useEffect(() => { db.getVendor().then(setVendor); }, []);
  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  async function saveDraft() {
    await db.projects.update(id, {
      documents: { ...project!.documents, thankyou: { status: "draft", generatedAt: new Date().toISOString() } },
    });
    alert("Saved");
  }

  function copyWhatsApp() {
    const msg = `${project!.client.contactName} ji 🙏

Your ${project!.project.title} is officially LIVE! 🎉

✅ Handed over:
• Source code (GitHub)
• All admin credentials
• 30-day free bug-fix support

I had a great time building this with you. Genuinely.

Two small favors (only if you're happy):

⭐ 30-sec Google Review: [Your Google Business link]
"What was the best part of working with me?" — that single line helps me a LOT.

🎁 Referral Reward: If you refer a friend who hires me, you get ₹5,000 cashback OR 10% off your next project.

Any friend who needs a website/software?

Thanks for trusting me with this.

— ${vendor.name}
${vendor.businessName}
${vendor.phone}`;
    navigator.clipboard.writeText(msg);
    alert("WhatsApp message copied!");
  }

  return (
    <DocShell backHref={`/projects/${id}`} title="Thank You Message" subtitle={project.invoiceNumber} onGenerate={saveDraft}>
      <div className="doc-page-wrapper" style={{ padding: "20px 20px" }}>
        <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 14px", display: "flex", gap: 10 }}>
          <button onClick={copyWhatsApp} style={{
            padding: "10px 18px", background: "#25d366", color: "#fff",
            border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            📱 Copy WhatsApp Version
          </button>
        </div>

        <div className="doc-a4" style={{
          maxWidth: "210mm", margin: "0 auto", background: "#fff", padding: "20mm 22mm",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", minHeight: "297mm",
          fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#0f172a", lineHeight: 1.6,
        }}>
          {/* Hero */}
          <div style={{ textAlign: "center", padding: "30px 0 20px", borderBottom: "2px solid #0f172a", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", color: "#0f172a", lineHeight: 1 }}>
              Thank you<span style={{ color: "#dc2626" }}>.</span>
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a", letterSpacing: 2, textTransform: "uppercase", marginTop: 10 }}>
              Project Complete · {formatDateLong(new Date())}
            </div>
          </div>

          <div style={{ fontSize: 13, marginBottom: 16 }}>
            Dear <strong>{project.client.contactName}</strong>,
          </div>

          <p style={{ marginBottom: 14 }}>
            We did it. Your <strong>{project.project.title}</strong> is officially live, tested, and handed over.
            It has been a pleasure working with <strong>{project.client.businessName}</strong> over the past few weeks.
          </p>

          <p style={{ marginBottom: 22 }}>
            This letter is partly a formal handover document, and partly a personal thank you for trusting a
            solo developer with your business project. I'll keep it short.
          </p>

          {/* Handover */}
          <Block title="Handover Summary">
            <ul style={{ paddingLeft: 18, fontSize: 10.5, lineHeight: 1.7 }}>
              <li><strong>Source Code:</strong> Pushed to GitHub. Repository access shared via email.</li>
              <li><strong>Admin Credentials:</strong> Hosting, domain, and admin panel logins — shared in a separate password-protected document.</li>
              <li><strong>Deployment:</strong> Live on production infrastructure. SSL configured. Auto-deploys on code update.</li>
              <li><strong>Documentation:</strong> Quick-start guide for admin panel + how to update content.</li>
              <li><strong>Contract Amount:</strong> {formatCurrency(project.project.finalAmount)} — fully received, invoices closed.</li>
            </ul>
          </Block>

          {/* Warranty */}
          <Block title="Free Support (Next 30 Days)">
            <p style={{ fontSize: 10.5 }}>
              From today, you have 30 days of <strong>complimentary bug-fix support</strong>. If something breaks
              (broken link, form not submitting, display glitch), just WhatsApp me at <strong>{vendor.phone}</strong>
              and I'll fix it within 48 hours — no charge.
            </p>
            <p style={{ fontSize: 10.5, marginTop: 6 }}>
              Please note: new features, design changes, or content edits are out of warranty. I'll quote them
              separately. But fixing things that aren't working — always free in the first month.
            </p>
          </Block>

          {/* Testimonial ask */}
          <Block title="A Small Ask (Only If You're Happy)" accent>
            <p style={{ fontSize: 10.5 }}>
              If you feel this project genuinely went well, <strong>one sentence of feedback</strong> from you
              would mean the world to me. I'm building my freelance practice from scratch, and your words help
              the next client trust me.
            </p>
            <div style={{ marginTop: 10, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 6, padding: 12 }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7.5, color: "#71717a", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4 }}>
                The question that's easiest to answer:
              </div>
              <div style={{ fontSize: 11.5, fontStyle: "italic", color: "#0f172a", fontWeight: 500 }}>
                "What was the best part of working with Sandeep?"
              </div>
            </div>
            <p style={{ fontSize: 10.5, marginTop: 8 }}>
              Reply to this email with 2-3 lines, or leave a Google review — whichever is easier for you.
            </p>
          </Block>

          {/* Referral */}
          <Block title="Referral Reward" accent>
            <p style={{ fontSize: 10.5 }}>
              Know another business owner or friend who needs a website, CRM, ERP, or custom software?
              Send them my way — and you both benefit:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Reward label="For You" value="Rs. 5,000 cashback" sub="Once they sign the contract" />
              <Reward label="For Them" value="10% off project" sub="First-time referral discount" />
            </div>
          </Block>

          {/* Future services */}
          <Block title="Need Something Later?">
            <ul style={{ paddingLeft: 18, fontSize: 10.5, lineHeight: 1.7 }}>
              <li><strong>Annual Maintenance:</strong> Keep site updated, backed up, and secure — starting Rs. 3,000/month.</li>
              <li><strong>Phase 2 Features:</strong> Things we talked about but parked for later.</li>
              <li><strong>New Projects:</strong> Mobile app, custom dashboard, integrations, etc.</li>
            </ul>
            <p style={{ fontSize: 10.5, marginTop: 6 }}>
              Repeat clients get a 15% loyalty discount on all future work.
            </p>
          </Block>

          {/* PS */}
          <div style={{ marginTop: 20, padding: 14, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6 }}>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 8, color: "#0369a1", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              P.S.
            </div>
            <div style={{ fontSize: 10.5, color: "#075985" }}>
              Let me know after 1 month how your customers are responding to the new {project.project.title}.
              I'm genuinely curious. Not a sales question — just want to know how it's working for you in the real world.
            </div>
          </div>

          {/* Sign off */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: "italic", color: "#3f3f46", marginBottom: 4 }}>
              {vendor.name}
            </div>
            <div style={{ fontSize: 10, color: "#71717a" }}>
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

function Block({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 20, padding: accent ? 14 : 0, background: accent ? "#fefce8" : "transparent", border: accent ? "1px solid #fde68a" : "none", borderRadius: accent ? 6 : 0 }}>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 9, color: accent ? "#92400e" : "#0f172a",
        letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600,
        marginBottom: 8, paddingBottom: accent ? 0 : 4,
        borderBottom: accent ? "none" : "1px solid #e4e4e7",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Reward({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 6, padding: 12 }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 7, color: "#71717a", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "#059669" }}>{value}</div>
      <div style={{ fontSize: 9, color: "#71717a", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
