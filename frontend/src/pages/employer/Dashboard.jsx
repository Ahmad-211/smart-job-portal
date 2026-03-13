import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineBriefcase,
    HiOutlineUserGroup,
    HiOutlineSparkles,
    HiOutlinePlusCircle,
    HiOutlineEye,
    HiOutlineClipboardList,
    HiOutlineArrowRight,
    HiOutlineLocationMarker,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineTrendingUp,
    HiOutlineCheckCircle,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlineBadgeCheck,
    HiOutlineCalendar,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import { getMyJobs } from '../../services/jobService';
import { getJobApplicants } from '../../services/applicationService';

/* ════════════ Helpers ════════════ */
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function statusColor(status) {
    const map = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
        shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        interview: 'bg-purple-50 text-purple-700 border-purple-200',
        accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
    };
    return map[status] || 'bg-surface-50 text-surface-600 border-surface-200';
}

/* ═══════════════════════ Component ═══════════════════════ */
export default function Dashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [allApplicants, setAllApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data } = await getMyJobs();
                const myJobs = data.data?.jobs || [];
                setJobs(myJobs);

                // Fetch applicants for each job in parallel
                if (myJobs.length > 0) {
                    const applicantResults = await Promise.allSettled(
                        myJobs.map((j) => getJobApplicants(j._id))
                    );
                    const merged = [];
                    applicantResults.forEach((res, idx) => {
                        if (res.status === 'fulfilled') {
                            const apps = res.value.data.data?.applicants || res.value.data.data?.applications || [];
                            apps.forEach((a) => merged.push({ ...a, _jobTitle: myJobs[idx].title, _jobId: myJobs[idx]._id }));
                        }
                    });
                    // Sort by match score descending (if available), then by date
                    merged.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                    setAllApplicants(merged);
                }
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    /* ── Computed stats ── */
    const activeJobs = jobs.filter((j) => j.isActive).length;
    const totalApplicants = allApplicants.length;
    const shortlisted = allApplicants.filter((a) => a.status === 'shortlisted' || a.status === 'interview').length;
    const hiredCount = allApplicants.filter((a) => a.status === 'accepted').length;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <div className="min-h-screen bg-surface-50">
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
                            </h1>
                            <p className="mt-1 text-blue-100 text-base">
                                Manage your job postings and review candidates
                            </p>
                        </div>
                        <Link
                            to="/employer/post-job"
                            className="w-fit px-6 py-2.5 rounded-xl bg-white text-primary-700 font-bold text-sm
                hover:bg-blue-50 active:scale-[0.97] shadow-lg shadow-black/10 transition-all duration-200 flex items-center gap-2"
                        >
                            <HiOutlinePlusCircle className="w-5 h-5" />
                            Post New Job
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
                {/* ═══════ STATS CARDS ═══════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={HiOutlineBriefcase}
                        label="Active Jobs"
                        value={loading ? '—' : activeJobs}
                        sub={`${jobs.length} total`}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        icon={HiOutlineUserGroup}
                        label="Total Applicants"
                        value={loading ? '—' : totalApplicants}
                        sub={shortlisted > 0 ? `${shortlisted} shortlisted` : null}
                        color="bg-purple-50 text-purple-600"
                    />
                    <StatCard
                        icon={HiOutlineBadgeCheck}
                        label="Hired"
                        value={loading ? '—' : hiredCount}
                        sub={hiredCount > 0 ? 'Congratulations!' : null}
                        color="bg-emerald-50 text-emerald-600"
                    />
                    <StatCard
                        icon={HiOutlineTrendingUp}
                        label="Avg. Views / Job"
                        value={loading ? '—' : (jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + (j.viewsCount || 0), 0) / jobs.length) : 0)}
                        sub="Across all listings"
                        color="bg-amber-50 text-amber-600"
                    />
                </div>

                {/* ═══════ QUICK ACTIONS ═══════ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <QuickAction
                        to="/employer/post-job"
                        icon={HiOutlinePlusCircle}
                        title="Post a New Job"
                        desc="Create a new job listing and reach top talent"
                        color="from-blue-500 to-indigo-600"
                    />
                    <QuickAction
                        to="/employer/my-jobs"
                        icon={HiOutlineClipboardList}
                        title="Manage Listings"
                        desc="Edit, pause, or remove your job postings"
                        color="from-purple-500 to-pink-600"
                    />
                    <QuickAction
                        to="/employer/my-jobs"
                        icon={HiOutlineChartBar}
                        title="View Analytics"
                        desc="Track views, applications, and hiring metrics"
                        color="from-emerald-500 to-teal-600"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ═══════ LEFT (2/3) — My Active Jobs ═══════ */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                                    <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
                                    My Active Jobs
                                </h2>
                                <Link to="/employer/my-jobs" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
                                    View all <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
                                </div>
                            ) : jobs.length > 0 ? (
                                <div className="space-y-3">
                                    {jobs.slice(0, 5).map((job) => {
                                        const jobApps = allApplicants.filter((a) => a._jobId === job._id);
                                        return (
                                            <Link
                                                key={job._id}
                                                to={`/employer/jobs/${job._id}/applicants`}
                                                className="group flex items-start gap-4 p-4 rounded-xl border border-surface-100
                          hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
                                            >
                                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                                                    <HiOutlineBriefcase className="w-5 h-5 text-primary-700" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors text-sm truncate">
                                                            {job.title}
                                                        </h4>
                                                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                            {job.isActive ? 'Active' : 'Closed'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                                                        <span className="flex items-center gap-1">
                                                            <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <HiOutlineUserGroup className="w-3.5 h-3.5" />
                                                            {jobApps.length} applicant{jobApps.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <HiOutlineEye className="w-3.5 h-3.5" />
                                                            {job.viewsCount || 0} views
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <HiOutlineClock className="w-3.5 h-3.5" />
                                                            {timeAgo(job.createdAt)}
                                                        </span>
                                                    </div>
                                                    {/* Skills bar */}
                                                    {job.skillsRequired?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {job.skillsRequired.slice(0, 4).map((s) => (
                                                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-100 capitalize">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {job.skillsRequired.length > 4 && (
                                                                <span className="text-[10px] text-surface-400">+{job.skillsRequired.length - 4}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <HiOutlineChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 flex-shrink-0 mt-3" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <HiOutlineBriefcase className="w-14 h-14 mx-auto text-surface-300 mb-3" />
                                    <p className="text-surface-500 font-medium">No jobs posted yet</p>
                                    <p className="text-sm text-surface-400 mt-1 mb-4">Create your first job listing to start receiving applications</p>
                                    <Link
                                        to="/employer/post-job"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm
                      hover:bg-primary-700 transition-all"
                                    >
                                        <HiOutlinePlusCircle className="w-4 h-4" />
                                        Post Your First Job
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════ RIGHT (1/3) — Top Applicants + Hiring Tips ═══════ */}
                    <div className="space-y-6">
                        {/* Top Applicants */}
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2 mb-4">
                                <HiOutlineSparkles className="w-5 h-5 text-amber-500" />
                                Top Applicants
                            </h3>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-9 h-9 rounded-full bg-surface-200" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-3/4 bg-surface-200 rounded" />
                                                <div className="h-3 w-1/2 bg-surface-200 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : allApplicants.length > 0 ? (
                                <div className="space-y-3">
                                    {allApplicants.slice(0, 6).map((app, idx) => (
                                        <div key={app._id || idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {app.applicantId?.name?.charAt(0)?.toUpperCase() || app.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-surface-800 truncate">
                                                    {app.applicantId?.name || app.userId?.name || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-surface-400 truncate mt-0.5">
                                                    Applied for {app._jobTitle}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                {app.matchScore ? (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                            app.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                                                                'bg-surface-100 text-surface-600'
                                                        }`}>
                                                        {app.matchScore}%
                                                    </span>
                                                ) : null}
                                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${statusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <HiOutlineUserGroup className="w-10 h-10 mx-auto text-surface-300 mb-2" />
                                    <p className="text-sm text-surface-500">No applicants yet</p>
                                    <p className="text-xs text-surface-400 mt-1">Post a job to start receiving applications</p>
                                </div>
                            )}
                        </div>

                        {/* Hiring Activity */}
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2 mb-4">
                                <HiOutlineCalendar className="w-5 h-5 text-primary-500" />
                                Recent Activity
                            </h3>
                            {allApplicants.length > 0 ? (
                                <div className="space-y-3">
                                    {allApplicants.slice(0, 4).map((app, idx) => (
                                        <div key={app._id || idx} className="flex items-start gap-2.5 text-sm">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${app.status === 'accepted' ? 'bg-emerald-500' :
                                                    app.status === 'rejected' ? 'bg-red-500' :
                                                        app.status === 'interview' ? 'bg-purple-500' : 'bg-blue-500'
                                                }`} />
                                            <div>
                                                <p className="text-surface-700">
                                                    <span className="font-medium">{app.applicantId?.name || app.userId?.name || 'Someone'}</span>
                                                    {' '}applied for{' '}
                                                    <span className="font-medium">{app._jobTitle}</span>
                                                </p>
                                                <p className="text-xs text-surface-400">{timeAgo(app.createdAt)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-surface-400 text-center py-4">No recent activity</p>
                            )}
                        </div>

                        {/* Hiring Tips */}
                        <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl border border-primary-100 p-6">
                            <h3 className="text-base font-bold text-primary-900 mb-3">💡 Hiring Tips</h3>
                            <ul className="space-y-2.5 text-sm text-primary-800">
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Write clear job descriptions with specific requirements</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Respond to applicants within 48 hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Use AI match scores to prioritize candidates</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Include salary ranges to attract more applicants</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════ Sub-Components ═══════════════════════ */

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">{value}</p>
            <p className="text-xs font-medium text-surface-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-surface-400 mt-1">{sub}</p>}
        </div>
    );
}

function QuickAction({ to, icon: Icon, title, desc, color }) {
    return (
        <Link
            to={to}
            className="group relative overflow-hidden bg-white rounded-2xl border border-surface-100 shadow-sm p-5
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-xs text-surface-500 mt-1">{desc}</p>
            <HiOutlineChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}

function JobCardSkeleton() {
    return (
        <div className="flex gap-4 p-4 rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-xl bg-surface-200" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-surface-200 rounded" />
                <div className="h-3 w-1/2 bg-surface-200 rounded" />
                <div className="flex gap-2">
                    <div className="h-3 w-16 bg-surface-200 rounded" />
                    <div className="h-3 w-16 bg-surface-200 rounded" />
                    <div className="h-3 w-16 bg-surface-200 rounded" />
                </div>
            </div>
        </div>
    );
}
