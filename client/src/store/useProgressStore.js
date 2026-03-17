/**
 * client/src/store/useProgressStore.js
 * Zustand store with persist — now includes getAdaptiveDifficulty
 * Run: npm install zustand  (inside client/ folder)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useProgressStore = create(
    persist(
        (set, get) => ({
            sessions: [],
            streak: 0,
            lastDate: null,

            // ── Add a completed test session ─────────────────────────────────
            addSession: (session) => {
                const today = new Date().toDateString();
                const { lastDate, streak, sessions } = get();

                let newStreak = streak;
                if (!lastDate) {
                    newStreak = 1;
                } else {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (lastDate === today) {
                        // same day — no change
                    } else if (lastDate === yesterday.toDateString()) {
                        newStreak = streak + 1;
                    } else {
                        newStreak = 1; // gap — reset
                    }
                }

                const newSession = { ...session, date: new Date().toISOString() };
                const updatedSessions = [newSession, ...sessions].slice(0, 100);
                set({ sessions: updatedSessions, streak: newStreak, lastDate: today });
            },

            // ── Derived stats ─────────────────────────────────────────────────
            getTotalQuestions: () =>
                get().sessions.reduce((sum, s) => sum + (s.total || 0), 0),

            getAvgAccuracy: () => {
                const { sessions } = get();
                if (!sessions.length) return 0;
                const avg = sessions.reduce(
                    (sum, s) => sum + (s.total > 0 ? s.correct / s.total : 0), 0
                ) / sessions.length;
                return Math.round(avg * 100);
            },

            getTotalTests: () => get().sessions.length,

            getWeakChapters: () => {
                const map = {};
                get().sessions.forEach(s => {
                    const k = `${s.subject}__${s.chapter}`;
                    if (!map[k]) map[k] = { subject: s.subject, chapter: s.chapter, correct: 0, total: 0 };
                    map[k].correct += s.correct || 0;
                    map[k].total += s.total || 0;
                });
                return Object.values(map)
                    .filter(c => c.total >= 2)
                    .map(c => ({ ...c, accuracy: Math.round(c.correct / c.total * 100) }))
                    .sort((a, b) => a.accuracy - b.accuracy)
                    .slice(0, 5);
            },

            // ── Adaptive difficulty ───────────────────────────────────────────
            // Returns 'Easy' | 'Standard' | 'Hard' based on recent performance
            getAdaptiveDifficulty: (subject, chapter) => {
                const sessions = get().sessions.filter(
                    s => s.subject === subject && s.chapter === chapter
                );
                if (sessions.length < 2) return 'Standard'; // not enough data yet

                const recent = sessions.slice(0, 3);
                const avg = recent.reduce(
                    (a, s) => a + (s.total > 0 ? s.correct / s.total : 0), 0
                ) / recent.length;
                const pct = Math.round(avg * 100);

                if (pct >= 75) return 'Hard';
                if (pct >= 50) return 'Standard';
                return 'Easy';
            },

            clearAll: () => set({ sessions: [], streak: 0, lastDate: null }),
        }),
        {
            name: 'vidyastra-progress',
            version: 1,
        }
    )
);

export default useProgressStore;