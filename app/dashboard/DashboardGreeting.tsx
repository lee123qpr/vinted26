'use client';

import { useState, useEffect } from 'react';

export default function DashboardGreeting({ userName }: { userName: string }) {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };

        updateGreeting();
        const interval = setInterval(updateGreeting, 60000);
        return () => clearInterval(interval);
    }, []);

    // Initial server render (hydration mismatch prevention): just show greeting if available or generic
    // Actually, to prevent mismatch, we can default to 'Welcome' or ensure efficient mounting
    // Or just use a suppressed hydration warning if we really want time-based immediately.
    // Better: Render nothing until mounted or "Welcome"
    if (!greeting) return <span className="font-medium capitalize">Welcome, {userName}!</span>;

    return (
        <span className="text-secondary-500 font-medium capitalize">
            {greeting}, {userName}!
        </span>
    );
}
