import api from "./axios";

// Matches: @GetMapping("/{stationId}/reviews") in ReviewController
export const getReviewsByStation = (stationId) => api.get(`/reviews/${stationId}/reviews`);
// Fallbacks for compatibility
export const getReviewsByStationAlt = (stationId) => api.get(`/stations/${stationId}/reviews`);
export const getReviewsByStationSingular = (stationId) => api.get(`/station/${stationId}/reviews`);

export const addReview = (data) => api.post("/reviews", data);

export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);

export const deleteReview = (id) => api.delete(`/reviews/${id}`);
