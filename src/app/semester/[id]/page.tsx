'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  FileDown,
  Upload,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  MinusCircle,
} from 'lucide-react';
import { NeoCard, NeoButton, NeoBadge, NeoInput } from '@/components/NeoComponents';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import SubjectForm from '@/components/SubjectForm';
import { cn } from '@/lib/utils';

const statusColors: any = {
  passed: '#A3E635',
  failed: '#FF4D4D',
  appearing: '#FFD600',
  not_attempted: '#FFFFFF',
  dropped: '#E5E7EB',
};

const statusIcons: any = {
  passed: CheckCircle2,
  failed: XCircle,
  appearing: Clock,
  not_attempted: MinusCircle,
  dropped: AlertCircle,
};

export default function SemesterPage() {
  const params = useParams();
  const semesterId = params.id as string;
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [viewingSubject, setViewingSubject] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const exportToCSV = () => {
    if (!filteredSubjects || filteredSubjects.length === 0) return;

    const headers = [
      'Code',
      'Name',
      'Semester',
      'Credits',
      'Status',
      'Grade',
      'Attempts',
      'Exam Session',
      'Remarks',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredSubjects.map((s: any) =>
        [
          s.code,
          `"${s.name}"`,
          s.semester,
          s.credits,
          s.status,
          s.grade || '',
          s.attempts,
          `"${s.exam_session || ''}"`,
          `"${s.remarks || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `semester_${semesterId}_backlogs.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', semesterId],
    queryFn: async () => {
      const res = await fetch(`/api/subjects?semester=${semesterId}`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', semesterId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Subject deleted successfully');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ action, ids, data }: any) => {
      const res = await fetch('/api/subjects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, data }),
      });
      if (!res.ok) throw new Error('Bulk action failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', semesterId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setSelectedIds([]);
      toast.success('Bulk action completed successfully');
    },
  });

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter(
      (s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [subjects, search]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubjects.map((s: any) => s.id));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-20 w-full animate-pulse border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            ></div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <NeoBadge className="mb-2" color="#A3E635">
            Semester View
          </NeoBadge>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            Semester <span className="text-[#A3E635]">{semesterId}</span>
          </h1>
          <p className="mt-2 text-lg font-bold text-gray-700">
            Managing <span className="underline">{filteredSubjects.length} subjects</span> for this
            academic session.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <NeoButton
            color="#A3E635"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} /> Add Subject
          </NeoButton>
          <NeoButton color="#FFFFFF" onClick={exportToCSV} className="flex items-center gap-2">
            <FileDown size={20} /> Export
          </NeoButton>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <NeoInput
            placeholder="Search by name or code..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <NeoButton color="#FFD600" className="flex items-center gap-2">
                  Bulk Actions ({selectedIds.length})
                </NeoButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <DropdownMenuLabel className="font-black uppercase">
                  Batch Updates
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    bulkMutation.mutate({
                      action: 'update',
                      ids: selectedIds,
                      data: { status: 'passed' },
                    })
                  }
                  className="font-bold"
                >
                  Mark as Passed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    bulkMutation.mutate({
                      action: 'update',
                      ids: selectedIds,
                      data: { status: 'failed' },
                    })
                  }
                  className="font-bold"
                >
                  Mark as Failed
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm('Are you sure you want to delete these subjects?')) {
                      bulkMutation.mutate({ action: 'delete', ids: selectedIds });
                    }
                  }}
                  className="font-bold text-[#FF4D4D]"
                >
                  Bulk Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <NeoCard className="p-0 overflow-hidden" noShadow={false}>
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black/90">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === filteredSubjects.length && filteredSubjects.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                />
              </TableHead>
              <TableHead className="text-white font-black uppercase">Code</TableHead>
              <TableHead className="text-white font-black uppercase">Name</TableHead>
              <TableHead className="text-white font-black uppercase">Credits</TableHead>
              <TableHead className="text-white font-black uppercase">Status</TableHead>
              <TableHead className="text-white font-black uppercase">Grade</TableHead>
              <TableHead className="text-white font-black uppercase">Attempts</TableHead>
              <TableHead className="text-white font-black uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <p className="text-xl font-black uppercase italic text-gray-400">
                    No subjects found in this semester
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubjects.map((s: any) => {
                const StatusIcon = statusIcons[s.status] || MinusCircle;
                return (
                  <TableRow key={s.id} className="border-b-2 border-black hover:bg-[#F4F1EA]">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={() => toggleSelect(s.id)}
                        className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                      />
                    </TableCell>
                    <TableCell className="font-black">{s.code}</TableCell>
                    <TableCell className="font-bold">{s.name}</TableCell>
                    <TableCell className="font-black">{s.credits}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 items-center gap-1.5 border-2 border-black px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          style={{ backgroundColor: statusColors[s.status] }}
                        >
                          <StatusIcon size={14} className="shrink-0" />
                          <span className="text-[10px] font-black uppercase whitespace-nowrap">
                            {s.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-black">{s.grade || '-'}</TableCell>
                    <TableCell>
                      <NeoBadge color="#FFFFFF" className="bg-white">
                        {s.attempts}
                      </NeoBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 border-2 border-black hover:bg-black hover:text-white"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <DropdownMenuItem
                            onClick={() => setViewingSubject(s)}
                            className="font-bold"
                          >
                            <Eye size={14} className="mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setEditingSubject(s)}
                            className="font-bold"
                          >
                            <Edit2 size={14} className="mr-2" /> Edit Subject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-black" />
                          <DropdownMenuItem
                            onClick={() => setDeletingId(s.id)}
                            className="font-bold text-[#FF4D4D]"
                          >
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </NeoCard>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddOpen || !!editingSubject}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingSubject(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-black p-4 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                {editingSubject ? 'Update Subject' : 'New Subject Entry'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <SubjectForm
              initialData={editingSubject}
              onSuccess={() => {
                setIsAddOpen(false);
                setEditingSubject(null);
                queryClient.invalidateQueries({ queryKey: ['subjects', semesterId] });
                queryClient.invalidateQueries({ queryKey: ['analytics'] });
                toast.success(editingSubject ? 'Subject updated!' : 'Subject added!');
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-black">
              This action cannot be undone. This will permanently delete the subject and all its
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-[#FF4D4D] border-2 border-black text-white font-black uppercase hover:bg-[#FF4D4D]/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Modal */}
      <Dialog open={!!viewingSubject} onOpenChange={(open) => !open && setViewingSubject(null)}>
        <DialogContent className="max-w-md border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-[#38BDF8] p-4 border-b-4 border-black">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-black">
                Subject Blueprint
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Subject Name</span>
              <span className="font-black text-right uppercase">{viewingSubject?.name}</span>
            </div>
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Subject Code</span>
              <span className="font-black uppercase">{viewingSubject?.code}</span>
            </div>
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Semester</span>
              <span className="font-black">Sem {viewingSubject?.semester}</span>
            </div>
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Credits</span>
              <span className="font-black">{viewingSubject?.credits} Units</span>
            </div>
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Current Status</span>
              <NeoBadge color={statusColors[viewingSubject?.status]}>
                {viewingSubject?.status.replace('_', ' ')}
              </NeoBadge>
            </div>
            <div className="flex justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase text-gray-500 text-xs">Attempts</span>
              <span className="font-black">{viewingSubject?.attempts} Sessions</span>
            </div>
            <div className="pt-2">
              <p className="font-bold uppercase text-gray-500 text-xs mb-1">Remarks</p>
              <div className="border-2 border-black bg-white p-3 font-bold italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {viewingSubject?.remarks ||
                  'No additional remarks recorded for this subject entry.'}
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              <NeoButton
                color="#A3E635"
                className="flex-1"
                onClick={() => {
                  setEditingSubject(viewingSubject);
                  setViewingSubject(null);
                }}
              >
                Edit Entry
              </NeoButton>
              <NeoButton color="#FFFFFF" className="flex-1" onClick={() => setViewingSubject(null)}>
                Close
              </NeoButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
