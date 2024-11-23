import { ResponseError } from '../error/response-error';
import { AnyZodObject, ZodError } from 'zod';

const formatZodErrors = (errors: ZodError['errors']) => {
  return errors.reduce((acc: Record<string, string[]>, error) => {
    const path = error.path.join('.');
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(error.message);
    return acc;
  }, {});
};

const validate = (schema: AnyZodObject, data: any) => {
  try {
    const validatedData = schema.parse(data);
    return validatedData;
  } catch (error) {
    const formattedErrors = formatZodErrors(error.errors);
    throw new ResponseError(400, 'Validation failed.', formattedErrors);
  }
};

export { validate };
