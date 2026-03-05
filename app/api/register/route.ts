import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await db.user.findUnique({ email });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.create({
            email,
            name,
            password: hashedPassword,
            image: `https://api.iconify.design/mdi:account-circle.svg?color=%23000000`, // Default avatar
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
