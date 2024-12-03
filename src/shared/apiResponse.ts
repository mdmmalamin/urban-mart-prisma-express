import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T | null | undefined;
};

export const apiResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    status: data.statusCode,
    success: data.success,
    message: data.message,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
  });
};
