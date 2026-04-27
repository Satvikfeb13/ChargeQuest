import api from './axios';

// Get current user's bookings
export const getMyBookings = async () => {
  try {
    const response = await api.get('/api/v1/bookings/me');
    return response;
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    throw error;
  }
};

// Get bookings for a specific user (admin or self)
export const getBookingsByUserId = async (userId) => {
  try {
    const response = await api.get(`/api/v1/bookings/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get single booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/api/v1/bookings/${bookingId}`);
    return response;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// Create booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/api/v1/bookings', bookingData);
    return response;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/api/v1/bookings/${bookingId}/cancel`);
    return response;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get all bookings (Admin only)
export const getAllBookings = async () => {
  try {
    const response = await api.get('/api/v1/bookings/admin/all');
    return response;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

export default api;