'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Phone, ArrowLeft, Play, Pause, BarChart3, Users, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SmartReachPage() {
  const [isCalling, setIsCalling] = useState(false)
  
  const stats = {
    todayCalls: 356,
    completionRate: 82.5,
    intentionRate: 42.3,
    avgDuration: '2分15秒',
  }

  const recentTasks = [
    { id: 1, name: '上海房源推荐', type: 'AI外呼', status: 'completed', calls: 156, intention: 45, time: '14:30' },
    { id: 2, name: '北京新盘通知', type: 'AI外呼', status: 'running', calls: 89, intention: 23, time: '14:25' },
    { id: 3, name: '深圳客户回访', type: '短信', status: 'completed', calls: 234, intention: 56, time: '14:20' },
    { id: 4, name: '广州跟进', type: '企业微信', status: 'pending', calls: 0, intention: 0, time: '14:15' },
  ]

  const intentionDistribution = [
    { level: '高意向', count: 45, percentage: 23 },
    { level: '有意向', count: 67, percentage: 34 },
    { level: '一般', count: 56, percentage: 28 },
    { level: '无意向', count: 28, percentage: 15 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Brain className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold">智能触达 Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              报表
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              新建任务
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="今日外呼" value={stats.todayCalls.toString()} icon={<Phone className="h-8 w-8 text-green-600" />} />
          <StatCard title="接通率" value={`${stats.completionRate}%`} icon={<CheckCircle className="h-8 w-8 text-blue-600" />} />
          <StatCard title="意向率" value={`${stats.intentionRate}%`} icon={<Users className="h-8 w-8 text-purple-600" />} />
          <StatCard title="平均时长" value={stats.avgDuration} icon={<Clock className="h-8 w-8 text-orange-600" />} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Tasks */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>触达任务</CardTitle>
                <CardDescription>管理您的AI外呼、短信、企业微信任务</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-500">
                            {task.type} • {task.time}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status === 'completed' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已完成</span>
                          )}
                          {task.status === 'running' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">进行中</span>
                          )}
                          {task.status === 'pending' && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">等待中</span>
                          )}
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-500">外呼数: </span>
                          <span className="font-medium">{task.calls}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">意向客户: </span>
                          <span className="font-medium text-green-600">{task.intention}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Intentions & Quick Actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>今日意向分布</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intentionDistribution.map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.level}</span>
                      <span className="font-medium">{item.count}人 ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.level === '高意向' ? 'bg-green-600' :
                          item.level === '有意向' ? 'bg-blue-600' :
                          item.level === '一般' ? 'bg-yellow-600' : 'bg-gray-600'
                        }`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>快速创建</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  AI外呼任务
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📱 短信群发
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💬 企业微信
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI外呼示例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="font-medium mb-2">开场白</div>
                  <p className="text-gray-600 mb-2">"您好，请问是王先生吗？我是房探AI的房产顾问..."</p>
                  <div className="font-medium mb-2">意图识别</div>
                  <p className="text-gray-600">
                    关键词: "感兴趣"、"看看"、"什么时候" → 高意向
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </CardContent>
    </Card>
  )
}
