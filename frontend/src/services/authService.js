import API from './api';

// Register a new user
export const registerUser = (data) => API.post('/auth/register', data);

// Login user
export const loginUser = (data) => API.post('/auth/login', data);

// Get current logged-in user
export const getMe = () => API.get('/auth/me');
