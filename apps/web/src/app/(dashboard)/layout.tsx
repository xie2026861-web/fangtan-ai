import Link from 'next/link';
import { Brain, LayoutDashboard, Users, Phone, FileText, Settings, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { icon: LayoutDashboard, label: '仪表盘', href: '/dashboard' },
  { icon: Users, label: '客户管理', href: '/dashboard/customers' },
  { icon: Phone, label: '外呼任务', href: '/dashboard/campaigns' },
  { icon: FileText, label: '内容生成', href: '/dashboard/content' },
  { icon: BarChart3, label: '数据分析', href: '/dashboard/analytics' },
  { icon: Settings, label: '设置', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Brain className="h-8 w-8 text-green-600 mr-2" />
            <span className="text-xl font-bold">房探AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="h-5 w-5 mr-3 text-gray-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-medium">用</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">用户名</p>
                <p className="text-xs text-gray-500">专业版</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
