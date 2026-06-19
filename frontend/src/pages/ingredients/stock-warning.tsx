import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  AlertTriangle,
  CalendarClock,
  PackageX,
  TimerReset,
  RotateCcw,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getStockWarningList,
  STORAGE_LOCATION_LABEL,
  type StockWarning,
  type WarningType,
} from "@/apis/ingredient"

const ALL_TYPE = "all"

const WARNING_TYPE_LABEL: Record<WarningType, string> = {
  low_stock: "库存不足",
  near_expiry: "即将过期",
  expired: "已过期",
}

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_TYPE, label: "全部预警" },
  { value: "low_stock", label: "库存不足" },
  { value: "near_expiry", label: "即将过期" },
  { value: "expired", label: "已过期" },
]

function severityBadge(severity: StockWarning["severity"]) {
  if (severity === "danger") {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="size-3" />
        紧急
      </Badge>
    )
  }
  if (severity === "warning") {
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
        <TimerReset className="size-3" />
        警告
      </Badge>
    )
  }
  return (
    <Badge variant="outline">
      <ShieldCheck className="size-3" />
      提醒
    </Badge>
  )
}

function warningIcon(type: WarningType) {
  if (type === "expired") return <PackageX className="size-5 text-destructive" />
  if (type === "near_expiry") return <CalendarClock className="size-5 text-amber-600" />
  return <AlertTriangle className="size-5 text-muted-foreground" />
}

export default function StockWarningPage() {
  const [warnings, setWarnings] = useState<StockWarning[]>([])
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPE)
  const [loading, setLoading] = useState(true)

  const loadWarnings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getStockWarningList({
        warning_type:
          typeFilter === ALL_TYPE ? undefined : (typeFilter as WarningType),
      })
      setWarnings(data)
    } catch (err) {
      toast.error("加载失败", {
        description: err instanceof Error ? err.message : "预警数据加载失败",
      })
      setWarnings([])
    } finally {
      setLoading(false)
    }
  }, [typeFilter])

  useEffect(() => {
    void loadWarnings()
  }, [loadWarnings])

  const handleReset = () => {
    setTypeFilter(ALL_TYPE)
  }

  const counts = useMemo(() => {
    const base: Record<WarningType, number> = {
      low_stock: 0,
      near_expiry: 0,
      expired: 0,
    }
    for (const w of warnings) {
      base[w.warning_type] += 1
    }
    return base
  }, [warnings])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-6 text-primary" />
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            库存预警
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          实时监控食材库存与保质期，及时处理临期、过期与库存不足的食材。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              库存不足
            </CardTitle>
            <PackageX className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{counts.low_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              即将过期
            </CardTitle>
            <CalendarClock className="size-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{counts.near_expiry}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已过期
            </CardTitle>
            <AlertTriangle className="size-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{counts.expired}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">筛选：</span>
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={typeFilter === opt.value ? "default" : "outline"}
              onClick={() => setTypeFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" />
            重置
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">预警明细</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="space-y-2 px-(--card-spacing) pb-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : warnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ShieldCheck className="size-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-medium">暂无食材数据</p>
                <p className="text-sm text-muted-foreground">
                  当前筛选条件下没有预警，库存状态良好。
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>食材</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>库存</TableHead>
                    <TableHead className="hidden md:table-cell">
                      保存位置
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      保质期至
                    </TableHead>
                    <TableHead>预警类型</TableHead>
                    <TableHead>级别</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warnings.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {warningIcon(w.warning_type)}
                          <span>{w.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{w.category_name}</Badge>
                      </TableCell>
                      <TableCell>
                        {w.quantity} {w.unit}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {STORAGE_LOCATION_LABEL[w.storage_location]}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {w.expiry_date ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {WARNING_TYPE_LABEL[w.warning_type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{severityBadge(w.severity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-(--card-spacing) pt-3">
                <p className="text-xs text-muted-foreground">
                  共 {warnings.length} 条预警
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
