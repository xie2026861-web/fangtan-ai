'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Phone, 
  FileText, 
  BarChart3, 
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">欢迎回来，管理员</h1>
          <p className="text-gray-500 mt-1">今天是2026年2月18日，星期二</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition">
            + 新建任务
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="今日新增客户"
          value="1,256"
          trend="+23%"
          trendUp={true}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          color="blue"
        />
        <StatCard 
          title="今日外呼"
          value="356"
          trend="+15%"
          trendUp={true}
          icon={<Phone className="h-5 w-5 text-green-600" />}
          color="green"
        />
        <StatCard 
          title="意向客户"
          value="42"
          trend="+8%"
          trendUp={true}
          icon={<BarChart3 className="h-5 w-5 text-orange-600" />}
          color="orange"
        />
        <StatCard 
          title="转化率"
          value="12.5%"
          trend="+2.3%"
          trendUp={true}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton 
            icon={<Phone className="h-6 w-6" />}
            label="新建外呼"
            color="from-blue-500 to-blue-600"
          />
          <QuickActionButton 
            icon={<Users className="h-6 w-6" />}
            label="采集数据"
            color="from-green-500 to-green-600"
          />
          <QuickActionButton 
            icon={<FileText className="h-6 w-6" />}
            label="生成文案"
            color="from-purple-500 to-purple-600"
          />
          <QuickActionButton 
            icon={<BarChart3 className="h-6 w-6" />}
            label="数据报表"
            color="from-orange-500 to-orange-600"
          />
        </div>
      </div>

      {/* AI Agent 状态 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Agent 状态</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <AgentStatusCard 
            name="数据采集 Agent"
            status="运行中"
            tasks="1,234"
            successRate="98.5%"
            color="blue"
          />
          <AgentStatusCard 
            name="智能触达 Agent"
            status="运行中"
            tasks="856"
            successRate="95.2%"
            color="green"
          />
          <AgentStatusCard 
            name="内容生成 Agent"
            status="运行中"
            tasks="423"
            successRate="97.8%"
            color="purple"
          />
          <AgentStatusCard 
            name="CRM协同 Agent"
            status="运行中"
            tasks="2,156"
            successRate="99.1%"
            color="orange"
          />
          <AgentStatusCard 
            name="合规管理 Agent"
            status="运行中"
            tasks="1,789"
            successRate="100%"
            color="red"
          />
        </div>
      </div>

      {/* 最近活动 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最近活动</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      activity.color === 'green' ? 'bg-green-100 text-green-600' :
                      activity.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === '成功' ? 'bg-green-100 text-green-700' :
                    activity.status === '进行中' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  trend, 
  trendUp, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  trend: string; 
  trendUp: boolean; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
    purple: 'bg-purple-50',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
            {icon}
          </div>
          <span className={`flex items-center text-xs md:text-sm font-medium ${
            trendUp ? 'text-green-600' : 'text-red-600'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
            {trend}
          </span>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{title}</div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button className={`p-4 md:p-6 rounded-2xl bg-gradient-to-r ${color} text-white text-center hover:shadow-lg transition-all hover:-translate-y-1`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="font-medium">{label}</div>
    </button>
  );
}

function AgentStatusCard({ 
  name, 
  status, 
  tasks, 
  successRate, 
  color 
}: { 
  name: string; 
  status: string; 
  tasks: string; 
  successRate: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    purple: 'border-l-purple-500',
    red: 'border-l-red-500',
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <span className="flex items-center w-2 h-2 rounded-full bg-green-500">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75 animate-ping"></span>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">完成任务</div>
            <div className="font-semibold text-gray-800">{tasks}</div>
          </div>
          <div>
            <div className="text-gray-500">成功率</div>
            <div className="font-semibold text-green-600">{successRate}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const recentActivities = [
  { 
    icon: <Users className="h-5 w-5" />, 
    title: '采集客户数据 1,256 条', 
    time: '2分钟前', 
    status: '成功',
    color: 'blue'
  },
  { 
    icon: <Phone className="h-5 w-5" />, 
    title: 'AI外呼完成 356 通', 
    time: '5分钟前', 
    status: '成功',
    color: 'green'
  },
  { 
    icon: <FileText className="h-5 w-5" />, 
    title: '生成文案 42 篇', 
    time: '10分钟前', 
    status: '成功',
    color: 'purple'
  },
  { 
    icon: <Shield className="h-5 w-5" />, 
    title: '合规审核通过', 
    time: '15分钟前', 
    status: '成功',
    color: 'orange'
  },
  { 
    icon: <BarChart3 className="h-5 w-5" />, 
    title: '数据报表生成中', 
    time: '20分钟前', 
    status: '进行中',
    color: 'blue'
  },
];
