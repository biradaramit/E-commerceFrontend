import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);

      const response = await apiClient.get("/Cart");

      setCart(response.data);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not load cart."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(item, newQuantity) {
    if (newQuantity <= 0) {
      await removeItem(item.id);
      return;
    }

    if (newQuantity > item.availableStockQuantity) {
      setMessage(
        `Only ${item.availableStockQuantity} item(s) are available.`
      );
      return;
    }

    try {
      setMessage("");

      const response = await apiClient.put(
        `/Cart/items/${item.id}`,
        {
          quantity: newQuantity
        }
      );

      setCart(response.data);
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not update cart quantity."
      );
    }
  }

  async function removeItem(cartItemId) {
    try {
      setMessage("");

      await apiClient.delete(`/Cart/items/${cartItemId}`);

      await loadCart();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Could not remove item from cart."
      );
    }
  }

  if (loading) {
    return <p>Loading your cart...</p>;
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>Shopping Cart</h1>
          <p className="page-subtitle">
            Review your products before checkout.
          </p>
        </div>

        <Link to="/" className="back-link">
          ← Continue Shopping
        </Link>
      </div>

      {message && (
        <div className="error-box">
          {message}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add products from the catalog to continue.</p>

          <Link to="/" className="primary-button">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                ) : (
                  <div className="cart-item-image-placeholder">
                    No Image
                  </div>
                )}

                <div className="cart-item-details">
                  <h3>{item.productName}</h3>

                  <p className="cart-item-price">
                    ₹{item.unitPrice}
                  </p>

                  <p className="cart-item-stock">
                    Available stock: {item.availableStockQuantity}
                  </p>
                </div>

                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item, item.quantity - 1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <strong>₹{item.totalPrice}</strong>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>
              <span>{items.length}</span>
            </div>

            <div className="summary-total">
              <span>Total Amount</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <button
              type="button"
              className="primary-button checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CartPage;