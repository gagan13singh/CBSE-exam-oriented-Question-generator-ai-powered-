/**
 * src/hooks/useHealth.js
 * Polls /api/health every 30s to show Groq/Ollama status badge.
 */

import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../config';

export function useHealth() {
    const [health, setHealth] = useState(null); // null = loading

    const fetchHealth = async () => {
        try {
            const res = await fetch(ENDPOINTS.health, { signal: AbortSignal.timeout(5000) });
            if (res.ok) setHealth(await res.json());
        } catch {
            setHealth(null);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    return health;
}
