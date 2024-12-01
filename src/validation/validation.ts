import { ZodError, ZodType } from 'zod';

export class Validation {
  static validate<T>(schema: ZodType, data: T): T {
    return schema.parse(data);
  }

  static formatZodErrors(errors: ZodError['errors']): Record<string, string[]> {
    /*
    Return example:
      {
        "email": [
          "Email is not valid."
        ],
        "password": [
          "Password minimum 6 characters."
        ]
      }
    */

    return errors.reduce((acc: Record<string, string[]>, error) => {
      const path = error.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(error.message);
      return acc;
    }, {});
  }
}
