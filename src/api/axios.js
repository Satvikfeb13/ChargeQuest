import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://chargequest-sfzu.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/api/v1/auth/login')) {
      localStorage.removeItem("token");
      window.location.href = "/api/v1/auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;
