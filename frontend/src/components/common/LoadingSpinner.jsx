/**
 * Reusable loading spinner.
 * @param {'sm'|'md'|'lg'} size
 * @param {string} className - extra css classes
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeMap = {
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeMap[size]} animate-spin rounded-full border-primary-500 border-t-transparent`}
            />
        </div>
    );
}
