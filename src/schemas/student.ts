import { z } from 'zod';

const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;
const telegramRegex = /^@[A-Za-z0-9_]{5,}$/;
const phoneRegex = /^\+?[0-9\s().-]{7,}$/;

export const ContactSchema = z
  .object({
    type: z.enum(['phone', 'email', 'telegram', 'whatsapp', 'viber', 'other']),
    value: z.string().min(1, 'Укажите значение контакта'),
  })
  .superRefine((val, ctx) => {
    switch (val.type) {
      case 'email': {
        const emailCheck = z.string().email('Некорректный email');
        const res = emailCheck.safeParse(val.value);
        if (!res.success) {
          ctx.addIssue({ code: 'custom', message: 'Некорректный email', path: ['value'] });
        }
        break;
      }
      case 'telegram': {
        if (!telegramRegex.test(val.value)) {
          ctx.addIssue({ code: 'custom', message: 'Ник Telegram должен начинаться с @', path: ['value'] });
        }
        break;
      }
      case 'phone':
      case 'whatsapp':
      case 'viber': {
        if (!phoneRegex.test(val.value)) {
          ctx.addIssue({ code: 'custom', message: 'Некорректный номер телефона', path: ['value'] });
        }
        break;
      }
      case 'other':
      default: {
        // No extra validation
      }
    }
  });

export const RelationSchema = z
  .object({
    relation_name: z.string().min(1, 'Укажите связь'),
    contact_type: z.enum(['phone', 'email', 'telegram', 'whatsapp', 'viber', 'other']),
    contact_value: z.string().min(1, 'Укажите контакт'),
  })
  .superRefine((val, ctx) => {
    switch (val.contact_type) {
      case 'email': {
        const emailCheck = z.string().email('Некорректный email');
        const res = emailCheck.safeParse(val.contact_value);
        if (!res.success) {
          ctx.addIssue({ code: 'custom', message: 'Некорректный email', path: ['contact_value'] });
        }
        break;
      }
      case 'telegram': {
        if (!telegramRegex.test(val.contact_value)) {
          ctx.addIssue({ code: 'custom', message: 'Ник Telegram должен начинаться с @', path: ['contact_value'] });
        }
        break;
      }
      case 'phone':
      case 'whatsapp':
      case 'viber': {
        if (!phoneRegex.test(val.contact_value)) {
          ctx.addIssue({ code: 'custom', message: 'Некорректный номер телефона', path: ['contact_value'] });
        }
        break;
      }
      case 'other':
      default: {
        // No extra validation
      }
    }
  });

export const StudentFormSchema = z
  .object({
    first_name: z.string().min(1, 'Имя обязательно').max(64),
    // Фамилия необязательна: допускаем пустую строку и отсутствующее значение
    last_name: z
      .union([z.string().max(64), z.literal('')])
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      }),
    is_online: z.boolean().default(true),
    address: z
      .string()
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        const trimmed = value.trim();
        return trimmed.length === 0 ? undefined : trimmed;
      }),
    color: z.string().regex(hexColorRegex, 'Цвет должен быть в формате HEX'),
    note: z.string().optional(),
    contacts: z.array(ContactSchema).default([]),
    relations: z.array(RelationSchema).default([]),
  })
  ;

export type StudentFormValues = z.infer<typeof StudentFormSchema>;


