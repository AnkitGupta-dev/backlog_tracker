'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  AlertCircle,
  X,
  CheckCircle,
  TrendingUp,
  BookOpen,
  CreditCard,
  Edit3,
  RefreshCw,
  MinusCircle,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { NeoCard, NeoButton, NeoBadge } from '@/components/NeoComponents';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SubjectForm from '@/components/SubjectForm';

export default function ShortlistPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Fetch all subjects to categorize
  const { data: subjects, isLoading } = useQuery<any[]>({
    queryKey: ['subjects-all'],
    queryFn: async () => {
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Failed to fetch subjects');
      return res.json();
    },
  });

  // Categorize subjects
  const { failedSubjects, droppedSubjects, dbShortlistedSubjects } = useMemo(() => {
    if (!subjects) {
      return { failedSubjects: [], droppedSubjects: [], dbShortlistedSubjects: [] };
    }
    return {
      failedSubjects: subjects.filter((s) => s.status === 'failed'),
      droppedSubjects: subjects.filter((s) => s.status === 'dropped'),
      dbShortlistedSubjects: subjects.filter((s) => s.is_shortlisted),
    };
  }, [subjects]);

  // Bulk shortlist mutation
  const shortlistMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await fetch('/api/subjects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shortlist', ids }),
      });
      if (!res.ok) throw new Error('Failed to save shortlist');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects-all'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Semester shortlist saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Something went wrong');
    },
  });

  // Reset shortlist mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subjects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shortlist', ids: [] }),
      });
      if (!res.ok) throw new Error('Failed to reset shortlist');
      return res.json();
    },
    onSuccess: () => {
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['subjects-all'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Semester shortlist has been reset.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Something went wrong');
    },
  });

  // Compute selected subjects (in selection mode)
  const selectedSubjectsList = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter((s) => selectedIds.includes(s.id));
  }, [subjects, selectedIds]);

  const selectedCreditsTotal = useMemo(() => {
    return selectedSubjectsList.reduce((acc, s) => acc + parseFloat(s.credits || 0), 0);
  }, [selectedSubjectsList]);

  // Compute db shortlist metrics
  const dbCreditsTotal = useMemo(() => {
    return dbShortlistedSubjects.reduce((acc, s) => acc + parseFloat(s.credits || 0), 0);
  }, [dbShortlistedSubjects]);

  const workloadLevel = (credits: number) => {
    if (credits === 0) return { label: 'Empty', color: '#E5E7EB' };
    if (credits < 10) return { label: 'Light Workload', color: '#A3E635' };
    if (credits <= 16) return { label: 'Normal Workload', color: '#FFD600' };
    return { label: 'Heavy Workload', color: '#FF4D4D' };
  };

  const handleSelectSubject = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleDeselectSubject = (id: number) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one subject to shortlist.');
      return;
    }
    shortlistMutation.mutate(selectedIds);
  };

  const handleReset = () => {
    resetMutation.mutate();
    setShowResetConfirm(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent bg-[#A3E635]"></div>
        </div>
      </MainLayout>
    );
  }

  // -------------------------------------------------------------
  // STATE A: VIEW PLAN OVERVIEW (IF DB HAS SHORTLISTED SUBJECTS)
  // -------------------------------------------------------------
  if (dbShortlistedSubjects.length > 0) {
    const workload = workloadLevel(dbCreditsTotal);
    return (
      <MainLayout>
        {/* Style block for animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flyIn {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-fly-in {
            animation: flyIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />

        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <NeoBadge className="mb-2" color="#A3E635">
              Plan Active & Confirmed
            </NeoBadge>
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              Next Semester <span className="text-[#A3E635]">Shortlist Plan</span>
            </h1>
            <p className="mt-2 text-gray-700 font-bold">
              Your confirmed blueprint of backlogs and dropped subjects for the upcoming semester.
            </p>
          </div>
          <div>
            {!showResetConfirm ? (
              <NeoButton color="#FF4D4D" onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 font-black uppercase">
                <RefreshCw size={18} /> Reset Plan
              </NeoButton>
            ) : (
              <div className="flex items-center gap-2 border-4 border-black p-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs font-black uppercase text-red-500">Reset selection?</span>
                <NeoButton color="#FF4D4D" onClick={handleReset} className="text-xs py-1 px-3 uppercase font-black text-white">
                  Confirm
                </NeoButton>
                <NeoButton color="#FFFFFF" onClick={() => setShowResetConfirm(false)} className="text-xs py-1 px-3 uppercase font-black border border-black hover:bg-gray-100">
                  Cancel
                </NeoButton>
              </div>
            )}
          </div>
        </div>

        {/* Plan Overview Metrics */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <NeoCard color="#FFFFFF">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Shortlisted Subjects</p>
                <p className="mt-1 text-4xl font-black tracking-tighter">
                  {dbShortlistedSubjects.length} <span className="text-lg">subjects</span>
                </p>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={24} />
              </div>
            </div>
          </NeoCard>

          <NeoCard color="#FFD600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-700">Planned Credits</p>
                <p className="mt-1 text-4xl font-black tracking-tighter">
                  {dbCreditsTotal} <span className="text-lg font-bold">units</span>
                </p>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <CreditCard size={24} />
              </div>
            </div>
          </NeoCard>

          <NeoCard color={workload.color}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-700">Workload Estimation</p>
                <p className="mt-1 text-2xl font-black uppercase tracking-tight italic">
                  {workload.label}
                </p>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp size={24} />
              </div>
            </div>
          </NeoCard>
        </div>

        {/* Shortlisted Subjects List */}
        <NeoCard>
          <div className="mb-6 flex items-center justify-between border-b-2 border-black pb-4">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <Sparkles size={24} className="text-[#FFD600]" /> Planned Blueprint
            </h3>
            <NeoBadge color="#FFFFFF">Active Selection</NeoBadge>
          </div>

          <div className="space-y-4">
            {dbShortlistedSubjects.map((subject, idx) => (
              <div
                key={subject.id}
                style={{ animationDelay: `${idx * 0.05}s` }}
                className="animate-fly-in opacity-0 flex flex-col justify-between border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:flex-row md:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#F4F1EA] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500">
                        {subject.code}
                      </span>
                      <NeoBadge color={subject.status === 'failed' ? '#FF4D4D' : '#FFD600'}>
                        Originally {subject.status.toUpperCase()}
                      </NeoBadge>
                      <span className="text-xs font-bold text-gray-400">• Sem {subject.semester}</span>
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight">{subject.name}</h4>
                    {subject.remarks && (
                      <p className="mt-1 text-sm font-bold text-gray-500 italic">
                        "{subject.remarks}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-4 md:mt-0 md:border-none md:pt-0 gap-6">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase text-gray-500">Subject Weight</p>
                    <p className="text-lg font-black">{subject.credits} Credits</p>
                  </div>
                  <NeoButton
                    color="#FFFFFF"
                    onClick={() => setEditingSubject(subject)}
                    className="flex items-center gap-1 text-xs font-black uppercase border-2 border-black"
                  >
                    <Edit3 size={14} /> Update Subject
                  </NeoButton>
                </div>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* Edit Modal Component */}
        <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
          <DialogContent className="max-w-2xl border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black p-4 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                  Update Subject Status
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6">
              {editingSubject && (
                <SubjectForm
                  initialData={editingSubject}
                  onSuccess={() => {
                    setEditingSubject(null);
                    queryClient.invalidateQueries({ queryKey: ['subjects-all'] });
                    queryClient.invalidateQueries({ queryKey: ['analytics'] });
                    toast.success('Subject details updated successfully!');
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    );
  }

  // -------------------------------------------------------------
  // STATE B: SELECTION MODE (IF NO SAVED SHORTLIST PRESENT)
  // -------------------------------------------------------------
  const workload = workloadLevel(selectedCreditsTotal);

  return (
    <MainLayout>
      {/* Style block for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flyToTopRow {
          0% { transform: translateY(60px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-fly-to-top {
          animation: flyToTopRow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      <div className="mb-8">
        <NeoBadge className="mb-2" color="#FFD600">
          Planning Utility
        </NeoBadge>
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
          Shortlist <span className="text-[#A3E635]">Next Semester</span>
        </h1>
        <p className="mt-2 text-gray-700 font-bold">
          Pick which failed backlogs and dropped subjects you intend to tackle in the upcoming semester.
        </p>
      </div>

      {/* Selected Subjects Row at the Top */}
      <NeoCard className="mb-8 border-4 border-black" color="#FFFFFF">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center border-b-2 border-black pb-4">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
              <CornerDownRight size={24} className="text-[#A3E635]" /> Selected Blueprint
            </h3>
            <p className="text-xs font-bold text-gray-500">
              Select subjects from the columns below. They will fly here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="border-2 border-black bg-[#F4F1EA] px-3 py-1 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Total Credits: {selectedCreditsTotal}
            </div>
            <div
              className="border-2 border-black px-3 py-1 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: workload.color }}
            >
              {workload.label}
            </div>
            <NeoButton
              color="#A3E635"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0 || shortlistMutation.isPending}
              className="font-black uppercase text-sm border-2 border-black py-2 px-4"
            >
              {shortlistMutation.isPending ? 'Saving...' : 'Confirm Plan'}
            </NeoButton>
          </div>
        </div>

        {selectedSubjectsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-400 bg-gray-50">
            <MinusCircle size={32} className="text-gray-400 mb-2" />
            <p className="font-bold text-gray-500 italic">
              No subjects shortlisted yet. Click subjects from the columns below.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {selectedSubjectsList.map((subject) => (
              <div
                key={subject.id}
                className="animate-fly-to-top relative flex items-center gap-3 border-2 border-black bg-[#FFD600] px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] pr-10"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                    {subject.code}
                  </p>
                  <p className="font-black text-sm uppercase max-w-[150px] truncate">
                    {subject.name}
                  </p>
                  <p className="text-[10px] font-bold text-black">{subject.credits} Credits</p>
                </div>
                <button
                  onClick={() => handleDeselectSubject(subject.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-black bg-white hover:bg-red-400"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </NeoCard>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Failed Backlogs Column */}
        <NeoCard color="#FFFFFF" className="border-4 border-black">
          <div className="mb-6 flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#FF4D4D]">
              Failed Backlogs ({failedSubjects.filter((s) => !selectedIds.includes(s.id)).length})
            </h3>
            <NeoBadge color="#FF4D4D">Action Required</NeoBadge>
          </div>

          <div className="space-y-4">
            {failedSubjects.filter((s) => !selectedIds.includes(s.id)).length === 0 ? (
              <div className="py-12 text-center font-bold text-gray-500 italic">
                No backlog subjects available for selection.
              </div>
            ) : (
              failedSubjects
                .filter((s) => !selectedIds.includes(s.id))
                .map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSelectSubject(subject.id)}
                    className="cursor-pointer border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFF5F5]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {subject.code} • Sem {subject.semester}
                        </span>
                        <h4 className="font-black uppercase tracking-tight mt-0.5">{subject.name}</h4>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">
                          Attempts: {subject.attempts} • {subject.grade ? `Grade: ${subject.grade}` : 'No Grade'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-black uppercase text-gray-600">Credits</span>
                        <span className="block font-black text-lg text-[#FF4D4D]">{subject.credits}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </NeoCard>

        {/* Dropped Subjects Column */}
        <NeoCard color="#FFFFFF" className="border-4 border-black">
          <div className="mb-6 flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-[#FF9F1C]">
              Dropped Subjects ({droppedSubjects.filter((s) => !selectedIds.includes(s.id)).length})
            </h3>
            <NeoBadge color="#FF9F1C">Optional Pick</NeoBadge>
          </div>

          <div className="space-y-4">
            {droppedSubjects.filter((s) => !selectedIds.includes(s.id)).length === 0 ? (
              <div className="py-12 text-center font-bold text-gray-500 italic">
                No dropped subjects available for selection.
              </div>
            ) : (
              droppedSubjects
                .filter((s) => !selectedIds.includes(s.id))
                .map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => handleSelectSubject(subject.id)}
                    className="cursor-pointer border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFBF2]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {subject.code} • Sem {subject.semester}
                        </span>
                        <h4 className="font-black uppercase tracking-tight mt-0.5">{subject.name}</h4>
                        <p className="text-[10px] font-bold text-gray-500 mt-1">
                          Attempts: {subject.attempts} • {subject.remarks || 'No remarks'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-black uppercase text-gray-600">Credits</span>
                        <span className="block font-black text-lg text-[#FF9F1C]">{subject.credits}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </NeoCard>
      </div>
    </MainLayout>
  );
}
