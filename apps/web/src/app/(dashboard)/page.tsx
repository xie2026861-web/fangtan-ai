import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const stats = [
  {
    title: '今日触达',
    value: '1,234',
    change: '+12%',
    icon: Phone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: '新增客户',
    value: '89',
    change: '+5%',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: '内容生成',
    value: '256',
    change: '+23%',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: '转化率',
    value: '3.2%',
    change: '+0.5%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'call',
    title: '外呼任务完成',
    description: '新盘推荐 - 已完成 50/100',
    time: '5分钟前',
    status: 'success',
  },
  {
    id: 2,
    type: 'content',
    title: '内容生成完成',
    description: '房产营销文案 - 5条新内容',
    time: '15分钟前',
    status: 'success',
  },
  {
    id: 3,
    type: 'customer',
    title: '新客户录入',
    description: '张先生 - 意向客户',
    time: '1小时前',
    status: 'success',
  },
  {
    id: 4,
    type: 'campaign',
    title: '任务提醒',
    description: '周末外呼任务即将开始',
    time: '2小时前',
    status: 'warning',
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: '新盘推荐外呼',
    time: '14:00',
    progress: 60,
    total: 100,
  },
  {
    id: 2,
    title: '客户回访',
    time: '15:30',
    progress: 0,
    total: 30,
  },
  {
    id: 3,
    title: '活动通知',
    time: '16:00',
    progress: 0,
    total: 50,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，这是您的业务概览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} 较昨日
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              了解最新的业务动态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        activity.status === 'success'
                          ? 'bg-green-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      {activity.type === 'call' && (
                        <Phone className="h-4 w-4 text-blue-600" />
                      )}
                      {activity.type === 'content' && (
                        <FileText className="h-4 w-4 text-purple-600" />
                      )}
                      {activity.type === 'customer' && (
                        <Users className="h-4 w-4 text-green-600" />
                      )}
                      {activity.type === 'campaign' && (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>即将进行的任务</CardTitle>
            <CardDescription>
              今日待完成的外呼任务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">{task.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(task.progress / task.total) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      {task.progress}/{task.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
            <CardDescription>
              快速开始新任务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">开始外呼</span>
                </div>
                <span className="text-blue-600">→</span>
              </button>
              <button className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">生成内容</span>
                </div>
                <span className="text-purple-600">→</span>
              </button>
              <button className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">添加客户</span>
                </div>
                <span className="text-green-600">→</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
