'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  mode?: 'single' | 'multiple' | 'range';
}

export function Calendar({ selected, onSelect, mode = 'single' }: CalendarProps) {
  return (
    <div className="rounded-xl tg-border border tg-surface p-2">
      <DayPicker
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        styles={{
          caption: { color: 'var(--tg-theme-text-color,#111)' },
          head_cell: { color: 'var(--tg-theme-hint-color,#888)' },
          day: { color: 'var(--tg-theme-text-color,#111)' },
          nav_button_next: { color: 'var(--tg-theme-link-color,#2ea6ff)' },
          nav_button_previous: { color: 'var(--tg-theme-link-color,#2ea6ff)' },
          day_selected: { background: 'var(--tg-theme-button-color,#2ea6ff)', color: 'var(--tg-theme-button-text-color,#fff)' },
        }}
      />
    </div>
  );
}


