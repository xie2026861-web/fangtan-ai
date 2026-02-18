'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Users, Phone, FileText, BarChart3, Shield, ArrowRight, TrendingUp, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">房探AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user.name}</span>
            <Button variant="outline" size="sm">退出</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            欢迎回来，{user.name}!
          </h1>
          <p className="text-gray-600">
            开始使用AI Agent提升你的房产营销效率
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<Users className="h-8 w-8 text-blue-600" />}
            title="今日新增客户"
            value="128"
            trend="+23%"
            trendUp={true}
          />
          <StatCard 
            icon={<Phone className="h-8 w-8 text-green-600" />}
            title="今日外呼"
            value="356"
            trend="+15%"
            trendUp={true}
          />
          <StatCard 
            icon={<Target className="h-8 w-8 text-purple-600" />}
            title="意向客户"
            value="42"
            trend="+8%"
            trendUp={true}
          />
          <StatCard 
            icon={<TrendingUp className="h-8 w-8 text-orange-600" />}
            title="转化率"
            value="12.5%"
            trend="+2.3%"
            trendUp={true}
          />
        </div>

        {/* Agent Cards */}
        <h2 className="text-2xl font-bold mb-4">AI Agent 能力中心</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AgentCard 
            icon={<Users className="h-10 w-10 text-blue-600" />}
            title="数据采集 Agent"
            description="多源数据采集、交叉核验，联系方式有效率≥95%"
            features={['POI数据', '平台数据', '行为数据', '交叉核验']}
            link="/dashboard/data-collection"
          />
          <AgentCard 
            icon={<Phone className="h-10 w-10 text-green-600" />}
            title="智能触达 Agent"
            description="AI外呼支持10+轮对话，实时意向评分，智能转人工"
            features={['AI外呼', '企微触达', '短信群发', '意向评分']}
            link="/dashboard/reach"
          />
          <AgentCard 
            icon={<FileText className="h-10 w-10 text-purple-600" />}
            title="内容生成 Agent"
            description="智能文案生成、虚拟软装效果图、多平台一键分发"
            features={['文案生成', '图片生成', '视频脚本', '多平台分发']}
            link="/dashboard/content"
          />
          <AgentCard 
            icon={<BarChart3 className="h-10 w-10 text-orange-600" />}
            title="CRM协同 Agent"
            description="智能标签体系、客户生命周期管理、动态激活提醒"
            features={['客户标签', '生命周期', '跟进提醒', '数据分析']}
            link="/dashboard/crm"
          />
          <AgentCard 
            icon={<Shield className="h-10 w-10 text-red-600" />}
            title="合规管理 Agent"
            description="AI内容标识、敏感词过滤、话术审核、区块链存证"
            features={['内容标识', '敏感词过滤', '话术审核', '存证追溯']}
            link="/dashboard/compliance"
          />
          <QuickActionCard />
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, title, value, trend, trendUp }: { icon: React.ReactNode; title: string; value: string; trend: string; trendUp: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {icon}
          <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </CardContent>
    </Card>
  )
}

function AgentCard({ icon, title, description, features, link }: { icon: React.ReactNode; title: string; description: string; features: string[]; link: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2" />
              {feature}
            </li>
          ))}
        </ul>
        <Link href={link}>
          <Button className="w-full">
            立即使用
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function QuickActionCard() {
  return (
    <Card className="border-dashed border-2 bg-gray-50">
      <CardHeader>
        <Zap className="h-10 w-10 text-yellow-600 mb-4" />
        <CardTitle className="text-xl">快速开始</CardTitle>
        <CardDescription>
          选择一个任务快速开始，或查看最近操作
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start">
          📞 新建外呼任务
        </Button>
        <Button variant="outline" className="w-full justify-start">
          📊 采集客户数据
        </Button>
        <Button variant="outline" className="w-full justify-start">
          ✍️ 生成营销文案
        </Button>
        <Button variant="outline" className="w-full justify-start">
          📈 查看数据报表
        </Button>
      </CardContent>
    </Card>
  )
}
