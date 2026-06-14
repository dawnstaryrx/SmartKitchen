import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Hash } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const displayName = user.nickname || user.email
  const avatarFallback = displayName.slice(0, 1).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {user.avatar && <AvatarImage src={user.avatar} alt={displayName} />}
          <AvatarFallback className="text-lg">{avatarFallback}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">昵称</p>
              <p className="text-sm font-medium">{user.nickname || "未设置"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">邮箱</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">用户ID</p>
              <p className="text-sm font-medium">{user.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">身份</p>
              <p className="text-sm font-medium">{user.is_admin ? "管理员" : "普通用户"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}