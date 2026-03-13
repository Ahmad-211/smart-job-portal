import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import JobListings from './pages/public/JobListings';
import JobDetails from './pages/public/JobDetails';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Job Seeker Pages
import SeekerDashboard from './pages/jobseeker/Dashboard';
import MyApplications from './pages/jobseeker/MyApplications';
import ResumeUpload from './pages/jobseeker/ResumeUpload';
import SeekerProfile from './pages/jobseeker/Profile';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import MyJobs from './pages/employer/MyJobs';
import JobApplicants from './pages/employer/JobApplicants';
import EmployerProfile from './pages/employer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import AdminApplications from './pages/admin/Applications';

// Misc
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-140px)]">
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Job Seeker ── */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['jobseeker']}><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['jobseeker']}><MyApplications /></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute allowedRoles={['jobseeker']}><ResumeUpload /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['jobseeker']}><SeekerProfile /></ProtectedRoute>} />

          {/* ── Employer ── */}
          <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute allowedRoles={['employer']}><PostJob /></ProtectedRoute>} />
          <Route path="/employer/my-jobs" element={<ProtectedRoute allowedRoles={['employer']}><MyJobs /></ProtectedRoute>} />
          <Route path="/employer/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['employer']}><JobApplicants /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['employer']}><EmployerProfile /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminApplications /></ProtectedRoute>} />

          {/* ── Misc ── */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </>
  );
}