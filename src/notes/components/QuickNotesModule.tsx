// components/QuickNotesModule.tsx — Página completa com grid de notas

import React, { useState, useMemo } from 'react';
import { QuickNote, NoteCategory, NOTE_CATEGORIES, NOTE_COLORS } from '../types';
import { useQuickNotes } from '../hooks/useQuickNotes';
import { QuickNoteModal } from './QuickNoteModal';

export const QuickNotesModule: React.FC = () => {
  const { notes, loading, saveNote, deleteNote, toggleFavorite } = useQuickNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NoteCategory | 'Todas' | 'Favoritos'>('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Filter by category
    if (activeFilter === 'Favoritos') {
      result = result.filter(n => n.isFavorite);
    } else if (activeFilter !== 'Todas') {
      result = result.filter(n => n.category === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.includes(q))
      );
    }

    return result;
  }, [notes, activeFilter, searchQuery]);

  const handleEditNote = (note: QuickNote) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Agora';
    if (mins < 60) return `${mins}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[5px] bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">sticky_note_2</span>
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Notas Rápidas</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{notes.length} {notes.length === 1 ? 'nota' : 'notas'} salvas</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-[5px] shadow-sm transition-all"
          aria-label="Criar nova nota"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nova Nota
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notas por título, conteúdo ou tags..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-[5px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors"
          aria-label="Buscar notas"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {(['Todas', ...NOTE_CATEGORIES, 'Favoritos'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-[5px] text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            aria-current={activeFilter === filter ? 'true' : undefined}
          >
            {filter === 'Favoritos' && <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">star</span>}
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600">note_stack</span>
          </div>
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">
            {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
            {searchQuery ? 'Tente buscar com outros termos.' : 'Clique em "Nova Nota" para começar a organizar suas ideias.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredNotes.map(note => {
            const colors = NOTE_COLORS[note.color];
            return (
              <div
                key={note.id}
                onClick={() => handleEditNote(note)}
                className={`group relative rounded-[5px] border p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colors.bg} ${colors.border} ${colors.dark_bg} ${colors.dark_border}`}
                role="button"
                aria-label={`Nota: ${note.title}`}
              >
                {/* Top row: category + favorite */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded">
                    {note.category}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
                    className={`transition-colors ${note.isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
                    aria-label={note.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <span className="material-symbols-outlined text-sm">{note.isFavorite ? 'star' : 'star_border'}</span>
                  </button>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-1">{note.title}</h4>

                {/* Content preview */}
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 leading-relaxed">
                  {stripHtml(note.content) || 'Sem conteúdo...'}
                </p>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[8px] font-bold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[8px] font-bold text-gray-400">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Footer: date + delete */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200/50 dark:border-white/5">
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                    {formatDate(note.updatedAt)}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    aria-label="Excluir nota"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <QuickNoteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={saveNote}
        editingNote={editingNote}
      />
    </div>
  );
};
