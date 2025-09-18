'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { SiViber, SiWhatsapp, SiTelegram } from 'react-icons/si';
import { MdOutlineMail, MdLocalPhone } from 'react-icons/md';
import { PiChatCircleDotsThin } from 'react-icons/pi';

export type ContactType = 'phone' | 'email' | 'telegram' | 'whatsapp' | 'viber' | 'other';

export interface ContactItemProps {
	type: ContactType;
	title: string;
	value: string;
	onEdit?: () => void;
	onDelete: () => void;
}

function renderTypeIcon(type: ContactType): React.ReactNode {
	const map: Record<ContactType, React.ReactNode> = {
		phone: <MdLocalPhone className="h-4 w-4" />,
		email: <MdOutlineMail className="h-4 w-4" />,
		telegram: <SiTelegram className="h-4 w-4" />,
		whatsapp: <SiWhatsapp className="h-4 w-4 text-green-500" />,
		viber: <SiViber className="h-4 w-4 text-purple-500" />,
		other: <PiChatCircleDotsThin className="h-4 w-4" />,
	};
	return map[type] ?? type;
}

export function ContactItem({ type, title, value, onEdit, onDelete }: ContactItemProps) {
	return (
		<div className="flex items-center gap-3 min-w-0">
			<div className="h-9 w-9 shrink-0 rounded-md border tg-border bg-white/5 flex items-center justify-center">
				{renderTypeIcon(type)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="text-sm font-medium truncate">{title || '—'}</div>
				<div className="text-xs opacity-80 truncate">{value || '—'}</div>
			</div>
			<div className="flex items-center gap-1">
				{onEdit && (
					<Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label="Редактировать">
						<Pencil className="h-4 w-4" />
					</Button>
				)}
				<Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить">
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

export default ContactItem;


