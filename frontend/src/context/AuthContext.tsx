import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { UserInfo } from "@/apis/auth"
import { login as apiLogin, logout as apiLogout, getMe } from "@/apis/auth"

interface AuthContextType {
  token: string | null
  user: UserInfo | null
  isLogin: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
  const [user, setUser] = useState<UserInfo | null>(() => {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserInfo
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const isLogin = !!token && !!user

  useEffect(() => {
    if (token) {
      getMe()
        .then((u) => {
          setUser(u)
          localStorage.setItem("user", JSON.stringify(u))
        })
        .catch(() => {
          setToken(null)
          setUser(null)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password)
    setToken(data.token)
    setUser(data.user_info)
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user_info))
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore logout API errors, still clear local state
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await getMe()
    setUser(u)
    localStorage.setItem("user", JSON.stringify(u))
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isLogin, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}