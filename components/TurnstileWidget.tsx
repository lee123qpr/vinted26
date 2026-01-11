'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface TurnstileWidgetProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

declare global {
    interface Window {
        turnstile?: {
            render: (element: string | HTMLElement, options: any) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

export default function TurnstileWidget({ siteKey, onVerify, onError, onExpire }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<string | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    const renderWidget = () => {
        if (window.turnstile && containerRef.current && !widgetIdRef.current) {
            // Check if widget is already rendered in the container to be extra safe
            if (containerRef.current.childElementCount > 0) return;

            const id = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onVerify(token),
                'error-callback': () => onError?.(),
                'expired-callback': () => onExpire?.(),
            });
            widgetIdRef.current = id;
            setWidgetId(id);
        }
    };

    useEffect(() => {
        // If script is already loaded
        if (window.turnstile) {
            renderWidget();
        }

        // Cleanup
        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    console.warn('Turnstile remove failed:', e);
                }
                widgetIdRef.current = null;
                setWidgetId(null);
            }
            // Fallback: clear container
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div className="flex justify-center my-4 min-h-[65px]">
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
                strategy="afterInteractive"
                onLoad={() => {
                    // Script loaded, render widget
                    renderWidget();
                }}
            />
            <div ref={containerRef} />
        </div>
    );
}
