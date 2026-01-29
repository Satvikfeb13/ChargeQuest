import api from "./axios";

export const getReviewsByStation = (stationId) => api.get(`/reviews/station/${stationId}`);

export const addReview = (data) => api.post("/reviews", data);

export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);

export const deleteReview = (id) => api.delete(`/reviews/${id}`);
