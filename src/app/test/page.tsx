'use client';

import { useMemo } from 'react';
import { useSignal, themeParams as _themeParams } from '@telegram-apps/sdk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

export default function TestPage() {
  const theme = useSignal(_themeParams.state);

  const rows = useMemo(() => Object.entries(theme ?? {}).filter(([, v]) => v != null), [theme]);

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-6">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">UI Тест: цветовая палитра Telegram</h1>
        <p className="text-white/70 text-sm">Проверьте, как элементы реагируют на смену темы в Telegram.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Кнопки</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Поля ввода</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Текстовое поле" />
          <Select defaultValue="1">
            <option value="1">Вариант 1</option>
            <option value="2">Вариант 2</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <input id="cb1" type="checkbox" className="h-4 w-4" />
          <label htmlFor="cb1">Чекбокс</label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Карточка</h2>
        <Card>
          <CardHeader>
            <h3 className="text-base font-medium">Заголовок</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">Это карточка. Фон и границы должны адаптироваться к теме.</p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button size="sm">Действие</Button>
            <Button size="sm" variant="outline">Отмена</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Календарь</h2>
        <Calendar />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Параметры темы (themeParams)</h2>
        <div className="grid gap-2 rounded-xl border border-white/10 p-3">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/70">{k}</span>
              <span className="font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


