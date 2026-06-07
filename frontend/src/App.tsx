import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">
        {/* 标题 */}
        <h1 className="mb-8 text-center text-4xl font-bold text-slate-900">
          SmartKitchen
        </h1>

        {/* 卡片区域 */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>菜谱管理</CardTitle>
              <CardDescription>
                管理和维护菜谱数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                进入模块
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI 菜谱生成</CardTitle>
              <CardDescription>
                基于 AI 自动生成菜谱
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                开始生成
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>设备监控</CardTitle>
              <CardDescription>
                查看厨房设备运行状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                查看详情
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tailwind 测试区域 */}
        <div className="mt-10 rounded-xl border bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            TailwindCSS 测试
          </h2>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
              React
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              TailwindCSS
            </span>

            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
              shadcn/ui
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;