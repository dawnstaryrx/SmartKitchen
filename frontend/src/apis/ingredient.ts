import request from "@/lib/request"

export interface IngredientCategory {
  id: number
  name: string
}

export interface IngredientNutrition {
  id: number
  ingredient_id: number
  calories: number | null
  protein: number | null
  fat: number | null
  carbohydrate: number | null
  fiber: number | null
  vitamins: string | null
  minerals: string | null
  remark: string | null
  created_at: string
  updated_at: string
}

export interface IngredientStorage {
  id: number
  ingredient_id: number
  room_temperature_days: number | null
  refrigerated_days: number | null
  frozen_days: number | null
  room_temperature_method: string | null
  refrigerated_method: string | null
  frozen_method: string | null
  spoilage_signs: string | null
  remark: string | null
  created_at: string
  updated_at: string
}

export interface IngredientCategoryInfo {
  id: number
  name: string
  code: string
  sort: number
  status: boolean
  remark: string | null
}

export interface Ingredient {
  id: number
  name: string
  category_id: number
  category_name: string | null
  alias_name: string | null
  cover_image: string | null
  description: string | null
  is_system: boolean
  status: boolean
  created_at: string
  calories: number | null
  room_temperature_method: string | null
  refrigerated_method: string | null
  frozen_method: string | null
  can_edit?: boolean
  can_delete?: boolean
}

export interface IngredientDetail {
  id: number
  category_id: number
  name: string
  alias_name: string | null
  cover_image: string | null
  description: string | null
  edible_value: string | null
  suitable_people: string | null
  contraindications: string | null
  origin_place: string | null
  season: string | null
  is_system: boolean
  created_by: number | null
  status: boolean
  created_at: string
  updated_at: string
  category: IngredientCategoryInfo | null
  nutrition: IngredientNutrition | null
  storage: IngredientStorage | null
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface IngredientPageQuery {
  page: number
  page_size: number
  keyword?: string
  category_id?: number
  is_system?: boolean
}

export async function getCategoryList(): Promise<IngredientCategory[]> {
  // 后端 /ingredient/categories 是分页接口，返回 { data: { items: [...], total, ... } }
  // 需取 res.data.data.items 才是数组，否则 .map 报错
  const res = await request.get<ApiResponse<PageResult<IngredientCategory>>>("/ingredient/categories")
  return res.data.data.items
}

export async function getIngredientPage(
  params: IngredientPageQuery
): Promise<PageResult<Ingredient>> {
  const res = await request.get<ApiResponse<PageResult<Ingredient>>>("/ingredient", { params })
  return res.data.data
}

export async function getIngredientDetail(
  id: number
): Promise<IngredientDetail> {
  const res = await request.get<ApiResponse<IngredientDetail>>(`/ingredient/${id}`)
  return res.data.data
}

export interface IngredientNutritionPayload {
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbohydrate?: number | null
  fiber?: number | null
  vitamins?: string | null
  minerals?: string | null
  remark?: string | null
}

export interface IngredientStoragePayload {
  room_temperature_days?: number | null
  refrigerated_days?: number | null
  frozen_days?: number | null
  room_temperature_method?: string | null
  refrigerated_method?: string | null
  frozen_method?: string | null
  spoilage_signs?: string | null
  remark?: string | null
}

export interface IngredientCreateRequest {
  category_id: number
  name: string
  alias_name?: string | null
  cover_image?: string | null
  description?: string | null
  edible_value?: string | null
  suitable_people?: string | null
  contraindications?: string | null
  origin_place?: string | null
  season?: string | null
  is_system: boolean
  status?: boolean
  nutrition?: IngredientNutritionPayload
  storage?: IngredientStoragePayload
}

export interface IngredientUpdateRequest {
  category_id?: number
  name?: string
  alias_name?: string | null
  cover_image?: string | null
  description?: string | null
  edible_value?: string | null
  suitable_people?: string | null
  contraindications?: string | null
  origin_place?: string | null
  season?: string | null
  is_system?: boolean
  status?: boolean
  nutrition?: IngredientNutritionPayload
  storage?: IngredientStoragePayload
}

export async function createIngredient(
  req: IngredientCreateRequest
): Promise<IngredientDetail> {
  const { nutrition, storage, ...basic } = req
  const res = await request.post<ApiResponse<IngredientDetail>>(
    "/ingredient",
    basic
  )
  const ingredient = res.data.data

  if (nutrition) {
    await request.post("/ingredient/nutrition", {
      ingredient_id: ingredient.id,
      ...nutrition,
    })
  }
  if (storage) {
    await request.post("/ingredient/storage", {
      ingredient_id: ingredient.id,
      ...storage,
    })
  }

  return getIngredientDetail(ingredient.id)
}

export async function updateIngredient(
  id: number,
  req: IngredientUpdateRequest
): Promise<IngredientDetail> {
  const { nutrition, storage, ...basic } = req

  const basicPayload: Record<string, unknown> = { ...basic }
  if (Object.keys(basicPayload).length > 0) {
    await request.put(`/ingredient/${id}`, basicPayload)
  }

  const current = await getIngredientDetail(id)

  if (nutrition) {
    if (current.nutrition) {
      await request.put(
        `/ingredient/nutrition/${current.nutrition.id}`,
        nutrition
      )
    } else {
      await request.post("/ingredient/nutrition", {
        ingredient_id: id,
        ...nutrition,
      })
    }
  }

  if (storage) {
    if (current.storage) {
      await request.put(`/ingredient/storage/${current.storage.id}`, storage)
    } else {
      await request.post("/ingredient/storage", {
        ingredient_id: id,
        ...storage,
      })
    }
  }

  return getIngredientDetail(id)
}

export async function deleteIngredient(id: number): Promise<void> {
  await request.delete(`/ingredient/${id}`)
}

export interface IngredientStats {
  total: number
  system_count: number
  mine_count: number
}

export async function getIngredientStats(): Promise<IngredientStats> {
  const [all, system, mine] = await Promise.all([
    getIngredientPage({ page: 1, page_size: 1 }),
    getIngredientPage({ page: 1, page_size: 1, is_system: true }),
    getIngredientPage({ page: 1, page_size: 1, is_system: false }),
  ])
  return {
    total: all.total,
    system_count: system.total,
    mine_count: mine.total,
  }
}

export type StorageLocation = "refrigerated" | "frozen" | "room" | "cool"
export type IngredientStatus = "fresh" | "near_expiry" | "expired"

export interface IngredientOption {
  id: number
  name: string
  alias_name: string | null
  cover_image: string | null
  category_id: number
  category_name: string | null
  description: string | null
}

export type IngredientSearchResult = PageResult<IngredientOption>

export interface IngredientSearchQuery {
  keyword?: string
  page: number
  page_size: number
}

export async function searchIngredients(
  params: IngredientSearchQuery
): Promise<IngredientSearchResult> {
  return getIngredientPage(params)
}

export interface MyIngredient {
  id: number
  ingredient_id: number
  name: string
  alias_name: string | null
  cover_image: string | null
  category_name: string
  description: string | null
  quantity: number
  unit: string
  storage_location: StorageLocation
  expiry_date: string | null
  purchase_date: string | null
  notes: string
  status: IngredientStatus
  days_until_expiry: number | null
  nutrition: IngredientNutrition | null
  storage: IngredientStorage | null
}

export interface MyIngredientPayload {
  ingredient_id: number
  quantity: number
  unit: string
  storage_location: StorageLocation
  purchase_date: string | null
  expiry_date: string | null
  notes: string
}

export type MyIngredientResponse = MyIngredient

export interface MyIngredientPageQuery {
  page: number
  page_size: number
  keyword?: string
  storage_location?: StorageLocation
}

export async function getMyIngredientPage(
  params: MyIngredientPageQuery
): Promise<PageResult<MyIngredient>> {
  const res = await request.get<PageResult<MyIngredient>>("/my-ingredients", { params })
  return res.data
}

export async function addMyIngredient(
  payload: MyIngredientPayload
): Promise<MyIngredient> {
  const res = await request.post<MyIngredient>("/my-ingredients", payload)
  return res.data
}

export async function updateMyIngredient(
  id: number,
  payload: MyIngredientPayload
): Promise<MyIngredient> {
  const res = await request.put<MyIngredient>(`/my-ingredients/${id}`, payload)
  return res.data
}

export async function deleteMyIngredient(id: number): Promise<void> {
  await request.delete(`/my-ingredients/${id}`)
}

export type ShoppingStatus = "pending" | "purchased"

export interface ShoppingItem {
  id: number
  name: string
  category_name: string
  quantity: number
  unit: string
  status: ShoppingStatus
  notes: string
  created_at: string
}

export interface ShoppingItemPayload {
  name: string
  category_name: string
  quantity: number
  unit: string
  notes: string
}

export interface ShoppingListPageQuery {
  page: number
  page_size: number
  keyword?: string
  status?: ShoppingStatus
}

export async function getShoppingListPage(
  params: ShoppingListPageQuery
): Promise<PageResult<ShoppingItem>> {
  const res = await request.get<PageResult<ShoppingItem>>("/shopping-list", { params })
  return res.data
}

export async function addShoppingItem(
  payload: ShoppingItemPayload
): Promise<ShoppingItem> {
  const res = await request.post<ShoppingItem>("/shopping-list", payload)
  return res.data
}

export async function updateShoppingItem(
  id: number,
  payload: Partial<ShoppingItemPayload> & { status?: ShoppingStatus }
): Promise<ShoppingItem> {
  const res = await request.put<ShoppingItem>(`/shopping-list/${id}`, payload)
  return res.data
}

export async function deleteShoppingItem(id: number): Promise<void> {
  await request.delete(`/shopping-list/${id}`)
}

export type WarningType = "low_stock" | "near_expiry" | "expired"
export type WarningSeverity = "info" | "warning" | "danger"

export interface StockWarning {
  id: number
  my_ingredient_id: number
  name: string
  category_name: string
  quantity: number
  unit: string
  storage_location: StorageLocation
  expiry_date: string | null
  days_until_expiry: number | null
  warning_type: WarningType
  severity: WarningSeverity
  message: string
}

export interface StockWarningQuery {
  warning_type?: WarningType
}

export async function getStockWarningList(
  params: StockWarningQuery
): Promise<StockWarning[]> {
  const res = await request.get<ApiResponse<StockWarning[]>>("/ingredient/stock-warnings", { params })
  return res.data.data
}

export const INGREDIENT_UNIT_OPTIONS = [
  "克",
  "千克",
  "毫升",
  "升",
  "个",
  "根",
  "颗",
  "包",
  "袋",
  "瓶",
  "块",
  "把",
] as const

export const STORAGE_LOCATION_OPTIONS: {
  value: StorageLocation
  label: string
}[] = [
  { value: "refrigerated", label: "冰箱冷藏" },
  { value: "frozen", label: "冰箱冷冻" },
  { value: "room", label: "常温" },
  { value: "cool", label: "阴凉处" },
]

export const STORAGE_LOCATION_LABEL: Record<StorageLocation, string> = {
  refrigerated: "冰箱冷藏",
  frozen: "冰箱冷冻",
  room: "常温",
  cool: "阴凉处",
}
