import axios from "axios";

// API base URL comes from the Vite env variable VITE_API_BASE_URL
// (see .env.development / .env.production). Falls back to the
// deployed Azure API Gateway so the build never points at localhost.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://ecommerce-api-gateway.ashysmoke-4c224a19.eastus.azurecontainerapps.io/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor:
// Automatically sends JWT token with protected requests.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor:
// Handles common API failures globally.
apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      // Token missing, invalid, or expired.
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Avoid redirect loop if already on login page.
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (statusCode === 403) {
      console.error(
        "Access denied. You do not have permission for this action."
      );
    }

    if (!error.response) {
      console.error(
        "Network error. Please check whether API Gateway is running."
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;