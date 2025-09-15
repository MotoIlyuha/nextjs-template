import { z } from 'zod';

export const StudentFormSchema = z.object({
  first_name: z.string().min(1, 'Имя обязательно').max(64),
  last_name: z.string().max(64).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  email: z.string().email().optional().nullable(),
  price_per_lesson: z.number().min(0),
  auto_pay: z.boolean().optional().nullable(),
});

export type StudentFormValues = z.infer<typeof StudentFormSchema>;


