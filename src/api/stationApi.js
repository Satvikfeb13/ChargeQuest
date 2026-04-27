import api from "./axios";

export const getAllStations = () => api.get("/api/v1/stations");

export const getStationById = (id) => api.get(`/api/v1/stations/${id}`);

export const createStation = (data) => api.post("/api/v1/stations", data);

export const updateStation = (id, data) => api.put(`/api/v1/stations/${id}`, data);

export const deleteStation = (id) => api.delete(`/api/v1/stations/${id}`);

export const setMaintenanceMode = (id) => api.patch(`/api/v1/stations/${id}/maintenance`);
