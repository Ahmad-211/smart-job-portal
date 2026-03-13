import API from './api';

// Get all users (admin)
export const getAllUsers = (params) => API.get('/admin/users', { params });

// Get user by ID (admin)
export const getUserById = (id) => API.get(`/admin/users/${id}`);

// Update user role (admin)
export const updateUserRole = (id, data) =>
    API.patch(`/admin/users/${id}/role`, data);

// Toggle user active status (admin)
export const toggleUserActive = (id) =>
    API.patch(`/admin/users/${id}/activate`);

// Get all jobs (admin)
export const adminGetAllJobs = (params) => API.get('/admin/jobs', { params });

// Delete job (admin)
export const adminDeleteJob = (id) => API.delete(`/admin/jobs/${id}`);

// Get all applications (admin)
export const adminGetAllApplications = (params) =>
    API.get('/admin/applications', { params });

// Get dashboard statistics (admin)
export const getAdminStats = () => API.get('/admin/stats');
