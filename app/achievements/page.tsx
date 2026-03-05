'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Badge,
    BADGES,
    UserStats,
    getUnlockedBadges,
    getLockedBadges,
    calculateStatsFromProgress,
} from '@/lib/badges';

interface ConfettiPiece {
    id: number;
    left: string;
    color: string;
    delay: string;
}

export default function AchievementsPage() {
    const [stats, setStats] = useState<UserStats>({
        currentStreak: 0,
        longestStreak: 0,
        totalDaysTracked: 0,
        totalWaterGlasses: 0,
        totalMealsLogged: 0,
        totalGoalsCompleted: 0,
        perfectDays: 0,
    });
    const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
    const [lockedBadges, setLockedBadges] = useState<Badge[]>([]);
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    const triggerConfetti = useCallback(() => {
        const colors = ['#FF004D', '#29ADFF', '#00E436', '#FFEC27', '#FF77A8', '#FFA300'];
        const pieces: ConfettiPiece[] = [];
        for (let i = 0; i < 50; i++) {
            pieces.push({
                id: i,
                left: `${Math.random() * 100}%`,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: `${Math.random() * 2}s`,
            });
        }
        setConfetti(pieces);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    useEffect(() => {
        // Load progress and todos from localStorage
        const savedProgress = localStorage.getItem('dietProgress');
        const savedTodos = localStorage.getItem('dietTodos');

        const progress = savedProgress ? JSON.parse(savedProgress) : [];
        const todos = savedTodos ? JSON.parse(savedTodos) : [];

        const calculatedStats = calculateStatsFromProgress(progress, todos);
        setStats(calculatedStats);
        const unlocked = getUnlockedBadges(calculatedStats);
        setUnlockedBadges(unlocked);
        setLockedBadges(getLockedBadges(calculatedStats));

        // Trigger confetti if there are unlocked badges
        if (unlocked.length > 0) {
            setTimeout(() => triggerConfetti(), 500);
        }
    }, [triggerConfetti]);

    // Calculate progress towards locked badges
    const getBadgeProgress = (badge: Badge): { current: number; target: number; percent: number } | null => {
        const { currentStreak, totalWaterGlasses, totalMealsLogged, perfectDays } = stats;

        // Simple heuristic based on badge category
        switch (badge.category) {
            case 'streak':
                const streakTarget = badge.name.includes('7') ? 7 : badge.name.includes('30') ? 30 : 3;
                return { current: currentStreak, target: streakTarget, percent: Math.min(100, (currentStreak / streakTarget) * 100) };
            case 'water':
                const waterTarget = badge.name.includes('100') ? 100 : badge.name.includes('50') ? 50 : 10;
                return { current: totalWaterGlasses, target: waterTarget, percent: Math.min(100, (totalWaterGlasses / waterTarget) * 100) };
            case 'meals':
                const mealTarget = badge.name.includes('100') ? 100 : badge.name.includes('50') ? 50 : 10;
                return { current: totalMealsLogged, target: mealTarget, percent: Math.min(100, (totalMealsLogged / mealTarget) * 100) };
            case 'special':
                return { current: perfectDays, target: 7, percent: Math.min(100, (perfectDays / 7) * 100) };
            default:
                return null;
        }
    };

    const categoryLabels: Record<string, string> = {
        streak: '🔥 STREAKS',
        water: '💧 HYDRATION',
        meals: '🍽️ NUTRITION',
        goals: '🎯 GOALS',
        special: '✨ SPECIAL',
    };

    const groupBadges = (badges: Badge[]) => {
        return badges.reduce((acc, badge) => {
            if (!acc[badge.category]) acc[badge.category] = [];
            acc[badge.category].push(badge);
            return acc;
        }, {} as Record<string, Badge[]>);
    };

    const unlockedGrouped = groupBadges(unlockedBadges);
    const lockedGrouped = groupBadges(lockedBadges);

    return (
        <div className="min-h-screen bg-retro-bg p-4 pb-24 relative overflow-hidden">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {confetti.map((piece) => (
                        <div
                            key={piece.id}
                            className="confetti"
                            style={{
                                left: piece.left,
                                backgroundColor: piece.color,
                                animationDelay: piece.delay,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <div className="bg-retro-paper dark:bg-gray-800 border-4 border-black dark:border-white/30 p-3 shadow-retro animate-slide-up">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl animate-bounce">🏆</span>
                        <div>
                            <h1 className="text-xl font-bold uppercase text-retro-text">ACHIEVEMENTS</h1>
                            <p className="text-xs font-mono text-retro-text opacity-70">
                                {unlockedBadges.length}/{BADGES.length} Badges Unlocked
                            </p>
                        </div>
                        {unlockedBadges.length > 0 && (
                            <button
                                onClick={triggerConfetti}
                                className="ml-auto text-2xl hover:scale-110 transition-transform"
                                title="Celebrate!"
                            >
                                🎉
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { value: stats.currentStreak, icon: '🔥', label: 'STREAK', bg: 'bg-retro-accent', delay: 0.1 },
                        { value: stats.totalWaterGlasses, icon: '💧', label: 'WATER', bg: 'bg-blue-300', delay: 0.2 },
                        { value: stats.totalMealsLogged, icon: '🍽️', label: 'MEALS', bg: 'bg-green-300', delay: 0.3 },
                        { value: stats.perfectDays, icon: '✨', label: 'PERFECT', bg: 'bg-purple-300', delay: 0.4 },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`${stat.bg} border-2 border-black p-2 text-center animate-scale-in`}
                            style={{ animationDelay: `${stat.delay}s`, opacity: 0, animationFillMode: 'forwards' }}
                        >
                            <div className="text-xl font-bold text-black">{stat.value}{stat.icon}</div>
                            <div className="text-xs font-mono text-black">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Unlocked Badges */}
                {unlockedBadges.length > 0 && (
                    <div className="bg-retro-paper dark:bg-gray-800 border-4 border-black dark:border-white/30 p-3 shadow-retro animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-sm font-bold uppercase mb-3 bg-retro-accent text-black inline-block px-2 py-1">
                            🏅 UNLOCKED ({unlockedBadges.length})
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(unlockedGrouped).map(([category, badges]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-bold text-retro-text opacity-70 mb-2">
                                        {categoryLabels[category]}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {badges.map((badge, index) => (
                                            <div
                                                key={badge.id}
                                                className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 border-2 border-yellow-500 p-3 text-center animate-bounce-in hover-lift"
                                                style={{ animationDelay: `${0.3 + index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                                            >
                                                <div className="text-3xl mb-1">{badge.icon}</div>
                                                <div className="text-xs font-bold text-black dark:text-white truncate">
                                                    {badge.name}
                                                </div>
                                                <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                                                    {badge.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locked Badges */}
                {lockedBadges.length > 0 && (
                    <div className="bg-retro-paper dark:bg-gray-800 border-4 border-black dark:border-white/30 p-3 shadow-retro animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-sm font-bold uppercase mb-3 bg-gray-500 text-white inline-block px-2 py-1">
                            🔒 LOCKED ({lockedBadges.length})
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(lockedGrouped).map(([category, badges]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-bold text-retro-text opacity-70 mb-2">
                                        {categoryLabels[category]}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {badges.map((badge) => {
                                            const progress = getBadgeProgress(badge);
                                            return (
                                                <div
                                                    key={badge.id}
                                                    className="bg-gray-200 dark:bg-gray-700 border-2 border-gray-400 p-3 text-center opacity-80 hover:opacity-100 transition-opacity"
                                                >
                                                    <div className="text-3xl mb-1 grayscale">🔒</div>
                                                    <div className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate">
                                                        {badge.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 truncate">
                                                        {badge.description}
                                                    </div>
                                                    {progress && (
                                                        <div className="mt-2">
                                                            <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-retro-primary animate-progress"
                                                                    style={{ width: `${progress.percent}%` }}
                                                                />
                                                            </div>
                                                            <div className="text-[9px] text-gray-500 mt-1">
                                                                {progress.current}/{progress.target}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Badges Message */}
                {unlockedBadges.length === 0 && (
                    <div className="bg-retro-paper dark:bg-gray-800 border-4 border-dashed border-black dark:border-white/50 p-8 text-center animate-bounce-in">
                        <div className="text-5xl mb-3">🎮</div>
                        <h2 className="text-lg font-bold uppercase mb-2 text-retro-text">NO BADGES YET</h2>
                        <p className="font-mono text-xs text-retro-text mb-4">
                            Start tracking your diet to unlock achievements!
                        </p>
                        <Link
                            href="/tracker"
                            className="inline-block bg-retro-primary text-white border-2 border-black px-4 py-2 font-bold uppercase hover:bg-black transition-colors text-sm hover-lift"
                        >
                            📊 GO TO TRACKER
                        </Link>
                    </div>
                )}

                {/* Back Link */}
                <div className="flex justify-center">
                    <Link
                        href="/tracker"
                        className="text-xs font-mono text-retro-text opacity-70 hover:opacity-100 underline"
                    >
                        ← Back to Tracker
                    </Link>
                </div>
            </div>
        </div>
    );
}

