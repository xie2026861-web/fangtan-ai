'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Shield, ArrowLeft, Plus, Search, Filter, AlertTriangle, CheckCircle, FileText, Eye, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('sensitive-words')
  
  // 敏感词数据
  const sensitiveWords = [
    { id: 1, word: '最好', category: 'extreme', level: 'warning', usage: 156, status: 'active' },
    { id: 2, word: '第一', category: 'extreme', level: 'warning', usage: 89, status: 'active' },
    { id: 3, word: '稳赚', category: 'financial', level: 'danger', usage: 45, status: 'active' },
    { id: 4, word: '保本', category: 'financial', level: 'danger', usage: 34, status: 'active' },
    { id: 5, word: '虚假', category: 'fraud', level: 'danger', usage: 12, status: 'active' },
    { id: 6, word: '学区房', category: 'realestate', level: 'warning', usage: 234, status: 'active' },
    { id: 7, word: '地铁房', category: 'realestate', level: 'warning', usage: 198, status: 'active' },
  ]

  // 合规日志数据
  const complianceLogs = [
    { id: 1, content: '房源推荐文案', result: 'passed', riskLevel: 'low', time: '14:30', user: '张经理' },
    { id: 2, content: '限时优惠推广', result: 'warning', riskLevel: 'medium', time: '14:25', user: '李销售' },
    { id: 3, content: '朋友圈文案', result: 'failed', riskLevel: 'high', time: '14:20', user: '王经纪人' },
    { id: 4, content: 'AI外呼话术', result: 'passed', riskLevel: 'low', time: '14:15', user: '赵主管' },
    { id: 5, content: '软文广告', result: 'warning', riskLevel: 'medium', time: '14:10', user: '钱经理' },
  ]

  // 话术模板数据
  const scriptTemplates = [
    { id: 1, name: '开场白标准话术', type: 'ai_call', status: 'approved', usage: 156, version: 'v2.1' },
    { id: 2, name: '房源推荐话术', type: 'ai_call', status: 'pending', usage: 89, version: 'v1.5' },
    { id: 3, name: '异议处理话术', type: 'ai_call', status: 'approved', usage: 67, version: 'v1.2' },
    { id: 4, name: '促单话术', type: 'ai_call', status: 'rejected', usage: 45, version: 'v1.0' },
    { id: 5, name: '短信模板', type: 'sms', status: 'approved', usage: 234, version: 'v3.0' },
  ]

  const stats = {
    totalChecks: 1560,
    passedRate: 92.5,
    warningCount: 89,
    failedCount: 28,
  }

  const categories = [
    { id: 'extreme', name: '极限词', color: 'bg-yellow-500' },
    { id: 'financial', name: '金融承诺', color: 'bg-red-500' },
    { id: 'fraud', name: '欺诈词汇', color: 'bg-red-700' },
    { id: 'realestate', name: '房地产违规', color: 'bg-orange-500' },
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
            <Brain className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold">合规管理 Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              配置
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              添加敏感词
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="今日检测" value={stats.totalChecks.toLocaleString()} icon={<Shield className="h-8 w-8 text-blue-600" />} />
          <StatCard title="通过率" value={`${stats.passedRate}%`} icon={<CheckCircle className="h-8 w-8 text-green-600" />} />
          <StatCard title="警告数" value={stats.warningCount.toString()} icon={<AlertTriangle className="h-8 w-8 text-yellow-600" />} />
          <StatCard title="违规数" value={stats.failedCount.toString()} icon={<AlertTriangle className="h-8 w-8 text-red-600" />} />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <TabButton 
            active={activeTab === 'sensitive-words'} 
            onClick={() => setActiveTab('sensitive-words')}
            icon={<Shield className="h-5 w-5" />}
            label="敏感词管理"
          />
          <TabButton 
            active={activeTab === 'compliance-logs'} 
            onClick={() => setActiveTab('compliance-logs')}
            icon={<FileText className="h-5 w-5" />}
            label="合规日志"
          />
          <TabButton 
            active={activeTab === 'script-review'} 
            onClick={() => setActiveTab('script-review')}
            icon={<Eye className="h-5 w-5" />}
            label="话术审核"
          />
        </div>

        {/* Content */}
        {activeTab === 'sensitive-words' && (
          <SensitiveWordsPanel 
            words={sensitiveWords} 
            categories={categories}
          />
        )}

        {activeTab === 'compliance-logs' && (
          <ComplianceLogsPanel logs={complianceLogs} />
        )}

        {activeTab === 'script-review' && (
          <ScriptReviewPanel templates={scriptTemplates} />
        )}
      </main>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        active 
          ? 'bg-red-600 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function SensitiveWordsPanel({ words, categories }: { words: any[]; categories: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>敏感词管理</CardTitle>
            <CardDescription>管理平台敏感词库，拦截违规内容</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Input placeholder="搜索敏感词..." className="w-64" />
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Categories */}
        <div className="flex space-x-4 mb-6">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
              <span className="text-sm text-gray-600">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Words Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">敏感词</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">分类</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">风险等级</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">今日使用</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{word.word}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      word.category === 'extreme' ? 'bg-yellow-100 text-yellow-800' :
                      word.category === 'financial' ? 'bg-red-100 text-red-800' :
                      word.category === 'fraud' ? 'bg-red-200 text-red-900' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {word.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      word.level === 'danger' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {word.level === 'danger' ? '危险' : '警告'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{word.usage} 次</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      启用
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Word Form */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="font-medium mb-4">添加新敏感词</div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>敏感词</Label>
              <Input placeholder="输入敏感词" />
            </div>
            <div>
              <Label>分类</Label>
              <select className="w-full p-2 border rounded-lg">
                <option value="extreme">极限词</option>
                <option value="financial">金融承诺</option>
                <option value="fraud">欺诈词汇</option>
                <option value="realestate">房地产违规</option>
              </select>
            </div>
            <div>
              <Label>风险等级</Label>
              <select className="w-full p-2 border rounded-lg">
                <option value="warning">警告</option>
                <option value="danger">危险</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComplianceLogsPanel({ logs }: { logs: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>合规检测日志</CardTitle>
            <CardDescription>查看内容审核记录和风险提示</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <select className="p-2 border rounded-lg">
              <option value="">全部结果</option>
              <option value="passed">通过</option>
              <option value="warning">警告</option>
              <option value="failed">违规</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{log.content}</div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{log.time}</span>
                  <span className="text-sm text-gray-500">{log.user}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    log.result === 'passed' ? 'bg-green-100 text-green-800' :
                    log.result === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.result === 'passed' ? '通过' : log.result === 'warning' ? '警告' : '违规'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">风险等级:</span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  log.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                  log.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {log.riskLevel === 'low' ? '低' : log.riskLevel === 'medium' ? '中' : '高'}
                </span>
                <Button variant="link" size="sm">
                  查看详情
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ScriptReviewPanel({ templates }: { templates: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>话术模板审核</CardTitle>
            <CardDescription>审核AI外呼话术模板，确保合规</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Input placeholder="搜索模板..." className="w-64" />
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">
                    {template.type === 'ai_call' ? 'AI外呼话术' : '短信模板'} • 版本 {template.version}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">使用 {template.usage} 次</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.status === 'approved' ? 'bg-green-100 text-green-800' :
                    template.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {template.status === 'approved' ? '已通过' : template.status === 'pending' ? '待审核' : '已拒绝'}
                  </span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    查看
                  </Button>
                  <Button size="sm">
                    审核
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                {template.type === 'ai_call' ? (
                  <div>
                    <div className="font-medium mb-2">话术预览</div>
                    "您好，请问是王先生吗？我是房探AI的房产顾问..."
                  </div>
                ) : (
                  <div>
                    <div className="font-medium mb-2">模板预览</div>
                    "【房探AI】限时优惠！精品房源推荐..."
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
