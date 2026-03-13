import { Link } from 'react-router-dom';
import {
    HiOutlineLightningBolt,
    HiOutlineSparkles,
    HiOutlineDocumentSearch,
    HiOutlineBriefcase,
    HiOutlineOfficeBuilding,
    HiOutlineArrowRight,
    HiOutlineChartBar,
    HiOutlineUserGroup,
    HiOutlineStar,
    HiOutlineShieldCheck,
} from 'react-icons/hi';

/* ═══════════════════════ Static Data ═══════════════════════ */
const features = [
    {
        icon: HiOutlineLightningBolt,
        title: 'AI-Powered Matching',
        desc: 'Our intelligent algorithm analyzes your skills, experience, and preferences to find the perfect job matches in seconds.',
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        icon: HiOutlineSparkles,
        title: 'Smart Recommendations',
        desc: 'Get personalized job recommendations that improve over time as our AI learns your career goals and interests.',
        color: 'from-purple-500 to-pink-600',
        bg: 'bg-purple-50',
        iconColor: 'text-purple-600',
    },
    {
        icon: HiOutlineDocumentSearch,
        title: 'Resume Analysis',
        desc: 'Upload your resume and receive instant feedback on keyword optimization, skills gaps, and match scores.',
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
    },
];

const stats = [
    { value: '10K+', label: 'Jobs Posted', icon: HiOutlineBriefcase },
    { value: '5K+', label: 'Candidates Hired', icon: HiOutlineUserGroup },
    { value: '500+', label: 'Companies Hiring', icon: HiOutlineOfficeBuilding },
    { value: '95%', label: 'Satisfaction Rate', icon: HiOutlineStar },
];

const testimonials = [
    {
        quote: 'The AI matching saved me weeks of searching. I found my dream role within 3 days!',
        name: 'Sarah Johnson',
        role: 'Software Engineer',
        company: 'TechCorp',
        avatar: 'S',
    },
    {
        quote: 'As an employer, the applicant ranking feature helped us hire 40% faster.',
        name: 'Michael Chen',
        role: 'HR Director',
        company: 'InnovateLabs',
        avatar: 'M',
    },
    {
        quote: 'Resume analysis showed me exactly which keywords I was missing. Got 3x more callbacks!',
        name: 'Emily Rodriguez',
        role: 'Marketing Manager',
        company: 'GrowthCo',
        avatar: 'E',
    },
];

const howItWorks = [
    { step: '01', title: 'Create Profile', desc: 'Sign up and tell us about your skills, experience, and career goals.' },
    { step: '02', title: 'Upload Resume', desc: 'Our AI extracts your skills and matches you with the best opportunities.' },
    { step: '03', title: 'Get Matched', desc: 'Receive personalized job recommendations ranked by match score.' },
    { step: '04', title: 'Get Hired', desc: 'Apply with one click and track your applications in real-time.' },
];

/* ═══════════════════════ Component ═══════════════════════ */
export default function Landing() {
    return (
        <div className="overflow-hidden">
            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium mb-6">
                            <HiOutlineShieldCheck className="w-4 h-4 text-emerald-300" />
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                            Find Your Dream Job with{' '}
                            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                AI-Powered Matching
                            </span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Upload your resume, let our AI analyze your skills, and get matched with the
                            perfect opportunities — all in minutes, not months.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold text-base
                  hover:bg-blue-50 shadow-xl shadow-black/10 hover:shadow-2xl
                  active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-base
                  hover:bg-white/10 backdrop-blur-sm
                  active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <HiOutlineOfficeBuilding className="w-5 h-5" />
                                I'm Hiring
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineShieldCheck className="w-4 h-4" />
                                <span>No credit card required</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-300/40" />
                            <div className="hidden sm:flex items-center gap-1.5">
                                <HiOutlineLightningBolt className="w-4 h-4" />
                                <span>2‑minute setup</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-300/40" />
                            <div className="hidden sm:flex items-center gap-1.5">
                                <HiOutlineStar className="w-4 h-4" />
                                <span>4.9★ rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
                    <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 70 1440 60V80H0V40Z" fill="white" />
                </svg>
            </section>

            {/* ═══════════════════════ STATS ═══════════════════════ */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className="text-center p-6 rounded-2xl bg-surface-50 border border-surface-100
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-3">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <p className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">{s.value}</p>
                                <p className="mt-1 text-sm font-medium text-surface-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ FEATURES ═══════════════════════ */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-surface-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Why Choose Us</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
                            Supercharge Your Job Search
                        </h2>
                        <p className="mt-4 text-lg text-surface-500">
                            Our AI-driven platform connects the right candidates with the right opportunities — faster and smarter.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group relative bg-white rounded-2xl p-8 border border-surface-100
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            >
                                {/* Gradient accent on hover */}
                                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                                    <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-surface-900 mb-3">{f.title}</h3>
                                <p className="text-surface-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Simple Process</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
                            How It Works
                        </h2>
                        <p className="mt-4 text-lg text-surface-500">
                            Four simple steps to land your next career opportunity.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, idx) => (
                            <div key={item.step} className="relative text-center">
                                {/* Connector line */}
                                {idx < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-20%)] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100" />
                                )}
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 border-2 border-primary-200 mb-5">
                                    <span className="text-2xl font-extrabold text-primary-600">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-bold text-surface-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-surface-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">Testimonials</span>
                        <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
                            Loved by Job Seekers & Employers
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white rounded-2xl p-8 border border-surface-100 shadow-sm
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <HiOutlineStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                <blockquote className="text-surface-700 leading-relaxed mb-6">
                                    &ldquo;{t.quote}&rdquo;
                                </blockquote>

                                <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-surface-800 text-sm">{t.name}</p>
                                        <p className="text-xs text-surface-400">{t.role} at {t.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Company logos strip */}
                    <div className="mt-16 text-center">
                        <p className="text-sm text-surface-400 uppercase tracking-wider font-medium mb-8">
                            Trusted by teams at leading companies
                        </p>
                        <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
                            {['TechCorp', 'InnovateLabs', 'GrowthCo', 'DataPrime', 'CloudNine'].map((co) => (
                                <span key={co} className="text-xl sm:text-2xl font-bold text-surface-500 tracking-tight">
                                    {co}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ CTA ═══════════════════════ */}
            <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Ready to Take the Next Step in Your Career?
                    </h2>
                    <p className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto">
                        Join thousands of professionals who found their perfect roles through AI-powered job matching. Start free today.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-primary-700 font-bold text-base
                hover:bg-blue-50 shadow-xl shadow-black/10 hover:shadow-2xl
                active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <HiOutlineBriefcase className="w-5 h-5" />
                            Find Jobs — It's Free
                        </Link>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-base
                hover:bg-white/10 backdrop-blur-sm
                active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <HiOutlineOfficeBuilding className="w-5 h-5" />
                            Post Jobs — Start Hiring
                        </Link>
                    </div>

                    <p className="mt-6 text-sm text-blue-200">
                        No credit card required &middot; Setup in 2 minutes &middot; Cancel anytime
                    </p>
                </div>
            </section>

            {/* ═══════════════════════ BOTTOM FEATURE BAR ═══════════════════════ */}
            <section className="py-12 bg-white border-t border-surface-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <HiOutlineShieldCheck className="w-8 h-8 text-emerald-500" />
                            <h4 className="font-bold text-surface-800">Secure & Private</h4>
                            <p className="text-sm text-surface-500">Your data is encrypted and never shared without consent.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <HiOutlineChartBar className="w-8 h-8 text-blue-500" />
                            <h4 className="font-bold text-surface-800">Real-Time Analytics</h4>
                            <p className="text-sm text-surface-500">Track your application status and match scores live.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <HiOutlineLightningBolt className="w-8 h-8 text-amber-500" />
                            <h4 className="font-bold text-surface-800">Lightning Fast</h4>
                            <p className="text-sm text-surface-500">AI processes your resume in under 30 seconds.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
