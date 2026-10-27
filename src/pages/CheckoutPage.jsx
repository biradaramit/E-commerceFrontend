import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

function CheckoutPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    phoneNumber: ""
  });

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/Cart");
      setCart(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Could not load your cart."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.shippingAddress.trim()) {
      setError("Shipping address is required.");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      // Current backend creates the order from CartItems.
      // No body is needed for POST /api/Orders.
      const response = await apiClient.post("/Orders");

      const createdOrder = response.data;

      // Store success information temporarily for Orders page.
      sessionStorage.setItem(
        "orderSuccessMessage",
        `Order placed successfully. Your Order ID is ${createdOrder.id}.`
      );

      navigate("/orders");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Could not place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return <p>Loading checkout...</p>;
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  if (items.length === 0) {
    return (
      <section className="empty-cart">
        <h1>Your cart is empty</h1>
        <p>Add products before proceeding to checkout.</p>

        <Link to="/" className="primary-button">
          Browse Products
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>Checkout</h1>
          <p className="page-subtitle">
            Enter your delivery details and review your order.
          </p>
        </div>

        <Link to="/cart" className="back-link">
          ← Back to Cart
        </Link>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Shipping Details</h2>

          <label htmlFor="shippingAddress">
            Shipping Address
          </label>

          <textarea
            id="shippingAddress"
            name="shippingAddress"
            rows="5"
            required
            placeholder="Enter your full delivery address"
            value={formData.shippingAddress}
            onChange={handleChange}
          />

          <label htmlFor="phoneNumber">
            Phone Number
          </label>

          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="primary-button place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="checkout-items">
            {items.map((item) => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <p>
                    ₹{item.unitPrice} × {item.quantity}
                  </p>
                </div>

                <strong>₹{item.totalPrice}</strong>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <span>Total Amount</span>
            <strong>₹{totalAmount}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CheckoutPage;