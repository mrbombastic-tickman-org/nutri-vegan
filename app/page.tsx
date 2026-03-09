import { db } from "@/lib/db";
import CategoryCard, { Category } from "@/components/CategoryCard";
import Link from "next/link";
import { unstable_cache } from "next/cache";

// Force dynamic rendering (prevents SSG database errors on Vercel)
export const dynamic = 'force-dynamic';

// Cache the categories query with error handling
const getCategories = unstable_cache(
    async () => {
        console.log('[DB DEBUG] Attempting to fetch categories...');
        try {
            const result = await db.category.findMany({
                orderBy: { name: 'asc' },
            });
            console.log('[DB DEBUG] Successfully fetched', result.length, 'categories');
            // Map to expected format with _count
            return result.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                icon: cat.icon,
                color: cat.color,
                _count: { dietPlans: parseInt(cat.diet_plans_count) || 0 }
            }));
        } catch (error: any) {
            console.error('[DB DEBUG] Database query failed:', {
                message: error.message,
                name: error.name,
            });
            throw error;
        }
    },
    ['categories-list'],
    { revalidate: 60, tags: ['categories'] }
);

export default async function HomePage() {
    let categories: Category[] = [];
    let dbError: { message: string; code?: string; hint: string } | null = null;

    try {
        categories = await getCategories();
    } catch (error: any) {
        console.error('[HOME PAGE] Failed to load categories:', error.message);
        dbError = {
            message: error.message,
            code: error.code,
            hint: 'Check your database connection in .env file'
        };
    }

    return (
        <div className="min-h-screen bg-retro-bg p-4 pb-24 transition-colors duration-300">
            {/* Retro Header Section */}
            <header className="mb-8 border-b-4 border-retro-border pb-4 text-center bg-retro-paper p-4 shadow-retro animate-slide-up">
                <h1 className="text-4xl font-bold text-retro-primary mb-2 tracking-widest uppercase filter drop-shadow-[2px_2px_0_var(--shadow-color)]">
                    NutriVegan
                </h1>
                <div className="inline-block bg-retro-border text-retro-paper px-2 py-1 font-mono text-sm typing-effect">
                    SYSTEM_READY... OK
                </div>
            </header>

            {/* Hero Box */}
            <section className="mb-8 animate-slide-up stagger-1">
                <div className="bg-retro-secondary text-white border-4 border-retro-border p-6 shadow-retro relative overflow-hidden group hover-lift">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2 uppercase drop-shadow-md">Welcome User_01</h2>
                        <p className="font-mono mb-4 text-white/90 drop-shadow-sm">
                            Initializing personalized nutrition modules. Select a database to proceed.
                        </p>
                        <Link
                            href="/chat"
                            className="inline-block bg-white text-retro-secondary border-2 border-retro-border px-4 py-2 font-bold shadow-retro-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-y-1"
                        >
                            &gt; RUN AI_OAUTH
                        </Link>
                    </div>
                    {/* Decorative Glitch text or shapes */}
                    <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 text-black transition-transform group-hover:rotate-6 group-hover:scale-110">
                        AI
                    </div>
                </div>
            </section>

            {/* Database Error Display */}
            {dbError && (
                <section className="mb-8 animate-fade-in">
                    <div className="bg-red-100 border-4 border-red-500 p-4 shadow-retro">
                        <h3 className="text-red-700 font-bold uppercase mb-2">⚠ Database Connection Error</h3>
                        <p className="text-red-600 font-mono text-sm">{dbError.message}</p>
                        {dbError.code && (
                            <p className="text-red-500 font-mono text-xs mt-1">Code: {dbError.code}</p>
                        )}
                        <p className="text-red-600 text-sm mt-2">{dbError.hint}</p>
                    </div>
                </section>
            )}

            {/* Categories Grid */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-retro-border pb-1 animate-fade-in">
                    <span className="w-3 h-3 bg-retro-border animate-pulse"></span>
                    <h3 className="text-xl font-bold uppercase text-retro-text">Select Category</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {categories.length === 0 && !dbError ? (
                        <div className="col-span-2 text-center py-8 text-retro-muted">
                            <p>No categories found. Database may be empty.</p>
                        </div>
                    ) : (
                        categories.map((category: Category, index: number) => (
                            <div
                                key={category.id}
                                className={`animate-slide-up hover-lift`}
                                style={{ animationDelay: `${0.1 + index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                            >
                                <CategoryCard category={category} />
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Quick Access / Footer */}
            <section className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="text-center font-mono text-xs text-retro-muted border-t-2 border-retro-muted pt-4 mt-8">
                    © 2026 NUTRIVEGAN // V.1.0.0
                    <br />
                    <span className="animate-pulse">MEMORY: 64KB OK</span>
                </div>
            </section>
        </div>
    );
}

