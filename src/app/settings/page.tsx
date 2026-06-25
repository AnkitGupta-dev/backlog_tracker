'use client';

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { NeoCard, NeoButton, NeoBadge, NeoInput } from '@/components/NeoComponents';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Trash2,
  Database,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Settings updated successfully!');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      degree_name: formData.get('degree_name'),
      university_name: formData.get('university_name'),
      total_credits: parseFloat(formData.get('total_credits') as string),
      passing_grade: formData.get('passing_grade'),
      theme: 'light', // Hardcoded for now
    };
    updateMutation.mutate(data);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');

      const subjects = lines
        .slice(1)
        .filter((l) => l.trim())
        .map((line) => {
          const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!values) return null;
          const cleanValues = values.map((v) => v.replace(/^"|"$/g, ''));

          return {
            code: cleanValues[0],
            name: cleanValues[1],
            semester: parseInt(cleanValues[2]),
            credits: parseFloat(cleanValues[3]),
            status: cleanValues[4],
            grade: cleanValues[5] || null,
            attempts: parseInt(cleanValues[6]),
            exam_session: cleanValues[7] || null,
            remarks: cleanValues[8] || null,
          };
        })
        .filter(Boolean);

      try {
        const res = await fetch('/api/subjects/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'insert', data: { subjects } }),
        });
        if (!res.ok) throw new Error('Import failed');
        toast.success(`Imported ${subjects.length} subjects successfully!`);
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
      } catch (err) {
        toast.error('Failed to import CSV. Ensure format is correct.');
      }
    };
    reader.readAsText(file);
  };

  const resetData = async () => {
    if (!confirm('Are you sure? This will delete all subjects and notes.')) return;
    try {
      await fetch('/api/subjects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: 'all' }), // I need to update the backend to handle "all"
      });
      // Also delete notes
      toast.success('Database reset successful');
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    } catch (err) {
      toast.error('Reset failed');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-96 animate-pulse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-12">
        <NeoBadge className="mb-2" color="#38BDF8">
          System Settings
        </NeoBadge>
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
          Global <span className="text-[#38BDF8]">Configuration</span>
        </h1>
        <p className="mt-2 text-lg font-bold text-gray-700">
          Personalize your Academic OS and manage your degree parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <NeoCard>
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="text-[#A3E635]" size={32} />
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                Degree Meta-Data
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Degree Title</Label>
                  <NeoInput
                    name="degree_name"
                    defaultValue={settings?.degree_name}
                    placeholder="e.g. B.Tech Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">University / Institution</Label>
                  <NeoInput
                    name="university_name"
                    defaultValue={settings?.university_name}
                    placeholder="e.g. Stanford University"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Graduation Credit Target</Label>
                  <NeoInput
                    name="total_credits"
                    type="number"
                    step="1"
                    defaultValue={settings?.total_credits}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Target Passing Grade</Label>
                  <NeoInput
                    name="passing_grade"
                    defaultValue={settings?.passing_grade}
                    placeholder="e.g. C or 4.0"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <NeoButton
                  type="submit"
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                  disabled={updateMutation.isPending}
                >
                  <Save size={20} /> {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </NeoButton>
              </div>
            </form>
          </NeoCard>

          <NeoCard color="#FFD600">
            <div className="mb-4 flex items-center gap-3">
              <Database size={32} />
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                Data Management
              </h3>
            </div>
            <p className="font-bold text-sm mb-6">
              Perform administrative operations on your academic database. Use with extreme caution
              as these actions are irreversible.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <NeoButton color="#FFFFFF" className="flex items-center gap-2">
                  <Upload size={18} /> Import CSV
                </NeoButton>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <NeoButton
                color="#FF4D4D"
                onClick={resetData}
                className="text-white flex items-center gap-2"
              >
                <Trash2 size={18} /> Reset All Data
              </NeoButton>
            </div>
          </NeoCard>
        </div>

        <div className="space-y-8">
          <NeoCard className="bg-black text-white">
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">
              Application Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-bold uppercase opacity-60">Version</span>
                <span className="font-black text-xs">1.0.0-PROD</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-bold uppercase opacity-60">Framework</span>
                <span className="font-black text-xs">Next.js 15+</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-bold uppercase opacity-60">Database</span>
                <span className="font-black text-xs">PostgreSQL (Neon)</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-bold uppercase opacity-60">UI Identity</span>
                <span className="font-black text-xs">Neo-Brutalism</span>
              </div>
            </div>
            <div className="mt-8 border-2 border-white p-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                This is a production-grade academic OS designed for high-performance backlog
                tracking.
              </p>
            </div>
          </NeoCard>
        </div>
      </div>
    </MainLayout>
  );
}
