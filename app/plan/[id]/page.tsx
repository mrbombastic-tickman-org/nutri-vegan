import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShoppingList from "@/components/ShoppingList";
import { unstable_cache } from "next/cache";

// Revalidate every 60 seconds
export const revalidate = 60;

// Cached query for single diet plan
const getDietPlanById = unstable_cache(
    async (id: string) => {
        return db.dietPlan.findUnique({ id });
    },
    ['diet-plan-detail'],
    { revalidate: 60, tags: ['diet-plans'] }
);

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const plan = await getDietPlanById(id);

    if (!plan) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-retro-bg p-4 pb-28">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
                <Link href="/" className="bg-retro-paper dark:bg-gray-800 border-2 border-black dark:border-white/30 px-3 py-1 shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all font-bold text-retro-text">
                    &lt; HOME
                </Link>
                <div className="font-mono text-xs text-retro-text">FILE_ID: {plan.id.slice(0, 8)}</div>
            </div>

            {/* Main File */}
            <div className="bg-retro-paper dark:bg-gray-800 border-4 border-black dark:border-white/30 p-6 shadow-retro-lg relative">
                {/* Paper Tape Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-yellow-200 dark:bg-yellow-600 opacity-50 rotate-1"></div>

                <h1 className="text-3xl font-bold uppercase mb-2 text-center border-b-4 border-black dark:border-white/30 pb-4 text-retro-text">
                    {plan.title}
                </h1>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-sm">
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 border-2 border-black dark:border-white/30">
                        <span className="block text-black dark:text-gray-300 text-xs">DIFFICULTY</span>
                        <span className="font-bold uppercase text-retro-primary">{plan.difficulty}</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-2 border-2 border-black dark:border-white/30">
                        <span className="block text-black dark:text-gray-300 text-xs">DURATION</span>
                        <span className="font-bold uppercase text-retro-text">{plan.duration}</span>
                    </div>
                </div>

                <p className="font-mono mb-6 text-justify border-l-4 border-retro-primary pl-4 text-retro-text">
                    {plan.description}
                </p>

                {/* Nutritional Data Block */}
                <div className="bg-black text-green-400 p-4 font-mono mb-6 border-4 border-gray-500">
                    <div className="mb-2 border-b border-green-800 pb-1">NUTRITION_ANALYSIS</div>
                    <div className="grid grid-cols-2 gap-y-2">
                        <div>CALORIES: {plan.calories || 'N/A'}</div>
                        <div>PROTEIN: {plan.protein}g</div>
                        <div>CARBS:   {plan.carbs}g</div>
                        <div>FATS:    {plan.fats}g</div>
                    </div>
                </div>

                {/* Lists */}
                <div className="grid gap-6">
                    <div className="border-2 border-black dark:border-white/30 p-4 bg-medical-light">
                        <h3 className="font-bold uppercase border-b-2 border-black mb-2 inline-block text-black">Benefits</h3>
                        <ul className="list-disc list-inside space-y-1 font-mono text-sm text-black">
                            {plan.benefits.map((benefit: string, i: number) => (
                                <li key={i}>{benefit}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-2 border-black dark:border-white/30 p-4 bg-skin-light">
                        <h3 className="font-bold uppercase border-b-2 border-black mb-2 inline-block text-black">Restrictions</h3>
                        <ul className="list-disc list-inside space-y-1 font-mono text-sm text-black">
                            {plan.restrictions.map((res: string, i: number) => (
                                <li key={i}>{res}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Meal Schedule */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold uppercase mb-4 text-center bg-black text-white py-1">
                        Meal Schedule
                    </h2>
                    <div className="space-y-4">
                        {plan.meals && (plan.meals as any[]).map((meal: any, i: number) => (
                            <div key={i} className="border-2 border-black dark:border-white/30 p-3 shadow-retro-sm bg-retro-paper dark:bg-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold bg-retro-warning px-2 border border-black text-xs text-black">
                                        {meal.time}
                                    </span>
                                    <span className="text-xs font-mono text-black dark:text-gray-200">{meal.type}</span>
                                </div>
                                <div className="font-bold text-retro-text">{meal.name}</div>
                                <div className="text-sm font-mono mt-1 text-black dark:text-gray-200">{meal.items.join(', ')}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shopping List */}
                <ShoppingList meals={plan.meals as any[]} planTitle={plan.title} />

                {/* CTA */}
                <div className="mt-8 pt-4 border-t-4 border-black dark:border-white/30 text-center">
                    <Link href="/chat" className="inline-block w-full bg-retro-primary text-white border-2 border-black p-4 font-bold text-xl hover:bg-black hover:text-retro-primary transition-colors shadow-retro hover:shadow-none active:translate-y-1">
                        CUSTOMIZE WITH AI &gt;
                    </Link>
                </div>
            </div>
        </div>
    );
}
