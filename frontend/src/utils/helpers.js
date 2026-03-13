// ── Date Formatting ──
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
};

// ── Salary Formatting ──
export const formatSalary = (min, max, currency = 'USD') => {
    const fmt = (n) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    if (max) return `Up to ${fmt(max)}`;
    return 'Not specified';
};

// ── Status Badge Colours ──
export const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-blue-100 text-blue-800',
    interview: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
};

// ── Job Type Labels ──
export const JOB_TYPE_LABELS = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    remote: 'Remote',
};

// ── Experience Level Labels ──
export const EXPERIENCE_LABELS = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior Level',
    lead: 'Lead / Principal',
};

// ── Match Score Color ──
export const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-500';
};

// ── Truncate Text ──
export const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '…';
};
