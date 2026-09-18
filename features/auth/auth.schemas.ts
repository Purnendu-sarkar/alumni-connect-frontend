import { z } from 'zod';

const passwordSchema = z.string().min(12, 'Use at least 12 characters.').max(128, 'Use at most 128 characters.').regex(/[a-z]/, 'Include a lowercase letter.').regex(/[A-Z]/, 'Include an uppercase letter.').regex(/\d/, 'Include a number.').regex(/[^A-Za-z0-9]/, 'Include a symbol.');

export const loginSchema = z.object({ email: z.email('Use a valid email address.').trim().toLowerCase(), password: z.string().min(1, 'Enter your password.').max(128) });

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(100),
  email: z.email('Use a valid email address.').trim().toLowerCase(),
  password: passwordSchema,
  confirmPassword: z.string(),
  universitySlug: z.string().trim().min(2, 'Enter your university code.').max(80).regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.'),
  role: z.enum(['STUDENT', 'ALUMNI']),
  batch: z.string().trim().max(100).optional(), department: z.string().trim().max(100).optional(),
  currentCompany: z.string().trim().max(100).optional(), position: z.string().trim().max(100).optional(),
}).superRefine((data, context) => {
  if (data.password !== data.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' });
  const required = data.role === 'ALUMNI' ? ['batch', 'department', 'currentCompany', 'position'] as const : ['batch', 'department'] as const;
  required.forEach((field) => { if (!data[field]?.trim()) context.addIssue({ code: 'custom', path: [field], message: 'This field is required.' }); });
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
