import api from "./axios";

export const getAllStations = () => api.get("/stations");

export const getStationById = (id) => api.get(`/stations/${id}`);

export const createStation = (data) => api.post("/stations", data);

export const updateStation = (id, data) => api.put(`/stations/${id}`, data);

export const deleteStation = (id) => api.delete(`/stations/${id}`);
