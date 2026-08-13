// hooks/useQuickNotes.ts — CRUD completo para Quick Notes

import { useState, useEffect, useCallback } from 'react';
import { QuickNote, NoteCategory, NoteColor } from '../types';

const STORAGE_KEY = 'malha3d_quick_notes';

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function loadNotes(): QuickNote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistNotes(notes: QuickNote[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export interface UseQuickNotesReturn {
  notes: QuickNote[];
  loading: boolean;
  saveNote: (note: Partial<QuickNote>) => boolean;
  deleteNote: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export function useQuickNotes(): UseQuickNotesReturn {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNotes(loadNotes());
    setLoading(false);
  }, []);

  const saveNote = useCallback((noteData: Partial<QuickNote>): boolean => {
    if (!noteData.title?.trim()) return false;

    setNotes(prev => {
      let updated: QuickNote[];

      if (noteData.id) {
        // Update existing
        updated = prev.map(n =>
          n.id === noteData.id
            ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
            : n
        );
      } else {
        // Create new
        const newNote: QuickNote = {
          id: generateId(),
          title: noteData.title!.trim(),
          content: noteData.content || '',
          category: noteData.category || 'Geral',
          color: noteData.color || 'yellow',
          tags: noteData.tags || [],
          isFavorite: noteData.isFavorite || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updated = [newNote, ...prev];
      }

      persistNotes(updated);
      return updated;
    });

    return true;
  }, []);

  const deleteNote = useCallback((id: string): boolean => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return false;

    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      persistNotes(updated);
      return updated;
    });

    return true;
  }, []);

  const toggleFavorite = useCallback((id: string): void => {
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n
      );
      persistNotes(updated);
      return updated;
    });
  }, []);

  return { notes, loading, saveNote, deleteNote, toggleFavorite };
}
