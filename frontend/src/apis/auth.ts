import request from "@/lib/request"

export interface UserInfo {
  id: number
  email: string
  nickname: string
  avatar: string | null
  is_admin: boolean
}

export interface LoginResponse {
  token: string
  user_info: UserInfo
}

export async function sendCode(email: string) {
  const res = await request.post("/auth/send-code", { email })
  return res.data as { message: string }
}

export async function register(
  email: string,
  code: string,
  password: string,
  confirm_password: string
) {
  const res = await request.post("/auth/register", {
    email,
    code,
    password,
    confirm_password,
  })
  return res.data as { message: string; user_id: number; email: string }
}

export async function login(email: string, password: string) {
  const res = await request.post<LoginResponse>("/auth/login", {
    email,
    password,
  })
  return res.data
}

export async function logout() {
  const res = await request.post("/auth/logout")
  return res.data
}

export async function getMe() {
  const res = await request.get<UserInfo>("/auth/me")
  return res.data
}