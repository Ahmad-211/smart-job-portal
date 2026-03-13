import API from './api';

// Upload resume (multipart/form-data)
export const uploadResume = (formData, onUploadProgress) =>
    API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
    });

// Get current user's resume
export const getMyResume = () => API.get('/resume/my-resume');

// Analyze resume (extract skills)
export const analyzeResume = () => API.post('/resume/analyze');

// Delete resume
export const deleteResume = () => API.delete('/resume/my-resume');
