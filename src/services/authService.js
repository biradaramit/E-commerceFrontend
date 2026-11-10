import apiClient from "../api/apiClient";

export const authService = {
  register: async (registerData) => {
    const response = await apiClient.post(
      "/Auth/register",
      registerData
    );

    return response.data;
  },

  login: async (loginData) => {
    const response = await apiClient.post(
      "/Auth/login",
      loginData
    );

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/Auth/me");

    return response.data;
  }
};