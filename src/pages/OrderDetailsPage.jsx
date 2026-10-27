import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";

function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(`/Orders/${id}`);

      setOrder(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Could not load order details."
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
    return <p>Loading order details...</p>;
  }

  if (error) {
    return (
      <section>
        <Link to="/orders" className="back-link">
          ← Back to My Orders
        </Link>

        <div className="error-box">
          {error}
        </div>
      </section>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <section>
      <Link to="/orders" className="back-link">
        ← Back to My Orders
      </Link>

      <div className="order-details-card">
        <div className="order-details-header">
          <div>
            <p className="order-label">Order ID</p>
            <h1>Order #{order.id}</h1>
          </div>

          <span className="status-badge">
            {formatStatus(order.status)}
          </span>
        </div>

        <div className="order-details-info">
          <div>
            <p className="order-label">Order Date</p>
            <p>{formatDate(order.orderDate)}</p>
          </div>

          <div>
            <p className="order-label">Total Amount</p>
            <strong className="order-total">
              ₹{order.totalAmount}
            </strong>
          </div>
        </div>

        <h2 className="order-items-heading">Items</h2>

        <div className="order-items-list">
          {order.items?.map((item) => (
            <article className="order-item-row" key={item.productId}>
              <div>
                <h3>{item.productName}</h3>
                <p>
                  ₹{item.unitPrice} × {item.quantity}
                </p>
              </div>

              <strong>₹{item.totalPrice}</strong>
            </article>
          ))}
        </div>

        <div className="order-details-total">
          <span>Total Amount</span>
          <strong>₹{order.totalAmount}</strong>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsPage;