import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Success message passed from Add Product. Read it once on mount.
  const [message, setMessage] = useState(
    () => location.state?.message || ""
  );

  // Clear the router state so a page refresh does not repeat the message.
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoryList = await productService.getCategories();

        setCategories(categoryList);
      } catch (error) {
        console.error("Could not load categories:", error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const productList = await productService.getAll(
          selectedCategory
        );

        setProducts(productList);
      } catch (error) {
        console.error(error);

        setError(
          "Could not load products. Ensure the API Gateway is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory]);

  async function handleAddToCart(product) {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login before adding products to cart.");
      return;
    }

    try {
      await cartService.addItem(product.id, 1);

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
          <label htmlFor="category">
            Filter by category
          </label>

          <select
            id="category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.name}
              >
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