'use client';

import { Phone, Mail, MessageCircle } from 'lucide-react';
import { SiTelegram, SiWhatsapp, SiViber } from 'react-icons/si';
import { PiChatCircleDotsThin } from 'react-icons/pi';
import type { ContactType } from '@/types/student';

interface ContactIconProps {
  type: ContactType;
  className?: string;
}

export function ContactIcon({ type, className = 'h-4 w-4' }: ContactIconProps) {
  switch (type) {
    case 'phone':
      return <Phone className={className} />;
    case 'email':
      return <Mail className={className} />;
    case 'telegram':
      return <SiTelegram className={className} color="#6cb5ff"/>;
    case 'whatsapp':
      return <SiWhatsapp className={`${className} text-green-500`} />;
    case 'viber':
      return <SiViber className={`${className} text-purple-500`} />;
    case 'other':
      return <PiChatCircleDotsThin className={className} />;
    default:
      return <MessageCircle className={className} />;
  }
}
