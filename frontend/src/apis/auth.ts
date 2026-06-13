import { API_BASE_URL } from "@/config"

export async function sendCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? "发送验证码失败")
  return data as { message: string }
}

export async function register(
  email: string,
  code: string,
  password: string,
  confirm_password: string
) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, password, confirm_password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail ?? "注册失败")
  return data as { message: string; user_id: number; email: string }
}
