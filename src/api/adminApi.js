import api from "./axios";

export const getAllStations = () => api.get("/stations");

// Admin: fetch all bookings using the dedicated admin endpoint
// Backend is expected to secure this route for ADMIN role only
export const getAllBookings = () => api.get("/bookings/admin/all");
