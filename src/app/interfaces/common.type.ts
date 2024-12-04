import { UserRole, UserStatus } from "@prisma/client";

export type TAuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar: string;
  iat: number;
  exp: number;
} | null;

export type TQueryReturn = {
  meta: { page: number; limit: number; total: number };
  data: any[];
};
