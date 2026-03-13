import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-7xl font-extrabold text-primary-500 mb-4">404</h1>
            <p className="text-xl text-surface-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
            <Link
                to="/"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
                Go Home
            </Link>
        </div>
    );
}
