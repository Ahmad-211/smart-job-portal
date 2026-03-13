import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    HiOutlineSearch,
    HiOutlineLocationMarker,
    HiOutlineBriefcase,
    HiOutlineCurrencyDollar,
    HiOutlineAcademicCap,
    HiOutlineClock,
    HiOutlineChevronDown,
    HiOutlineX,
    HiOutlineAdjustments,
    HiOutlineTag,
    HiOutlineSparkles,
    HiOutlineSortDescending,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineEmojiSad,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import { getJobs } from '../../services/jobService';
import { getRecommendedJobs } from '../../services/recommendationService';

/* ════════════ Constants ════════════ */
const JOB_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead / Manager' },
];

const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-salary.max', label: 'Highest Salary' },
    { value: 'salary.min', label: 'Lowest Salary' },
];

const ITEMS_PER_PAGE = 10;

/* ════════════ Helpers ════════════ */
function formatSalary(salary) {
    if (!salary) return 'Not specified';
    const fmt = (n) => {
        if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
        return `$${n}`;
    };
    if (salary.min && salary.max) return `${fmt(salary.min)} – ${fmt(salary.max)}`;
    if (salary.min) return `From ${fmt(salary.min)}`;
    if (salary.max) return `Up to ${fmt(salary.max)}`;
    return 'Not specified';
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function jobTypeBadgeColor(type) {
    const map = {
        'full-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'part-time': 'bg-amber-50 text-amber-700 border-amber-200',
        'contract': 'bg-purple-50 text-purple-700 border-purple-200',
        'internship': 'bg-cyan-50 text-cyan-700 border-cyan-200',
        'remote': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[type] || 'bg-surface-50 text-surface-600 border-surface-200';
}

/* ═══════════════════════ Component ═══════════════════════ */
export default function JobListings() {
    const { isAuthenticated, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    /* ── State ── */
    const [jobs, setJobs] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalJobs, setTotalJobs] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [searchText, setSearchText] = useState(searchParams.get('search') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
    const [experience, setExperience] = useState(searchParams.get('experienceLevel') || '');
    const [skillInput, setSkillInput] = useState('');
    const [selectedSkills, setSelectedSkills] = useState(() => {
        const s = searchParams.get('skills');
        return s ? s.split(',') : [];
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-createdAt');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const searchInputRef = useRef(null);

    /* ── Fetch Jobs ── */
    const fetchJobs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: ITEMS_PER_PAGE };
            if (searchText.trim()) params.search = searchText.trim();
            if (location.trim()) params.location = location.trim();
            if (jobType) params.jobType = jobType;
            if (experience) params.experienceLevel = experience;
            if (selectedSkills.length) params.skills = selectedSkills;

            const { data } = await getJobs(params);
            setJobs(data.data.jobs);
            setTotalJobs(data.total);
            setCurrentPage(data.page);
            setTotalPages(data.pages);
        } catch {
            toast.error('Failed to load jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [searchText, location, jobType, experience, selectedSkills]);

    /* ── Fetch Recommendations ── */
    useEffect(() => {
        if (isAuthenticated && user?.role === 'jobseeker') {
            getRecommendedJobs()
                .then(({ data }) => setRecommended(data.data?.jobs || []))
                .catch(() => { /* silently ignore */ });
        }
    }, [isAuthenticated, user]);

    /* ── Trigger fetch on filter/page change ── */
    useEffect(() => {
        fetchJobs(currentPage);
    }, [fetchJobs, currentPage]);

    /* ── Sync URL params ── */
    useEffect(() => {
        const params = {};
        if (searchText) params.search = searchText;
        if (location) params.location = location;
        if (jobType) params.jobType = jobType;
        if (experience) params.experienceLevel = experience;
        if (selectedSkills.length) params.skills = selectedSkills.join(',');
        if (sortBy !== '-createdAt') params.sort = sortBy;
        if (currentPage > 1) params.page = currentPage;
        setSearchParams(params, { replace: true });
    }, [searchText, location, jobType, experience, selectedSkills, sortBy, currentPage, setSearchParams]);

    /* ── Handlers ── */
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchJobs(1);
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !selectedSkills.includes(s)) {
            setSelectedSkills((prev) => [...prev, s]);
            setSkillInput('');
            setCurrentPage(1);
        }
    };

    const removeSkill = (skill) => {
        setSelectedSkills((prev) => prev.filter((s) => s !== skill));
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchText('');
        setLocation('');
        setJobType('');
        setExperience('');
        setSelectedSkills([]);
        setSortBy('-createdAt');
        setCurrentPage(1);
    };

    const hasActiveFilters = searchText || location || jobType || experience || selectedSkills.length > 0;

    /* ═══════════════════════ RENDER ═══════════════════════ */
    return (
        <div className="min-h-screen bg-surface-50">
            {/* ── Search Header ── */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center mb-2">
                        Find Your Perfect Job
                    </h1>
                    <p className="text-blue-100 text-center mb-8 text-lg">
                        {totalJobs > 0 ? `${totalJobs.toLocaleString()} opportunities waiting for you` : 'Search thousands of opportunities'}
                    </p>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Job title, company, or keywords..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-surface-900 text-sm placeholder:text-surface-400
                    border-0 outline-none focus:ring-2 focus:ring-primary-300 shadow-lg"
                                />
                            </div>
                            <div className="relative sm:w-56">
                                <HiOutlineLocationMarker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="text"
                                    placeholder="Location..."
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-surface-900 text-sm placeholder:text-surface-400
                    border-0 outline-none focus:ring-2 focus:ring-primary-300 shadow-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold text-sm
                  hover:bg-blue-50 active:scale-[0.97] transition-all duration-200 shadow-lg"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ── Recommended Section ── */}
                {isAuthenticated && user?.role === 'jobseeker' && recommended.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-5">
                            <HiOutlineSparkles className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-bold text-surface-900">Recommended for You</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommended.slice(0, 3).map((item) => {
                                const job = item.job || item; // fallback if it's already flat
                                return (
                                <Link
                                    key={job._id || job.id}
                                    to={`/jobs/${job._id || job.id}`}
                                    className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200
                    hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                                            {job.company?.charAt(0) || 'J'}
                                        </div>
                                        {item.matchScore && (
                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-500 text-white flex-shrink-0">
                                                {item.matchScore}% match
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-surface-500 mt-1 truncate">{job.company}</p>
                                    <p className="text-xs text-surface-400 mt-1 truncate">{job.location}</p>
                                </Link>
                            )})}
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ═══════ FILTERS SIDEBAR (Desktop) ═══════ */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-6 sticky top-20 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-surface-900 flex items-center gap-2">
                                    <HiOutlineAdjustments className="w-5 h-5" />
                                    Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button onClick={clearAllFilters} className="text-xs text-primary-600 hover:underline font-medium">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Job Type */}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">
                                    <HiOutlineBriefcase className="inline w-4 h-4 mr-1 -mt-0.5" />
                                    Job Type
                                </label>
                                <select
                                    value={jobType}
                                    onChange={(e) => { setJobType(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white outline-none
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                >
                                    {JOB_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">
                                    <HiOutlineAcademicCap className="inline w-4 h-4 mr-1 -mt-0.5" />
                                    Experience Level
                                </label>
                                <select
                                    value={experience}
                                    onChange={(e) => { setExperience(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white outline-none
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                >
                                    {EXPERIENCE_LEVELS.map((l) => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">
                                    <HiOutlineTag className="inline w-4 h-4 mr-1 -mt-0.5" />
                                    Skills
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. React"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none
                      focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                {selectedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {selectedSkills.map((s) => (
                                            <span
                                                key={s}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200"
                                            >
                                                {s}
                                                <button onClick={() => removeSkill(s)} className="hover:text-primary-900">
                                                    <HiOutlineX className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* ═══════ MOBILE FILTER BUTTON ═══════ */}
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-surface-200
              text-surface-700 font-medium text-sm shadow-sm hover:bg-surface-50 transition-all"
                    >
                        <HiOutlineAdjustments className="w-5 h-5" />
                        Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                    </button>

                    {/* ═══════ MOBILE FILTER DRAWER ═══════ */}
                    {mobileFiltersOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                            <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl p-6 overflow-y-auto animate-slideIn">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-surface-900">Filters</h3>
                                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-surface-100">
                                        <HiOutlineX className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    {/* Job Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-700 mb-2">Job Type</label>
                                        <select
                                            value={jobType}
                                            onChange={(e) => { setJobType(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white outline-none focus:border-primary-500"
                                        >
                                            {JOB_TYPES.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Experience */}
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-700 mb-2">Experience Level</label>
                                        <select
                                            value={experience}
                                            onChange={(e) => { setExperience(e.target.value); setCurrentPage(1); }}
                                            className="w-full px-3 py-2.5 rounded-xl border border-surface-200 text-sm bg-white outline-none focus:border-primary-500"
                                        >
                                            {EXPERIENCE_LEVELS.map((l) => (
                                                <option key={l.value} value={l.value}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-700 mb-2">Skills</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. React"
                                                value={skillInput}
                                                onChange={(e) => setSkillInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                                className="flex-1 px-3 py-2 rounded-lg border border-surface-200 text-sm outline-none focus:border-primary-500"
                                            />
                                            <button onClick={addSkill} className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium">
                                                Add
                                            </button>
                                        </div>
                                        {selectedSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {selectedSkills.map((s) => (
                                                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
                                                        {s}
                                                        <button onClick={() => removeSkill(s)}><HiOutlineX className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => { clearAllFilters(); setMobileFiltersOpen(false); }}
                                            className="w-full py-2.5 rounded-xl border border-surface-200 text-surface-600 font-medium text-sm hover:bg-surface-50"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full mt-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                                >
                                    Show Results
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════ MAIN CONTENT ═══════ */}
                    <div className="flex-1 min-w-0">
                        {/* Sort bar + active filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                            <p className="text-sm text-surface-500">
                                {loading ? 'Loading…' : (
                                    totalJobs > 0
                                        ? <><span className="font-semibold text-surface-800">{totalJobs.toLocaleString()}</span> jobs found</>
                                        : 'No jobs found'
                                )}
                            </p>
                            <div className="flex items-center gap-2">
                                <HiOutlineSortDescending className="w-4 h-4 text-surface-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-surface-200 text-sm bg-white outline-none focus:border-primary-500 transition-all"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Active filter pills */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {searchText && (
                                    <FilterPill label={`"${searchText}"`} onClear={() => setSearchText('')} />
                                )}
                                {location && (
                                    <FilterPill label={location} icon={<HiOutlineLocationMarker className="w-3.5 h-3.5" />} onClear={() => setLocation('')} />
                                )}
                                {jobType && (
                                    <FilterPill label={JOB_TYPES.find((t) => t.value === jobType)?.label || jobType} onClear={() => setJobType('')} />
                                )}
                                {experience && (
                                    <FilterPill label={EXPERIENCE_LEVELS.find((l) => l.value === experience)?.label || experience} onClear={() => setExperience('')} />
                                )}
                                {selectedSkills.map((s) => (
                                    <FilterPill key={s} label={s} onClear={() => removeSkill(s)} />
                                ))}
                            </div>
                        )}

                        {/* ── Job Cards ── */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20">
                                <HiOutlineEmojiSad className="w-16 h-16 mx-auto text-surface-300 mb-4" />
                                <h3 className="text-xl font-bold text-surface-700 mb-2">No jobs found</h3>
                                <p className="text-surface-500 mb-6">Try adjusting your filters or search terms</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <JobCard key={job._id} job={job} />
                                ))}
                            </div>
                        )}

                        {/* ── Pagination ── */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="p-2.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>

                                {generatePageNumbers(currentPage, totalPages).map((p, i) =>
                                    p === '...' ? (
                                        <span key={`dots-${i}`} className="px-2 text-surface-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${p === currentPage
                                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                                                    : 'border border-surface-200 text-surface-600 hover:bg-surface-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="p-2.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-50
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer animation */}
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}

/* ═══════════════════════ Sub-Components ═══════════════════════ */

function JobCard({ job }) {
    return (
        <Link
            to={`/jobs/${job._id}`}
            className="group block bg-white rounded-2xl border border-surface-100 p-6 shadow-sm
        hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Company avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-700">
                        {job.company?.charAt(0)?.toUpperCase() || 'J'}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors truncate">
                                {job.title}
                            </h3>
                            <p className="text-sm text-surface-500 mt-0.5">{job.company}</p>
                        </div>

                        {/* Match score badge */}
                        {job.matchScore && (
                            <span className={`flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                    job.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                                        'bg-surface-100 text-surface-600'
                                }`}>
                                {job.matchScore}% match
                            </span>
                        )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-surface-500">
                        <span className="flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                            <HiOutlineCurrencyDollar className="w-4 h-4" />
                            {formatSalary(job.salary)}
                        </span>
                        <span className="flex items-center gap-1">
                            <HiOutlineClock className="w-4 h-4" />
                            {timeAgo(job.createdAt)}
                        </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${jobTypeBadgeColor(job.jobType)}`}>
                            {job.jobType?.replace('-', ' ') || 'Full-time'}
                        </span>
                        {job.experienceLevel && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-surface-50 text-surface-600 border-surface-200 capitalize">
                                {job.experienceLevel}
                            </span>
                        )}
                        {job.skillsRequired?.slice(0, 3).map((skill) => (
                            <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 font-medium">
                                {skill}
                            </span>
                        ))}
                        {job.skillsRequired?.length > 3 && (
                            <span className="text-xs text-surface-400 font-medium">
                                +{job.skillsRequired.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Arrow on hover */}
                <div className="hidden sm:flex items-center">
                    <HiOutlineChevronRight className="w-5 h-5 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        </Link>
    );
}

function FilterPill({ label, icon, onClear }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200">
            {icon}
            {label}
            <button onClick={onClear} className="hover:text-primary-900 ml-0.5">
                <HiOutlineX className="w-3.5 h-3.5" />
            </button>
        </span>
    );
}

function JobCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-surface-100 p-6 animate-pulse">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-200" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 bg-surface-200 rounded" />
                    <div className="h-4 w-1/3 bg-surface-200 rounded" />
                    <div className="flex gap-2">
                        <div className="h-4 w-24 bg-surface-200 rounded" />
                        <div className="h-4 w-20 bg-surface-200 rounded" />
                        <div className="h-4 w-16 bg-surface-200 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-surface-200 rounded-full" />
                        <div className="h-6 w-16 bg-surface-200 rounded-full" />
                        <div className="h-6 w-14 bg-surface-200 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Pagination helper ── */
function generatePageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
}
