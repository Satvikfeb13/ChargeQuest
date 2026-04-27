import api from "./axios";

export const getAllStations = () => api.get("/api/v1/stations");

// Admin: fetch all bookings using the dedicated admin endpoint
// Backend is expected to secure this route for ADMIN role only
export const getAllBookings = () => api.get("/api/v1/bookings/admin/all");
