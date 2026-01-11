'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(expiresAt) - +new Date();

            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                // const seconds = Math.floor((difference / 1000) % 60); // Optional: add seconds if needed

                setTimeLeft(`${hours}h ${minutes}m left`);
                setIsExpired(false);
            } else {
                setTimeLeft('Expired');
                setIsExpired(true);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute to save resources

        return () => clearInterval(timer);
    }, [expiresAt]);

    if (isExpired) {
        return <span className="text-red-500 font-medium text-xs">Expired</span>;
    }

    return (
        <span className="text-orange-600 font-medium text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {timeLeft}
        </span>
    );
}
