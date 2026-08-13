// types.ts — Quick Notes Types

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = 'Geral' | 'Trabalho' | 'Pessoal' | 'Ideias' | 'Lembretes' | 'Reuniões';

export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'gray';

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; dark_bg: string; dark_border: string; label: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-200', dark_bg: 'dark:bg-yellow-900/20', dark_border: 'dark:border-yellow-700/30', label: 'Amarelo' },
  blue:   { bg: 'bg-blue-100',   border: 'border-blue-200',   dark_bg: 'dark:bg-blue-900/20',   dark_border: 'dark:border-blue-700/30',   label: 'Azul' },
  green:  { bg: 'bg-green-100',  border: 'border-green-200',  dark_bg: 'dark:bg-green-900/20',  dark_border: 'dark:border-green-700/30',  label: 'Verde' },
  pink:   { bg: 'bg-pink-100',   border: 'border-pink-200',   dark_bg: 'dark:bg-pink-900/20',   dark_border: 'dark:border-pink-700/30',   label: 'Rosa' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-200', dark_bg: 'dark:bg-purple-900/20', dark_border: 'dark:border-purple-700/30', label: 'Roxo' },
  gray:   { bg: 'bg-gray-100',   border: 'border-gray-200',   dark_bg: 'dark:bg-gray-800/40',   dark_border: 'dark:border-gray-700/30',   label: 'Cinza' },
};

export const NOTE_CATEGORIES: NoteCategory[] = ['Geral', 'Trabalho', 'Pessoal', 'Ideias', 'Lembretes', 'Reuniões'];

export const COLOR_HEX: Record<NoteColor, string> = {
  yellow: '#fef08a',
  blue:   '#bfdbfe',
  green:  '#bbf7d0',
  pink:   '#fbcfe8',
  purple: '#e9d5ff',
  gray:   '#e5e7eb',
};
