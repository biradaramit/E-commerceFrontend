import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient.get(`/Products/${id}`);

        setProduct(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Product was not found."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function handleAddToCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await apiClient.post("/Cart/items", {
        productId: product.id,
        quantity: Number(quantity)
      });

      setMessage(`${product.name} was added to your cart.`);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not add product to cart."
      );
    }
  }

  if (loading) {
    return <p>Loading product details...</p>;
  }

  if (error) {
    return (
      <section>
        <Link to="/" className="back-link">
          ← Back to Products
        </Link>

        <div className="error-box">{error}</div>
      </section>
    );
  }

  if (!product) {
    return null;
  }

  const isOutOfStock = product.stockQuantity <= 0;

  // Requirement says selector should be 1–10.
  // It must also not exceed the actual available stock.
  const maxQuantity = Math.min(10, product.stockQuantity);

  return (
    <section>
      <Link to="/" className="back-link">
        ← Back to Products
      </Link>

      {message && (
        <div className="message-box">
          {message}
        </div>
      )}

      <div className="product-details">
        <div className="product-details-image-container">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-details-image"
            />
          ) : (
            <div className="product-details-placeholder">
              No Image Available
            </div>
          )}
        </div>

        <div className="product-details-content">
          <p className="product-category">
            {product.categoryName || "Uncategorized"}
          </p>

          <h1>{product.name}</h1>

          <p className="details-price">
            ₹{product.price}
          </p>

          <p className="product-description">
            {product.description || "No description available."}
          </p>

          {isOutOfStock ? (
            <div className="out-of-stock details-stock">
              Out of Stock
            </div>
          ) : (
            <p className="stock-available details-stock">
              In Stock: {product.stockQuantity} item(s)
            </p>
          )}

          {!isOutOfStock && (
            <div className="quantity-section">
              <label htmlFor="quantity">
                Quantity
              </label>

              <select
                id="quantity"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              >
                {Array.from(
                  { length: maxQuantity },
                  (_, index) => index + 1
                ).map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            className="add-cart-button details-add-button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;