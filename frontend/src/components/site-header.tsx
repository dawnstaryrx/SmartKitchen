import { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  ChefHat,
  Refrigerator,
  UtensilsCrossed,
  Bot,
  Menu,
  X,
} from "lucide-react"

interface NavItem {
  label: string
  icon: typeof ChefHat
  path: string
}

const topNavItems: NavItem[] = [
  { label: "食材", icon: Refrigerator, path: "/ingredients/my-ingredients" },
  { label: "食谱", icon: UtensilsCrossed, path: "/recipes/my-recipes" },
  { label: "厨具", icon: ChefHat, path: "/kitchenware/my-kitchenware" },
  { label: "AI助手", icon: Bot, path: "/ai-assistant" },
]

export default function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/ai-assistant") return location.pathname === path
    return location.pathname.startsWith("/" + path.split("/")[1])
  }

  const handleNav = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <ChefHat className="size-5" />
            <span>智能厨房</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {topNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.label}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                >
                  <Icon />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">登录</Link>
          </Button>
          <Button asChild>
            <Link to="/register">注册</Link>
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 top-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-white dark:bg-neutral-950" />
          <nav className="relative flex flex-col gap-1 p-4 pt-16">
            {topNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.label}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => handleNav(item.path)}
                >
                  <Icon />
                  {item.label}
                </Button>
              )
            })}
            <div className="my-2 border-t" />
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() => handleNav("/login")}
            >
              登录
            </Button>
            <Button
              className="justify-start"
              onClick={() => handleNav("/register")}
            >
              注册
            </Button>
          </nav>
        </div>
      )}
    </>
  )
}
