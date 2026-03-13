import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineLocationMarker,
    HiOutlineCurrencyDollar,
    HiOutlineBriefcase,
    HiOutlineClock,
    HiOutlineUserGroup,
    HiOutlineEye,
    HiOutlineCalendar,
    HiOutlineAcademicCap,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineSparkles,
    HiOutlineArrowLeft,
    HiOutlineShare,
    HiOutlineHeart,
    HiOutlineChevronRight,
    HiOutlineExclamationCircle,
    HiOutlineBadgeCheck,
    HiOutlineLightningBolt,
    HiOutlineTag,
    HiOutlineGlobe,
    HiOutlineMail,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import { getJobById } from '../../services/jobService';
import { applyForJob } from '../../services/applicationService';
import { getSkillGap, getSimilarJobs } from '../../services/recommendationService';

/* ════════════ Helpers ════════════ */
function formatSalary(salary) {
    if (!salary) return 'Not specified';
    const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
    if (salary.min) return `From ${fmt(salary.min)}`;
    if (salary.max) return `Up to ${fmt(salary.max)}`;
    return 'Not specified';
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return new Date(dateStr).toLocaleDateString();
}

function jobTypeBadge(type) {
    const map = {
        'full-time': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Full-time' },
        'part-time': { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Part-time' },
        'contract': { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Contract' },
        'internship': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Internship' },
        'remote': { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Remote' },
    };
    return map[type] || { bg: 'bg-surface-50 text-surface-600 border-surface-200', label: type || 'Full-time' };
}

function expLevelLabel(lvl) {
    const map = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior Level', lead: 'Lead / Manager' };
    return map[lvl] || lvl;
}

/* ═══════════════════════ Component ═══════════════════════ */
export default function JobDetails() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const isJobseeker = isAuthenticated && user?.role === 'jobseeker';

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [saved, setSaved] = useState(false);

    // Skill gap & similar jobs
    const [skillGap, setSkillGap] = useState(null);
    const [similarJobs, setSimilarJobs] = useState([]);

    /* ── Fetch Job ── */
    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const { data } = await getJobById(id);
                setJob(data.data.job);
            } catch {
                toast.error('Failed to load job details');
                navigate('/jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id, navigate]);

    /* ── Fetch Skill Gap + Similar Jobs ── */
    useEffect(() => {
        if (!id || !isJobseeker) return;
        getSkillGap(id).then(({ data }) => setSkillGap(data.data)).catch(() => { });
        getSimilarJobs(id).then(({ data }) => setSimilarJobs(data.data?.jobs || [])).catch(() => { });
    }, [id, isJobseeker]);

    /* ── Apply Handler ── */
    const handleApply = async () => {
        if (!isAuthenticated) {
            toast.info('Please login to apply for this job');
            navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
            return;
        }
        setApplying(true);
        try {
            await applyForJob({ jobId: id, coverLetter: coverLetter.trim() || undefined });
            setApplied(true);
            setShowApplyModal(false);
            toast.success('Application submitted successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to submit application';
            toast.error(msg);
        } finally {
            setApplying(false);
        }
    };

    /* ── Loading Skeleton ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-surface-50">
                <div className="bg-gradient-to-r from-primary-600 to-indigo-700 h-48" />
                <div className="max-w-5xl mx-auto px-4 -mt-20">
                    <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse space-y-4">
                        <div className="h-8 w-2/3 bg-surface-200 rounded" />
                        <div className="h-5 w-1/3 bg-surface-200 rounded" />
                        <div className="flex gap-3 mt-4">
                            <div className="h-8 w-24 bg-surface-200 rounded-full" />
                            <div className="h-8 w-24 bg-surface-200 rounded-full" />
                            <div className="h-8 w-24 bg-surface-200 rounded-full" />
                        </div>
                        <div className="h-4 w-full bg-surface-200 rounded mt-6" />
                        <div className="h-4 w-5/6 bg-surface-200 rounded" />
                        <div className="h-4 w-4/6 bg-surface-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!job) return null;

    const deadline = job.applicationDeadline ? new Date(job.applicationDeadline) : null;
    const isExpired = deadline && deadline < new Date();
    const badge = jobTypeBadge(job.jobType);

    return (
        <div className="min-h-screen bg-surface-50">
            {/* ═══════ HEADER ═══════ */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium mb-6 transition-colors">
                        <HiOutlineArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
                {/* ═══════ JOB HEADER CARD ═══════ */}
                <div className="bg-white rounded-2xl shadow-lg border border-surface-100 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-5">
                        {/* Company avatar */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center shadow-sm">
                            <span className="text-2xl font-bold text-primary-700">
                                {job.company?.charAt(0)?.toUpperCase() || 'J'}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">{job.title}</h1>
                                    <p className="text-lg text-surface-600 mt-1">{job.company}</p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setSaved(!saved)}
                                        className={`p-2.5 rounded-xl border transition-all ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-surface-200 text-surface-400 hover:text-red-500 hover:border-red-200'}`}
                                        title={saved ? 'Unsave' : 'Save job'}
                                    >
                                        <HiOutlineHeart className={`w-5 h-5 ${saved ? 'fill-red-500' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                                        className="p-2.5 rounded-xl border border-surface-200 text-surface-400 hover:text-primary-600 hover:border-primary-200 transition-all"
                                        title="Share"
                                    >
                                        <HiOutlineShare className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-surface-500">
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineLocationMarker className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                                    {formatSalary(job.salary)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <HiOutlineClock className="w-4 h-4" />
                                    {timeAgo(job.createdAt)}
                                </span>
                                {job.viewsCount > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineEye className="w-4 h-4" />
                                        {job.viewsCount} views
                                    </span>
                                )}
                                {job.applicantsCount > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <HiOutlineUserGroup className="w-4 h-4" />
                                        {job.applicantsCount} applicants
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${badge.bg}`}>
                                    {badge.label}
                                </span>
                                {job.experienceLevel && (
                                    <span className="text-xs font-medium px-3 py-1.5 rounded-full border bg-surface-50 text-surface-600 border-surface-200">
                                        <HiOutlineAcademicCap className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                                        {expLevelLabel(job.experienceLevel)}
                                    </span>
                                )}
                                {deadline && (
                                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${isExpired ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        <HiOutlineCalendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                                        {isExpired ? 'Expired' : `Apply by ${deadline.toLocaleDateString()}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Apply button bar */}
                    <div className="mt-6 pt-6 border-t border-surface-100 flex flex-col sm:flex-row items-center gap-3">
                        {isExpired ? (
                            <div className="flex items-center gap-2 text-red-600 font-medium">
                                <HiOutlineExclamationCircle className="w-5 h-5" />
                                <span>This job listing has expired</span>
                            </div>
                        ) : applied ? (
                            <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                <HiOutlineBadgeCheck className="w-5 h-5" />
                                <span>You have already applied for this job</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => isAuthenticated ? setShowApplyModal(true) : handleApply()}
                                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm
                  hover:bg-primary-700 active:scale-[0.97] shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <HiOutlineLightningBolt className="w-5 h-5" />
                                Apply Now
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ═══════ MAIN CONTENT ═══════ */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Match Score + Skill Gap (jobseeker only) */}
                        {isJobseeker && skillGap && (
                            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                                <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2 mb-5">
                                    <HiOutlineSparkles className="w-5 h-5 text-amber-500" />
                                    Your Match Analysis
                                </h2>

                                {/* Match score bar */}
                                {skillGap.matchScore != null && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-surface-700">Match Score</span>
                                            <span className={`text-2xl font-extrabold ${skillGap.matchScore >= 80 ? 'text-emerald-600' :
                                                    skillGap.matchScore >= 50 ? 'text-amber-600' : 'text-red-500'
                                                }`}>
                                                {skillGap.matchScore}%
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full bg-surface-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${skillGap.matchScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
                                                        skillGap.matchScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                                                            'bg-gradient-to-r from-red-500 to-orange-400'
                                                    }`}
                                                style={{ width: `${skillGap.matchScore}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Skill breakdown */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {skillGap.matchedSkills?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mb-3">
                                                <HiOutlineCheckCircle className="w-4 h-4" />
                                                Matched Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {skillGap.matchedSkills.map((s) => (
                                                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {skillGap.missingSkills?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5 mb-3">
                                                <HiOutlineXCircle className="w-4 h-4" />
                                                Missing Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {skillGap.missingSkills.map((s) => (
                                                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Job Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                            <h2 className="text-lg font-bold text-surface-900 mb-4">Job Description</h2>
                            <div className="text-surface-600 leading-relaxed whitespace-pre-line">
                                {job.description}
                            </div>
                        </div>

                        {/* Responsibilities */}
                        {job.responsibilities?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                                <h2 className="text-lg font-bold text-surface-900 mb-4">Responsibilities</h2>
                                <ul className="space-y-2.5">
                                    {job.responsibilities.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-surface-600">
                                            <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Qualifications */}
                        {job.qualifications?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                                <h2 className="text-lg font-bold text-surface-900 mb-4">Qualifications</h2>
                                <ul className="space-y-2.5">
                                    {job.qualifications.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-surface-600">
                                            <HiOutlineAcademicCap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Benefits */}
                        {job.benefits?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                                <h2 className="text-lg font-bold text-surface-900 mb-4">Benefits & Perks</h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {job.benefits.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                            <HiOutlineBadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                            <span className="text-sm text-emerald-800 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══════ SIDEBAR ═══════ */}
                    <div className="space-y-6">
                        {/* Skills Required */}
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2 mb-4">
                                <HiOutlineTag className="w-5 h-5 text-primary-500" />
                                Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skillsRequired?.map((skill) => (
                                    <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 capitalize">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                            <h3 className="text-base font-bold text-surface-900 flex items-center gap-2 mb-4">
                                <HiOutlineBriefcase className="w-5 h-5 text-primary-500" />
                                About {job.company}
                            </h3>
                            <div className="space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mb-4">
                                    <span className="text-xl font-bold text-primary-700">{job.company?.charAt(0)?.toUpperCase() || 'C'}</span>
                                </div>

                                {job.employerId?.email && (
                                    <div className="flex items-center gap-2 text-sm text-surface-500">
                                        <HiOutlineMail className="w-4 h-4" />
                                        <span>{job.employerId.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-surface-500">
                                    <HiOutlineGlobe className="w-4 h-4" />
                                    <span>{job.location}</span>
                                </div>
                            </div>
                        </div>

                        {/* Job Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
                            <h3 className="text-base font-bold text-surface-900 mb-4">Job Summary</h3>
                            <div className="space-y-3 text-sm">
                                <SummaryRow label="Job Type" value={jobTypeBadge(job.jobType).label} />
                                <SummaryRow label="Experience" value={expLevelLabel(job.experienceLevel)} />
                                <SummaryRow label="Salary" value={formatSalary(job.salary)} />
                                <SummaryRow label="Location" value={job.location} />
                                <SummaryRow label="Posted" value={timeAgo(job.createdAt)} />
                                {deadline && <SummaryRow label="Deadline" value={isExpired ? 'Expired' : deadline.toLocaleDateString()} />}
                            </div>
                        </div>

                        {/* Apply CTA (sticky on desktop) */}
                        {!isExpired && !applied && (
                            <div className="sticky top-20">
                                <button
                                    onClick={() => isAuthenticated ? setShowApplyModal(true) : handleApply()}
                                    className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-sm
                    hover:bg-primary-700 active:scale-[0.97] shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <HiOutlineLightningBolt className="w-5 h-5" />
                                    Apply Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════ SIMILAR JOBS ═══════ */}
                {similarJobs.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-surface-900 mb-6">Similar Jobs</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {similarJobs.slice(0, 6).map((sj) => (
                                <Link
                                    key={sj._id}
                                    to={`/jobs/${sj._id}`}
                                    className="group bg-white rounded-xl p-5 border border-surface-100 shadow-sm
                    hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-sm">
                                            {sj.company?.charAt(0)?.toUpperCase() || 'J'}
                                        </div>
                                        {sj.matchScore && (
                                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                {sj.matchScore}%
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1 text-sm">
                                        {sj.title}
                                    </h3>
                                    <p className="text-xs text-surface-500 mt-1">{sj.company}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                                        <span className="flex items-center gap-1">
                                            <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                                            {sj.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
                                            {formatSalary(sj.salary)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-end mt-3">
                                        <span className="text-xs text-primary-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Job <HiOutlineChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════ APPLY MODAL ═══════ */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fadeIn">
                        <h3 className="text-xl font-bold text-surface-900 mb-1">Apply for this Job</h3>
                        <p className="text-sm text-surface-500 mb-5">{job.title} at {job.company}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    Cover Letter <span className="text-surface-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell the employer why you're a great fit..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm outline-none resize-none
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                />
                            </div>

                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                                <HiOutlineExclamationCircle className="inline w-4 h-4 mr-1.5 -mt-0.5" />
                                Your resume on file will be attached automatically.
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowApplyModal(false)}
                                className="flex-1 py-3 rounded-xl border border-surface-200 text-surface-600 font-semibold text-sm hover:bg-surface-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="flex-1 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm
                  hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
                            >
                                {applying ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
        </div>
    );
}

/* ── Summary Row ── */
function SummaryRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
            <span className="text-surface-500">{label}</span>
            <span className="font-semibold text-surface-800">{value}</span>
        </div>
    );
}
