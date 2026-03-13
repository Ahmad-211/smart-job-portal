import { Link } from 'react-router-dom';
import { HiOutlineBriefcase } from 'react-icons/hi';

export default function Footer() {
    return (
        <footer className="bg-surface-900 text-surface-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                            <HiOutlineBriefcase className="h-6 w-6" />
                            <span>JobPortal</span>
                        </Link>
                        <p className="text-sm text-surface-400 leading-relaxed">
                            AI-powered job matching, resume analysis, and personalized recommendations to
                            accelerate your career.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-3">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>support@smartjobportal.com</li>
                            <li>Built with MERN + AI</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-surface-700 mt-8 pt-6 text-center text-sm text-surface-500">
                    © {new Date().getFullYear()} Smart Job Portal. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
