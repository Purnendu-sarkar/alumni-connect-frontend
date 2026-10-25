import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters.')
  .max(128, 'Use at most 128 characters.')
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/\d/, 'Include a number.')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol.');

export const loginSchema = z.object({
  email: z.email('Use a valid email address.').trim().toLowerCase(),
  password: z.string().min(1, 'Enter your password.').max(128),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.').max(100),
    email: z.email('Use a valid email address.').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    universitySlug: z
      .string()
      .trim()
      .min(2, 'Enter your university code.')
      .max(80)
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only.'),
    role: z.enum(['STUDENT', 'ALUMNI']),
    department: z.string().trim().min(1, 'Department is required.').max(100),
    batch: z.string().trim().min(1, 'Batch / graduation year is required.').max(100),

    // Student fields
    studentId: z.string().trim().max(100).optional(),
    currentSemester: z.string().trim().max(50).optional(),
    admissionYear: z.string().trim().max(20).optional(),
    expectedGraduationYear: z.string().trim().max(20).optional(),

    // Alumni fields
    graduationYear: z.string().trim().max(20).optional(),
    academicId: z.string().trim().max(100).optional(),
    employmentStatus: z.string().trim().max(100).optional(),
    currentCompany: z.string().trim().max(100).optional(),
    position: z.string().trim().max(100).optional(),

    skills: z.string().trim().optional(),
    interests: z.string().trim().optional(),
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
