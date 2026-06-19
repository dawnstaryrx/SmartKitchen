import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  BookOpen,
  Search,
  RotateCcw,
  PackageOpen,
  Users,
  Ban,
  Leaf,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Flame,
  Snowflake,
  Database,
  UserRound,
  ShieldCheck,
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  createIngredient,
  deleteIngredient,
  getCategoryList,
  getIngredientDetail,
  getIngredientPage,
  getIngredientStats,
  updateIngredient,
  type Ingredient,
  type IngredientCategory,
  type IngredientCreateRequest,
  type IngredientDetail,
  type IngredientStats,
  type IngredientStoragePayload,
  type IngredientNutritionPayload,
  type IngredientUpdateRequest,
} from "@/apis/ingredient"

const PAGE_SIZE = 12

const STORAGE_METHOD_ENTRIES = [
  { key: "room_temperature_method", label: "常温" },
  { key: "refrigerated_method", label: "冷藏" },
  { key: "frozen_method", label: "冷冻" },
] as const

function getRecommendedStorage(
  item: Pick<
    Ingredient,
    "room_temperature_method" | "refrigerated_method" | "frozen_method"
  >
): string | null {
  for (const entry of STORAGE_METHOD_ENTRIES) {
    const method = item[entry.key]
    if (method && method.includes("推荐") && !method.includes("不推荐")) {
      return entry.label
    }
  }
  return null
}

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

function IngredientImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined
  alt: string
  className?: string
}) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) {
    return (
      <div
        className={
          "flex items-center justify-center bg-muted text-muted-foreground " +
          (className ?? "")
        }
      >
        <Leaf className="size-10 opacity-40" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
    />
  )
}

function toNullIfEmpty(v: string): string | null {
  const trimmed = v.trim()
  return trimmed === "" ? null : trimmed
}

function toNumberOrNull(v: string): number | null {
  if (v.trim() === "") return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

interface FormState {
  category_id: string
  name: string
  alias_name: string
  cover_image: string
  description: string
  edible_value: string
  suitable_people: string
  contraindications: string
  origin_place: string
  season: string
  is_system: boolean
  status: boolean
  calories: string
  protein: string
  fat: string
  carbohydrate: string
  fiber: string
  vitamins: string
  minerals: string
  nutrition_remark: string
  room_temperature_method: string
  refrigerated_method: string
  frozen_method: string
  room_temperature_days: string
  refrigerated_days: string
  frozen_days: string
  spoilage_signs: string
  storage_remark: string
}

const EMPTY_FORM: FormState = {
  category_id: "",
  name: "",
  alias_name: "",
  cover_image: "",
  description: "",
  edible_value: "",
  suitable_people: "",
  contraindications: "",
  origin_place: "",
  season: "",
  is_system: true,
  status: true,
  calories: "",
  protein: "",
  fat: "",
  carbohydrate: "",
  fiber: "",
  vitamins: "",
  minerals: "",
  nutrition_remark: "",
  room_temperature_method: "",
  refrigerated_method: "",
  frozen_method: "",
  room_temperature_days: "",
  refrigerated_days: "",
  frozen_days: "",
  spoilage_signs: "",
  storage_remark: "",
}

function detailToForm(detail: IngredientDetail): FormState {
  return {
    category_id: String(detail.category_id),
    name: detail.name,
    alias_name: detail.alias_name ?? "",
    cover_image: detail.cover_image ?? "",
    description: detail.description ?? "",
    edible_value: detail.edible_value ?? "",
    suitable_people: detail.suitable_people ?? "",
    contraindications: detail.contraindications ?? "",
    origin_place: detail.origin_place ?? "",
    season: detail.season ?? "",
    is_system: detail.is_system,
    status: detail.status,
    calories: detail.nutrition?.calories != null ? String(detail.nutrition.calories) : "",
    protein: detail.nutrition?.protein != null ? String(detail.nutrition.protein) : "",
    fat: detail.nutrition?.fat != null ? String(detail.nutrition.fat) : "",
    carbohydrate: detail.nutrition?.carbohydrate != null ? String(detail.nutrition.carbohydrate) : "",
    fiber: detail.nutrition?.fiber != null ? String(detail.nutrition.fiber) : "",
    vitamins: detail.nutrition?.vitamins ?? "",
    minerals: detail.nutrition?.minerals ?? "",
    nutrition_remark: detail.nutrition?.remark ?? "",
    room_temperature_method: detail.storage?.room_temperature_method ?? "",
    refrigerated_method: detail.storage?.refrigerated_method ?? "",
    frozen_method: detail.storage?.frozen_method ?? "",
    room_temperature_days: detail.storage?.room_temperature_days != null ? String(detail.storage.room_temperature_days) : "",
    refrigerated_days: detail.storage?.refrigerated_days != null ? String(detail.storage.refrigerated_days) : "",
    frozen_days: detail.storage?.frozen_days != null ? String(detail.storage.frozen_days) : "",
    spoilage_signs: detail.storage?.spoilage_signs ?? "",
    storage_remark: detail.storage?.remark ?? "",
  }
}

function buildNutritionPayload(form: FormState): IngredientNutritionPayload {
  return {
    calories: toNumberOrNull(form.calories),
    protein: toNumberOrNull(form.protein),
    fat: toNumberOrNull(form.fat),
    carbohydrate: toNumberOrNull(form.carbohydrate),
    fiber: toNumberOrNull(form.fiber),
    vitamins: toNullIfEmpty(form.vitamins),
    minerals: toNullIfEmpty(form.minerals),
    remark: toNullIfEmpty(form.nutrition_remark),
  }
}

function buildStoragePayload(form: FormState): IngredientStoragePayload {
  return {
    room_temperature_method: toNullIfEmpty(form.room_temperature_method),
    refrigerated_method: toNullIfEmpty(form.refrigerated_method),
    frozen_method: toNullIfEmpty(form.frozen_method),
    room_temperature_days: toNumberOrNull(form.room_temperature_days),
    refrigerated_days: toNumberOrNull(form.refrigerated_days),
    frozen_days: toNumberOrNull(form.frozen_days),
    spoilage_signs: toNullIfEmpty(form.spoilage_signs),
    remark: toNullIfEmpty(form.storage_remark),
  }
}

export default function IngredientKnowledgePage() {
  const { user } = useAuth()
  const isAdmin = user?.is_admin ?? false

  const [categories, setCategories] = useState<IngredientCategory[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    undefined
  )
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<IngredientStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<IngredientDetail | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getIngredientStats()
      setStats(data)
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadIngredients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getIngredientPage({
        page,
        page_size: PAGE_SIZE,
        keyword: appliedKeyword || undefined,
        category_id: selectedCategoryId,
      })
      setIngredients(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "食材列表加载失败",
      })
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }, [page, appliedKeyword, selectedCategoryId])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  useEffect(() => {
    void loadIngredients()
  }, [loadIngredients])

  const handleSearch = () => {
    setAppliedKeyword(keyword.trim())
    setPage(1)
  }

  const handleReset = () => {
    setKeyword("")
    setAppliedKeyword("")
    setSelectedCategoryId(undefined)
    setPage(1)
  }

  const handleCategoryClick = (id: number | undefined) => {
    setSelectedCategoryId(id)
    setPage(1)
  }

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
  }

  const handleViewDetail = async (ingredient: Ingredient) => {
    setDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      const data = await getIngredientDetail(ingredient.id)
      setDetail(data)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "食材详情加载失败",
      })
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, is_system: isAdmin })
    setFormOpen(true)
  }

  const openEdit = async (ingredient: Ingredient) => {
    setEditingId(ingredient.id)
    setFormOpen(true)
    setFormLoading(true)
    setForm(EMPTY_FORM)
    try {
      const data = await getIngredientDetail(ingredient.id)
      setForm(detailToForm(data))
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "食材详情加载失败",
      })
      setFormOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("保存失败", { description: "请填写食材名称" })
      return
    }
    if (!form.category_id) {
      toast.error("保存失败", { description: "请选择分类" })
      return
    }

    setSubmitting(true)
    try {
      if (editingId !== null) {
        const payload: IngredientUpdateRequest = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          alias_name: toNullIfEmpty(form.alias_name),
          cover_image: toNullIfEmpty(form.cover_image),
          description: toNullIfEmpty(form.description),
          edible_value: toNullIfEmpty(form.edible_value),
          suitable_people: toNullIfEmpty(form.suitable_people),
          contraindications: toNullIfEmpty(form.contraindications),
          origin_place: toNullIfEmpty(form.origin_place),
          season: toNullIfEmpty(form.season),
          is_system: isAdmin ? form.is_system : false,
          status: form.status,
          nutrition: buildNutritionPayload(form),
          storage: buildStoragePayload(form),
        }
        await updateIngredient(editingId, payload)
        toast.success("食材已更新")
      } else {
        const payload: IngredientCreateRequest = {
          category_id: Number(form.category_id),
          name: form.name.trim(),
          alias_name: toNullIfEmpty(form.alias_name),
          cover_image: toNullIfEmpty(form.cover_image),
          description: toNullIfEmpty(form.description),
          edible_value: toNullIfEmpty(form.edible_value),
          suitable_people: toNullIfEmpty(form.suitable_people),
          contraindications: toNullIfEmpty(form.contraindications),
          origin_place: toNullIfEmpty(form.origin_place),
          season: toNullIfEmpty(form.season),
          is_system: isAdmin ? form.is_system : false,
          status: form.status,
          nutrition: buildNutritionPayload(form),
          storage: buildStoragePayload(form),
        }
        await createIngredient(payload)
        toast.success("食材已创建")
      }
      setFormOpen(false)
      await Promise.all([loadIngredients(), loadStats()])
    } catch (err) {
      toast.error("保存失败", {
        description: err instanceof Error ? err.message : "操作失败，请重试",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await deleteIngredient(deleteId)
      toast.success("食材已删除")
      setDeleteId(null)
      if (ingredients.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await Promise.all([loadIngredients(), loadStats()])
      }
    } catch (err) {
      toast.error("操作失败", {
        description: err instanceof Error ? err.message : "删除失败，请重试",
      })
    } finally {
      setDeleting(false)
    }
  }

  const pageRange = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  )

  const statsCards = [
    {
      label: "总食材",
      value: stats?.total ?? 0,
      icon: Database,
      tone: "text-primary",
    },
    {
      label: "系统食材",
      value: stats?.system_count ?? 0,
      icon: ShieldCheck,
      tone: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "我的食材",
      value: stats?.mine_count ?? 0,
      icon: UserRound,
      tone: "text-green-600 dark:text-green-400",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="size-6 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            食材知识库
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          管理厨房食材知识，维护营养成分、保存指南、适宜人群与禁忌搭配。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                {statsLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="font-heading text-2xl font-semibold">{s.value}</p>
                )}
              </div>
              <s.icon className={"size-8 " + s.tone} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="搜索食材名称，如：番茄、鸡胸肉"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch()
              }}
              className="sm:max-w-sm"
            />
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
            创建食材
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={selectedCategoryId === undefined ? "default" : "outline"}
          onClick={() => handleCategoryClick(undefined)}
        >
          全部
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            size="sm"
            variant={selectedCategoryId === cat.id ? "default" : "outline"}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-[4/3] w-full rounded-t-xl" />
                <CardHeader>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : ingredients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <PackageOpen className="size-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium">暂无食材</p>
                <p className="text-sm text-muted-foreground">
                  点击「创建食材」添加第一条食材数据。
                </p>
              </div>
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                创建第一条食材
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ingredients.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                <div className="relative overflow-hidden">
                  <IngredientImage
                    src={item.cover_image}
                    alt={item.name}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {item.is_system ? (
                      <Badge className="bg-blue-500/90 text-white hover:bg-blue-500/90">
                        <ShieldCheck className="size-3" />
                        系统
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/90 text-white hover:bg-green-500/90">
                        <UserRound className="size-3" />
                        我的
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate">{item.name}</CardTitle>
                    {item.category_name && (
                      <Badge variant="secondary" className="shrink-0">
                        {item.category_name}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <CardDescription className="line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="size-3.5" />
                    {item.calories != null ? `${item.calories} kcal/100g` : "热量未填"}
                  </span>
                  {(() => {
                    const rec = getRecommendedStorage(item)
                    return (
                      <span className="inline-flex items-center gap-1">
                        <Snowflake className="size-3.5" />
                        {rec ? `推荐${rec}保存` : "保存方式未填"}
                      </span>
                    )
                  })()}
                </CardContent>
                <CardFooter className="gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetail(item)}
                  >
                    <Eye className="size-4" />
                    详情
                  </Button>
                  {item.can_edit !== false && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => openEdit(item)}
                      aria-label="编辑"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                  {item.can_delete !== false && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setDeleteId(item.id)}
                      aria-label="删除"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg">
              {detailLoading ? "加载中..." : detail?.name ?? "食材详情"}
            </DialogTitle>
            <DialogDescription>
              完整的食材营养信息、保存指南与食用建议。
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detail ? (
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <IngredientImage
                  src={detail.cover_image}
                  alt={detail.name}
                  className="aspect-[4/3] w-full rounded-lg object-cover sm:w-44 sm:shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl font-semibold">
                      {detail.name}
                    </h3>
                    {detail.category?.name && (
                      <Badge variant="secondary">{detail.category.name}</Badge>
                    )}
                    {detail.is_system ? (
                      <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/15 dark:text-blue-400">
                        <ShieldCheck className="size-3" />
                        系统
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/15 dark:text-green-400">
                        <UserRound className="size-3" />
                        我的
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {detail.description}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <section className="space-y-3">
                <h4 className="font-heading text-sm font-medium">营养成分</h4>
                {detail.nutrition ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">含量</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>热量</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.calories ?? "—"} 千卡
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>蛋白质</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.protein ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>脂肪</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.fat ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>碳水</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.carbohydrate ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>膳食纤维</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.fiber ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>维生素</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.vitamins ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>矿物质</TableCell>
                        <TableCell className="text-right">
                          {detail.nutrition.minerals ?? "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无营养成分数据</p>
                )}
              </section>

              <Separator className="my-4" />

              <section className="space-y-3">
                <h4 className="font-heading text-sm font-medium">保存指南</h4>
                {detail.storage ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>方式</TableHead>
                        <TableHead>说明</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>常温保存</TableCell>
                        <TableCell>
                          {detail.storage.room_temperature_method ?? "—"}
                          {detail.storage.room_temperature_days != null &&
                            `（${detail.storage.room_temperature_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>冷藏保存</TableCell>
                        <TableCell>
                          {detail.storage.refrigerated_method ?? "—"}
                          {detail.storage.refrigerated_days != null &&
                            `（${detail.storage.refrigerated_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>冷冻保存</TableCell>
                        <TableCell>
                          {detail.storage.frozen_method ?? "—"}
                          {detail.storage.frozen_days != null &&
                            `（${detail.storage.frozen_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>变质判断</TableCell>
                        <TableCell>
                          {detail.storage.spoilage_signs ?? "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无保存指南数据</p>
                )}
              </section>

              <Separator className="my-4" />

              <section className="space-y-2">
                <h4 className="font-heading text-sm font-medium">食用价值</h4>
                <p className="text-sm text-muted-foreground">
                  {detail.edible_value ?? "—"}
                </p>
              </section>

              <Separator className="my-4" />

              <section className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="inline-flex items-center gap-1.5 font-heading text-sm font-medium">
                    <Users className="size-4" />
                    适宜人群
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {detail.suitable_people ?? "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="inline-flex items-center gap-1.5 font-heading text-sm font-medium">
                    <Ban className="size-4" />
                    禁忌搭配
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {detail.contraindications ?? "—"}
                  </p>
                </div>
              </section>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>
              {editingId !== null ? "编辑食材" : "创建食材"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "修改食材基础信息、营养成分与保存指南。"
                : "填写食材信息，名称与分类必填，营养与保存信息可选。"}
            </DialogDescription>
          </DialogHeader>

          {formLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] px-4">
              <div className="space-y-6 py-2">
                <section className="space-y-3">
                  <h4 className="font-heading text-sm font-medium">基础信息</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ing-name">
                        食材名称 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="ing-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="如：番茄"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ing-category">
                        分类 <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.category_id}
                        onValueChange={(v) => setForm({ ...form, category_id: v })}
                      >
                        <SelectTrigger id="ing-category" className="w-full">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ing-alias">别名</Label>
                      <Input
                        id="ing-alias"
                        value={form.alias_name}
                        onChange={(e) =>
                          setForm({ ...form, alias_name: e.target.value })
                        }
                        placeholder="如：西红柿"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ing-cover">图片地址</Label>
                      <Input
                        id="ing-cover"
                        value={form.cover_image}
                        onChange={(e) =>
                          setForm({ ...form, cover_image: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ing-desc">简介</Label>
                    <Textarea
                      id="ing-desc"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="简短介绍"
                      className="min-h-16"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ing-edible">食用价值</Label>
                    <Textarea
                      id="ing-edible"
                      value={form.edible_value}
                      onChange={(e) =>
                        setForm({ ...form, edible_value: e.target.value })
                      }
                      placeholder="营养价值与功效"
                      className="min-h-16"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ing-suitable">适宜人群</Label>
                      <Textarea
                        id="ing-suitable"
                        value={form.suitable_people}
                        onChange={(e) =>
                          setForm({ ...form, suitable_people: e.target.value })
                        }
                        placeholder="适宜人群"
                        className="min-h-16"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ing-taboo">禁忌搭配</Label>
                      <Textarea
                        id="ing-taboo"
                        value={form.contraindications}
                        onChange={(e) =>
                          setForm({ ...form, contraindications: e.target.value })
                        }
                        placeholder="禁忌搭配"
                        className="min-h-16"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="ing-origin">产地</Label>
                      <Input
                        id="ing-origin"
                        value={form.origin_place}
                        onChange={(e) =>
                          setForm({ ...form, origin_place: e.target.value })
                        }
                        placeholder="产地"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ing-season">时令季节</Label>
                      <Input
                        id="ing-season"
                        value={form.season}
                        onChange={(e) =>
                          setForm({ ...form, season: e.target.value })
                        }
                        placeholder="如：夏季"
                      />
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="ing-system">系统食材</Label>
                        <p className="text-xs text-muted-foreground">
                          开启后该食材为系统内置，所有用户可见。
                        </p>
                      </div>
                      <Switch
                        id="ing-system"
                        checked={form.is_system}
                        onCheckedChange={(v) => setForm({ ...form, is_system: v })}
                      />
                    </div>
                  )}
                </section>

                <Separator />

                <section className="space-y-3">
                  <h4 className="font-heading text-sm font-medium">营养信息</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="nut-cal">热量 (kcal/100g)</Label>
                      <Input
                        id="nut-cal"
                        type="number"
                        step="0.01"
                        value={form.calories}
                        onChange={(e) =>
                          setForm({ ...form, calories: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nut-protein">蛋白质 (g)</Label>
                      <Input
                        id="nut-protein"
                        type="number"
                        step="0.01"
                        value={form.protein}
                        onChange={(e) =>
                          setForm({ ...form, protein: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nut-fat">脂肪 (g)</Label>
                      <Input
                        id="nut-fat"
                        type="number"
                        step="0.01"
                        value={form.fat}
                        onChange={(e) => setForm({ ...form, fat: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nut-carb">碳水 (g)</Label>
                      <Input
                        id="nut-carb"
                        type="number"
                        step="0.01"
                        value={form.carbohydrate}
                        onChange={(e) =>
                          setForm({ ...form, carbohydrate: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nut-fiber">膳食纤维 (g)</Label>
                      <Input
                        id="nut-fiber"
                        type="number"
                        step="0.01"
                        value={form.fiber}
                        onChange={(e) =>
                          setForm({ ...form, fiber: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nut-vitamins">维生素</Label>
                      <Input
                        id="nut-vitamins"
                        value={form.vitamins}
                        onChange={(e) =>
                          setForm({ ...form, vitamins: e.target.value })
                        }
                        placeholder="维生素说明"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nut-minerals">矿物质</Label>
                    <Input
                      id="nut-minerals"
                      value={form.minerals}
                      onChange={(e) =>
                        setForm({ ...form, minerals: e.target.value })
                      }
                      placeholder="矿物质说明"
                    />
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h4 className="font-heading text-sm font-medium">保存指南</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="st-room">常温保存</Label>
                      <Input
                        id="st-room"
                        value={form.room_temperature_method}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            room_temperature_method: e.target.value,
                          })
                        }
                        placeholder="常温保存方法"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="st-room-days">常温保存天数</Label>
                      <Input
                        id="st-room-days"
                        type="number"
                        value={form.room_temperature_days}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            room_temperature_days: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="st-ref">冷藏保存</Label>
                      <Input
                        id="st-ref"
                        value={form.refrigerated_method}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            refrigerated_method: e.target.value,
                          })
                        }
                        placeholder="冷藏保存方法"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="st-ref-days">冷藏保存天数</Label>
                      <Input
                        id="st-ref-days"
                        type="number"
                        value={form.refrigerated_days}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            refrigerated_days: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="st-frozen">冷冻保存</Label>
                      <Input
                        id="st-frozen"
                        value={form.frozen_method}
                        onChange={(e) =>
                          setForm({ ...form, frozen_method: e.target.value })
                        }
                        placeholder="冷冻保存方法"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="st-frozen-days">冷冻保存天数</Label>
                      <Input
                        id="st-frozen-days"
                        type="number"
                        value={form.frozen_days}
                        onChange={(e) =>
                          setForm({ ...form, frozen_days: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="st-spoilage">变质判断方法</Label>
                    <Textarea
                      id="st-spoilage"
                      value={form.spoilage_signs}
                      onChange={(e) =>
                        setForm({ ...form, spoilage_signs: e.target.value })
                      }
                      placeholder="变质判断方法"
                      className="min-h-16"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="st-remark">建议保存方式</Label>
                    <Textarea
                      id="st-remark"
                      value={form.storage_remark}
                      onChange={(e) =>
                        setForm({ ...form, storage_remark: e.target.value })
                      }
                      placeholder="建议保存方式"
                      className="min-h-16"
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="p-4">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || formLoading}>
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
            <AlertDialogTitle>确认删除该食材？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，该食材及其营养与保存信息将被移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
