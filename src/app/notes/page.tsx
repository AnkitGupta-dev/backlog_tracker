'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { NeoCard, NeoButton, NeoBadge, NeoInput } from '@/components/NeoComponents';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, StickyNote, Trash2, Edit2, Save, X, Calendar } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FormattedDate from '@/components/FormattedDate';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsAddOpen(false);
      toast.success('Note created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
      toast.success('Note updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      content: formData.get('content'),
    };

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            ></div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <NeoBadge className="mb-2" color="#A3E635">
            Subject Notes
          </NeoBadge>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            Study <span className="text-[#A3E635]">Scratchpad</span>
          </h1>
          <p className="mt-2 text-lg font-bold text-gray-700">
            Quick notes, strategies, and pointers for your academic journey.
          </p>
        </div>

        <NeoButton
          color="#A3E635"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} /> Create Note
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 ? (
          <NeoCard className="lg:col-span-3 py-20 text-center">
            <StickyNote size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-2xl font-black uppercase italic text-gray-400">
              Your scratchpad is empty
            </p>
          </NeoCard>
        ) : (
          notes.map((note: any) => (
            <NeoCard
              key={note.id}
              className="group relative flex flex-col hover:-translate-y-2 transition-transform"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase text-gray-500">
                    <FormattedDate date={note.created_at} />
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="p-1 border-2 border-black bg-white hover:bg-[#FFD600] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this note?')) deleteMutation.mutate(note.id);
                    }}
                    className="p-1 border-2 border-black bg-white hover:bg-[#FF4D4D] hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 underline decoration-[#A3E635] decoration-4">
                {note.title}
              </h3>
              <p className="font-bold text-gray-700 line-clamp-6 flex-1 italic">{note.content}</p>
            </NeoCard>
          ))
        )}
      </div>

      {/* Add/Edit Note Dialog */}
      <Dialog
        open={isAddOpen || !!editingNote}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingNote(null);
          }
        }}
      >
        <DialogContent className="max-w-xl border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-[#A3E635] p-4 border-b-4 border-black">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-black">
                {editingNote ? 'Update Scratch' : 'New Scratch'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase">Note Title</label>
              <NeoInput
                name="title"
                placeholder="e.g. Exam Strategy"
                defaultValue={editingNote?.title}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase">Content</label>
              <Textarea
                name="content"
                placeholder="Write your thoughts here..."
                className="min-h-[200px] border-2 border-black font-bold focus-visible:ring-0"
                defaultValue={editingNote?.content}
                required
              />
            </div>
            <div className="flex gap-4">
              <NeoButton
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Note'}
              </NeoButton>
              <NeoButton
                color="#FFFFFF"
                className="flex-1"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingNote(null);
                }}
              >
                Cancel
              </NeoButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
