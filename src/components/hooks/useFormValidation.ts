import { useState } from "react";
import { z } from "zod";

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export function useFormValidation<T extends Record<string, unknown>>(schema: z.ZodType<T>) {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validate = (data: unknown) => {
    const result = schema.safeParse(data);

    if (!result.success) {
      const formattedErrors: ValidationErrors<T> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof T;
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      return result;
    }

    setErrors({});
    return result;
  };

  return { validate, errors };
}
