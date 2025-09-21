"use client";

import { useArchivedStudents, useUpdateStudent } from "@/hooks/useStudents";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Archive, User, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { StudentWithRelations } from "@/types/student";

interface ArchiveDrawerProps {
  teacherId: string;
}

export function ArchiveDrawer({ teacherId }: ArchiveDrawerProps) {
  const { isArchiveDrawerOpen, closeArchiveDrawer } = useUIStore();
  const {
    data: archivedStudents,
    isLoading,
    error,
  } = useArchivedStudents(teacherId);
  const { mutate: restoreStudent, isPending: isRestoring } =
    useUpdateStudent(teacherId);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestoreStudent = (studentId: string) => {
    setRestoringId(studentId);
    restoreStudent(
      { studentId, values: { is_archived: false } as any },
      {
        onSuccess: () => {
          setRestoringId(null);
        },
        onError: () => {
          setRestoringId(null);
        },
      }
    );
  };

  // Вспомогательные функции для получения контактной информации
  const getPhoneContact = (
    student: StudentWithRelations
  ): string | undefined => {
    return student.student_contacts?.find(
      (contact: any) => contact.type === "phone"
    )?.value;
  };

  const getEmailContact = (
    student: StudentWithRelations
  ): string | undefined => {
    return student.student_contacts?.find(
      (contact: any) => contact.type === "email"
    )?.value;
  };

  return (
    <Drawer open={isArchiveDrawerOpen} onOpenChange={closeArchiveDrawer}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Архив учеников
            </div>
          </DrawerTitle>
          {/* <DrawerDescription>
            Список архивированных учеников. Вы можете восстановить их в любой момент.
          </DrawerDescription> */}
          <DrawerClose asChild>
            <button className="text-sm opacity-70">Закрыть</button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto pb-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm opacity-70">Загрузка архива...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-red-500">
                Ошибка загрузки архива: {error.message}
              </div>
            </div>
          )}

          {!isLoading &&
            !error &&
            (!archivedStudents || archivedStudents.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Archive className="h-12 w-12 opacity-30 mb-3" />
                <div className="text-sm opacity-70">Архив пуст</div>
                <div className="text-xs opacity-50 mt-1">
                  Здесь будут отображаться архивированные ученики
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            archivedStudents &&
            archivedStudents.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm opacity-70">
                  Список архивированных учеников. Вы можете восстановить их в
                  любой момент.
                </span>
                {archivedStudents.map((student) => (
                  <Card key={student.id} className="opacity-75">
                    <CardContent className="!p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-lg border border-white/20 flex-shrink-0"
                              style={{
                                backgroundColor: student.color || "#226095",
                              }}
                              data-testid="color-square"
                              aria-hidden
                            />
                            <h3 className="font-medium truncate">
                              {student.first_name} {student.last_name}
                            </h3>
                          </div>

                          {getPhoneContact(student) && (
                            <div className="text-sm opacity-70 mb-1">
                              📞 {getPhoneContact(student)}
                            </div>
                          )}

                          {getEmailContact(student) && (
                            <div className="text-sm opacity-70 mb-1">
                              ✉️ {getEmailContact(student)}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant={'outline'}
                          onClick={() => handleRestoreStudent(student.id)}
                          disabled={isRestoring && restoringId === student.id}
                          className="ml-3 flex-shrink-0 border-none"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          {isRestoring && restoringId === student.id
                            ? "Восстановление..."
                            : "Восстановить"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
