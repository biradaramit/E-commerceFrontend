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
  },

  // Matches ProductService CreateProductDto exactly.
  // Requires a valid JWT with the Admin role (sent by the apiClient interceptor).
  createProduct: async (product) => {
    const response = await apiClient.post("/Products", {
      name: product.name,
      description: product.description || null,
      price: Number(product.price),
      sku: product.sku,
      categoryId: Number(product.categoryId),
      stockQuantity: Number(product.stockQuantity),
      imageUrl: product.imageUrl || null
    });

    return response.data;
  }
};