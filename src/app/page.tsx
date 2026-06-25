'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { NeoCard, NeoButton, NeoBadge } from '@/components/NeoComponents';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  GraduationCap,
  History,
  MoreVertical,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SubjectForm from '@/components/SubjectForm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import FormattedDate from '@/components/FormattedDate';

const COLORS = ['#A3E635', '#FF4D4D', '#FFD600', '#38BDF8', '#C084FC'];

const Counter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.floor(value);
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMiliseconds = duration;
    const incrementTime = Math.abs(totalMiliseconds / end);

    const timer = setInterval(
      () => {
        start += 1;
        setCount(start);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        }
      },
      Math.max(incrementTime, 16)
    );

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

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
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin border-4 border-black border-t-transparent bg-[#A3E635]"></div>
        </div>
      </MainLayout>
    );
  }

  const { stats, backlogChartData, statusDistribution, recentActivity, settings } = analytics;

  const statCards = [
    { title: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: '#FFFFFF' },
    { title: 'Active Backlogs', value: stats.backlogs, icon: AlertCircle, color: '#FF4D4D' },
    { title: 'Subjects Passed', value: stats.passed, icon: CheckCircle2, color: '#A3E635' },
    {
      title: 'Credits Earned',
      value: stats.totalCreditsEarned,
      icon: CreditCard,
      color: '#FFD600',
    },
    {
      title: 'Degree Progress',
      value: stats.degreeProgress,
      icon: TrendingUp,
      color: '#38BDF8',
      unit: '%',
    },
    {
      title: 'Semesters Clear',
      value: stats.completedSemesters,
      icon: GraduationCap,
      color: '#C084FC',
    },
  ];

  return (
    <MainLayout>
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <NeoBadge className="mb-2" color="#FFD600">
            Academic Dashboard
          </NeoBadge>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            {settings?.degree_name || 'Engineering'} <br />
            <span className="text-[#A3E635]">Progress Tracker</span>
          </h1>
          <p className="mt-4 text-lg font-bold text-gray-700">
            Welcome back. You have{' '}
            <span className="text-[#FF4D4D] underline">{stats.backlogs} pending backlogs</span> to
            clear.
          </p>
        </div>

        <div className="flex gap-4">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <NeoButton color="#A3E635" className="flex items-center gap-2">
                <Plus size={20} /> Add Subject
              </NeoButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl border-4 border-black p-0 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-black p-4 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                    New Subject Entry
                  </DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-6">
                <SubjectForm
                  onSuccess={() => {
                    setIsAddOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['analytics'] });
                    toast.success('Subject added successfully!');
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <NeoCard key={i} color={stat.color} className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-600">{stat.title}</p>
                <div className="mt-1 text-5xl font-black tracking-tighter flex items-end gap-1">
                  <Counter value={stat.value} />
                  <span className="text-xl mb-1">{stat.unit}</span>
                </div>
              </div>
              <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <stat.icon size={24} />
              </div>
            </div>
            {stat.title === 'Degree Progress' && (
              <div className="mt-4 h-4 w-full border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div
                  className="h-full bg-black transition-all duration-1000"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            )}
          </NeoCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Backlog Chart */}
        <NeoCard className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Backlogs by Semester
            </h3>
            <NeoBadge color="#FF4D4D">Visual Analytics</NeoBadge>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backlogChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="name" stroke="#000" tick={{ fontWeight: 'bold' }} />
                <YAxis stroke="#000" tick={{ fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="backlogs" fill="#FF4D4D" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>

        {/* Status Pie Chart */}
        <NeoCard className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Status Distribution
            </h3>
            <NeoBadge color="#38BDF8">Overview</NeoBadge>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {statusDistribution.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 border border-black"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs font-bold uppercase">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* Recent Activity */}
        <NeoCard className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Recent Academic Activity
            </h3>
            <Link
              href="/timeline"
              className="group flex items-center gap-1 text-sm font-black uppercase hover:underline"
            >
              View History{' '}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#F4F1EA]">
                  <History size={32} className="opacity-20" />
                </div>
                <p className="font-bold text-gray-500 italic">
                  No recent activity detected. Time to start logging!
                </p>
              </div>
            ) : (
              recentActivity.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
                        item.status === 'passed'
                          ? 'bg-[#A3E635]'
                          : item.status === 'failed'
                            ? 'bg-[#FF4D4D]'
                            : 'bg-[#FFD600]'
                      )}
                    >
                      {item.status === 'passed' ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <AlertCircle size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-tight">{item.name}</p>
                      <p className="text-xs font-bold text-gray-500">
                        {item.code} • Sem {item.semester} • <FormattedDate date={item.updated_at} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
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
                  </div>
                </div>
              ))
            )}
          </div>
        </NeoCard>

        {/* Insights Section */}
        <NeoCard className="bg-[#FFD600] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Smart Academic Insights
            </h3>
            <TrendingUp size={24} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-bold">Progress Statement</p>
              <p className="mt-2 text-lg font-black uppercase leading-tight italic">
                "You have completed <span className="text-[#A3E635]">{stats.degreeProgress}%</span>{' '}
                of your {settings?.degree_name || 'Engineering'} degree."
              </p>
            </div>
            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-bold">Graduation Goal</p>
              <p className="mt-2 text-lg font-black uppercase leading-tight italic">
                "Only <span className="text-[#FF4D4D]">{stats.creditsRemaining} credits</span>{' '}
                remain to achieve your graduation target."
              </p>
            </div>
          </div>
        </NeoCard>
      </div>

      {/* Floating Add Button for Mobile */}
      <div className="fixed bottom-8 right-8 z-50 md:hidden">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex h-16 w-16 items-center justify-center border-4 border-black bg-[#A3E635] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
              <Plus size={32} />
            </button>
          </DialogTrigger>
        </Dialog>
      </div>
    </MainLayout>
  );
}
