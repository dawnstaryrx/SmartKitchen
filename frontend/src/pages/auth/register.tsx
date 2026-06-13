import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, KeyRound, Loader2 } from "lucide-react"
import { sendCode, register } from "@/apis/auth"
import SiteHeader from "@/components/site-header"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")

  const validate = () => {
    if (!email) return "请输入邮箱"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "邮箱格式不正确"
    if (!code) return "请输入验证码"
    if (code.length !== 6) return "验证码为6位数字"
    if (!password) return "请输入密码"
    if (password.length < 6) return "密码至少6位"
    if (!confirmPassword) return "请确认密码"
    if (password !== confirmPassword) return "两次密码不一致"
    return ""
  }

  const handleSendCode = async () => {
    if (!email) { setError("请先输入邮箱"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("邮箱格式不正确"); return }
    setError("")
    setSendingCode(true)
    try {
      await sendCode(email)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败")
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    setLoading(true)
    try {
      await register(email, code, password, confirmPassword)
      navigate("/login")
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">注册</CardTitle>
            <CardDescription>创建你的账号，开始智能厨房之旅</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                disabled={sendingCode || countdown > 0}
                onClick={handleSendCode}
              >
                {countdown > 0
                  ? `${countdown}s`
                  : sendingCode
                    ? "发送中..."
                    : "发送验证码"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">验证码</Label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                placeholder="请输入6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="请设置密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Button className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "注册中..." : "注册"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
