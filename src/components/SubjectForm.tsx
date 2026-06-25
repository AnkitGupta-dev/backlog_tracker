'use client';

import React, { useState } from 'react';
import { NeoButton, NeoInput } from './NeoComponents';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface SubjectFormProps {
  initialData?: any;
  onSuccess: () => void;
}

export default function SubjectForm({ initialData, onSuccess }: SubjectFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code'),
      name: formData.get('name'),
      semester: parseInt(formData.get('semester') as string),
      credits: parseFloat(formData.get('credits') as string),
      grade: formData.get('grade') || null,
      status: formData.get('status'),
      attempts: parseInt(formData.get('attempts') as string),
      exam_session: formData.get('exam_session'),
      remarks: formData.get('remarks'),
    };

    try {
      const url = isEditing ? `/api/subjects/${initialData.id}` : '/api/subjects';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save subject');
      }

      onSuccess();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-black uppercase">
            Subject Name
          </Label>
          <NeoInput
            id="name"
            name="name"
            placeholder="e.g. Engineering Mathematics-I"
            defaultValue={initialData?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-black uppercase">
            Subject Code
          </Label>
          <NeoInput
            id="code"
            name="code"
            placeholder="e.g. MTH101"
            defaultValue={initialData?.code}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester" className="text-sm font-black uppercase">
            Semester
          </Label>
          <Select name="semester" defaultValue={initialData?.semester?.toString() || '1'}>
            <SelectTrigger className="h-12 border-2 border-black font-bold focus:ring-0">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={s.toString()} className="font-bold">
                  Semester {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="credits" className="text-sm font-black uppercase">
            Credits
          </Label>
          <NeoInput
            id="credits"
            name="credits"
            type="number"
            step="0.5"
            min="0"
            placeholder="e.g. 4.0"
            defaultValue={initialData?.credits || 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-black uppercase">
            Status
          </Label>
          <Select name="status" defaultValue={initialData?.status || 'not_attempted'}>
            <SelectTrigger className="h-12 border-2 border-black font-bold focus:ring-0">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <SelectItem value="not_attempted" className="font-bold">
                Not Attempted
              </SelectItem>
              <SelectItem value="appearing" className="font-bold">
                Appearing
              </SelectItem>
              <SelectItem value="passed" className="font-bold">
                Passed
              </SelectItem>
              <SelectItem value="failed" className="font-bold">
                Failed
              </SelectItem>
              <SelectItem value="dropped" className="font-bold">
                Dropped
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade" className="text-sm font-black uppercase">
            Grade (Optional)
          </Label>
          <NeoInput
            id="grade"
            name="grade"
            placeholder="e.g. A, B+, 9.0"
            defaultValue={initialData?.grade || ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attempts" className="text-sm font-black uppercase">
            Number of Attempts
          </Label>
          <NeoInput
            id="attempts"
            name="attempts"
            type="number"
            min="0"
            defaultValue={initialData?.attempts || 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exam_session" className="text-sm font-black uppercase">
            Exam Session
          </Label>
          <NeoInput
            id="exam_session"
            name="exam_session"
            placeholder="e.g. Summer 2024"
            defaultValue={initialData?.exam_session || ''}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="remarks" className="text-sm font-black uppercase">
          Remarks (Optional)
        </Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Notes about this subject..."
          className="min-h-[100px] border-2 border-black font-bold focus-visible:ring-0"
          defaultValue={initialData?.remarks || ''}
        />
      </div>
      <NeoButton type="submit" className="w-full h-14 text-xl" disabled={loading}>
        {loading ? 'Processing...' : isEditing ? 'Update Subject' : 'Register Subject'}
      </NeoButton>
    </form>
  );
}
