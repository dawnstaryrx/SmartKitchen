import { Link, Outlet, useLocation } from "react-router-dom"
import {
  Refrigerator,
  BookOpen,
  AlertTriangle,
  ShoppingCart,
  Globe,
  ChefHat,
  Library,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import SiteHeader from "@/components/site-header"

interface NavItem {
  label: string
  path: string
  icon: typeof Refrigerator
}

interface NavGroup {
  label: string
  pathPrefix: string
  children: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "食材",
    pathPrefix: "/ingredients",
    children: [
      { label: "我的食材", path: "/ingredients/my-ingredients", icon: Refrigerator },
      { label: "食材知识库", path: "/ingredients/knowledge", icon: BookOpen },
      { label: "库存预警", path: "/ingredients/stock-warning", icon: AlertTriangle },
      { label: "采购清单", path: "/ingredients/shopping-list", icon: ShoppingCart },
    ],
  },
  {
    label: "食谱",
    pathPrefix: "/recipes",
    children: [
      { label: "我的食谱", path: "/recipes/my-recipes", icon: ChefHat },
      { label: "公共食谱", path: "/recipes/public", icon: Globe },
    ],
  },
  {
    label: "厨具",
    pathPrefix: "/kitchenware",
    children: [
      { label: "我的厨具", path: "/kitchenware/my-kitchenware", icon: Library },
      { label: "厨具知识库", path: "/kitchenware/knowledge", icon: BookOpen },
    ],
  },
]

function getActiveGroup(groups: NavGroup[], pathname: string): NavGroup | null {
  if (pathname === "/ai-assistant") return null
  return groups.find((g) => pathname.startsWith(g.pathPrefix)) ?? null
}

export default function DashboardLayout() {
  const location = useLocation()
  const activeGroup = getActiveGroup(navGroups, location.pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        {activeGroup && (
          <aside className="hidden md:flex w-48 flex-col border-r bg-sidebar text-sidebar-foreground pt-2 shrink-0">
            <nav className="flex flex-col gap-0.5 px-3">
              {activeGroup.children.map((child) => {
                const ChildIcon = child.icon
                const isChildActive = location.pathname === child.path
                return (
                  <Button
                    key={child.path}
                    variant={isChildActive ? "secondary" : "ghost"}
                    asChild
                    className="justify-start"
                  >
                    <Link to={child.path}>
                      <ChildIcon className="size-4 shrink-0" />
                      <span>{child.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          {activeGroup && (
            <nav className="flex md:hidden gap-1 overflow-x-auto px-4 py-2 border-b">
              {activeGroup.children.map((child) => {
                const ChildIcon = child.icon
                const isChildActive = location.pathname === child.path
                return (
                  <Button
                    key={child.path}
                    variant={isChildActive ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <Link to={child.path}>
                      <ChildIcon className="size-3.5" />
                      <span>{child.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </nav>
          )}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
