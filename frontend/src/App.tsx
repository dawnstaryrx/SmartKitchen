import { Route, Routes } from "react-router-dom";
import HomePage from "@/pages/home"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import DashboardLayout from "@/layouts/dashboard-layout"
import MyIngredientsPage from "@/pages/ingredients/my-ingredients"
import IngredientKnowledgePage from "@/pages/ingredients/knowledge"
import StockWarningPage from "@/pages/ingredients/stock-warning"
import ShoppingListPage from "@/pages/ingredients/shopping-list"
import MyRecipesPage from "@/pages/recipes/my-recipes"
import PublicRecipesPage from "@/pages/recipes/public-recipes"
import MyKitchenwarePage from "@/pages/kitchenware/my-kitchenware"
import KitchenwareKnowledgePage from "@/pages/kitchenware/knowledge"
import AiAssistantPage from "@/pages/ai-assistant"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/ingredients/my-ingredients" element={<MyIngredientsPage />} />
        <Route path="/ingredients/knowledge" element={<IngredientKnowledgePage />} />
        <Route path="/ingredients/stock-warning" element={<StockWarningPage />} />
        <Route path="/ingredients/shopping-list" element={<ShoppingListPage />} />
        <Route path="/recipes/my-recipes" element={<MyRecipesPage />} />
        <Route path="/recipes/public" element={<PublicRecipesPage />} />
        <Route path="/kitchenware/my-kitchenware" element={<MyKitchenwarePage />} />
        <Route path="/kitchenware/knowledge" element={<KitchenwareKnowledgePage />} />
        <Route path="/ai-assistant" element={<AiAssistantPage />} />
      </Route>
    </Routes>
  )
}

export default App

