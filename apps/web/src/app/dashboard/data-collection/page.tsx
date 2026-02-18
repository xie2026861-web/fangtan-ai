'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Database, ArrowLeft, Play, Pause, Refresh, Download, Settings, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DataCollectionPage() {
  const [isCollecting, setIsCollecting] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>(['lianjia', 'ke'])

  const dataSources = [
    { id: 'lianjia', name: '链家网', enabled: true, records: 1250 },
    { id: 'ke', name: '贝壳找房', enabled: true, records: 980 },
    { id: 'fang', name: '房天下', enabled: false, records: 650 },
    { id: 'anjuke', name: '安居客', enabled: false, records: 520 },
    { id: 'poi', name: 'POI数据', enabled: true, records: 2340 },
  ]

  const recentTasks = [
    { id: 1, name: '上海房源采集', sources: ['lianjia', 'ke'], status: 'completed', records: 1250, time: '2026-02-18 14:30' },
    { id: 2, name: '北京学区房', sources: ['ke'], status: 'running', records: 680, time: '2026-02-18 14:25' },
    { id: 3, name: '深圳二手房', sources: ['lianjia', 'anjuke'], status: 'pending', records: 0, time: '2026-02-18 14:20' },
  ]

  const stats = {
    totalRecords: 5740,
    todayRecords: 1250,
    activeTasks: 2,
    successRate: 98.5,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">数据采集 Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              配置
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
          <StatCard title="总数据量" value={stats.totalRecords.toLocaleString()} icon={<Database className="h-8 w-8 text-blue-600" />} />
          <StatCard title="今日采集" value={stats.todayRecords.toLocaleString()} icon={<Refresh className="h-8 w-8 text-green-600" />} />
          <StatCard title="进行中任务" value={stats.activeTasks.toString()} icon={<Play className="h-8 w-8 text-orange-600" />} />
          <StatCard title="成功率" value={`${stats.successRate}%`} icon={<CheckCircle className="h-8 w-8 text-purple-600" />} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Data Sources */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>数据源配置</CardTitle>
                <CardDescription>选择要采集的数据源</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <input 
                          type="checkbox"
                          checked={selectedSources.includes(source.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSources([...selectedSources, source.id])
                            } else {
                              setSelectedSources(selectedSources.filter(id => id !== source.id))
                            }
                          }}
                          className="h-5 w-5"
                        />
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-sm text-gray-500">已采集 {source.records} 条数据</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {source.enabled ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已启用</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">未启用</span>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">采集说明</div>
                      <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                        <li>建议同时选择 2-3 个数据源以提高数据覆盖度</li>
                        <li>每次采集任务建议不超过 5000 条数据</li>
                        <li>系统会自动过滤重复数据</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>最近采集任务</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-500">
                          数据源: {task.sources.join(', ')} • {task.time}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">{task.records.toLocaleString()} 条</div>
                          <div className="text-sm text-gray-500">
                            {task.status === 'completed' && '已完成'}
                            {task.status === 'running' && '采集中'}
                            {task.status === 'pending' && '等待中'}
                          </div>
                        </div>
                        {task.status === 'running' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-1" />
                            暂停
                          </Button>
                        ) : task.status === 'pending' ? (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            开始
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            导出
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Quick Actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>快速采集</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>采集区域</Label>
                  <Input placeholder="上海" />
                </div>
                <div>
                  <Label>房源类型</Label>
                  <Input placeholder="二手房" />
                </div>
                <div>
                  <Label>关键词</Label>
                  <Input placeholder="学区房,地铁房" />
                </div>
                <div>
                  <Label>最大数量</Label>
                  <Input type="number" placeholder="1000" />
                </div>
                <Button className="w-full" onClick={() => setIsCollecting(true)}>
                  <Play className="h-4 w-4 mr-2" />
                  开始采集
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>数据质量</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QualityItem label="联系方式准确率" value="95.2%" />
                <QualityItem label="去重率" value="12.5%" />
                <QualityItem label="平均响应时间" value="0.8s" />
                <QualityItem label="数据完整性" value="89.3%" />
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

function QualityItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: value }}></div>
      </div>
    </div>
  )
}
