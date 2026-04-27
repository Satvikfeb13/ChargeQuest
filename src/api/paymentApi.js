import api from "./axios";

export const createOrder = (bookingId) =>
  api.post("/api/v1/payment/order", { bookingId });

export const verifyPayment = (data) =>
  api.post("/api/v1/payment/verify", data);
