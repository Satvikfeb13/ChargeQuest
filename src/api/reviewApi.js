import api from "./axios";

// Matches: @GetMapping("/{stationId}/reviews") in ReviewController
export const getReviewsByStation = (stationId) => api.get(`/api/v1/reviews/${stationId}/reviews`);
// Fallbacks for compatibility
export const getReviewsByStationAlt = (stationId) => api.get(`/api/v1/stations/${stationId}/reviews`);
export const getReviewsByStationSingular = (stationId) => api.get(`/api/v1/station/${stationId}/reviews`);

export const addReview = (data) => api.post("/api/v1/reviews", data);

export const updateReview = (id, data) => api.put(`/api/v1/reviews/${id}`, data);

export const deleteReview = (id) => api.delete(`/api/v1/reviews/${id}`);
