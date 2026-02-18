'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, FileText, ArrowLeft, Download, Copy, Eye, Image, Video, Share2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContentGenerationPage() {
  const [selectedType, setSelectedType] = useState('property_description')
  
  const contentTypes = [
    { id: 'property_description', name: '房源描述', icon: '🏠', count: 156 },
    { id: 'promotion', name: '推广文案', icon: '📢', count: 89 },
    { id: 'soft_article', name: '软文', icon: '📝', count: 45 },
    { id: 'social_post', name: '朋友圈', icon: '📱', count: 234 },
    { id: 'video_script', name: '短视频脚本', icon: '🎬', count: 67 },
    { id: 'poster', name: '海报', icon: '🖼️', count: 123 },
  ]

  const recentContents = [
    { id: 1, type: '房源描述', title: '陆家嘴优质房源推荐', platform: '贝壳', status: 'published', time: '14:30' },
    { id: 2, type: '推广文案', title: '限时优惠笋盘', platform: '抖音', status: 'draft', time: '14:25' },
    { id: 3, type: '朋友圈', title: '新上好房推荐', platform: '微信', status: 'published', time: '14:20' },
    { id: 4, type: '短视频脚本', title: '房源讲解脚本', platform: '小红书', status: 'pending', time: '14:15' },
  ]

  const stats = {
    todayGenerated: 45,
    totalTemplates: 23,
    platformPosts: 156,
    avgRating: 4.8,
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
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold">内容生成 Agent</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              模板库
            </Button>
            <Button size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              AI生成
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard title="今日生成" value={stats.todayGenerated.toString()} icon={<FileText className="h-8 w-8 text-purple-600" />} />
          <StatCard title="模板数量" value={stats.totalTemplates.toString()} icon={<Copy className="h-8 w-8 text-blue-600" />} />
          <StatCard title="平台分发" value={stats.platformPosts.toString()} icon={<Share2 className="h-8 w-8 text-green-600" />} />
          <StatCard title="平均评分" value={stats.avgRating.toString()} icon={<Sparkles className="h-8 w-8 text-orange-600" />} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - Content Types */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>内容类型</CardTitle>
                <CardDescription>选择要生成的内容类型</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {contentTypes.map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedType === type.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-500">{type.count} 篇</div>
                    </div>
                  ))}
                </div>

                {/* Content Generator */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium mb-4">快速生成</div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>房源标题</Label>
                      <Input placeholder="陆家嘴稀缺好房" />
                    </div>
                    <div>
                      <Label>价格</Label>
                      <Input placeholder="850万" />
                    </div>
                    <div>
                      <Label>区域</Label>
                      <Input placeholder="上海浦东" />
                    </div>
                    <div>
                      <Label>面积</Label>
                      <Input placeholder="120平米" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <Label>房源亮点</Label>
                    <Input placeholder="采光好,户型方正,交通便利" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>多平台分发</span>
                    </Label>
                    <Label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span>生成配套图片</span>
                    </Label>
                  </div>
                  <Button className="mt-4">
                    <Sparkles className="h-4 w-4 mr-2" />
                    一键生成
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Contents */}
            <Card>
              <CardHeader>
                <CardTitle>最近生成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentContents.map((content) => (
                    <div key={content.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{content.title}</div>
                          <div className="text-sm text-gray-500">
                            {content.type} • {content.platform} • {content.time}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {content.status === 'published' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">已发布</span>
                          )}
                          {content.status === 'draft' && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">草稿</span>
                          )}
                          {content.status === 'pending' && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">待审核</span>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Templates & Tips */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>推荐模板</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TemplateItem name="专业房源描述" type="房源描述" usage={156} />
                <TemplateItem name="限时优惠推广" type="推广文案" usage={89} />
                <TemplateItem name="朋友圈文案" type="朋友圈" usage={234} />
                <TemplateItem name="短视频脚本" type="视频脚本" usage={67} />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI写作技巧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-800 mb-1">💡 提供具体数据</div>
                    <p className="text-purple-700">包含价格、面积、房型等具体信息，AI生成的内容更准确</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">🎯 明确目标人群</div>
                    <p className="text-blue-700">说明目标客户特征，如"刚需首置"、"改善换房"</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800 mb-1">✨ 突出独特卖点</div>
                    <p className="text-green-700">强调房源的独特优势，如"稀缺户型"、"优质学区"</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>支持的平台</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['贝壳', '链家', '抖音', '小红书', '微信', '微博', '今日头条'].map((platform) => (
                    <span key={platform} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {platform}
                    </span>
                  ))}
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

function TemplateItem({ name, type, usage }: { name: string; type: string; usage: number }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div>
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-gray-500">{type}</div>
      </div>
      <div className="text-xs text-gray-400">使用 {usage} 次</div>
    </div>
  )
}
