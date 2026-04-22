import Dexie, { Table } from "dexie";
import type { Project, VendorInfo } from "./types";
import { DEFAULT_VENDOR } from "./types";

export class ClientFlowDB extends Dexie {
  projects!: Table<Project, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super("ClientFlowDB");
    this.version(1).stores({
      projects: "id, createdAt, status, invoiceNumber, *milestones",
      settings: "key",
    });
  }

  async getVendor(): Promise<VendorInfo> {
    const row = await this.settings.get("vendor");
    return (row?.value as VendorInfo) ?? DEFAULT_VENDOR;
  }

  async setVendor(vendor: VendorInfo) {
    await this.settings.put({ key: "vendor", value: vendor });
  }

  async getNextInvoiceNumber(): Promise<string> {
    const all = await this.projects.toArray();
    const year = new Date().getFullYear();
    const thisYear = all.filter((p) => p.invoiceNumber?.includes(`/${year}/`));
    const count = thisYear.length + 1;
    return `SP/${year}/${String(count).padStart(3, "0")}`;
  }
}

export const db = new ClientFlowDB();
