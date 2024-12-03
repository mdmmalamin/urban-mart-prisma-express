import { UserRole } from "@prisma/client";

export type TAuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
} | null;
