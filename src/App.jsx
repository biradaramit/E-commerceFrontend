import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const fn = () => {
    localStorage.setItem("name","Kamalesh");
    console.log(localStorage.getItem("name"));
  }
  fn();
  return (
    <>
      <Header />

      <main className="container">
        <Routes>
          <Route path="/" element={<ProductsPage />} />

          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />
         
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
  path="/cart"
  element={
    <ProtectedRoute>
      <CartPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/orders/:id"
  element={
    <ProtectedRoute>
      <OrderDetailsPage />
    </ProtectedRoute>
  }
/>
        </Routes>
      </main>
    </>
  );
}

export default App;