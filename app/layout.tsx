import type { Metadata, Viewport } from "next";
import "./globals.css";
import MobileNav from "@/components/MobileNav";
import Header from "@/components/Header";
import FloatingChatButton from "@/components/FloatingChatButton";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Providers } from "@/components/Providers";

import { VT323 } from 'next/font/google';

const vt323 = VT323({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-vt323',
    display: 'swap',
});

export const metadata: Metadata = {
    // ... existing metadata ...
    title: {
        default: "NutriVegan - AI-Powered Nutrition",
        template: "%s | NutriVegan",
    },
    description: "Personalized AI-powered diet plans for medical, fitness, beauty, and athletic goals.",
    keywords: ["diet plan", "nutrition", "AI", "health", "fitness", "meal planning", "weight loss", "vegan"],
    authors: [{ name: "NutriVegan Team" }],
    creator: "NutriVegan",
    publisher: "NutriVegan",

    // Open Graph
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://nutrivegan.app",
        siteName: "NutriVegan",
        title: "NutriVegan - AI-Powered Nutrition",
        description: "Personalized AI-powered diet plans.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "NutriVegan Preview",
            },
        ],
    },

    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "NutriVegan - AI-Powered Nutrition",
        description: "Personalized AI-powered diet plans.",
        images: ["/og-image.png"],
    },

    // PWA
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "NutriVegan",
    },

    // Icons
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180" },
        ],
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#fdf6e3" },
        { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
    ],
    colorScheme: "light dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={vt323.variable}>
            <body className="pb-24 safe-bottom bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-retro">
                <ThemeProvider>
                    <Providers>
                        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-retro-primary text-white px-4 py-2 z-[100]">
                            Skip to main content
                        </a>
                        <div className="min-h-screen border-x-4 border-black dark:border-white/20 max-w-lg mx-auto bg-[var(--bg-primary)] shadow-retro-lg transition-colors duration-300">
                            <Header />
                            <main id="main-content" role="main">
                                {children}
                            </main>
                        </div>
                        <FloatingChatButton />
                        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
                            <MobileNav />
                        </div>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
