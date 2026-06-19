import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Refrigerator,
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  PackageOpen,
  CalendarClock,
  AlertTriangle,
  Eye,
  Leaf,
  Flame,
  Beef,
  Snowflake,
  Check,
  ChevronLeft,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  addMyIngredient,
  deleteMyIngredient,
  getMyIngredientPage,
  INGREDIENT_UNIT_OPTIONS,
  searchIngredients,
  STORAGE_LOCATION_LABEL,
  STORAGE_LOCATION_OPTIONS,
  updateMyIngredient,
  type IngredientOption,
  type IngredientStatus,
  type MyIngredient,
  type MyIngredientPayload,
  type StorageLocation,
} from "@/apis/ingredient"

const PAGE_SIZE = 12
const SEARCH_PAGE_SIZE = 8
const ALL_LOCATIONS = "all"
const STORAGE_METHOD_LABEL: Record<StorageLocation, string> = {
  refrigerated: "冷藏",
  frozen: "冷冻",
  room: "常温",
  cool: "阴凉",
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

function statusBadge(status: IngredientStatus, days: number | null) {
  if (status === "expired") {
    return (
      <Badge className="bg-red-500/15 text-red-600 hover:bg-red-500/20 dark:text-red-400">
        <AlertTriangle className="size-3" />
        已过期
      </Badge>
    )
  }
  if (status === "near_expiry") {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
        <CalendarClock className="size-3" />
        临期 {days ?? 0} 天
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/20 dark:text-green-400">
      <Check className="size-3" />
      新鲜
    </Badge>
  )
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
        <Leaf className="size-8 opacity-40" />
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

interface StockFormState {
  quantity: string
  unit: string
  storage_location: StorageLocation
  purchase_date: string
  expiry_date: string
  notes: string
}

const EMPTY_STOCK_FORM: StockFormState = {
  quantity: "",
  unit: "克",
  storage_location: "refrigerated",
  purchase_date: "",
  expiry_date: "",
  notes: "",
}

export default function MyIngredientsPage() {
  const [items, setItems] = useState<MyIngredient[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [appliedKeyword, setAppliedKeyword] = useState("")
  const [locationFilter, setLocationFilter] = useState<string>(ALL_LOCATIONS)
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null)
  const [selected, setSelected] = useState<IngredientOption | null>(null)
  const [stockForm, setStockForm] = useState<StockFormState>(EMPTY_STOCK_FORM)
  const [submitting, setSubmitting] = useState(false)

  const [searchKeyword, setSearchKeyword] = useState("")
  const [appliedSearchKeyword, setAppliedSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState<IngredientOption[]>([])
  const [searchTotal, setSearchTotal] = useState(0)
  const [searchTotalPages, setSearchTotalPages] = useState(0)
  const [searchPage, setSearchPage] = useState(1)
  const [searching, setSearching] = useState(false)

  const [detailItem, setDetailItem] = useState<MyIngredient | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyIngredientPage({
        page,
        page_size: PAGE_SIZE,
        keyword: appliedKeyword || undefined,
        storage_location:
          locationFilter === ALL_LOCATIONS
            ? undefined
            : (locationFilter as StorageLocation),
      })
      setItems(data.items)
      setTotal(data.total)
      setTotalPages(data.total_pages)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "食材库存加载失败",
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [page, appliedKeyword, locationFilter])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const runSearch = useCallback(
    async (kw: string, p: number) => {
      setSearching(true)
      try {
        const data = await searchIngredients({
          keyword: kw || undefined,
          page: p,
          page_size: SEARCH_PAGE_SIZE,
        })
        setSearchResults(data.items)
        setSearchTotal(data.total)
        setSearchTotalPages(data.total_pages)
      } catch (err) {
        toast.error("加载失败", {
          description: err instanceof Error ? err.message : "食材搜索失败",
        })
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    },
    []
  )

  useEffect(() => {
    if (!formOpen || editingId !== null) return
    void runSearch(appliedSearchKeyword, searchPage)
  }, [formOpen, editingId, appliedSearchKeyword, searchPage, runSearch])

  const handleSearchKeywordChange = (value: string) => {
    setSearchKeyword(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setAppliedSearchKeyword(value.trim())
      setSearchPage(1)
    }, 300)
  }

  const handleListSearch = () => {
    setAppliedKeyword(keyword.trim())
    setPage(1)
  }

  const handleListReset = () => {
    setKeyword("")
    setAppliedKeyword("")
    setLocationFilter(ALL_LOCATIONS)
    setPage(1)
  }

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return
    setPage(next)
  }

  const openCreate = () => {
    setEditingId(null)
    setEditingIngredientId(null)
    setSelected(null)
    setStockForm(EMPTY_STOCK_FORM)
    setSearchKeyword("")
    setAppliedSearchKeyword("")
    setSearchPage(1)
    setFormOpen(true)
  }

  const openEdit = (item: MyIngredient) => {
    setEditingId(item.id)
    setEditingIngredientId(item.ingredient_id)
    setSelected({
      id: item.ingredient_id,
      name: item.name,
      alias_name: item.alias_name,
      cover_image: item.cover_image,
      category_id: 0,
      category_name: item.category_name,
      description: item.description,
    })
    setStockForm({
      quantity: String(item.quantity),
      unit: item.unit,
      storage_location: item.storage_location,
      purchase_date: item.purchase_date ?? "",
      expiry_date: item.expiry_date ?? "",
      notes: item.notes,
    })
    setFormOpen(true)
  }

  const handleSelectIngredient = (option: IngredientOption) => {
    setSelected(option)
  }

  const handleClearSelection = () => {
    setSelected(null)
  }

  const handleSubmit = async () => {
    const targetIngredientId = editingId !== null ? editingIngredientId : selected?.id
    if (targetIngredientId === null || targetIngredientId === undefined) {
      toast.error("保存失败", { description: "请先选择食材" })
      return
    }
    const quantity = Number(stockForm.quantity)
    if (!stockForm.quantity || Number.isNaN(quantity) || quantity <= 0) {
      toast.error("保存失败", { description: "请填写有效的数量" })
      return
    }

    const payload: MyIngredientPayload = {
      ingredient_id: targetIngredientId,
      quantity,
      unit: stockForm.unit,
      storage_location: stockForm.storage_location,
      purchase_date: stockForm.purchase_date || null,
      expiry_date: stockForm.expiry_date || null,
      notes: stockForm.notes.trim(),
    }

    setSubmitting(true)
    try {
      if (editingId !== null) {
        await updateMyIngredient(editingId, payload)
        toast.success("食材已更新")
      } else {
        await addMyIngredient(payload)
        toast.success("食材已添加")
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

  const handleDelete = async () => {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await deleteMyIngredient(deleteId)
      toast.success("食材已删除")
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

  const openDetail = (item: MyIngredient) => {
    setDetailItem(item)
    setDetailOpen(true)
  }

  const pageRange = useMemo(
    () => buildPageRange(page, totalPages),
    [page, totalPages]
  )

  const renderSelectedSummary = () => {
    if (!selected) return null
    return (
      <Card className="bg-muted/40">
        <CardContent className="flex items-start gap-3">
          <IngredientImage
            src={selected.cover_image}
            alt={selected.name}
            className="size-16 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-medium">{selected.name}</span>
              {selected.alias_name && (
                <span className="text-xs text-muted-foreground">
                  ({selected.alias_name})
                </span>
              )}
              {selected.category_name && (
                <Badge variant="secondary">{selected.category_name}</Badge>
              )}
            </div>
            {selected.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {selected.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Snowflake className="size-3.5" />
                保存方式：
                {STORAGE_METHOD_LABEL[stockForm.storage_location]}
              </span>
            </div>
          </div>
          {editingId === null && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClearSelection}
              aria-label="取消选择"
            >
              <X className="size-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderSearchStep = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          1
        </span>
        搜索并选择知识库食材
      </div>
      <Command className="rounded-lg border" shouldFilter={false}>
        <CommandInput
          placeholder="输入食材名称搜索，如：西红柿、鸡胸肉"
          value={searchKeyword}
          onValueChange={handleSearchKeywordChange}
        />
        <CommandList>
          {searching && searchResults.length === 0 ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="size-12 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <CommandEmpty>未找到匹配的食材</CommandEmpty>
          ) : (
            <ScrollArea className="h-[240px]">
              {searchResults.map((opt) => {
                const isActive = selected?.id === opt.id
                return (
                  <CommandItem
                    key={opt.id}
                    value={String(opt.id)}
                    onSelect={() => handleSelectIngredient(opt)}
                    className="gap-3 py-2"
                    aria-selected={isActive}
                  >
                    <IngredientImage
                      src={opt.cover_image}
                      alt={opt.name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{opt.name}</span>
                        {opt.category_name && (
                          <Badge variant="outline" className="shrink-0">
                            {opt.category_name}
                          </Badge>
                        )}
                      </div>
                      {opt.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isActive && <Check className="size-4 shrink-0 text-primary" />}
                  </CommandItem>
                )
              })}
            </ScrollArea>
          )}
        </CommandList>
      </Command>

      {!searching && searchTotal > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            共 {searchTotal} 条，第 {searchPage} / {searchTotalPages} 页
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={searchPage <= 1}
              onClick={() => setSearchPage(searchPage - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={searchPage >= searchTotalPages}
              onClick={() => setSearchPage(searchPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const renderStockForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {editingId !== null ? "1" : "2"}
        </span>
        {editingId !== null ? "修改库存信息" : "填写库存信息"}
      </div>
      {renderSelectedSummary()}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="mi-quantity">数量</Label>
          <Input
            id="mi-quantity"
            type="number"
            min={0}
            step="0.01"
            value={stockForm.quantity}
            onChange={(e) =>
              setStockForm({ ...stockForm, quantity: e.target.value })
            }
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mi-unit">单位</Label>
          <Select
            value={stockForm.unit}
            onValueChange={(v) => setStockForm({ ...stockForm, unit: v })}
          >
            <SelectTrigger id="mi-unit" className="w-full">
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
        <Label htmlFor="mi-location">保存位置</Label>
        <Select
          value={stockForm.storage_location}
          onValueChange={(v) =>
            setStockForm({ ...stockForm, storage_location: v as StorageLocation })
          }
        >
          <SelectTrigger id="mi-location" className="w-full">
            <SelectValue placeholder="选择位置" />
          </SelectTrigger>
          <SelectContent>
            {STORAGE_LOCATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="mi-purchase">购买日期</Label>
          <Input
            id="mi-purchase"
            type="date"
            value={stockForm.purchase_date}
            onChange={(e) =>
              setStockForm({ ...stockForm, purchase_date: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mi-expiry">过期日期</Label>
          <Input
            id="mi-expiry"
            type="date"
            value={stockForm.expiry_date}
            onChange={(e) =>
              setStockForm({ ...stockForm, expiry_date: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mi-notes">备注</Label>
        <Textarea
          id="mi-notes"
          value={stockForm.notes}
          onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
          placeholder="可选，填写补充信息"
          className="min-h-20"
        />
      </div>
    </div>
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Refrigerator className="size-6 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            我的食材
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          库存关联食材知识库，避免重复维护营养与保存信息，跟踪数量、位置与保质期。
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="搜索食材名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleListSearch()
              }}
              className="sm:max-w-xs"
            />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="保存位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS}>全部位置</SelectItem>
                {STORAGE_LOCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleListSearch}>
                <Search className="size-4" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleListReset}>
                <RotateCcw className="size-4" />
                重置
              </Button>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            添加食材
          </Button>
        </CardContent>
      </Card>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-[16/9] w-full rounded-t-xl" />
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-full" />
                </CardFooter>
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
                  点击「添加食材」从知识库选择食材开始记录库存。
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <IngredientImage
                  src={item.cover_image}
                  alt={item.name}
                  className="aspect-[16/9] w-full object-cover"
                />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="truncate">{item.name}</CardTitle>
                    {statusBadge(item.status, item.days_until_expiry)}
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-1.5">
                    {item.category_name && (
                      <Badge variant="outline">{item.category_name}</Badge>
                    )}
                    <Badge variant="outline">
                      {STORAGE_LOCATION_LABEL[item.storage_location]}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">库存数量</span>
                    <span className="font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">剩余天数</span>
                    <span className="font-medium">
                      {item.days_until_expiry !== null
                        ? `${item.days_until_expiry} 天`
                        : "—"}
                    </span>
                  </div>
                  {item.expiry_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">过期日期</span>
                      <span className="font-medium">{item.expiry_date}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDetail(item)}
                    aria-label="查看详情"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteId(item.id)}
                    aria-label="删除"
                  >
                    <Trash2 className="size-4" />
                  </Button>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
          <DialogHeader className="shrink-0 p-4 pb-2">
            <DialogTitle>
              {editingId !== null ? "编辑库存" : "添加食材"}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? "食材不可修改，仅可调整库存数量、保存位置与日期等信息。"
                : "从知识库选择食材后填写库存信息，名称与分类自动关联。"}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
            {editingId === null && !selected ? (
              renderSearchStep()
            ) : (
              <>
                {editingId === null && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSelection}
                      className="text-muted-foreground"
                    >
                      <ChevronLeft className="size-4" />
                      重新选择食材
                    </Button>
                  </div>
                )}
                {renderStockForm()}
              </>
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (editingId === null && !selected)}
            >
              {submitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg">
              {detailItem?.name ?? "食材详情"}
            </DialogTitle>
            <DialogDescription>
              食材的营养成分、保存指南与当前库存信息。
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <IngredientImage
                  src={detailItem.cover_image}
                  alt={detailItem.name}
                  className="aspect-[4/3] w-full rounded-lg object-cover sm:w-44 sm:shrink-0"
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-xl font-semibold">
                      {detailItem.name}
                    </h3>
                    {detailItem.category_name && (
                      <Badge variant="secondary">
                        {detailItem.category_name}
                      </Badge>
                    )}
                    {statusBadge(detailItem.status, detailItem.days_until_expiry)}
                  </div>
                  {detailItem.description && (
                    <p className="text-sm text-muted-foreground">
                      {detailItem.description}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <section className="space-y-3">
                <h4 className="inline-flex items-center gap-1.5 font-heading text-sm font-medium">
                  <Beef className="size-4" />
                  营养成分
                </h4>
                {detailItem.nutrition ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">含量/100g</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Flame className="mr-1.5 inline size-3.5" />
                          热量
                        </TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.calories ?? "—"} 千卡
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>蛋白质</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.protein ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>脂肪</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.fat ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>碳水</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.carbohydrate ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>膳食纤维</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.fiber ?? "—"} g
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>维生素</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.vitamins ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>矿物质</TableCell>
                        <TableCell className="text-right">
                          {detailItem.nutrition.minerals ?? "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无营养数据</p>
                )}
              </section>

              <Separator className="my-4" />

              <section className="space-y-3">
                <h4 className="inline-flex items-center gap-1.5 font-heading text-sm font-medium">
                  <Snowflake className="size-4" />
                  保存指南
                </h4>
                {detailItem.storage ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>方式</TableHead>
                        <TableHead>建议</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>常温</TableCell>
                        <TableCell>
                          {detailItem.storage.room_temperature_method ??
                            "—"}
                          {detailItem.storage.room_temperature_days !== null &&
                            `（约 ${detailItem.storage.room_temperature_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>冷藏</TableCell>
                        <TableCell>
                          {detailItem.storage.refrigerated_method ?? "—"}
                          {detailItem.storage.refrigerated_days !== null &&
                            `（约 ${detailItem.storage.refrigerated_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>冷冻</TableCell>
                        <TableCell>
                          {detailItem.storage.frozen_method ?? "—"}
                          {detailItem.storage.frozen_days !== null &&
                            `（约 ${detailItem.storage.frozen_days} 天）`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>变质判断</TableCell>
                        <TableCell>
                          {detailItem.storage.spoilage_signs ?? "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无保存指南</p>
                )}
              </section>

              <Separator className="my-4" />

              <section className="space-y-3">
                <h4 className="inline-flex items-center gap-1.5 font-heading text-sm font-medium">
                  <Refrigerator className="size-4" />
                  库存信息
                </h4>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground">数量</TableCell>
                      <TableCell className="text-right">
                        {detailItem.quantity} {detailItem.unit}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        保存位置
                      </TableCell>
                      <TableCell className="text-right">
                        {STORAGE_LOCATION_LABEL[detailItem.storage_location]}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        购买日期
                      </TableCell>
                      <TableCell className="text-right">
                        {detailItem.purchase_date ?? "—"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        过期日期
                      </TableCell>
                      <TableCell className="text-right">
                        {detailItem.expiry_date ?? "—"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">
                        剩余天数
                      </TableCell>
                      <TableCell className="text-right">
                        {detailItem.days_until_expiry !== null
                          ? `${detailItem.days_until_expiry} 天`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </section>

              {detailItem.notes && (
                <>
                  <Separator className="my-4" />
                  <section className="space-y-2">
                    <h4 className="font-heading text-sm font-medium">备注</h4>
                    <p className="text-sm text-muted-foreground">
                      {detailItem.notes}
                    </p>
                  </section>
                </>
              )}
            </div>
          )}
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
            <AlertDialogTitle>确认删除该食材库存？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，该库存记录将从你的食材中移除。
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
