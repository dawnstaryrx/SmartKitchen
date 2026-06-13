import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Refrigerator, UtensilsCrossed, Bell } from "lucide-react"
import SiteHeader from "@/components/site-header"

const features = [
  {
    icon: Refrigerator,
    title: "智能食材管理",
    description: "实时监控冰箱库存，自动记录食材种类和数量",
  },
  {
    icon: UtensilsCrossed,
    title: "食谱推荐",
    description: "根据现有食材智能推荐可制作的菜品",
  },
  {
    icon: Bell,
    title: "过期提醒",
    description: "食材临期自动提醒，减少食物浪费",
  },
  {
    icon: ChefHat,
    title: "智能烹饪",
    description: "一键联动智能厨具，轻松完成烹饪",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center bg-gradient-to-b from-primary/5 to-background">
        <ChefHat className="size-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          智能厨房管理系统
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          让 AI 帮你管理食材、推荐食谱、控制厨具，享受智能化的烹饪体验
        </p>
        <div className="flex gap-4">
          <Button size="lg">立即开始</Button>
          <Button size="lg" variant="outline">
            了解更多
          </Button>
        </div>
      </section>

      <section className="px-4 py-16 max-w-6xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-center mb-12">
          核心功能
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <Icon className="size-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
