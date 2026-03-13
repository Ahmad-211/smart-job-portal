import API from './api';

// Apply for a job
export const applyForJob = (data) => API.post('/applications', data);

// Get my applications (jobseeker)
export const getMyApplications = () => API.get('/applications/my-applications');

// Get applicants for a job (employer)
export const getJobApplicants = (jobId) =>
    API.get(`/applications/job/${jobId}/applicants`);

// Update application status (employer)
export const updateApplicationStatus = (id, data) =>
    API.patch(`/applications/${id}/status`, data);

// Get single application
export const getApplicationById = (id) => API.get(`/applications/${id}`);

// Withdraw application (jobseeker)
export const withdrawApplication = (id) => API.delete(`/applications/${id}`);
