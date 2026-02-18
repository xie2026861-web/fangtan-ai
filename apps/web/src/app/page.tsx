import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Users, 
  Phone, 
  FileText, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">房探AI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600">功能</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600">价格</Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-600">登录</Link>
            <Link href="/register">
              <Button>免费试用</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            让房产营销更智能
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            5大AI Agent协同作战，为房产经纪人提供智能获客、精准触达、内容生成等一站式解决方案
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                免费开始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                了解更多
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">核心AI Agent功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="数据采集Agent"
              description="多源数据采集、交叉核验，联系方式有效率≥95%，精准定位潜在客户"
            />
            <FeatureCard 
              icon={<Phone className="h-8 w-8 text-green-600" />}
              title="智能触达Agent"
              description="AI外呼支持10+轮对话，实时意向评分，智能转人工，提升触达效率5倍"
            />
            <FeatureCard 
              icon={<FileText className="h-8 w-8 text-purple-600" />}
              title="内容生成Agent"
              description="智能文案生成、虚拟软装效果图、多平台一键分发，让内容创作更高效"
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-orange-600" />}
              title="CRM协同Agent"
              description="智能标签体系、客户生命周期追踪、动态激活提醒，让客户管理更轻松"
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-red-600" />}
              title="合规管理Agent"
              description="AI内容标识、敏感词过滤、话术审核、区块链存证，确保合规运营"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">灵活的订阅方案</h2>
          <p className="text-gray-600 text-center mb-12">选择适合你的方案，开启智能营销之旅</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              title="基础版"
              price="999"
              period="月"
              features={[
                '数据采集 1000条/月',
                'AI外呼 5000分钟/月',
                '基础文案生成',
                '客户池管理',
                '基础数据报表',
              ]}
              highlight={false}
            />
            <PricingCard 
              title="企业版"
              price="9800"
              period="月"
              features={[
                '数据采集 1万条/月',
                'AI外呼 5万分钟/月',
                '全部Agent功能',
                '多团队管理',
                '高级数据看板',
                'API访问',
              ]}
              highlight={true}
            />
            <PricingCard 
              title="定制版"
              price="10-100万"
              period="年"
              features={[
                '私有化部署',
                '专属API接口',
                '定制AI模型训练',
                'SLA服务保障',
                '专属客户成功经理',
                '无限客资/外呼',
              ]}
              highlight={false}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6" />
              <span className="font-bold">房探AI</span>
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

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function PricingCard({ title, price, period, features, highlight }: { title: string; price: string; period: string; features: string[]; highlight: boolean }) {
  return (
    <Card className={`relative ${highlight ? 'border-blue-500 border-2 shadow-xl' : ''}`}>
      {highlight && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            热门推荐
          </span>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">¥{price}</span>
          <span className="text-gray-500">/{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Link href={title === '基础版' ? '/register' : '/contact'}>
          <Button className={`w-full mt-6 ${highlight ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
            立即开始
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
