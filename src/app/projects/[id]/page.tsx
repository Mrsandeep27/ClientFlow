"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Milestone } from "@/lib/types";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useLiveQuery(() => db.projects.get(id), [id]);

  if (!project) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  const paidAmount = project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const progress = Math.round((paidAmount / project.project.finalAmount) * 100);

  async function updateMilestone(mid: string, status: Milestone["status"]) {
    if (!project) return;
    const updated = project.milestones.map((m) =>
      m.id === mid
        ? { ...m, status, paidDate: status === "paid" ? new Date().toISOString() : undefined }
        : m
    );
    await db.projects.update(project.id, { milestones: updated, updatedAt: new Date().toISOString() });
  }

  async function markDelivered() {
    if (!project) return;
    if (!confirm("Mark project as DELIVERED? (Thank you message can then be generated)")) return;
    await db.projects.update(project.id, { status: "delivered", updatedAt: new Date().toISOString() });
  }

  async function archive() {
    if (!project) return;
    if (!confirm("Archive this project?")) return;
    await db.projects.update(project.id, { status: "archived", updatedAt: new Date().toISOString() });
  }

  return (
    <div className="page-container" style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", textDecoration: "none", letterSpacing: 1, textTransform: "uppercase" }}>
          ← All Projects
        </Link>
      </nav>

      {/* Header */}
      <div className="header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", letterSpacing: 1, marginBottom: 4 }}>
            {project.invoiceNumber} · Created {formatDate(project.createdAt)}
          </div>
          <h1 className="big-title" style={{ fontFamily: "Playfair Display, serif", fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {project.client.businessName}
          </h1>
          <div style={{ color: "#3f3f46", fontSize: 14, marginTop: 4 }}>
            {project.project.title}
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 8 }}>
          {project.status === "active" && (
            <button onClick={markDelivered} style={btnStyle("primary")}>Mark Delivered</button>
          )}
          {project.status !== "archived" && (
            <button onClick={archive} style={btnStyle("ghost")}>Archive</button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "20px 0 28px" }}>
        <InfoCard label="Total Amount" value={formatCurrency(project.project.finalAmount)} />
        <InfoCard label="Collected" value={formatCurrency(paidAmount)} accent="#059669" />
        <InfoCard label="Pending" value={formatCurrency(project.project.finalAmount - paidAmount)} accent="#dc2626" />
        <InfoCard label="Progress" value={`${progress}%`} />
      </div>

      {/* Two columns: Docs + Milestones */}
      <div className="grid-2-dashboard" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Documents */}
        <div>
          <h2 style={sectionTitleStyle()}>5 Documents</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <DocCard
              num="01"
              title="Client Contract"
              desc="Legal service agreement. Generate & send when client commits."
              status={project.documents.contract.status}
              href={`/projects/${id}/contract`}
            />
            <DocCard
              num="02"
              title="Welcome Message"
              desc="Onboarding message. Send within 1 hour of contract signing."
              status={project.documents.welcome.status}
              href={`/projects/${id}/welcome`}
            />
            <DocCard
              num="03"
              title="Invoice"
              desc={`Invoice no. ${project.documents.invoice.number ?? project.invoiceNumber}. Generate per milestone.`}
              status={project.documents.invoice.status}
              href={`/projects/${id}/invoice`}
            />
            <DocCard
              num="04"
              title="Client Portal"
              desc={`Shareable link: /portal/${project.documents.portal.slug} · Code: ${project.documents.portal.accessCode}`}
              status={project.documents.portal.enabled ? "draft" : "not_generated"}
              href={`/portal/${project.documents.portal.slug}?code=${project.documents.portal.accessCode}`}
              external
            />
            <DocCard
              num="05"
              title="Thank You Message"
              desc="Post-delivery note + testimonial request + referral ask."
              status={project.documents.thankyou.status}
              href={`/projects/${id}/thankyou`}
              disabled={project.status === "active"}
            />
          </div>
        </div>

        {/* Milestones + Client */}
        <div>
          <h2 style={sectionTitleStyle()}>Payment Milestones</h2>
          <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: 16, marginBottom: 20 }}>
            {project.milestones.map((m) => (
              <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px dashed #e4e4e7" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, fontWeight: 600 }}>
                    {formatCurrency(m.amount)}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: "IBM Plex Mono, monospace", color: "#71717a" }}>
                    {m.percent}% {m.paidDate ? `· Paid ${formatDate(m.paidDate)}` : ""}
                  </div>
                  <select
                    value={m.status}
                    onChange={(e) => updateMilestone(m.id, e.target.value as Milestone["status"])}
                    style={{ fontSize: 10, padding: "3px 6px", border: "1px solid #e4e4e7", borderRadius: 3, textTransform: "uppercase", fontWeight: 600, letterSpacing: 0.5 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="sent">Invoice Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <h2 style={sectionTitleStyle()}>Client Contact</h2>
          <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: 16, fontSize: 12 }}>
            <InfoRow label="Contact" value={project.client.contactName} />
            <InfoRow label="Phone" value={project.client.phone} />
            <InfoRow label="Email" value={project.client.email} />
            {project.client.whatsapp && <InfoRow label="WhatsApp" value={project.client.whatsapp} />}
            {project.client.gstin && <InfoRow label="GSTIN" value={project.client.gstin} />}
            <InfoRow label="Address" value={`${project.client.address.line1}, ${project.client.address.city}`} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Link href={`/projects/${id}/edit`} style={{ ...btnStyle("ghost"), width: "100%", justifyContent: "center", display: "flex" }}>
              Edit Project Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocCard({ num, title, desc, status, href, external, disabled }: {
  num: string; title: string; desc: string; status: string; href: string; external?: boolean; disabled?: boolean;
}) {
  const statusColors: Record<string, { bg: string; color: string; text: string }> = {
    not_generated: { bg: "#f1f5f9", color: "#71717a", text: "NOT READY" },
    draft: { bg: "#fef3c7", color: "#92400e", text: "DRAFT" },
    sent: { bg: "#ecfdf5", color: "#059669", text: "SENT" },
  };
  const s = statusColors[status] ?? statusColors.not_generated;
  const content = (
    <div style={{
      background: disabled ? "#fafafa" : "#fff",
      border: "1px solid #e4e4e7",
      borderRadius: 8,
      padding: 16,
      display: "grid",
      gridTemplateColumns: "40px 1fr auto auto",
      gap: 14,
      alignItems: "center",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.15s",
      cursor: disabled ? "not-allowed" : "pointer",
    }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 600, color: "#71717a" }}>
        {num}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 11, color: "#71717a", lineHeight: 1.4 }}>{desc}</div>
      </div>
      <span style={{ fontSize: 9, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, letterSpacing: 1, background: s.bg, color: s.color, padding: "3px 8px", borderRadius: 3 }}>
        {s.text}
      </span>
      <div style={{ fontSize: 13, color: disabled ? "#cbd5e1" : "#0f172a" }}>→</div>
    </div>
  );

  if (disabled) return <div>{content}</div>;
  if (external) return <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>{content}</a>;
  return <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>{content}</Link>;
}

function InfoCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: 14 }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent ?? "#0f172a", letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 10, padding: "4px 0" }}>
      <span style={{ color: "#71717a" }}>{label}</span>
      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>{value}</span>
    </div>
  );
}

function sectionTitleStyle(): React.CSSProperties {
  return {
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: 11,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    fontWeight: 500,
  };
}

function btnStyle(variant: "primary" | "ghost"): React.CSSProperties {
  if (variant === "primary") {
    return { padding: "9px 18px", background: "#0f172a", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" };
  }
  return { padding: "9px 18px", background: "#fff", color: "#0f172a", border: "1px solid #e4e4e7", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer", textDecoration: "none" };
}
