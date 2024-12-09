import { Gender } from "@prisma/client";

export type TCreateAdmin = {
  password: string;
  admin: {
    fullName: string;
    email: string;
    phone: string;
    gender: Gender;
    dateOfBirth: Date;
    avatar?: string;
  };
};

export type TRegisterVendor = {
  fullName: string;
  dateOfBirth: Date;
  gender: Gender;
  email: string;
  phone: string;
  password: string;
};

export type TRegisterCustomer = {
  email: string;
  phone: string;
  password: string;
};
