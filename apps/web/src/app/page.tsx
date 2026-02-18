import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Users, 
  Phone, 
  FileText, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 深色背景 */}
      <section className="hero-gradient hero-grid relative min-h-screen overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl" />
        
        {/* 导航 */}
        <nav className="relative z-10 container-app py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">房探AI</span>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white/70 hover:text-white transition">功能</Link>
              <Link href="#pricing" className="text-white/70 hover:text-white transition">方案</Link>
              <Link href="#cases" className="text-white/70 hover:text-white transition">案例</Link>
              <Link href="#pricing" className="text-white/70 hover:text-white transition">定价</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-white/70 hover:text-white transition hidden md:block">登录</Link>
              <Link href="/register">
                <Button className="btn-gradient hidden md:flex">免费试用</Button>
              </Link>
              
              {/* 移动端菜单按钮 */}
              <button className="md:hidden text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
        
        {/* Hero内容 */}
        <div className="relative z-10 container-app py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 左侧文字 */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                让房产营销<br/>
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  更智能
                </span>
              </h1>
              <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto md:mx-0">
                5大AI Agent协同作战，为房产经纪人提供智能获客、精准触达、内容生成等一站式解决方案
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <Button className="btn-gradient w-full sm:w-auto">
                    免费试用
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* 右侧图形 */}
            <div className="hidden md:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl backdrop-blur-xl border border-white/10" />
                <div className="absolute top-8 left-8 right-8 bottom-8 bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl" />
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl" />
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl" />
                    <div className="col-span-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部渐变条 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500" />
      </section>

      {/* Stats Section - 白色背景 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatItem 
              icon={<Users className="h-6 w-6 text-blue-600" />}
              value="1,256"
              label="今日新增客户"
              trend="+23%"
            />
            <StatItem 
              icon={<Phone className="h-6 w-6 text-green-600" />}
              value="356"
              label="今日外呼"
              trend="+15%"
            />
            <StatItem 
              icon={<Shield className="h-6 w-6 text-orange-600" />}
              value="42"
              label="意向客户"
              trend="+8%"
            />
            <StatItem 
              icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
              value="12.5%"
              label="转化率"
              trend="+2.3%"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 bg-gray-50">
        <div className="container-app">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              AI Agent 能力中心
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              5大AI Agent协同工作，覆盖房产营销全流程
            </p>
          </div>
          
          <div className="grid-responsive">
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-blue-600" />}
              title="数据采集 Agent"
              description="多源数据采集、交叉核验，联系方式有效率≥95%"
              color="blue"
              features={['POI数据采集', '平台数据整合', '智能交叉核验']}
            />
            <FeatureCard 
              icon={<Phone className="h-8 w-8 text-green-600" />}
              title="智能触达 Agent"
              description="AI外呼支持10+轮对话，实时意向评分"
              color="green"
              features={['AI智能外呼', '企业微信触达', '短信群发']}
            />
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-purple-600" />}
              title="内容生成 Agent"
              description="智能文案生成、虚拟软装效果图"
              color="purple"
              features={['智能文案', '图片生成', '多平台分发']}
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-orange-600" />}
              title="CRM协同 Agent"
              description="智能标签体系、客户生命周期追踪"
              color="orange"
              features={['智能标签', '生命周期', '数据分析']}
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-red-600" />}
              title="合规管理 Agent"
              description="AI内容标识、敏感词过滤、话术审核"
              color="red"
              features={['内容标识', '敏感词过滤', '话术审核']}
            />
            <QuickStartCard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900">
        <div className="container-app">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">房探AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 房探AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ icon, value, label, trend }: { icon: React.ReactNode; value: string; label: string; trend: string }) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-500 mb-2">{label}</div>
      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
        {trend}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, features }: { icon: React.ReactNode; title: string; description: string; color: string; features: string[] }) {
  const colorClasses = {
    blue: 'from-blue-50 to-purple-50 text-blue-600',
    green: 'from-green-50 to-emerald-50 text-green-600',
    purple: 'from-purple-50 to-pink-50 text-purple-600',
    orange: 'from-orange-50 to-red-50 text-orange-600',
    red: 'from-red-50 to-pink-50 text-red-600',
  };
  
  const hoverClasses = {
    blue: 'hover:shadow-blue-500/10',
    green: 'hover:shadow-green-500/10',
    purple: 'hover:shadow-purple-500/10',
    orange: 'hover:shadow-orange-500/10',
    red: 'hover:shadow-red-500/10',
  };
  
  return (
    <Card className={`feature-card group ${hoverClasses[color as keyof typeof hoverClasses]}`}>
      <CardContent className="p-6 md:p-8">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-5`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-4">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function QuickStartCard() {
  return (
    <Card className="feature-card border-2 border-dashed border-gray-200">
      <CardContent className="p-6 md:p-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-5 mx-auto">
          <ArrowRight className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">快速开始</h3>
        <p className="text-gray-500 text-sm mb-4">选择一个任务快速开始</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 px-3 rounded-lg bg-gray-50 text-gray-600 text-sm hover:bg-blue-50 hover:text-blue-600 transition">
            📞 新建外呼
          </button>
          <button className="py-2 px-3 rounded-lg bg-gray-50 text-gray-600 text-sm hover:bg-blue-50 hover:text-blue-600 transition">
            📊 采集数据
          </button>
          <button className="py-2 px-3 rounded-lg bg-gray-50 text-gray-600 text-sm hover:bg-blue-50 hover:text-blue-600 transition">
            ✍️ 生成文案
          </button>
          <button className="py-2 px-3 rounded-lg bg-gray-50 text-gray-600 text-sm hover:bg-blue-50 hover:text-blue-600 transition">
            📈 数据报表
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
