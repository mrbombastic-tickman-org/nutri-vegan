import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        const history = await db.chatHistory.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: 'desc' },
            take: 20
        });
        return NextResponse.json({ history });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
