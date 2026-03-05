import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Fetch metrics for chart
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        const metrics = await db.userMetric.findMany({
            where: {
                userId: user.id,
                type: type || undefined
            },
            orderBy: { recordedAt: 'asc' },
            take: 30 // Last 30 entries
        });

        return NextResponse.json({ metrics });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}

// POST: Add new metric
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        const { type, value, unit } = await request.json();

        const metric = await db.userMetric.create({
            userId: user.id,
            type,
            value: parseFloat(value),
            unit,
            recordedAt: new Date(),
        });

        return NextResponse.json({ metric });
    } catch {
        return NextResponse.json({ error: 'Failed to save metric' }, { status: 500 });
    }
}
