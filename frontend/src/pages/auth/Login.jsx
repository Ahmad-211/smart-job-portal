import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';

/* ── Zod Schema ── */
const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    remember: z.boolean().optional(),
});

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
    });

    // Redirect based on role
    const getRedirectPath = (role) => {
        const from = location.state?.from?.pathname;
        if (from) return from;
        switch (role) {
            case 'admin': return '/admin/dashboard';
            case 'employer': return '/employer/dashboard';
            default: return '/dashboard';
        }
    };

    const getErrorMessage = (err) => {
        if (!err.response) return 'Unable to connect to server. Please check your internet connection.';
        const status = err.response.status;
        const msg = err.response.data?.message;
        if (status === 401) return msg || 'Invalid email or password';
        if (status === 403) return msg || 'Your account has been deactivated. Please contact support.';
        if (status >= 500) return 'Server error. Please try again later.';
        return msg || 'Login failed. Please try again.';
    };

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const user = await login({ email: formData.email, password: formData.password });
            toast.success(`Welcome back, ${user.name}!`);
            navigate(getRedirectPath(user.role), { replace: true });
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = (field) =>
        `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${errors[field]
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
            : 'border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
        }`;

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
            {/* Card */}
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-4 shadow-lg shadow-primary-200">
                        <HiOutlineLockClosed className="w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">Welcome back</h1>
                    <p className="mt-2 text-surface-500">Sign in to your account to continue</p>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-8 space-y-6 border border-surface-100">
                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    className={inputCls('email')}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-danger-500 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-surface-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${errors.password
                                            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20'
                                            : 'border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                                        }`}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-danger-500 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember me / Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 transition"
                                    {...register('remember')}
                                />
                                <span className="text-sm text-surface-600">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl bg-primary-600 text-white font-semibold text-sm
                hover:bg-primary-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-primary-200 hover:shadow-primary-300"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* ── Divider ── */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white text-surface-400 font-medium">Or continue with</span>
                        </div>
                    </div>

                    {/* ── Social Login ── */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-surface-200
                bg-white text-surface-700 text-sm font-medium hover:bg-surface-50 hover:border-surface-300
                transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-surface-200
                bg-white text-surface-700 text-sm font-medium hover:bg-surface-50 hover:border-surface-300
                transition-all duration-200 active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                    </div>
                </div>

                {/* ── Footer link ── */}
                <p className="mt-6 text-center text-sm text-surface-500">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}
