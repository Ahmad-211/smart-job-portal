import API from './api';

// Get recommended jobs for current user
export const getRecommendedJobs = () => API.get('/recommendations/jobs');

// Get skill gap analysis for a job
export const getSkillGap = (jobId) =>
    API.get(`/recommendations/skill-gap/${jobId}`);

// Get trending jobs
export const getTrendingJobs = () => API.get('/recommendations/trending');

// Get personalized feed
export const getPersonalizedFeed = () => API.get('/recommendations/feed');

// Get similar jobs
export const getSimilarJobs = (jobId) =>
    API.get(`/recommendations/jobs/similar/${jobId}`);
