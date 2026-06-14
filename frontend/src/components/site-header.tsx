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
  User,
  LogOut,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

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
  const { user, isLogin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/ai-assistant") return location.pathname === path
    return location.pathname.startsWith("/" + path.split("/")[1])
  }

  const handleNav = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/"
    } catch {
      toast.error("退出失败")
    }
  }

  const displayName = user ? (user.nickname || user.email) : ""

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
          {isLogin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {displayName}
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User />
                  个人中心
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link to="/register">注册</Link>
              </Button>
            </>
          )}
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
            {isLogin ? (
              <>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleNav("/profile")}
                >
                  <User />
                  个人中心
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-destructive"
                  onClick={() => { setMenuOpen(false); setLogoutDialogOpen(true) }}
                >
                  <LogOut />
                  退出登录
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </nav>
        </div>
      )}

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定退出登录吗？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后将需要重新登录才能访问个人功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLogout}>
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}