
import Layout from "./components/layout/Layout";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProductCatalog from "./pages/ProductCatalog";
import CartPage from "./pages/CartPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./auth/ProtectedRoute";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: "60px", margin: 0 }}>404</h1>
      <p style={{ color: "#6b7280", marginTop: "10px" }}>
        We couldn't find that page.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Standalone page: no sidebar/header */}
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              {/* Public: browsing */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductCatalog />} />

              {/* Need a logged-in user */}
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;