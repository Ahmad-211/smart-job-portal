import { Link } from 'react-router-dom';

export default function Unauthorized() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-7xl font-extrabold text-danger-500 mb-4">403</h1>
            <p className="text-xl text-surface-600 mb-6">You don't have permission to access this page.</p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
                Go Home
            </Link>
        </div>
    );
}
