// components/QuickNoteModal.tsx — Modal flutuante de criação/edição

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuickNote, NoteCategory, NoteColor, NOTE_CATEGORIES, NOTE_COLORS, COLOR_HEX } from '../types';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<QuickNote>) => boolean;
  editingNote?: QuickNote | null;
}

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ isOpen, onClose, onSave, editingNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Geral');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Populate fields when editing
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category);
      setColor(editingNote.color);
      setTags([...editingNote.tags]);
      setIsFavorite(editingNote.isFavorite);
      if (contentRef.current) contentRef.current.innerHTML = editingNote.content;
    } else {
      resetForm();
    }
  }, [editingNote, isOpen]);

  // Focus title on open
  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('Geral');
    setColor('yellow');
    setTags([]);
    setTagInput('');
    setIsFavorite(false);
    setError('');
    if (contentRef.current) contentRef.current.innerHTML = '';
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Título é obrigatório');
      titleRef.current?.focus();
      return;
    }

    const noteContent = contentRef.current?.innerHTML || content;

    const success = onSave({
      ...(editingNote ? { id: editingNote.id } : {}),
      title: title.trim(),
      content: noteContent,
      category,
      color,
      tags,
      isFavorite,
    });

    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-label="Modal de nota rápida"
    >
      <div className="w-full max-w-lg mx-4 rounded-[5px] shadow-2xl overflow-hidden bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base">sticky_note_2</span>
            {editingNote ? 'Editar Nota' : 'Nova Nota'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[5px] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Fechar modal"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Título *
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="Título da nota..."
              className={`w-full px-3 py-2 text-sm rounded-[5px] bg-gray-50 dark:bg-white/5 border ${error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'} text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors`}
              aria-label="Título da nota"
            />
            {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
          </div>

          {/* Rich Text Toolbar */}
          <div>
            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Conteúdo
            </label>
            <div className="border border-gray-200 dark:border-white/10 rounded-[5px] overflow-hidden">
              <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                <button onClick={() => execCommand('bold')} className="w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Negrito" aria-label="Negrito">
                  <span className="material-symbols-outlined text-sm">format_bold</span>
                </button>
                <button onClick={() => execCommand('italic')} className="w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Itálico" aria-label="Itálico">
                  <span className="material-symbols-outlined text-sm">format_italic</span>
                </button>
                <button onClick={() => execCommand('insertUnorderedList')} className="w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Lista" aria-label="Lista">
                  <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                </button>
                <button onClick={() => execCommand('formatBlock', 'blockquote')} className="w-7 h-7 rounded hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="Citação" aria-label="Citação">
                  <span className="material-symbols-outlined text-sm">format_quote</span>
                </button>
              </div>
              <div
                ref={contentRef}
                contentEditable
                className="min-h-[120px] max-h-[200px] overflow-y-auto px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none [&_blockquote]:border-l-2 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-500"
                onInput={() => setContent(contentRef.current?.innerHTML || '')}
                suppressContentEditableWarning
                aria-label="Conteúdo da nota"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Cor
            </label>
            <div className="flex items-center gap-2">
              {(Object.keys(COLOR_HEX) as NoteColor[]).map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                  title={NOTE_COLORS[c].label}
                  aria-label={`Cor ${NOTE_COLORS[c].label}`}
                />
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="w-full px-3 py-2 text-sm rounded-[5px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none appearance-none"
              aria-label="Categoria da nota"
            >
              {NOTE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Tags (Enter para adicionar)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors" aria-label={`Remover tag ${tag}`}>
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Digite uma tag e pressione Enter..."
              className="w-full px-3 py-2 text-sm rounded-[5px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none"
              aria-label="Adicionar tag"
            />
          </div>

          {/* Favorite */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center gap-2 px-3 py-2 rounded-[5px] border transition-all ${isFavorite ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-amber-300'}`}
            aria-label="Marcar como favorita"
          >
            <span className="material-symbols-outlined text-sm">{isFavorite ? 'star' : 'star_border'}</span>
            <span className="text-xs font-bold">{isFavorite ? 'Favorita' : 'Marcar como favorita'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 rounded-[5px] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 rounded-[5px] uppercase tracking-wider transition-colors"
          >
            {editingNote ? 'Atualizar' : 'Salvar Nota'}
          </button>
        </div>
      </div>
    </div>
  );
};
