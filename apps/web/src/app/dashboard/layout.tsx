'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Brain, 
  Home, 
  Users, 
  Phone, 
  FileText, 
  BarChart3, 
  Shield,
  Menu,
  X,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: '首页', icon: Home },
  { href: '/dashboard/data-collection', label: '数据采集', icon: Users },
  { href: '/dashboard/reach', label: '智能触达', icon: Phone },
  { href: '/dashboard/content', label: '内容生成', icon: FileText },
  { href: '/dashboard/crm', label: 'CRM协同', icon: BarChart3 },
  { href: '/dashboard/compliance', label: '合规管理', icon: Shield },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部导航 */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">房探AI</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* 移动端侧边栏 */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div 
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-800">房探AI</span>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-800">房探AI</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
              管
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">管理员</div>
              <div className="text-sm text-gray-500">admin@fangtan.ai</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        {/* 桌面端顶部栏 */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find(item => item.href === pathname)?.label || '首页'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 内容 */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
