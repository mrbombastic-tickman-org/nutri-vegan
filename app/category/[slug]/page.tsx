import { db } from "@/lib/db";
import DietPlanCard from "@/components/DietPlanCard";
import DietPlanGrid from "@/components/DietPlanGrid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

// Force dynamic rendering (prevents SSG database errors on Vercel)
export const dynamic = 'force-dynamic';

// Cached query for category with diet plans
const getCategoryBySlug = unstable_cache(
    async (slug: string) => {
        return db.category.findUnique({ slug });
    },
    ['category-detail-v3'],
    { revalidate: 60, tags: ['categories', 'diet-plans'] }
);

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const getHeaderColor = (color: string | null) => {
        switch (color) {
            case '#4CAF50': return 'bg-medical text-black';
            case '#2196F3': return 'bg-fitness text-black';
            case '#E91E63': return 'bg-skin text-black';
            case '#FF9800': return 'bg-athletic text-black';
            default: return 'bg-black text-white';
        }
    };

    return (
        <div className="min-h-screen bg-retro-bg p-4 pb-24">
            {/* Header Bar */}
            <div className={`border-4 border-black dark:border-white/30 p-4 mb-6 shadow-retro relative ${getHeaderColor(category.color)}`}>
                <Link href="/" className="absolute top-4 right-4 bg-white border-2 border-black px-2 hover:bg-black hover:text-white transition-colors text-black">
                    X CLOSE
                </Link>

                <div className="flex items-center gap-4">
                    <div className="bg-white border-2 border-black p-2 text-4xl shadow-retro-sm">
                        {category.icon || '📁'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ textShadow: "2px 2px 0px rgba(255,255,255,0.5)" }}>
                            {category.name}
                        </h1>
                        <p className="font-bold opacity-80 font-mono">
                            /{category.slug}/index.html
                        </p>
                    </div>
                </div>

                <div className="mt-4 bg-white/80 border-2 border-black p-2 font-mono text-sm text-black">
                    {category.description}
                </div>
            </div>

            {/* Plan Grid with Filters */}
            <DietPlanGrid plans={category.dietPlans as any} />
        </div>
    );
}
