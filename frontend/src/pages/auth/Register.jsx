import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlinePhone,
    HiOutlineOfficeBuilding,
    HiOutlineBriefcase,
    HiOutlineArrowRight,
    HiOutlineArrowLeft,
    HiOutlineCheck,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';

/* ────────────────────────────── Zod Schemas ────────────────────────────── */
const stepTwoSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters'),
        email: z.string().email('Enter a valid email address'),
        phone: z.string().optional(),
        company: z.string().optional(),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .regex(/[A-Z]/, 'Include at least one uppercase letter')
            .regex(/[0-9]/, 'Include at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
        terms: z.boolean().refine((val) => val === true, {
            message: 'You must accept the terms & conditions',
        }),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

/* ───────────────────── Password Strength Helper ────────────────────────── */
function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score === 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 5, label: 'Excellent', color: 'bg-green-600' };
}

/* ═══════════════════════════════ Component ══════════════════════════════ */
export default function Register() {
    const { register: authRegister } = useAuth();
    const navigate = useNavigate();

    /* ── Local state ── */
    const [step, setStep] = useState(1); // 1 = role, 2 = form
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── React Hook Form (step 2 only) ── */
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(stepTwoSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            company: '',
            password: '',
            confirmPassword: '',
            terms: false,
        },
    });

    const watchedPassword = watch('password');
    const strength = useMemo(() => getPasswordStrength(watchedPassword), [watchedPassword]);

    /* ── Helpers ── */
    const getRedirectPath = (r) =>
        r === 'employer' ? '/employer/dashboard' : '/dashboard';

    const goToStep2 = () => {
        if (!role) {
            toast.error('Please select a role to continue');
            return;
        }
        setStep(2);
    };

    /* ── Submit ── */
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                role,
            };
            if (data.phone) payload.phone = data.phone;
            if (role === 'employer' && data.company) {
                payload.profile = { company: data.company };
            }

            const user = await authRegister(payload);
            toast.success(`Welcome, ${user.name}! Your account is ready.`);
            navigate(getRedirectPath(user.role), { replace: true });
        } catch (err) {
            const res = err.response?.data;
            // Field-level validation errors from express-validator
            if (res?.errors && Array.isArray(res.errors)) {
                res.errors.forEach((e) => {
                    if (e.field && e.message) {
                        setError(e.field, { message: e.message });
                    }
                });
                toast.error('Please fix the errors below');
            } else {
                toast.error(res?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Shared input class ── */
    const inputCls = (field) =>
        `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${errors[field]
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
        }`;

    const passwordInputCls = (field) =>
        `w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${errors[field]
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
        }`;

    /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
            <div className="w-full max-w-md">
                {/* ── Header ── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-200">
                        <HiOutlineUser className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
                        Create your account
                    </h1>
                    <p className="mt-2 text-surface-500">
                        {step === 1 ? 'Choose how you want to use the platform' : 'Fill in your details to get started'}
                    </p>
                </div>

                {/* ── Progress indicator ── */}
                <div className="flex items-center justify-center gap-3 mb-8 mx-auto max-w-xs">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                                    : 'bg-surface-200 text-surface-500'
                                    }`}
                            >
                                {step > s ? <HiOutlineCheck className="w-4 h-4" /> : s}
                            </div>
                            <span className={`text-xs font-medium ${step >= s ? 'text-primary-600' : 'text-surface-400'}`}>
                                {s === 1 ? 'Select Role' : 'Your Details'}
                            </span>
                            {s < 2 && (
                                <div className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${step > 1 ? 'bg-primary-500' : 'bg-surface-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-card p-8 border border-surface-100 overflow-hidden">
                    {/* ═══════════════ STEP 1 — Role Selection ═══════════════ */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fadeIn">
                            <h2 className="text-lg font-bold text-surface-800 text-center">I want to…</h2>

                            <div className="space-y-3">
                                {/* Job Seeker */}
                                <button
                                    type="button"
                                    onClick={() => setRole('jobseeker')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group
                    ${role === 'jobseeker'
                                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                                            : 'border-surface-200 hover:border-primary-300 hover:bg-primary-50/30'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${role === 'jobseeker' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                                        }`}>
                                        <HiOutlineBriefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-semibold text-surface-800">Find a Job</span>
                                        <p className="text-sm text-surface-500 mt-0.5">
                                            Search jobs, upload resume, get AI-matched recommendations
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${role === 'jobseeker' ? 'border-primary-600 bg-primary-600' : 'border-surface-300'
                                        }`}>
                                        {role === 'jobseeker' && <HiOutlineCheck className="w-3 h-3 text-white" />}
                                    </div>
                                </button>

                                {/* Employer */}
                                <button
                                    type="button"
                                    onClick={() => setRole('employer')}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group
                    ${role === 'employer'
                                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-100'
                                            : 'border-surface-200 hover:border-primary-300 hover:bg-primary-50/30'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${role === 'employer' ? 'bg-primary-600 text-white' : 'bg-surface-100 text-surface-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                                        }`}>
                                        <HiOutlineOfficeBuilding className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-semibold text-surface-800">Hire Talent</span>
                                        <p className="text-sm text-surface-500 mt-0.5">
                                            Post jobs, rank applicants with AI scoring, manage hiring
                                        </p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${role === 'employer' ? 'border-primary-600 bg-primary-600' : 'border-surface-300'
                                        }`}>
                                        {role === 'employer' && <HiOutlineCheck className="w-3 h-3 text-white" />}
                                    </div>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={goToStep2}
                                disabled={!role}
                                className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-2
                  hover:bg-primary-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                  shadow-lg shadow-primary-200 hover:shadow-primary-300"
                            >
                                Continue <HiOutlineArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ═══════════════ STEP 2 — Details Form ═══════════════ */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fadeIn">
                            {/* Full Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    {role === 'employer' ? 'Contact Name' : 'Full Name'}
                                </label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                    <input
                                        id="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className={inputCls('name')}
                                        {...register('name')}
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-xs text-danger-500 font-medium">{errors.name.message}</p>}
                            </div>

                            {/* Company (employer only) */}
                            {role === 'employer' && (
                                <div>
                                    <label htmlFor="company" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                        Company Name <span className="text-surface-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <HiOutlineOfficeBuilding className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                        <input
                                            id="company"
                                            type="text"
                                            placeholder="Acme Inc."
                                            className={inputCls('company')}
                                            {...register('company')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label htmlFor="reg-email" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                    <input
                                        id="reg-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className={inputCls('email')}
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-xs text-danger-500 font-medium">{errors.email.message}</p>}
                            </div>

                            {/* Phone (optional) */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    Phone <span className="text-surface-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className={inputCls('phone')}
                                        {...register('phone')}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className={passwordInputCls('password')}
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-danger-500 font-medium">{errors.password.message}</p>}

                                {/* Password strength meter */}
                                {watchedPassword && (
                                    <div className="mt-2 space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-surface-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="reg-confirm" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                    <input
                                        id="reg-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className={passwordInputCls('confirmPassword')}
                                        {...register('confirmPassword')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((p) => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-danger-500 font-medium">{errors.confirmPassword.message}</p>
                                )}
                            </div>

                            {/* Terms & Conditions */}
                            <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 transition"
                                    {...register('terms')}
                                />
                                <span className="text-sm text-surface-600 leading-snug">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                                </span>
                            </label>
                            {errors.terms && <p className="text-xs text-danger-500 font-medium -mt-2">{errors.terms.message}</p>}

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="py-3 px-5 rounded-xl border border-surface-200 text-surface-600 font-semibold text-sm
                    hover:bg-surface-50 transition-all duration-200 flex items-center gap-1.5"
                                >
                                    <HiOutlineArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold text-sm
                    hover:bg-primary-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-lg shadow-primary-200 hover:shadow-primary-300"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creating account…
                                        </span>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Footer link ── */}
                <p className="mt-6 text-center text-sm text-surface-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            {/* ── Inline keyframe for fade-in animation ── */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
        </div>
    );
}
