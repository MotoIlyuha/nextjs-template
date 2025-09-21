'use client';

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, Archive, Trash2, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { SiTelegram, SiWhatsapp, SiViber } from 'react-icons/si';
import { PiChatCircleDotsThin } from 'react-icons/pi';
import YandexMap from '@/components/YandexMap';

interface StudentContact {
  id: string;
  type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'viber' | 'other';
  value: string;
}

interface StudentRelation {
  id: string;
  relation_name: string;
  contact_type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'viber' | 'other';
  contact_value: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string | null;
  class_or_course: number | null;
  is_online: boolean | null;
  color: string | null;
  note: string | null;
  address: string | null;
  student_contacts?: StudentContact[];
  student_relations?: StudentRelation[];
}

interface StudentDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onArchive: (studentId: string) => void;
  onDelete: (studentId: string) => void;
}

const getContactIcon = (type: string) => {
  switch (type) {
    case 'phone':
      return <Phone className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'telegram':
      return <SiTelegram className="h-4 w-4" color="#6cb5ff"/>;
    case 'whatsapp':
      return <SiWhatsapp className="h-4 w-4 text-green-500" />;
    case 'viber':
      return <SiViber className="h-4 w-4 text-purple-500" />;
    case 'other':
      return <PiChatCircleDotsThin className="h-4 w-4" />;
    default:
      return <MessageCircle className="h-4 w-4" />;
  }
};

const getContactActionButton = (type: string, value: string) => {
  switch (type) {
    case 'phone':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`tel:${value}`, '_self')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="xs:hidden">Звонок</span>
          <span className="hidden xs:inline">Позвонить</span>
        </Button>
      );
    case 'email':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`mailto:${value}`, '_self')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="xs:hidden">Письмо</span>
          <span className="hidden xs:inline">Написать</span>
        </Button>
      );
    case 'telegram':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`https://t.me/${value.replace('@', '')}`, '_blank')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="xs:hidden">TG</span>
          <span className="hidden xs:inline">Написать</span>
        </Button>
      );
    case 'whatsapp':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`https://wa.me/${value.replace(/[^\d]/g, '')}`, '_blank')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="xs:hidden">WA</span>
          <span className="hidden xs:inline">Написать</span>
        </Button>
      );
    case 'viber':
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(`viber://chat?number=${value.replace(/[^\d]/g, '')}`, '_self')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          <span className="xs:hidden">VB</span>
          <span className="hidden xs:inline">Написать</span>
        </Button>
      );
    default:
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-xs sm:text-sm px-2 sm:px-3"
          disabled
        >
          <span className="xs:hidden">Копир.</span>
          <span className="hidden xs:inline">Копировать</span>
        </Button>
      );
  }
};

const getClassLabel = (classOrCourse: number | null) => {
  if (classOrCourse === null) return 'Не указан';
  if (classOrCourse < 11) return `${classOrCourse + 1} класс`;
  return `Курс ${classOrCourse - 10}`;
};

export default function StudentDrawer({
  student,
  isOpen,
  onClose,
  onEdit,
  onArchive,
  onDelete,
}: StudentDrawerProps) {
  if (!student) return null;

  const allContacts = [
    // Контакты ученика
    ...(student.student_contacts || []).map(contact => ({
      ...contact,
      owner: `${student.first_name} ${student.last_name || ''}`.trim(),
    })),
    // Контакты родственников
    ...(student.student_relations || []).map(relation => ({
      id: relation.id,
      type: relation.contact_type,
      value: relation.contact_value,
      owner: relation.relation_name,
    })),
  ];

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-lg border border-white/20 flex-shrink-0"
          style={{ backgroundColor: student.color || '#226095' }}
          data-testid="color-square"
          aria-hidden
        />
            <div className="min-w-0">
              <DrawerTitle>
                <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-lg">{student.first_name} {student.last_name || ''}</span>
                    {/* Badges */}
                    <div className="flex gap-2">
                    {student.class_or_course && <Badge
                        variant="outline"
                        className="border-transparent bg-blue-500 text-white text-xs"
                    >
                        {getClassLabel(student.class_or_course)}
                    </Badge>}
                    <Badge
                        variant="outline"
                        className={student.is_online
                        ? 'border-transparent bg-green-600 text-white text-xs'
                        : 'border-transparent bg-orange-500 text-white text-xs'}
                    >
                        {student.is_online ? 'Онлайн' : 'Очно'}
                    </Badge>
                    </div>
                </div>
              </DrawerTitle>
            </div>
          </div>
          <DrawerClose asChild>
            <button className="text-sm opacity-70">Закрыть</button>
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="h-[70vh] sm:h-[75vh]">
          <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">

            {/* Заметка */}
            {student.note && (
              <div>
                <h3 className="text-sm font-medium mb-2">Заметка</h3>
                <p className="text-sm opacity-80 leading-relaxed">{student.note}</p>
              </div>
            )}

            {/* Контакты */}
            {allContacts.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2 sm:mb-3">Контакты</h3>
                <div className="space-y-2 sm:space-y-3">
                  {allContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 p-2 sm:p-3 rounded-lg bg-white/5">
                      <div className="flex-shrink-0">
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">{contact.owner}</div>
                        <div className="text-xs sm:text-sm opacity-70 truncate">{contact.value}</div>
                      </div>
                      <div className="flex-shrink-0">
                        {getContactActionButton(contact.type, contact.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Адрес */}
            {student.address && (
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-2 sm:mb-3">Адрес</h3>
                <div className="flex items-center gap-2 pl-3 sm:pl-4 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/5">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm leading-relaxed">{student.address}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(student.address || '');
                      window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
                    }}
                    className="text-xs sm:text-sm flex-shrink-0 px-2 sm:px-3"
                  >
                    <span className="sm:hidden">Маршрут</span>
                    <span className="hidden sm:inline">Проложить маршрут</span>
                  </Button>
                </div>
                {/* Карта Yandex */}
                <div className="mt-2 sm:mt-3 h-32 sm:h-40">
                  <YandexMap 
                    address={student.address || ''} 
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Кнопки действий */}
        <div className="bg-tg-surface/95 backdrop-blur-sm border-t border-white/10 p-2 sticky bottom-0 z-10">
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => onEdit(student)}
              className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="xs:hidden">Ред.</span>
              <span className="hidden xs:inline">Редактировать</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onArchive(student.id)}
              className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="xs:hidden">Арх.</span>
              <span className="hidden xs:inline">В архив</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(student.id)}
              className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-500 border-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="xs:hidden">Уд.</span>
              <span className="hidden xs:inline">Удалить</span>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
