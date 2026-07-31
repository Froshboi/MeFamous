export type { UserRole } from "@/types/database";
import type { UserRole } from "@/types/database";

export interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

export type NavItem = {
  label: string;
  href: string;
};
