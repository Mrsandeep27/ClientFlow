"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";

  const project = useLiveQuery(async () => {
    const all = await db.projects.toArray();
    return all.find((p) => p.documents.portal.slug === slug && p.documents.portal.accessCode === code);
  }, [slug, code]);

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "#fafafa" }}>
        <div style={{ maxWidth: 380, textAlign: "center", padding: 40, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Portal</div>
          <div style={{ color: "#71717a", fontSize: 13 }}>Invalid access code or project not found.</div>
        </div>
      </div>
    );
  }

  const paid = project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const pending = project.project.finalAmount - paid;
  const progress = Math.round((paid / project.project.finalAmount) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "#0f172a", color: "#fff", borderRadius: 10, padding: "22px 26px", marginBottom: 20 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            Client Portal · {project.invoiceNumber}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {project.client.businessName}
          </h1>
          <div style={{ color: "#cbd5e1", fontSize: 13, marginTop: 4 }}>
            {project.project.title}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
                Project Status
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{progress}% Complete</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <StatusBadge status={project.status} />
            </div>
          </div>
          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #059669, #10b981)", transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 18 }}>
            <Stat label="Total Amount" value={formatCurrency(project.project.finalAmount)} />
            <Stat label="Paid" value={formatCurrency(paid)} color="#059669" />
            <Stat label="Pending" value={formatCurrency(pending)} color="#dc2626" />
          </div>
        </div>

        {/* Milestones */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
            Payment Milestones
          </div>
          {project.milestones.map((m) => (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px dashed #e4e4e7" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: m.status === "paid" ? "#059669" : m.status === "sent" ? "#2563eb" : "#e4e4e7",
                color: m.status === "pending" ? "#71717a" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, fontFamily: "IBM Plex Mono, monospace",
              }}>
                {m.status === "paid" ? "✓" : m.percent + "%"}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: "#71717a", fontFamily: "IBM Plex Mono, monospace" }}>
                  {m.status === "paid" && m.paidDate ? `Paid on ${formatDate(m.paidDate)}` : m.status === "sent" ? "Invoice sent · Awaiting payment" : "Upcoming"}
                </div>
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 600 }}>
                {formatCurrency(m.amount)}
              </div>
              <StatusBadge status={m.status} small />
            </div>
          ))}
        </div>

        {/* Scope */}
        <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 10, padding: 22, marginBottom: 20 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
            Scope of Work
          </div>
          {project.project.scope.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, padding: "8px 0", borderBottom: i < project.project.scope.length - 1 ? "1px dashed #e4e4e7" : "none" }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a" }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{s.item}</div>
                {s.description && <div style={{ fontSize: 10, color: "#71717a" }}>{s.description}</div>}
              </div>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, fontWeight: 600 }}>{formatCurrency(s.amount)}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: "#0f172a", color: "#fff", borderRadius: 10, padding: 22, textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Need to reach me?
          </div>
          <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 14 }}>
            Your single point of contact for this project
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="tel:+917039185207" style={btnDark()}>📞 Call</a>
            <a href="https://wa.me/917039185207" style={btnDark()}>💬 WhatsApp</a>
            <a href="mailto:pandey.sandeep70391@gmail.com" style={btnDark()}>✉ Email</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a", letterSpacing: 1.2 }}>
          Sandeep Digital Solutions · UDYAM-MH-18-0541047
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = "#0f172a" }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#71717a", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: "#ecfdf5", color: "#059669" },
    delivered: { bg: "#eff6ff", color: "#2563eb" },
    archived: { bg: "#f1f5f9", color: "#64748b" },
    paid: { bg: "#ecfdf5", color: "#059669" },
    sent: { bg: "#eff6ff", color: "#2563eb" },
    pending: { bg: "#fef3c7", color: "#92400e" },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <span style={{
      fontSize: small ? 8 : 10, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600,
      letterSpacing: 1, textTransform: "uppercase",
      background: c.bg, color: c.color, padding: small ? "2px 6px" : "4px 10px", borderRadius: 3,
    }}>
      {status}
    </span>
  );
}

function btnDark(): React.CSSProperties {
  return {
    padding: "10px 18px", background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6,
    color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 500,
  };
}
