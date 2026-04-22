export type ProjectStatus = "active" | "delivered" | "archived";
export type MilestoneStatus = "pending" | "sent" | "paid";
export type DocStatus = "not_generated" | "draft" | "sent";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Client {
  businessName: string;
  contactName: string;
  designation?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: Address;
  gstin?: string;
  pan?: string;
  website?: string;
}

export interface ScopeItem {
  id: string;
  item: string;
  description?: string;
  sacCode: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Milestone {
  id: string;
  label: string;
  percent: number;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  paidDate?: string;
  paymentRef?: string;
}

export interface ProjectData {
  title: string;
  description: string;
  scope: ScopeItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  startDate: string;
  deliveryDate: string;
  revisionsIncluded: number;
  techStack: string[];
}

export interface DocumentState {
  contract: { status: DocStatus; generatedAt?: string; customHtml?: string };
  welcome: { status: DocStatus; generatedAt?: string; customHtml?: string };
  invoice: { status: DocStatus; generatedAt?: string; number?: string };
  portal: { enabled: boolean; slug: string; accessCode: string };
  thankyou: { status: DocStatus; generatedAt?: string; customHtml?: string };
}

export interface CommunicationNote {
  id: string;
  type: "email" | "whatsapp" | "call" | "note";
  content: string;
  at: string;
}

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  invoiceNumber: string;

  client: Client;
  project: ProjectData;
  milestones: Milestone[];
  documents: DocumentState;
  communication: CommunicationNote[];
  notes: string;
}

/** Vendor/Your info - used in all generated documents */
export interface VendorInfo {
  name: string; // Sandeep Pandey
  businessName: string; // Sandeep Digital Solutions
  role: string; // Proprietor / Full-Stack Developer
  email: string;
  phone: string;
  whatsapp: string;
  address: Address;
  pan: string;
  udyam: string;
  bankDetails: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upi: string;
  };
}

export const DEFAULT_VENDOR: VendorInfo = {
  name: "Sandeep Pandey",
  businessName: "Sandeep Digital Solutions",
  role: "Proprietor · Full-Stack Developer",
  email: "pandey.sandeep70391@gmail.com",
  phone: "+91 70391 85207",
  whatsapp: "7039185207",
  address: {
    line1: "V4, Shubhas Nagar No-2",
    line2: "Shubhas Nagar Road, Andheri",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400093",
  },
  pan: "GVBPP8719M",
  udyam: "UDYAM-MH-18-0541047",
  bankDetails: {
    accountName: "Sandeep Pandey",
    bankName: "State Bank of India",
    accountNumber: "44385737129",
    ifsc: "SBIN0007074",
    upi: "7039185207@upi",
  },
};
