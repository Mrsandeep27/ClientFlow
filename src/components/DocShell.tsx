"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function DocShell({
  backHref,
  title,
  subtitle,
  onGenerate,
  children,
}: {
  backHref: string;
  title: string;
  subtitle?: string;
  onGenerate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar (hidden in print) */}
      <div className="no-print" style={{
        background: "#0f172a", color: "#fff", padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href={backHref} style={{
            fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#cbd5e1",
            textDecoration: "none", letterSpacing: 1, textTransform: "uppercase",
          }}>← Back</Link>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: "#cbd5e1" }}>{subtitle}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onGenerate && (
            <button onClick={onGenerate} style={{
              padding: "8px 14px", background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
            }}>
              Save Draft
            </button>
          )}
          <button onClick={() => window.print()} style={{
            padding: "8px 16px", background: "#10b981", color: "#fff",
            border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            Download PDF
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
