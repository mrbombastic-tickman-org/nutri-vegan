'use client';

import Link from 'next/link';
import ThemeSwitch from './ThemeSwitch';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header
            className="sticky top-0 z-50 bg-retro-paper/95 backdrop-blur-lg border-b-4 border-retro-border shadow-retro transition-colors duration-300"
            role="banner"
        >
            <div className="px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-retro-primary focus:ring-offset-2 rounded-sm"
                    aria-label="NutriVegan - Go to homepage"
                >
                    <span className="text-2xl" aria-hidden="true">🥗</span>
                    <h1
                        className="text-3xl font-bold tracking-widest uppercase transition-colors"
                        style={{
                            color: '#FF004D',
                            textShadow: isDark
                                ? '2px 2px 0 rgba(255,255,255,0.8)'
                                : '3px 3px 0 rgba(0,0,0,0.2)'
                        }}
                    >
                        NutriVegan
                    </h1>
                </Link>

                {/* Theme Switch */}
                <div className="flex items-center gap-3" role="group" aria-label="Theme controls">
                    <span
                        className="text-xs font-mono hidden sm:block text-retro-text/70"
                        aria-live="polite"
                    >
                        {isDark ? 'DARK_MODE' : 'LIGHT_MODE'}
                    </span>
                    <ThemeSwitch
                        checked={isDark}
                        onChange={toggleTheme}
                    />
                </div>
            </div>
        </header>
    );
}
