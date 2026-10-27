import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import ProductCard from "../components/ProductCard";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiClient.get("/Categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Could not load categories:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts(category) {
      try {
        setLoading(true);
        setError("");

        const url = category
          ? `/Products?category=${encodeURIComponent(category)}`
          : "/Products";

        const response = await apiClient.get(url);

        setProducts(response.data);
      } catch (error) {
        console.error(error);
        setError(
          "Could not load products. Ensure the .NET API is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts(selectedCategory);
  }, [selectedCategory]);

  async function handleAddToCart(product) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login before adding products to cart.");
      return;
    }

    try {
      await apiClient.post("/Cart/items", {
        productId: product.id,
        quantity: 1
      });

      setMessage(`${product.name} was added to your cart.`);
    } catch (error) {
      console.error(error);

      const apiMessage =
        error.response?.data?.message ||
        "Could not add product to cart.";

      setMessage(apiMessage);
    }
  }

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">
            Browse our available products.
          </p>
        </div>

        <div className="filter-box">
          <label htmlFor="category">Filter by category</label>

          <select
            id="category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="message-box">
          {message}
        </div>
      )}

      {loading && <p>Loading products...</p>}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p>No products found in this category.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;