/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TErrorSources,
  TGenericErrorResponse,
} from "../interfaces/error.types";

export const handlerZodError = (err: any): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue: any) => {
    errorSources.push({
      path: issue.path?.length ? issue.path.map(String).join(".") : "",
      message: issue.message,
    });
  });

  return {
    statusCode: 400,
    message: errorSources[0]?.message || "Validation Error",
    errorSources,
  };
};
