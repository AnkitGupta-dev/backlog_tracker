'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  History,
  StickyNote,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Semester 1', href: '/semester/1', icon: BookOpen },
  { name: 'Semester 2', href: '/semester/2', icon: BookOpen },
  { name: 'Semester 3', href: '/semester/3', icon: BookOpen },
  { name: 'Semester 4', href: '/semester/4', icon: BookOpen },
  { name: 'Semester 5', href: '/semester/5', icon: BookOpen },
  { name: 'Semester 6', href: '/semester/6', icon: BookOpen },
  { name: 'Semester 7', href: '/semester/7', icon: BookOpen },
  { name: 'Semester 8', href: '/semester/8', icon: BookOpen },
  { name: 'Shortlist Plan', href: '/shortlist', icon: GraduationCap },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Timeline', href: '/timeline', icon: History },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b-4 border-black bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#A3E635] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter">Backlog</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="border-2 border-black hover:bg-[#F4F1EA] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Menu size={20} />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed bottom-0 top-0 z-50 w-64 border-r-4 border-black bg-white transition-transform duration-300 ease-in-out lg:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#A3E635] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter">Backlog</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              className="border-2 border-black hover:bg-[#F4F1EA] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-black">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 border-2 border-transparent px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'border-black bg-[#A3E635] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'hover:border-black hover:bg-[#F4F1EA] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  )}
                >
                  <item.icon
                    className={cn('h-5 w-5 shrink-0', isActive ? 'text-black' : 'text-gray-500')}
                  />
                  <span className={cn('font-bold', isActive ? 'text-black' : 'text-gray-700')}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-2 border-black bg-[#FFD600] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase">Academic OS</p>
            <p className="text-[10px] font-bold opacity-75">v1.0.0 Production</p>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r-4 border-black bg-white transition-all duration-300 ease-in-out hidden lg:block',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#A3E635] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-xl font-black uppercase tracking-tighter">Backlog</span>
              </div>
            )}
            {isCollapsed && (
              <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#A3E635] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <GraduationCap className="h-6 w-6" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex border-2 border-black hover:bg-[#F4F1EA] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-black">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 border-2 border-transparent px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'border-black bg-[#A3E635] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'hover:border-black hover:bg-[#F4F1EA] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  )}
                >
                  <item.icon
                    className={cn('h-5 w-5 shrink-0', isActive ? 'text-black' : 'text-gray-500')}
                  />
                  {!isCollapsed && (
                    <span className={cn('font-bold', isActive ? 'text-black' : 'text-gray-700')}>
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-4 border-2 border-black bg-[#FFD600] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase">Academic OS</p>
              <p className="text-[10px] font-bold opacity-75">v1.0.0 Production</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out pt-16 lg:pt-0',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
