import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const message = sessionStorage.getItem("orderSuccessMessage");

    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem("orderSuccessMessage");
    }

    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/Orders/my-orders");

      setOrders(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Could not load your order history."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "N/A";
    }

    return new Date(dateValue).toLocaleString();
  }

  function formatStatus(status) {
    // If API sends numeric enum values, display readable text.
    const statusMap = {
      1: "Pending",
      2: "Paid",
      3: "Processing",
      4: "Shipped",
      5: "Delivered",
      6: "Cancelled"
    };

    return statusMap[status] || status || "Pending";
  }

  if (loading) {
    return <p>Loading your orders...</p>;
  }

  return (
    <section>
      <div className="page-title-row">
        <div>
          <h1>My Orders</h1>
          <p className="page-subtitle">
            View your past orders and order details.
          </p>
        </div>

        <Link to="/" className="back-link">
          ← Continue Shopping
        </Link>
      </div>

      {successMessage && (
        <div className="message-box">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="empty-cart">
          <h2>You have no orders yet</h2>
          <p>Browse products and place your first order.</p>

          <Link to="/" className="primary-button">
            Browse Products
          </Link>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-card-main">
                <div>
                  <p className="order-label">Order ID</p>
                  <h2>#{order.id}</h2>
                </div>

                <div>
                  <p className="order-label">Order Date</p>
                  <p>{formatDate(order.orderDate)}</p>
                </div>

                <div>
                  <p className="order-label">Status</p>
                  <span className="status-badge">
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div>
                  <p className="order-label">Total Amount</p>
                  <strong className="order-total">
                    ₹{order.totalAmount}
                  </strong>
                </div>
              </div>

              <div className="order-card-footer">
                <span>
                  {order.items?.length || 0} item(s)
                </span>

                <Link
                  to={`/orders/${order.id}`}
                  className="view-order-button"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;