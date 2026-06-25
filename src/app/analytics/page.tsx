'use client';

import React from 'react';
import MainLayout from '@/components/MainLayout';
import { NeoCard, NeoBadge } from '@/components/NeoComponents';
import { useQuery } from '@tanstack/react-query';
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

const COLORS = ['#A3E635', '#FF4D4D', '#FFD600', '#38BDF8', '#C084FC'];

export default function AnalyticsPage() {
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            ></div>
          ))}
        </div>
      </MainLayout>
    );
  }

  const { stats, semesterStats, backlogChartData, statusDistribution } = analytics;

  // Additional data for Analytics
  const completionData = semesterStats.map((s: any) => ({
    subject: `Sem ${s.semester}`,
    A: s.completionPercentage,
    fullMark: 100,
  }));

  const creditsData = semesterStats.map((s: any) => ({
    name: `Sem ${s.semester}`,
    passed: s.passed,
    total: s.total,
  }));

  return (
    <MainLayout>
      <div className="mb-12">
        <NeoBadge className="mb-2" color="#C084FC">
          Advanced Analytics
        </NeoBadge>
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
          Deep <span className="text-[#C084FC]">Insights</span>
        </h1>
        <p className="mt-2 text-lg font-bold text-gray-700">
          Visualizing your academic trajectory and historical performance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Semester Completion Radar */}
        <NeoCard className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Semester Proficiency
            </h3>
            <PieChartIcon size={24} />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={completionData}>
                <PolarGrid stroke="#000" />
                <PolarAngleAxis dataKey="subject" tick={{ fontWeight: 'bold', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#000" />
                <Radar
                  name="Completion %"
                  dataKey="A"
                  stroke="#A3E635"
                  fill="#A3E635"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontWeight: 'bold',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>

        {/* Subjects Per Semester Stacked Bar */}
        <NeoCard className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Subject Distribution
            </h3>
            <BarChart3 size={24} />
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditsData}>
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
                <Bar
                  dataKey="total"
                  name="Total Subjects"
                  fill="#FFFFFF"
                  stroke="#000"
                  strokeWidth={2}
                />
                <Bar
                  dataKey="passed"
                  name="Passed Subjects"
                  fill="#A3E635"
                  stroke="#000"
                  strokeWidth={2}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
          <NeoCard color="#FFD600" className="flex items-center gap-6">
            <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <TrendingUp size={32} />
            </div>
            <div>
              <p className="text-sm font-black uppercase">Overall Pass Rate</p>
              <p className="text-4xl font-black">{stats.passPercentage}%</p>
            </div>
          </NeoCard>

          <NeoCard color="#38BDF8" className="flex items-center gap-6">
            <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-sm font-black uppercase">Average Attempts</p>
              <p className="text-4xl font-black">
                {(stats.totalAttempts / (stats.totalSubjects || 1)).toFixed(1)}
              </p>
            </div>
          </NeoCard>
        </div>

        {/* Semester-wise Progress Area Chart */}
        <NeoCard className="lg:col-span-2 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Academic Velocity
            </h3>
            <Activity size={24} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#000" />
                <XAxis dataKey="subject" stroke="#000" tick={{ fontWeight: 'bold' }} />
                <YAxis stroke="#000" tick={{ fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="A"
                  stroke="#000"
                  strokeWidth={4}
                  fill="#C084FC"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </NeoCard>
      </div>
    </MainLayout>
  );
}
