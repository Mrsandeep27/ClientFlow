# ClientFlow — Sandeep Digital Solutions

Client onboarding & document generation PWA. Fill one form → get 5 professional documents per client.

## What It Does

When a client says YES, create a project in ClientFlow. It auto-generates all 5 documents you need:

1. **Client Contract** — Legal service agreement (11 clauses, Indian Contract Act compliant)
2. **Welcome Message** — Formal welcome email + WhatsApp-ready version
3. **Invoice** — Full or per-milestone GST-compliant invoice (SAC codes)
4. **Client Portal** — Shareable public link where client sees live project status
5. **Thank You Message** — Post-delivery note with testimonial + referral ask

All documents match your Swiss minimalist brand style. Download as PDF with one click.

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Dexie.js** — IndexedDB for offline-first local storage
- **dexie-react-hooks** for live queries
- **nanoid** for IDs
- **PWA-ready** via manifest.json

## Setup (First Time)

```bash
cd ClientFlow
npm install
npm run dev
```

Open http://localhost:3000

Your data stays on your laptop (IndexedDB) — no server needed, no hosting cost.

## Usage Workflow

### 1. Client Says YES → Create Project
Click `+ New Project` → fill one form:
- Client info (business, contact, address, GSTIN, PAN)
- Project scope (items + SAC codes + rates)
- Pricing (auto-calculates 40-30-30 milestones)
- Dates, tech stack, revisions included

### 2. Project Dashboard
See all 5 document cards + milestone tracker.

### 3. Generate Each Document
Click any card → full preview → `Download PDF` (browser print → Save as PDF).
WhatsApp versions auto-copy to clipboard for messaging.

### 4. Track Payments
Mark each milestone `pending → sent → paid` as you go.

### 5. Mark Delivered
When project ships, click "Mark Delivered" — Thank You document unlocks.

### 6. Client Portal
Share `yourapp.com/portal/[slug]?code=[code]` with client — they see live status, milestones, payments.

## Pre-filled Info (Vendor = You)

Your details are pre-filled in all documents:
- **Sandeep Pandey** · Sandeep Digital Solutions
- UDYAM: MH-18-0541047 · PAN: GVBPP8719M
- Phone: +91 70391 85207
- Email: pandey.sandeep70391@gmail.com
- Address: V4, Shubhas Nagar No-2, Andheri, Mumbai 400093
- Bank: SBI 44385737129 · IFSC SBIN0007074

Edit these in `src/lib/types.ts` → `DEFAULT_VENDOR` if anything changes.

## PDF Export

All documents use browser print-to-PDF (Ctrl+P → Save as PDF).
- Works offline
- No server-side PDF library needed
- A4-sized, print-optimized

## Data Backup

Data lives in browser's IndexedDB. To backup:
- Open DevTools → Application → IndexedDB → ClientFlowDB
- Export via browser tools, or build export feature later

**Future:** Add Supabase sync for multi-device access.

## Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel: push to GitHub → connect to Vercel → auto-deploys.

## Folder Structure

```
ClientFlow/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home dashboard
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── projects/
│   │   │   ├── new/page.tsx            # Create project
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Project dashboard
│   │   │       ├── contract/page.tsx   # Doc 1
│   │   │       ├── welcome/page.tsx    # Doc 2
│   │   │       ├── invoice/page.tsx    # Doc 3
│   │   │       └── thankyou/page.tsx   # Doc 5
│   │   └── portal/[slug]/page.tsx      # Doc 4 (public)
│   ├── components/
│   │   └── DocShell.tsx                # Shared print wrapper
│   └── lib/
│       ├── db.ts                       # Dexie DB setup
│       ├── types.ts                    # TypeScript types
│       └── utils.ts                    # Helpers (currency, dates, words)
├── public/
│   └── manifest.json                   # PWA manifest
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## License

Private — Sandeep Digital Solutions
