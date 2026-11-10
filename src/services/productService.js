import apiClient from "../api/apiClient";

export const productService = {
  getAll: async (category = "") => {
    const url = category
      ? `/Products?category=${encodeURIComponent(category)}`
      : "/Products";

    const response = await apiClient.get(url);

    return response.data;
  },

  getById: async (productId) => {
    const response = await apiClient.get(
      `/Products/${productId}`
    );

    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get("/Categories");

    return response.data;
  }
};