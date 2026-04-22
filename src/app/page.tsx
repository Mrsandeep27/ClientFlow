"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default function HomePage() {
  const projects = useLiveQuery(() => db.projects.orderBy("createdAt").reverse().toArray(), []);

  const active = projects?.filter((p) => p.status === "active") ?? [];
  const delivered = projects?.filter((p) => p.status === "delivered") ?? [];
  const archived = projects?.filter((p) => p.status === "archived") ?? [];

  const totalRevenue = (projects ?? []).reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0),
    0
  );
  const pendingRevenue = (projects ?? [])
    .filter((p) => p.status === "active")
    .reduce(
      (sum, p) => sum + p.milestones.filter((m) => m.status !== "paid").reduce((s, m) => s + m.amount, 0),
      0
    );

  return (
    <div className="page-container" style={{ minHeight: "100vh", padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <header className="header-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 className="big-title" style={{ fontFamily: "Playfair Display, serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
            ClientFlow
          </h1>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#71717a", marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>
            Sandeep Digital Solutions · Client Onboarding System
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: 10 }}>
          <Link href="/settings" style={btn("ghost")}>Settings</Link>
          <Link href="/projects/new" style={btn("primary")}>+ New Project</Link>
        </div>
      </header>

      {/* Stats */}
      <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Active Projects" value={active.length.toString()} />
        <StatCard label="Delivered" value={delivered.length.toString()} />
        <StatCard label="Revenue Collected" value={formatCurrency(totalRevenue)} />
        <StatCard label="Pending Revenue" value={formatCurrency(pendingRevenue)} accent />
      </div>

      {/* Active Projects */}
      <Section title="Active Projects" count={active.length}>
        {active.length === 0 ? (
          <EmptyState message="No active projects yet. Create one when a client says YES." />
        ) : (
          <ProjectGrid projects={active} />
        )}
      </Section>

      {/* Delivered */}
      {delivered.length > 0 && (
        <Section title="Delivered" count={delivered.length}>
          <ProjectGrid projects={delivered} />
        </Section>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <Section title="Archived" count={archived.length}>
          <ProjectGrid projects={archived} />
        </Section>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-card" style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: 16 }}>
      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
        {label}
      </div>
      <div className="stat-value" style={{ fontSize: 24, fontWeight: 700, color: accent ? "#dc2626" : "#0f172a", letterSpacing: "-0.02em" }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, borderBottom: "1px solid #e4e4e7", paddingBottom: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</h2>
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a" }}>({count})</span>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: "36px 20px", border: "2px dashed #e4e4e7", borderRadius: 8,
      textAlign: "center", color: "#71717a", fontSize: 13,
    }}>
      {message}
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="project-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const paidAmount = project.milestones.filter((m) => m.status === "paid").reduce((s, m) => s + m.amount, 0);
  const progress = Math.round((paidAmount / project.project.finalAmount) * 100);

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8,
        padding: 18, transition: "all 0.15s", cursor: "pointer",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0f172a"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e4e4e7"; }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#71717a", letterSpacing: 1 }}>
            {project.invoiceNumber}
          </div>
          <StatusBadge status={project.status} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 4 }}>
          {project.client.businessName}
        </h3>
        <div style={{ fontSize: 12, color: "#71717a", marginBottom: 12 }}>
          {project.project.title}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
          <span style={{ color: "#71717a" }}>Progress</span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#059669", transition: "width 0.3s" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#71717a" }}>
          <span>Started {formatDate(project.createdAt)}</span>
          <span style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, color: "#0f172a" }}>
            {formatCurrency(project.project.finalAmount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    active: { bg: "#ecfdf5", color: "#059669" },
    delivered: { bg: "#eff6ff", color: "#2563eb" },
    archived: { bg: "#f1f5f9", color: "#64748b" },
  };
  const c = colors[status] ?? colors.active;
  return (
    <span style={{
      fontSize: 9, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600,
      letterSpacing: 1, textTransform: "uppercase",
      background: c.bg, color: c.color, padding: "3px 8px", borderRadius: 3,
    }}>
      {status}
    </span>
  );
}

function btn(variant: "primary" | "ghost"): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "9px 18px", borderRadius: 6, fontSize: 13, fontWeight: 500,
    textDecoration: "none", letterSpacing: "-0.005em",
    display: "inline-flex", alignItems: "center", gap: 6,
    transition: "all 0.15s",
  };
  if (variant === "primary") {
    return { ...base, background: "#0f172a", color: "#fff" };
  }
  return { ...base, background: "#fff", color: "#0f172a", border: "1px solid #e4e4e7" };
}
