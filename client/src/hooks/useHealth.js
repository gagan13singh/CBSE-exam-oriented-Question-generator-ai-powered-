import { useState, useEffect, useRef } from 'react';
import { ENDPOINTS } from '../config';

export function useHealth() {
    const [health, setHealth] = useState(null);
    const lastGoodHealth = useRef(null); // preserve last known good state

    const fetchHealth = async () => {
        try {
            const res = await fetch(ENDPOINTS.health, {
                signal: AbortSignal.timeout(12000), // 12s — enough for cold start
            });
            if (res.ok) {
                const data = await res.json();
                lastGoodHealth.current = data;
                setHealth(data);
            }
        } catch {
            // Don't reset to null — keep showing last known state
            // Only show null (connecting) on very first load
            if (lastGoodHealth.current) {
                setHealth(lastGoodHealth.current);
            }
            // silently retry on next interval
        }
    };

    useEffect(() => {
        fetchHealth();
        // Poll every 60s instead of 30s — no need to hammer the server
        const interval = setInterval(fetchHealth, 60_000);
        return () => clearInterval(interval);
    }, []);

    return health;
}