import apiClient from "../api/apiClient";

export const cartService = {
  getCart: async () => {
    const response = await apiClient.get("/Cart");

    return response.data;
  },

  addItem: async (productId, quantity) => {
    const response = await apiClient.post("/Cart/items", {
      productId,
      quantity
    });

    return response.data;
  },

  updateItem: async (cartItemId, quantity) => {
    const response = await apiClient.put(
      `/Cart/items/${cartItemId}`,
      { quantity }
    );

    return response.data;
  },

  removeItem: async (cartItemId) => {
    await apiClient.delete(`/Cart/items/${cartItemId}`);
  }
};