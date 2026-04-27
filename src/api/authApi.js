import api from "./axios";

export const loginUser = (data) => api.post("/api/v1/auth/login", data);
export const registerUser = (data) => api.post("/api/v1/auth/register", data);
export const getCurrentUser = () => api.get("/api/v1/users/me");
