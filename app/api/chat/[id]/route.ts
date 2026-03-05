import { db } from "@/lib/db";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ email: session.user.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    try {
        const historyId = (await params).id;

        // Fetch history with messages - ensure it belongs to the user
        const chatValues = await db.chatHistory.findUnique({
            id: historyId,
            userId: user.id // Security check
        });

        if (!chatValues) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        return NextResponse.json({ chat: chatValues });
    } catch (error) {
        console.error('Fetch Chat Error:', error);
        return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }
}
