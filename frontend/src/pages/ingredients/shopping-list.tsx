import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  RotateCcw,
  PackageOpen,
  Pencil,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

import {
  addShoppingItem,
  deleteShoppingItem,
  getCategoryList,
  getShoppingListPage,
  INGREDIENT_UNIT_OPTIONS,
  updateShoppingItem,
  type IngredientCategory,
  type ShoppingItem,
  type ShoppingItemPayload,
  type ShoppingStatus,
} from "@/apis/ingredient"

const PAGE_SIZE = 10
const ALL_STATUS = "all"

function buildPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total]
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total]
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total]
}

interface FormState {
  name: string
  category_name: string
  quantity: string
  unit: string
  notes: string
}

const EMPTY_FORM: FormState = {
  name: "",
  category_name: "",
  quantity: "",
  unit: "克",
  notes: "",
}

export default function ShoppingListPage() {
  const [categories, setCategories] = useState<IngredientCategory[]>([])
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS)
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategoryList()
      setCategories(data)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "分类加载失败",
      })
    }
  }, [])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getShoppingListPage({
        page,
        page_size: PAGE_SIZE,
        keyword: appliedKeyword || undefined,
        status:
          statusFilter === ALL_STATUS ? undefined : (statusFilter as ShoppingStatus),
      })
      setItems(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "采购清单加载失败",
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, appliedKeyword, statusFilter])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const handleSearch = () => {
    setAppliedKeyword(keyword.trim())
    setPage(1)
  }

  const handleReset = () => {
    setKeyword("")
    setAppliedKeyword("")
    setStatusFilter(ALL_STATUS)
    setPage(1)
  }

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (item: ShoppingItem) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      category_name: item.category_name,
      quantity: String(item.quantity),
      unit: item.unit,
      notes: item.notes,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("保存失败", { description: "请填写商品名称" })
      return
    }
    const quantity = Number(form.quantity)
    if (!form.quantity || Number.isNaN(quantity) || quantity <= 0) {
      toast.error("保存失败", { description: "请填写有效的数量" })
      return
    }

    const payload: ShoppingItemPayload = {
      name: form.name.trim(),
      category_name: form.category_name || "其他",
      quantity,
      unit: form.unit,
      notes: form.notes.trim(),
    }

    setSubmitting(true)
    try {
      if (editingId !== null) {
        await updateShoppingItem(editingId, payload)
        toast.success("采购项已更新")
      } else {
        await addShoppingItem(payload)
        toast.success("采购项已添加")
      }
      setFormOpen(false)
      await loadItems()
    } catch (err) {
      toast.error("保存失败", {
        description: err instanceof Error ? err.message : "操作失败，请重试",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (item: ShoppingItem) => {
    const nextStatus: ShoppingStatus =
      item.status === "pending" ? "purchased" : "pending"
    setTogglingId(item.id)
    try {
      await updateShoppingItem(item.id, { status: nextStatus })
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it))
      )
      toast.success(nextStatus === "purchased" ? "已标记为已购买" : "已标记为待购买")
    } catch (err) {
      toast.error("操作失败", {
        description: err instanceof Error ? err.message : "更新状态失败",
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await deleteShoppingItem(deleteId)
      toast.success("采购项已删除")
      setDeleteId(null)
      if (items.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await loadItems()
      }
    } catch (err) {
      toast.error("操作失败", {
        description: err instanceof Error ? err.message : "删除失败，请重试",
      })
    } finally {
      setDeleting(false)
    }
  }

  const pendingCount = useMemo(
    () => items.filter((it) => it.status === "pending").length,
    [items]
  )

  const pageRange = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <ShoppingCart className="size-6 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            采购清单
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          记录需要采购的食材，勾选已购买项目，让购物更有条理。
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="搜索商品名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="sm:max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUS}>全部状态</SelectItem>
                <SelectItem value="pending">待购买</SelectItem>
                <SelectItem value="purchased">已购买</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>
                <Search className="size-4" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                重置
              </Button>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            添加采购项
          </Button>
        </CardContent>
      </Card>

      {!loading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          当前页共 {items.length} 项，其中 {pendingCount} 项待购买。
        </p>
      )}

      <div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="size-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <PackageOpen className="size-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium">暂无食材数据</p>
                <p className="text-sm text-muted-foreground">
                  点击「添加采购项」开始记录你的购物清单。
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const purchased = item.status === "purchased"
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <Checkbox
                      checked={purchased}
                      disabled={togglingId === item.id}
                      onCheckedChange={() => handleToggleStatus(item)}
                      aria-label="切换购买状态"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            "font-medium " +
                            (purchased ? "text-muted-foreground line-through" : "")
                          }
                        >
                          {item.name}
                        </span>
                        <Badge variant="outline">{item.category_name}</Badge>
                        <Badge variant={purchased ? "secondary" : "default"}>
                          {purchased ? "已购买" : "待购买"}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        <span>
                          数量：{item.quantity} {item.unit}
                        </span>
                        {item.notes && <span className="truncate">备注：{item.notes}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(item)}
                        aria-label="编辑"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteId(item.id)}
                        aria-label="删除"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="flex flex-col items-center gap-3">
          <Pagination className="justify-start sm:justify-center">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="上一页"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(page - 1)
                  }}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {pageRange.map((p, idx) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  text="下一页"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(page + 1)
                  }}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-xs text-muted-foreground">
            共 {total} 条数据，第 {page} / {totalPages} 页
          </p>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? "编辑采购项" : "添加采购项"}
            </DialogTitle>
            <DialogDescription>
              记录需要采购的食材及其数量，方便对照清单购物。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="sl-name">商品名称</Label>
              <Input
                id="sl-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：鸡蛋"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="sl-category">分类</Label>
                <Select
                  value={form.category_name}
                  onValueChange={(v) => setForm({ ...form, category_name: v })}
                >
                  <SelectTrigger id="sl-category" className="w-full">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sl-unit">单位</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm({ ...form, unit: v })}
                >
                  <SelectTrigger id="sl-unit" className="w-full">
                    <SelectValue placeholder="选择单位" />
                  </SelectTrigger>
                  <SelectContent>
                    {INGREDIENT_UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl-quantity">数量</Label>
              <Input
                id="sl-quantity"
                type="number"
                min={0}
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl-notes">备注</Label>
              <Textarea
                id="sl-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="可选，如品牌、规格要求"
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该采购项？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，该采购项将从清单中移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
