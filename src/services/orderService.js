import apiClient from "../api/apiClient";

export const orderService = {
  placeOrder: async (shippingAddress, phoneNumber) => {
    const response = await apiClient.post("/Orders", {
      shippingAddress,
      phoneNumber
    });

    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get("/Orders/my-orders");

    return response.data;
  },

  getById: async (orderId) => {
    const response = await apiClient.get(
      `/Orders/${orderId}`
    );

    return response.data;
  }
};