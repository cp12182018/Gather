export type ContactStatus = "New" | "Invited" | "Attending" | "Follow Up";

export interface ContactLog {
  id: string;
  timestamp: number;
  text: string;
}

export interface Contact {
  id: string;
  name: string;
  contactInfo: string;
  metAt: string;
  metDate?: string;
  notes: string;
  events: string[];
  status: ContactStatus;
  createdAt: number;
  isArchived?: boolean;
  logs?: ContactLog[];
}

export const STATUSES: ContactStatus[] = ["New", "Invited", "Attending", "Follow Up"];
export const EVENTS: string[] = ["Bible Study", "Sunday Service", "Youth Group", "Community Group", "Worship Night", "Alpha Course"];

