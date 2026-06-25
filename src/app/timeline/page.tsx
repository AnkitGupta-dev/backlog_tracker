'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { NeoCard, NeoBadge } from '@/components/NeoComponents';
import { useQuery } from '@tanstack/react-query';
import { History, BookOpen, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import FormattedDate from '@/components/FormattedDate';

export default function TimelinePage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            ></div>
          ))}
        </div>
      </MainLayout>
    );
  }

  const { recentActivity } = analytics;

  return (
    <MainLayout>
      <div className="mb-12">
        <NeoBadge className="mb-2" color="#FFD600">
          Academic History
        </NeoBadge>
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
          Action <span className="text-[#FFD600]">Timeline</span>
        </h1>
        <p className="mt-2 text-lg font-bold text-gray-700">
          Chronological record of every subject registration and status update.
        </p>
      </div>

      <div className="relative ml-4 border-l-4 border-black pl-8 pb-12">
        {recentActivity.length === 0 ? (
          <NeoCard className="bg-white">
            <p className="text-xl font-black uppercase italic text-gray-400">
              No activity recorded yet.
            </p>
          </NeoCard>
        ) : (
          recentActivity.map((item: any, i: number) => (
            <div key={item.id} className="relative mb-12 last:mb-0">
              {/* Dot */}
              <div className="absolute -left-[46px] top-0 h-8 w-8 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div
                  className={cn(
                    'h-full w-full',
                    item.status === 'passed'
                      ? 'bg-[#A3E635]'
                      : item.status === 'failed'
                        ? 'bg-[#FF4D4D]'
                        : 'bg-[#FFD600]'
                  )}
                ></div>
              </div>

              <NeoCard className="bg-white hover:-translate-y-1 transition-transform">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <NeoBadge
                        color={
                          item.status === 'passed'
                            ? '#A3E635'
                            : item.status === 'failed'
                              ? '#FF4D4D'
                              : '#FFD600'
                        }
                      >
                        {item.status.replace('_', ' ')}
                      </NeoBadge>
                      <span className="text-xs font-black uppercase text-gray-500">
                        <FormattedDate date={item.updated_at} includeTime />
                      </span>
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{item.name}</h3>
                    <p className="font-bold text-gray-600">
                      {item.code} • Semester {item.semester} • {item.credits} Credits
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-xs font-black uppercase text-gray-400">Attempts</p>
                      <p className="text-2xl font-black">{item.attempts}</p>
                    </div>
                    {item.grade && (
                      <div className="text-right">
                        <p className="text-xs font-black uppercase text-gray-400">Final Grade</p>
                        <NeoBadge color="#A3E635" className="text-lg px-4">
                          {item.grade}
                        </NeoBadge>
                      </div>
                    )}
                  </div>
                </div>

                {item.remarks && (
                  <div className="mt-4 border-t-2 border-black pt-4">
                    <p className="text-xs font-black uppercase text-gray-400 mb-1">
                      Notes from Session
                    </p>
                    <p className="font-bold italic text-gray-700">"{item.remarks}"</p>
                  </div>
                )}
              </NeoCard>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}
