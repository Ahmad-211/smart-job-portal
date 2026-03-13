import API from './api';

// Get all jobs (public, with optional query params)
export const getJobs = (params) => API.get('/jobs', { params });

// Get single job by ID
export const getJobById = (id) => API.get(`/jobs/${id}`);

// Create a new job (employer)
export const createJob = (data) => API.post('/jobs', data);

// Update a job (employer)
export const updateJob = (id, data) => API.put(`/jobs/${id}`, data);

// Delete a job (employer)
export const deleteJob = (id) => API.delete(`/jobs/${id}`);

// Get employer's own jobs
export const getMyJobs = () => API.get('/jobs/employer/my-jobs');

// Advanced search
export const searchJobs = (params) => API.get('/jobs/search', { params });

// Search stats
export const getSearchStats = () => API.get('/jobs/search/stats');

// Skill suggestions
export const getSkillSuggestions = () => API.get('/jobs/search/skills');

// Search by locations
export const searchByLocations = (params) => API.get('/jobs/search/locations', { params });

// Salary range search
export const searchBySalary = (params) => API.get('/jobs/search/salary-range', { params });
