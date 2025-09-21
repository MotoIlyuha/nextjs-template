"use client";

import React, { useEffect, useMemo, forwardRef } from "react";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentFormSchema, type StudentFormValues } from "@/schemas/student";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { SiViber } from "react-icons/si";
import { SiWhatsapp } from "react-icons/si";
import { SiTelegram } from "react-icons/si";
import { MdOutlineMail } from "react-icons/md";
import { MdLocalPhone } from "react-icons/md";
import { PiChatCircleDotsThin } from "react-icons/pi";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
import { useUIStore } from "@/stores/uiStore";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/ui/tabs";
import ContactItem from "@/components/ui/contact-item";
import MapAddressPicker from "@/components/MapAddressPicker";

export interface StudentFormProps {
  teacherId: string;
  student?: Partial<StudentFormValues> & { id?: string };
  color?: string;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  onStateChange?: (state: {
    isPending: boolean;
    mode: "create" | "edit";
  }) => void;
}

/**
 * Форма создания/редактирования ученика.
 * - При наличии `student` — редактирование (пока только создание подключено).
 * - Валидация через Zod (`StudentFormSchema`).
 */
export const StudentForm = forwardRef<HTMLFormElement, StudentFormProps>(
  (
    {
      teacherId,
      student,
      color,
      onTabChange,
      activeTab = "basic",
      onSubmit,
      isSubmitting,
      onStateChange,
    },
    ref
  ) => {
    const mode: "create" | "edit" = student ? "edit" : "create";
    const form = useForm<StudentFormValues>({
      resolver: zodResolver(StudentFormSchema) as any,
      defaultValues: {
        first_name: (student as any)?.first_name ?? "",
        last_name: (student as any)?.last_name ?? "",
        is_online: (student as any)?.is_online ?? true,
        class_or_course: (student as any)?.class_or_course ?? null,
        address: (student as any)?.address ?? "",
        color: color ?? (student as any)?.color ?? "#226095",
        note: (student as any)?.note ?? "",
        contacts: (student as any)?.contacts ?? [],
        relations: (student as any)?.relations ?? [],
      },
    });

    useEffect(() => {
      if (color) {
        form.setValue("color", color, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }, [color]);

    const { mutate: createStudent, isPending: isCreating } = useCreateStudent(teacherId);
    const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent(teacherId);
    const { closeStudentForm } = useUIStore();
    
    const isPending = isCreating || isUpdating;

    // Передаем состояние в родительский компонент
    useEffect(() => {
      onStateChange?.({ isPending, mode });
    }, [isPending, mode, onStateChange]);

    const handleSubmit: SubmitHandler<StudentFormValues> = (values) => {
      console.log('StudentForm handleSubmit called with values:', values);
      console.log('Mode:', mode, 'isPending:', isPending);
      const onSuccess = () => {
        console.log('Student operation completed successfully, closing form');
        closeStudentForm();
      };
      const onError = (error: any) => {
        console.error('Error with student operation:', error);
      };
      if (mode === "create") {
        console.log('Calling createStudent for create mode');
        createStudent(values, { onSuccess, onError });
      } else {
        console.log('Calling updateStudent for edit mode');
        if (!student?.id) {
          console.error('Student ID is required for edit mode');
          return;
        }
        updateStudent({ studentId: student.id, values }, { onSuccess, onError });
      }
    };

    // Если передан внешний обработчик, используем его
    const finalOnSubmit = onSubmit || handleSubmit;

    const contactsArray = useFieldArray({
      control: form.control,
      name: "contacts" as const,
    });
    const relationsArray = useFieldArray({
      control: form.control,
      name: "relations" as const,
    });

    const [isAddContactOpen, setIsAddContactOpen] = React.useState(false);
    const [isAddRelationOpen, setIsAddRelationOpen] = React.useState(false);
    const [isMapPickerOpen, setIsMapPickerOpen] = React.useState(false);
    const [newContactType, setNewContactType] = React.useState<string>("phone");
    const [newContactValue, setNewContactValue] = React.useState<string>("");
    const [editContactIndex, setEditContactIndex] = React.useState<number | null>(null);
    const [newRelationName, setNewRelationName] = React.useState<string>("");
    const [newRelationType, setNewRelationType] =
      React.useState<string>("phone");
    const [newRelationValue, setNewRelationValue] = React.useState<string>("");
    const [editRelationIndex, setEditRelationIndex] = React.useState<number | null>(null);

    const messengerOptions = useMemo(
      () => [
        { label: "Telegram", value: "Telegram" },
        { label: "WhatsApp", value: "WhatsApp" },
        { label: "Viber", value: "Viber" },
        { label: "Скайп", value: "Скайп" },
        { label: "Другой", value: "Другой" },
      ],
      []
    );

    function renderContactType(type?: string) {
      if (!type) return "—";
      const map: Record<string, { icon: React.ReactNode; label: string }> = {
        phone: { icon: <MdLocalPhone className="h-4 w-4" />, label: "Телефон" },
        email: { icon: <MdOutlineMail className="h-4 w-4" />, label: "Email" },
        telegram: {
          icon: <SiTelegram className="h-4 w-4" />,
          label: "Telegram",
        },
        whatsapp: {
          icon: <SiWhatsapp className="h-4 w-4 text-green-500" />,
          label: "WhatsApp",
        },
        viber: {
          icon: <SiViber className="h-4 w-4 text-purple-500" />,
          label: "Viber",
        },
        other: {
          icon: <PiChatCircleDotsThin className="h-4 w-4" />,
          label: "Другой",
        },
      };
      const v = map[type];
      if (!v) return type;
      return (
        <span className="inline-flex items-center gap-2">
          {v.icon}
          <span>{v.label}</span>
        </span>
      );
    }

    function getRandomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomFrom<T>(arr: T[]): T {
      return arr[getRandomInt(0, arr.length - 1)];
    }

    function randomPhone() {
      const parts = [
        "+7",
        "9" + getRandomInt(10, 99),
        getRandomInt(100, 999).toString(),
        getRandomInt(10, 99).toString(),
        getRandomInt(10, 99).toString(),
      ];
      return `${parts[0]}${parts[1]}${parts[2]}${parts[3]}${parts[4]}`;
    }

    function randomEmail(first: string, last: string) {
      const domains = ["example.com", "mail.ru", "gmail.com", "yandex.ru"];
      return `${first}.${last}${getRandomInt(1, 99)}@${randomFrom(
        domains
      )}`.toLowerCase();
    }

    function randomTelegram() {
      const letters = "abcdefghijklmnopqrstuvwxyz0123456789_";
      const len = getRandomInt(5, 12);
      let nick = "@";
      for (let i = 0; i < len; i++)
        nick += letters[getRandomInt(0, letters.length - 1)];
      return nick;
    }

    function randomColor() {
      const val = getRandomInt(0, 0xffffff);
      return `#${val.toString(16).padStart(6, "0")}`;
    }

    function fillWithMockData() {
      const firsts = [
        "Иван",
        "Пётр",
        "Сергей",
        "Дмитрий",
        "Алексей",
        "Анна",
        "Мария",
        "Ольга",
      ];
      const lasts = [
        "Иванов",
        "Петров",
        "Сергеев",
        "Дмитриев",
        "Алексеев",
        "Иванова",
        "Петрова",
        "Смирнова",
      ];
      const first_name = randomFrom(firsts);
      const last_name = randomFrom(lasts);
      const is_online = Math.random() > 0.5;
      const address = is_online
        ? ""
        : `г. Москва, ул. Пушкина, д. ${getRandomInt(1, 200)}`;
      const colorHex = randomColor();
      const note = "Занимается по будням, любит математику.";

      const contactTypes: Array<
        "phone" | "email" | "telegram" | "whatsapp" | "viber" | "other"
      > = ["phone", "email", "telegram", "whatsapp", "viber", "other"];
      const contactsCount = getRandomInt(1, 3);
      const contacts: { type: any; value: string }[] = [];
      for (let i = 0; i < contactsCount; i++) {
        const type = randomFrom(contactTypes);
        let value = "";
        if (type === "phone" || type === "whatsapp" || type === "viber")
          value = randomPhone();
        else if (type === "email") value = randomEmail(first_name, last_name);
        else if (type === "telegram") value = randomTelegram();
        else value = "Контакт";
        contacts.push({ type, value });
      }

      const relationsCount = getRandomInt(0, 2);
      const relationNames = ["Мама", "Папа", "Бабушка", "Дедушка", "Опекун"];
      const relations: {
        relation_name: string;
        contact_type: any;
        contact_value: string;
      }[] = [];
      for (let i = 0; i < relationsCount; i++) {
        const t: any = randomFrom([
          "phone",
          "email",
          "telegram",
          "whatsapp",
          "viber",
          "other",
        ]);
        const v =
          t === "email"
            ? randomEmail(first_name, last_name)
            : t === "telegram"
            ? randomTelegram()
            : randomPhone();
        relations.push({
          relation_name: randomFrom(relationNames),
          contact_type: t,
          contact_value: v,
        });
      }

      form.reset(
        {
          first_name,
          last_name,
          is_online,
          class_or_course: Math.floor(Math.random() * 16), // Random class/course 0-15
          address,
          color: colorHex,
          note,
          contacts,
          relations,
        },
        { keepDefaultValues: true }
      );
    }

    return (
      <Form {...(form as any)}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(finalOnSubmit as any)}
          className="space-y-5 min-w-0 overflow-x-hidden"
        >
          <div className="space-y-4 min-w-0">
            {activeTab === "basic" && (
              <div className="min-w-0">
                {/* Basic */}
                <div className="grid gap-y-2 gap-x-4 sm:grid-cols-2 min-w-0">
                  <FormField name="first_name">
                    {(field) => (
                      <FormItem>
                        <label className="text-sm" onClick={fillWithMockData}>Имя</label>
                        <Input
                          placeholder="Иван"
                          {...field}
                          className="w-full"
                        />
                        {form.formState.errors.first_name && (
                          <p className="text-red-400 text-xs">
                            {form.formState.errors.first_name.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  </FormField>
                  <FormField name="last_name">
                    {(field) => (
                      <FormItem>
                        <label className="text-sm">Фамилия</label>
                        <Input
                          placeholder="Иванов"
                          {...field}
                          className="w-full"
                        />
                        {form.formState.errors.last_name && (
                          <p className="text-red-400 text-xs">
                            {form.formState.errors.last_name.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  </FormField>
                </div>

                {/* Class/Course and Lesson format in 2x2 grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 min-w-0 mt-2">
                  <div className="flex items-center">
                    <label className="text-sm">Класс/Курс</label>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="text-sm">Формат занятий</label>
                  </div>
                  
                  <FormField name="class_or_course">
                    {(field) => (
                      <FormItem>
                        <Select value={field.value == null ? "none" : String(field.value)} onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Не выбрано" />
                          </SelectTrigger>
                          <SelectContent className="tg-border max-h-[60vh]">
                            <SelectItem value="none">Не выбрано</SelectItem>
                            <SelectGroup>
                              <SelectLabel>Классы</SelectLabel>
                              {Array.from({ length: 11 }).map((_, idx) => (
                                <SelectItem key={idx} value={String(idx)}>
                                  {idx + 1} класс
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Курсы</SelectLabel>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <SelectItem key={idx + 11} value={String(idx + 11)}>
                                  Курс {idx + 1}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.class_or_course && (
                          <p className="text-red-400 text-xs">
                            {form.formState.errors.class_or_course.message as any}
                          </p>
                        )}
                      </FormItem>
                    )}
                  </FormField>
                  
                  <FormField name="is_online">
                    {(field) => (
                      <FormItem>
                        <SegmentedControl
                          type="single"
                          value={field.value ? "online" : "offline"}
                          onValueChange={(value: string) => field.onChange(value === "online")}
                        >
                          <SegmentedControlItem value="online">
                            Онлайн
                          </SegmentedControlItem>
                          <SegmentedControlItem value="offline">
                            Очно
                          </SegmentedControlItem>
                        </SegmentedControl>
                      </FormItem>
                    )}
                  </FormField>
                  {!form.watch("is_online") && (
                    <FormField name="address">
                      {(field) => (
                        <FormItem className="col-span-2">
                          <label className="text-sm">Адрес</label>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Город, улица, дом"
                              {...field}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              onClick={() => setIsMapPickerOpen(true)}
                              aria-label="Открыть карту"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    </FormField>
                  )}
                </div>
                {/* Note */}
                <FormField name="note">
                  {(field) => (
                    <FormItem className="mt-2">
                      <label className="text-sm">Заметка</label>
                      <Textarea
                        placeholder="Примечания по ученику"
                        {...field}
                      />
                    </FormItem>
                  )}
                </FormField>
              </div>
            )}
            {activeTab === "contacts" && (
              <div className="min-w-0">
                {/* Contacts */}
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Контакты</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        setEditContactIndex(null);
                        setNewContactType("phone");
                        setNewContactValue("");
                        setIsAddContactOpen(true);
                      }}
                    >
                      + Добавить
                    </Button>
                  </div>
                  {contactsArray.fields.length === 0 && (
                    <p className="text-sm opacity-70">Нет контактов</p>
                  )}
                  {contactsArray.fields.map((f, idx) => (
                    <ContactItem
                      key={f.id}
                      type={form.getValues(`contacts.${idx}.type`) as any}
                      title={`${form.getValues("first_name")} ${form.getValues(
                        "last_name"
                      )}`.trim()}
                      value={form.getValues(`contacts.${idx}.value`) as any}
                      onEdit={() => {
                        setEditContactIndex(idx);
                        setNewContactType(
                          (form.getValues(`contacts.${idx}.type`) as string) ||
                            "phone"
                        );
                        setNewContactValue(
                          (form.getValues(`contacts.${idx}.value`) as string) ||
                            ""
                        );
                        setIsAddContactOpen(true);
                      }}
                      onDelete={() => contactsArray.remove(idx)}
                    />
                  ))}
                </div>

                {/* Add Contact Nested Drawer */}
                <Drawer
                  open={isAddContactOpen}
                  onOpenChange={setIsAddContactOpen}
                >
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-md">
                      <DrawerHeader>
                        <DrawerTitle>{editContactIndex === null ? "Добавить контакт" : "Редактировать контакт"}</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="text-sm">Тип</label>
                          <Select
                            value={newContactType}
                            onValueChange={setNewContactType}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[20vh]">
                              <SelectItem value="phone">
                                <span className="inline-flex items-center gap-2">
                                  <MdLocalPhone className="h-4 w-4" />
                                  <span>Телефон</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="email">
                                <span className="inline-flex items-center gap-2">
                                  <MdOutlineMail className="h-4 w-4" />
                                  <span>Email</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="telegram">
                                <span className="inline-flex items-center gap-2">
                                  <SiTelegram className="h-4 w-4" />
                                  <span>Telegram</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="whatsapp">
                                <span className="inline-flex items-center gap-2">
                                  <SiWhatsapp className="h-4 w-4 text-green-500" />
                                  <span>WhatsApp</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="viber">
                                <span className="inline-flex items-center gap-2">
                                  <SiViber className="h-4 w-4 text-purple-500" />
                                  <span>Viber</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="other">
                                <span className="inline-flex items-center gap-2">
                                  <PiChatCircleDotsThin className="h-4 w-4" />
                                  <span>Другой</span>
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm">Значение</label>
                          <Input
                            placeholder={
                              newContactType === "telegram"
                                ? "@username"
                                : newContactType === "email"
                                ? "email@example.com"
                                : "+7..."
                            }
                            value={newContactValue}
                            onChange={(e) => setNewContactValue(e.target.value)}
                          />
                          {newContactType === "telegram" &&
                            !/^@[A-Za-z0-9_]{5,}$/.test(
                              newContactValue || ""
                            ) && (
                              <p className="text-xs text-red-400 mt-1">
                                Ник Telegram должен начинаться с @
                              </p>
                            )}
                          {newContactType === "email" &&
                            newContactValue &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              newContactValue
                            ) && (
                              <p className="text-xs text-red-400 mt-1">
                                Некорректный email
                              </p>
                            )}
                          {(newContactType === "phone" ||
                            newContactType === "whatsapp" ||
                            newContactType === "viber") &&
                            newContactValue &&
                            !/^\+?[0-9\s().-]{7,}$/.test(newContactValue) && (
                              <p className="text-xs text-red-400 mt-1">
                                Некорректный номер телефона
                              </p>
                            )}
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button
                          type="button"
                          onClick={() => {
                            if (editContactIndex === null) {
                              contactsArray.append({
                                type: newContactType as any,
                                value: newContactValue,
                              });
                            } else {
                              form.setValue(
                                `contacts.${editContactIndex}.type`,
                                newContactType as any,
                                { shouldDirty: true, shouldValidate: true }
                              );
                              form.setValue(
                                `contacts.${editContactIndex}.value`,
                                newContactValue,
                                { shouldDirty: true, shouldValidate: true }
                              );
                            }
                            setEditContactIndex(null);
                            setIsAddContactOpen(false);
                          }}
                          disabled={!newContactValue}
                        >
                          {editContactIndex === null ? "Добавить" : "Сохранить"}
                        </Button>
                        <DrawerClose asChild>
                          <Button variant="outline" type="button">
                            Отмена
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>

                {/* Relations */}
                <div className="space-y-3 mt-6 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Родственники</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        setEditRelationIndex(null);
                        setNewRelationName("");
                        setNewRelationType("phone");
                        setNewRelationValue("");
                        setIsAddRelationOpen(true);
                      }}
                    >
                      + Добавить
                    </Button>
                  </div>
                  {relationsArray.fields.length === 0 && (
                    <p className="text-sm opacity-70">Нет записей</p>
                  )}
                  {relationsArray.fields.map((f, idx) => (
                    <ContactItem
                      key={f.id}
                      type={
                        form.getValues(`relations.${idx}.contact_type`) as any
                      }
                      title={
                        (form.getValues(
                          `relations.${idx}.relation_name`
                        ) as any) || ""
                      }
                      value={
                        (form.getValues(
                          `relations.${idx}.contact_value`
                        ) as any) || ""
                      }
                      onEdit={() => {
                        setEditRelationIndex(idx);
                        setNewRelationName(
                          (form.getValues(
                            `relations.${idx}.relation_name`
                          ) as string) || ""
                        );
                        setNewRelationType(
                          (form.getValues(
                            `relations.${idx}.contact_type`
                          ) as string) || "phone"
                        );
                        setNewRelationValue(
                          (form.getValues(
                            `relations.${idx}.contact_value`
                          ) as string) || ""
                        );
                        setIsAddRelationOpen(true);
                      }}
                      onDelete={() => relationsArray.remove(idx)}
                    />
                  ))}
                </div>

                {/* Add Relation Nested Drawer */}
                <Drawer
                  open={isAddRelationOpen}
                  onOpenChange={setIsAddRelationOpen}
                >
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-md">
                      <DrawerHeader>
                        <DrawerTitle>{editRelationIndex === null ? "Добавить запись" : "Редактировать запись"}</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="text-sm">Кто</label>
                          <Input
                            placeholder="Мама / Папа / Опекун"
                            value={newRelationName}
                            onChange={(e) => setNewRelationName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 items-end">
                          <div>
                            <label className="text-sm">Тип контакта</label>
                            <Select
                              value={newRelationType}
                              onValueChange={setNewRelationType}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[20vh]">
                                <SelectItem value="phone">
                                  <span className="inline-flex items-center gap-2">
                                    <MdLocalPhone className="h-4 w-4" />
                                    <span>Телефон</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="email">
                                  <span className="inline-flex items-center gap-2">
                                    <MdOutlineMail className="h-4 w-4" />
                                    <span>Email</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="telegram">
                                  <span className="inline-flex items-center gap-2">
                                    <SiTelegram className="h-4 w-4" />
                                    <span>Telegram</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="whatsapp">
                                  <span className="inline-flex items-center gap-2">
                                    <SiWhatsapp className="h-4 w-4 text-green-500" />
                                    <span>WhatsApp</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="viber">
                                  <span className="inline-flex items-center gap-2">
                                    <SiViber className="h-4 w-4 text-purple-500" />
                                    <span>Viber</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="other">
                                  <span className="inline-flex items-center gap-2">
                                    <PiChatCircleDotsThin className="h-4 w-4" />
                                    <span>Другой</span>
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm">Контакт</label>
                            <Input
                              placeholder={
                                newRelationType === "telegram"
                                  ? "@username"
                                  : newRelationType === "email"
                                  ? "email@example.com"
                                  : "+7..."
                              }
                              value={newRelationValue}
                              onChange={(e) =>
                                setNewRelationValue(e.target.value)
                              }
                            />
                            {newRelationType === "telegram" &&
                              newRelationValue &&
                              !/^@[A-Za-z0-9_]{5,}$/.test(newRelationValue) && (
                                <p className="text-xs text-red-400 mt-1">
                                  Ник Telegram должен начинаться с @
                                </p>
                              )}
                            {newRelationType === "email" &&
                              newRelationValue &&
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                newRelationValue
                              ) && (
                                <p className="text-xs text-red-400 mt-1">
                                  Некорректный email
                                </p>
                              )}
                            {(newRelationType === "phone" ||
                              newRelationType === "whatsapp" ||
                              newRelationType === "viber") &&
                              newRelationValue &&
                              !/^\+?[0-9\s().-]{7,}$/.test(
                                newRelationValue
                              ) && (
                                <p className="text-xs text-red-400 mt-1">
                                  Некорректный номер телефона
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button
                          type="button"
                          onClick={() => {
                            if (editRelationIndex === null) {
                              relationsArray.append({
                                relation_name: newRelationName,
                                contact_type: newRelationType as any,
                                contact_value: newRelationValue,
                              });
                            } else {
                              form.setValue(
                                `relations.${editRelationIndex}.relation_name`,
                                newRelationName,
                                { shouldDirty: true, shouldValidate: true }
                              );
                              form.setValue(
                                `relations.${editRelationIndex}.contact_type`,
                                newRelationType as any,
                                { shouldDirty: true, shouldValidate: true }
                              );
                              form.setValue(
                                `relations.${editRelationIndex}.contact_value`,
                                newRelationValue,
                                { shouldDirty: true, shouldValidate: true }
                              );
                            }
                            setEditRelationIndex(null);
                            setIsAddRelationOpen(false);
                          }}
                          disabled={!newRelationName || !newRelationValue}
                        >
                          {editRelationIndex === null ? "Добавить" : "Сохранить"}
                        </Button>
                        <DrawerClose asChild>
                          <Button variant="outline" type="button">
                            Отмена
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            )}
          </div>
          {/* Address Map Picker Drawer */}
          <MapAddressPicker
            open={isMapPickerOpen}
            onOpenChange={setIsMapPickerOpen}
            initialAddress={form.getValues("address") || ""}
            onSelect={(addr) => {
              form.setValue("address", addr, { shouldDirty: true, shouldValidate: true });
            }}
          />
        </form>
      </Form>
    );
  }
);

StudentForm.displayName = "StudentForm";

export default StudentForm;
