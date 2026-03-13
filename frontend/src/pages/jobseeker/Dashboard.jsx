import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlinePaperAirplane,
    HiOutlineCalendar,
    HiOutlineSparkles,
    HiOutlineDocumentAdd,
    HiOutlineSearch,
    HiOutlineClipboardList,
    HiOutlineArrowRight,
    HiOutlineLocationMarker,
    HiOutlineCurrencyDollar,
    HiOutlineClock,
    HiOutlineBriefcase,
    HiOutlineChevronRight,
    HiOutlineTrendingUp,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineEye,
    HiOutlineUser,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import { getMyApplications } from '../../services/applicationService';
import { getRecommendedJobs, getTrendingJobs } from '../../services/recommendationService';

/* ════════════ Helpers ════════════ */
function formatSalary(salary) {
    if (!salary) return 'N/A';
    const fmt = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
    if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
    if (salary.min) return `From ${fmt(salary.min)}`;
    if (salary.max) return `Up to ${fmt(salary.max)}`;
    return 'N/A';
}

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
    const [applications, setApplications] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [appRes, recRes, trendRes] = await Promise.allSettled([
                    getMyApplications(),
                    getRecommendedJobs(),
                    getTrendingJobs(),
                ]);
                if (appRes.status === 'fulfilled') setApplications(appRes.value.data.data?.applications || []);
                if (recRes.status === 'fulfilled') setRecommended(recRes.value.data.data?.jobs || []);
                if (trendRes.status === 'fulfilled') setTrending(trendRes.value.data.data?.jobs || []);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /* ── Computed stats ── */
    const totalApps = applications.length;
    const interviews = applications.filter((a) => a.status === 'interview' || a.status === 'shortlisted').length;
    const accepted = applications.filter((a) => a.status === 'accepted').length;
    const pending = applications.filter((a) => a.status === 'pending').length;

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
                                Here&apos;s what&apos;s happening with your job search
                            </p>
                        </div>
                        <Link
                            to="/jobs"
                            className="w-fit px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm
                hover:bg-white/20 backdrop-blur-sm active:scale-[0.97] transition-all duration-200 flex items-center gap-2"
                        >
                            <HiOutlineSearch className="w-4 h-4" />
                            Browse Jobs
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
                {/* ═══════ STATS CARDS ═══════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={HiOutlinePaperAirplane}
                        label="Applications Sent"
                        value={loading ? '—' : totalApps}
                        color="bg-blue-50 text-blue-600"
                        trend={totalApps > 0 ? `${pending} pending` : null}
                    />
                    <StatCard
                        icon={HiOutlineCalendar}
                        label="Interviews"
                        value={loading ? '—' : interviews}
                        color="bg-purple-50 text-purple-600"
                        trend={interviews > 0 ? 'Upcoming' : null}
                    />
                    <StatCard
                        icon={HiOutlineCheckCircle}
                        label="Accepted"
                        value={loading ? '—' : accepted}
                        color="bg-emerald-50 text-emerald-600"
                        trend={accepted > 0 ? 'Congratulations!' : null}
                    />
                    <StatCard
                        icon={HiOutlineTrendingUp}
                        label="Profile Views"
                        value={loading ? '—' : '—'}
                        color="bg-amber-50 text-amber-600"
                        trend="Coming soon"
                    />
                </div>

                {/* ═══════ QUICK ACTIONS ═══════ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <QuickAction
                        to="/resume"
                        icon={HiOutlineDocumentAdd}
                        title="Upload Resume"
                        desc="AI-analyze your resume for better matches"
                        color="from-blue-500 to-indigo-600"
                    />
                    <QuickAction
                        to="/jobs"
                        icon={HiOutlineSearch}
                        title="Search Jobs"
                        desc="Browse thousands of opportunities"
                        color="from-purple-500 to-pink-600"
                    />
                    <QuickAction
                        to="/my-applications"
                        icon={HiOutlineClipboardList}
                        title="View Applications"
                        desc="Track your application status"
                        color="from-emerald-500 to-teal-600"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ═══════ LEFT COLUMN (2/3) ═══════ */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recommended Jobs */}
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                                    <HiOutlineSparkles className="w-5 h-5 text-amber-500" />
                                    Recommended for You
                                </h2>
                                <Link to="/jobs" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
                                    View all <HiOutlineArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
                                </div>
                            ) : recommended.length > 0 ? (
                                <div className="space-y-3">
                                    {recommended.slice(0, 4).map((item) => {
                                        const job = item.job || item;
                                        const jobObj = { ...job, matchScore: item.matchScore };
                                        if (!jobObj._id && jobObj.id) jobObj._id = jobObj.id;
                                        return <JobCard key={jobObj._id} job={jobObj} />;
                                    })}
                                </div>
                            ) : trending.length > 0 ? (
                                <>
                                    <p className="text-sm text-surface-400 mb-3">Upload your resume to get personalized recommendations. Here are some trending jobs:</p>
                                    <div className="space-y-3">
                                        {trending.slice(0, 4).map((item) => {
                                            const jobObj = { ...item };
                                            if (!jobObj._id && jobObj.id) jobObj._id = jobObj.id;
                                            return <JobCard key={jobObj._id} job={jobObj} />;
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <HiOutlineBriefcase className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                                    <p className="text-surface-500 font-medium">No recommendations yet</p>
                                    <p className="text-sm text-surface-400 mt-1">
                                        <Link to="/resume" className="text-primary-600 hover:underline">Upload your resume</Link> to get AI-powered job matches
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════ RIGHT COLUMN (1/3) ═══════ */}
                    <div className="space-y-6">
                        {/* Recent Applications */}
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-surface-900 flex items-center gap-2">
                                    <HiOutlineClipboardList className="w-5 h-5 text-primary-500" />
                                    Recent Applications
                                </h3>
                                {applications.length > 0 && (
                                    <Link to="/my-applications" className="text-xs text-primary-600 hover:underline font-medium">
                                        View all
                                    </Link>
                                )}
                            </div>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-surface-200" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-3/4 bg-surface-200 rounded" />
                                                <div className="h-3 w-1/2 bg-surface-200 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : applications.length > 0 ? (
                                <div className="space-y-3">
                                    {applications.slice(0, 5).map((app) => (
                                        <div key={app._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                                            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                                                {app.jobId?.company?.charAt(0)?.toUpperCase() || 'J'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-surface-800 truncate">{app.jobId?.title || 'Untitled Job'}</p>
                                                <p className="text-xs text-surface-400 mt-0.5">{app.jobId?.company} · {timeAgo(app.createdAt)}</p>
                                            </div>
                                            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <HiOutlinePaperAirplane className="w-10 h-10 mx-auto text-surface-300 mb-2" />
                                    <p className="text-sm text-surface-500">No applications yet</p>
                                    <Link to="/jobs" className="text-xs text-primary-600 hover:underline font-medium mt-1 inline-block">
                                        Start applying →
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Profile Completion */}
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6">
                            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2 mb-4">
                                <HiOutlineUser className="w-5 h-5 text-primary-500" />
                                Profile Completion
                            </h3>
                            <ProfileProgress user={user} />
                        </div>

                        {/* Tips Card */}
                        <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl border border-primary-100 p-6">
                            <h3 className="text-base font-bold text-primary-900 mb-3">💡 Job Search Tips</h3>
                            <ul className="space-y-2.5 text-sm text-primary-800">
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Keep your resume updated with latest skills</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Apply to jobs with 70%+ match scores</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Personalize your cover letter for each role</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                                    <span>Follow up on applications after 1 week</span>
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

function StatCard({ icon: Icon, label, value, color, trend }) {
    return (
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">{value}</p>
            <p className="text-xs font-medium text-surface-500 mt-0.5">{label}</p>
            {trend && <p className="text-[10px] text-surface-400 mt-1">{trend}</p>}
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

function JobCard({ job }) {
    return (
        <Link
            to={`/jobs/${job._id}`}
            className="group flex items-start gap-4 p-4 rounded-xl border border-surface-100
        hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200"
        >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">{job.company?.charAt(0)?.toUpperCase() || 'J'}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors text-sm truncate">
                        {job.title}
                    </h4>
                    {job.matchScore && (
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                job.matchScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-surface-100 text-surface-600'
                            }`}>
                            {job.matchScore}%
                        </span>
                    )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5">{job.company}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><HiOutlineLocationMarker className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><HiOutlineCurrencyDollar className="w-3.5 h-3.5" />{formatSalary(job.salary)}</span>
                </div>
            </div>
            <HiOutlineChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 flex-shrink-0 mt-3" />
        </Link>
    );
}

function JobCardSkeleton() {
    return (
        <div className="flex gap-4 p-4 rounded-xl animate-pulse">
            <div className="w-11 h-11 rounded-xl bg-surface-200" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-surface-200 rounded" />
                <div className="h-3 w-1/3 bg-surface-200 rounded" />
                <div className="h-3 w-1/2 bg-surface-200 rounded" />
            </div>
        </div>
    );
}

function ProfileProgress({ user }) {
    const checks = [
        { label: 'Email verified', done: !!user?.email },
        { label: 'Resume uploaded', done: !!user?.profile?.resume },
        { label: 'Skills added', done: user?.profile?.skills?.length > 0 },
        { label: 'Bio completed', done: !!user?.profile?.bio },
    ];
    const done = checks.filter((c) => c.done).length;
    const pct = Math.round((done / checks.length) * 100);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-surface-700">{pct}% Complete</span>
                <span className="text-xs text-surface-400">{done}/{checks.length}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-100 overflow-hidden mb-4">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="space-y-2">
                {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-sm">
                        {c.done ? (
                            <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <HiOutlineXCircle className="w-4 h-4 text-surface-300" />
                        )}
                        <span className={c.done ? 'text-surface-600' : 'text-surface-400'}>{c.label}</span>
                    </div>
                ))}
            </div>
            {pct < 100 && (
                <Link
                    to="/profile"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                >
                    Complete your profile <HiOutlineArrowRight className="w-3 h-3" />
                </Link>
            )}
        </div>
    );
}
