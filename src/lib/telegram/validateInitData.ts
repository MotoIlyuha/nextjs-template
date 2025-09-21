import { validate } from '@tma.js/init-data-node';

export const validateInitData = (initData: string): boolean => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  }
  // The validate function from @tma.js/init-data-node returns void (throws on error).
  // To conform to the boolean return type, we catch errors and return false, otherwise true.
  try {
    validate(initData, botToken);
    return true;
  } catch {
    return false;
  }
}
