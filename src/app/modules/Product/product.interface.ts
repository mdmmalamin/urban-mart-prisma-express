import { ProductStatus } from "@prisma/client";

export type TCreateProduct = {
  categoryId: string;
  name: string;
  description?: string;
  price?: number;
  status?: ProductStatus;

  quantity?: 0;
};
