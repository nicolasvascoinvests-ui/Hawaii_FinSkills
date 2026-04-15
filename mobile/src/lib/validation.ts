import { z } from 'zod';

export const MIN_AGE = 14;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Please enter a valid email');

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    birthYear: z
      .number()
      .int('Please enter a valid birth year')
      .min(1900, 'Please enter a valid birth year')
      .max(new Date().getFullYear(), 'Please enter a valid birth year'),
  })
  .superRefine((val, ctx) => {
    const age = new Date().getFullYear() - val.birthYear;
    if (age < MIN_AGE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthYear'],
        message: `You must be at least ${MIN_AGE} years old to create an account.`,
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((val) => val.password === val.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export function firstError(issues: z.ZodIssue[]): string {
  return issues[0]?.message ?? 'Invalid input';
}
