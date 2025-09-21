import type { ContactType } from '@/types/student';

/**
 * Получить информацию об иконке для типа контакта
 */
export function getContactIconInfo(type: ContactType) {
  switch (type) {
    case 'phone':
      return {
        component: 'Phone',
        className: 'h-4 w-4',
        color: undefined
      };
    case 'email':
      return {
        component: 'Mail',
        className: 'h-4 w-4',
        color: undefined
      };
    case 'telegram':
      return {
        component: 'SiTelegram',
        className: 'h-4 w-4',
        color: '#6cb5ff'
      };
    case 'whatsapp':
      return {
        component: 'SiWhatsapp',
        className: 'h-4 w-4 text-green-500',
        color: undefined
      };
    case 'viber':
      return {
        component: 'SiViber',
        className: 'h-4 w-4 text-purple-500',
        color: undefined
      };
    case 'other':
      return {
        component: 'PiChatCircleDotsThin',
        className: 'h-4 w-4',
        color: undefined
      };
    default:
      return {
        component: 'MessageCircle',
        className: 'h-4 w-4',
        color: undefined
      };
  }
}

/**
 * Получить URL для действия с контактом
 */
export function getContactActionUrl(type: ContactType, value: string): string | null {
  switch (type) {
    case 'phone':
      return `tel:${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'telegram':
      return `https://t.me/${value.replace('@', '')}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    case 'viber':
      return `viber://chat?number=${value.replace(/[^\d]/g, '')}`;
    default:
      return null;
  }
}

/**
 * Получить текст кнопки для действия с контактом
 */
export function getContactActionText(type: ContactType, isShort: boolean = false): string {
  switch (type) {
    case 'phone':
      return isShort ? 'Звонок' : 'Позвонить';
    case 'email':
      return isShort ? 'Письмо' : 'Написать';
    case 'telegram':
      return isShort ? 'TG' : 'Написать';
    case 'whatsapp':
      return isShort ? 'WA' : 'Написать';
    case 'viber':
      return isShort ? 'VB' : 'Написать';
    default:
      return isShort ? 'Копир.' : 'Копировать';
  }
}

/**
 * Получить target для открытия ссылки
 */
export function getContactActionTarget(type: ContactType): '_self' | '_blank' {
  return ['telegram', 'whatsapp'].includes(type) ? '_blank' : '_self';
}

/**
 * Проверить, можно ли выполнить действие с контактом
 */
export function canPerformContactAction(type: ContactType): boolean {
  return type !== 'other';
}
