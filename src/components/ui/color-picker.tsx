'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

const PREDEFINED_COLORS = [
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Голубой
  '#96CEB4', // Мятный
  '#FFEAA7', // Желтый
  '#DDA0DD', // Фиолетовый
  '#98D8C8', // Зеленый
];

export function ColorPicker({ value, onChange, className = '', onOpenChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const hiddenColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Проверяем localStorage для подсказки
    const hasSeenTooltip = localStorage.getItem('color-picker-tooltip-seen');
    if (!hasSeenTooltip) {
      setShowTooltip(true);
    }
  }, []);

  const handleColorButtonClick = () => {
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('color-picker-tooltip-seen', 'true');
    }
    
    if (!isOpen) {
      setIsOpen(true);
      // Небольшая задержка для инициализации анимации
      setTimeout(() => {
        setIsAnimating(true);
        onOpenChange?.(true);
      }, 10);
    } else {
      hiddenColorInputRef.current?.click();
    }
  };

  const handlePredefinedColorClick = (color: string) => {
    onChange(color);
    setIsClosing(true);
    setIsAnimating(true);
    // Закрываем панель после анимации
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      onOpenChange?.(false);
    }, 300);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Основная кнопка выбора цвета */}
      <button
        type="button"
        aria-label="Выбрать цвет"
        className="h-7 w-7 rounded-md border tg-border flex-shrink-0 relative transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: value }}
        onClick={handleColorButtonClick}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Подсказка */}
        {showTooltip && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
            Выбери цвет ученика
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </button>

      {/* Скрытый input для кастомного цвета */}
      <input
        ref={hiddenColorInputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {/* Панель с предустановленными цветами */}
      {isOpen && (
        <div
          className="absolute -top-2 left-8 z-40"
          style={{
            transform: isAnimating 
              ? isClosing 
                ? 'translateX(-100%)' 
                : 'translateX(0)'
              : 'translateX(100%)',
            opacity: isAnimating 
              ? isClosing 
                ? 0 
                : 1
              : 0,
            transition: 'all 0.3s ease-in-out',
            willChange: 'transform, opacity'
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="flex flex-row gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border tg-border">
            {PREDEFINED_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="h-7 w-7 rounded-md border tg-border hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: color }}
                onClick={() => handlePredefinedColorClick(color)}
                aria-label={`Выбрать цвет ${color}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
