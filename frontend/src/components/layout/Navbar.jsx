import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { HiOutlineBriefcase, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineViewGrid, HiOutlineSearch } from 'react-icons/hi';
import { useState } from 'react';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const getDashboardLink = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'employer') return '/employer/dashboard';
        return '/dashboard';
    };

    const isActive = (path) => location.pathname === path;
    const isJobseeker = isAuthenticated && user?.role === 'jobseeker';

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* ── Logo (top-left) ── */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shadow-md shadow-primary-200 group-hover:shadow-primary-300 transition-all duration-300">
                            <HiOutlineBriefcase className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                            JobPortal
                        </span>
                    </Link>

                    {/* ── Desktop nav (top-right) ── */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Browse Jobs — only for jobseekers */}
                                {isJobseeker && (
                                    <Link
                                        to="/jobs"
                                        className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive('/jobs')
                                                ? 'bg-surface-100 text-primary-600'
                                                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                                            }`}
                                    >
                                        <HiOutlineSearch className="w-4 h-4" />
                                        Browse Jobs
                                    </Link>
                                )}

                                {/* Dashboard */}
                                <Link
                                    to={getDashboardLink()}
                                    className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${location.pathname.includes('dashboard')
                                            ? 'bg-surface-100 text-primary-600'
                                            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
                                        }`}
                                >
                                    <HiOutlineViewGrid className="w-4 h-4" />
                                    Dashboard
                                </Link>

                                {/* Divider */}
                                <div className="w-px h-6 bg-surface-200" />

                                {/* User pill */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-surface-800 leading-tight">{user?.name}</p>
                                        <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
                                    </div>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-surface-200 text-surface-600 text-sm font-medium
                    hover:border-danger-500 hover:text-danger-600 hover:bg-red-50 transition-all duration-300"
                                >
                                    <HiOutlineLogout className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Login — secondary outlined */}
                                <Link
                                    to="/login"
                                    className="px-6 py-2.5 rounded-lg border-2 border-primary-500 text-primary-600 text-sm font-semibold
                    hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-lg hover:shadow-primary-200
                    active:scale-[0.97] transition-all duration-300"
                                >
                                    Login
                                </Link>

                                {/* Sign Up — primary filled */}
                                <Link
                                    to="/register"
                                    className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold
                    hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-200
                    active:scale-[0.97] transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* ── Mobile hamburger ── */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-surface-600
              hover:bg-surface-100 transition-all duration-300"
                    >
                        {menuOpen ? <HiOutlineX className="h-6 w-6" /> : <HiOutlineMenu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="bg-white border-t border-surface-100 px-4 py-4 space-y-2">
                    {isAuthenticated ? (
                        <>
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-surface-100">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-800">{user?.name}</p>
                                    <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
                                </div>
                            </div>

                            {/* Browse Jobs — only for jobseekers */}
                            {isJobseeker && (
                                <Link
                                    to="/jobs"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-surface-600 hover:bg-surface-50 font-medium transition-all duration-300"
                                >
                                    <HiOutlineSearch className="w-4 h-4" />
                                    Browse Jobs
                                </Link>
                            )}

                            <Link
                                to={getDashboardLink()}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-surface-600 hover:bg-surface-50 font-medium transition-all duration-300"
                            >
                                <HiOutlineViewGrid className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <button
                                onClick={() => { logout(); setMenuOpen(false); }}
                                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-danger-600 hover:bg-red-50 font-medium transition-all duration-300"
                            >
                                <HiOutlineLogout className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="flex gap-3 pt-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center px-4 py-2.5 rounded-lg border-2 border-primary-500 text-primary-600 font-semibold text-sm
                    hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 text-center px-4 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm
                    hover:bg-primary-700 transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
