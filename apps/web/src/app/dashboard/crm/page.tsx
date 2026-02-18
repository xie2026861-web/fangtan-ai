'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Users, ArrowLeft, Plus, Search, Filter, Tag, Calendar, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function CrmPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  const customers = [
    { id: 1, name: '张先生', phone: '138****8888', intention: '高意向', stage: '谈判中', source: '链家', lastContact: '2026-02-18', tags: ['刚需', '学区', '浦东'] },
    { id: 2, name: '李女士', phone: '139****6666', intention: '有意向', stage: '看房中', source: '贝壳', lastContact: '2026-02-17', tags: ['改善', '大户型'] },
    { id: 3, name: '王先生', phone: '137****5555', intention: '一般', stage: '跟进中', source: '自然来访', lastContact: '2026-02-16', tags: ['投资'] },
    { id: 4, name: '赵女士', phone: '136****4444', intention: '高意向', stage: '签约中', source: '转介绍', lastContact: '2026-02-18', tags: ['刚需', '婚房'] },
    { id: 5, name: '刘先生', phone: '135****3333', intention: '低意向', stage: '休眠', source: '广告', lastContact: '2026-02-10', tags: [] },
  ]

  const stats = {
    totalCustomers: 1256,
    newThisWeek: 89,
    toFollowUp: 45,
    closingThisMonth: 23,
  }

  const lifecycleStages = [
    { stage: '线索', count: 345 },
    { stage: '意向', count: 234 },
    { stage: '谈判', count: 89 },
    { stage: '签约', count: 45 },
  ]

  const intentionDistribution = [
    { level: '高意向', count: 156, color: 'bg-green-500' },
    { level: '有意向', count: 234, color: 'bg-blue-500' },
    { level: '一般', count: 345, color: 'bg-yellow-500' },
    { level: '无意向', count: 89, color: 'bg-gray-500' },
    { level: '休眠', count: 67, color: 'bg-red-500' },
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
            <Brain className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold">CRM协同 Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新增客户
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="客户总数" value={stats.totalCustomers.toLocaleString()} icon={<Users className="h-8 w-8 text-blue-600" />} />
          <StatCard title="本周新增" value={stats.newThisWeek.toString()} icon={<Plus className="h-8 w-8 text-green-600" />} />
          <StatCard title="待跟进" value={stats.toFollowUp.toString()} icon={<Calendar className="h-8 w-8 text-orange-600" />} />
          <StatCard title="本月成交" value={stats.closingThisMonth.toString()} icon={<Tag className="h-8 w-8 text-purple-600" />} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left - Customer List */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>客户列表</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="搜索客户..." className="w-64" />
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">电话</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">意向</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">阶段</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">来源</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">标签</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">最后联系</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr 
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`border-b cursor-pointer hover:bg-gray-50 ${
                            selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-medium">{customer.name}</td>
                          <td className="py-3 px-4 text-gray-500">{customer.phone}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              customer.intention === '高意向' ? 'bg-green-100 text-green-800' :
                              customer.intention === '有意向' ? 'bg-blue-100 text-blue-800' :
                              customer.intention === '一般' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.intention}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{customer.stage}</td>
                          <td className="py-3 px-4 text-gray-500">{customer.source}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              {customer.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                              {customer.tags.length > 2 && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{customer.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-sm">{customer.lastContact}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Lifecycle Stages */}
            <Card>
              <CardHeader>
                <CardTitle>客户生命周期分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end space-x-4 h-32">
                  {lifecycleStages.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-md"
                        style={{ height: `${(item.count / 400) * 100}%` }}
                      ></div>
                      <div className="text-sm mt-2">{item.stage}</div>
                      <div className="text-xs text-gray-500">{item.count}人</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Statistics & Quick Actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>意向分布</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {intentionDistribution.map((item) => (
                  <div key={item.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.level}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full`} 
                        style={{ width: `${(item.count / 400) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  新增客户
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  批量跟进
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📊 导出报表
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔄 同步数据
                </Button>
              </CardContent>
            </Card>

            {selectedCustomer && (
              <Card>
                <CardHeader>
                  <CardTitle>客户详情</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">姓名</div>
                      <div className="font-medium">{selectedCustomer.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">电话</div>
                      <div className="font-medium">{selectedCustomer.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">意向等级</div>
                      <div className="font-medium">{selectedCustomer.intention}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">当前阶段</div>
                      <div className="font-medium">{selectedCustomer.stage}</div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        联系
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        跟进
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
