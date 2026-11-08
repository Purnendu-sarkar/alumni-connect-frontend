import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/\d/, 'Password must include a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must include a symbol.');

export const loginSchema = z.object({
  email: z.string().email('Enter a valid institutional email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required.').max(128),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(100),
    email: z.string().email('Enter a valid institutional email address.').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    role: z.enum(['STUDENT', 'ALUMNI']),
    department: z.string().trim().min(1, 'Department is required.').max(100),
    batch: z.string().trim().max(100).optional(),
    universityId: z.string().trim().min(2, 'Institutional University ID is required.').max(40),
    graduationYear: z.string().trim().max(10).optional(),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const setupAccountSchema = z
  .object({
    token: z.string().min(1, 'Setup token is required.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid institutional email address.').trim().toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type SetupAccountValues = z.infer<typeof setupAccountSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
