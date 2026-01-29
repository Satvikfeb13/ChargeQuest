import api from "./axios";

export const createOrder = (bookingId) =>
  api.post("/payment/order", { bookingId });

export const verifyPayment = (data) =>
  api.post("/payment/verify", data);
