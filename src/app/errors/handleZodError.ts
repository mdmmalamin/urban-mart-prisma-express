import { ZodError, ZodIssue } from "zod";
import { TErrorMessages, TGenericErrorResponse } from "../interfaces";
import { httpStatus } from "../../shared";

export const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const statusCode = httpStatus.BAD_REQUEST;
  const message = "Zod Validation Error !";
  const errorSources: TErrorMessages = err?.issues?.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  return {
    statusCode,
    message,
    errorSources,
  };
};
