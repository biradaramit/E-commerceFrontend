import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://localhost:44377/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Later, after login, this automatically attaches JWT token
// to Cart and Order requests.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
 
export default apiClient;