'use client';

import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
                    Account Restricted
                </h2>
                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <p className="text-secondary-600 mb-6">
                        Your account has been suspended or banned due to a violation of our terms of service.
                    </p>
                    <p className="text-sm text-secondary-500 mb-8">
                        If you believe this is a mistake, please contact our support team.
                    </p>
                    <div className="space-y-4">
                        <Link
                            href="mailto:support@skipped.com"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Contact Support
                        </Link>
                        <Link
                            href="/"
                            className="w-full flex justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50"
                        >
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
