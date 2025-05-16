import { prisma } from "@/prisma";
import { LoginDetails } from "@/types/users/loginDetails";
import { loginSchema } from "@/zod/users";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const req = await request.json();
        const info: LoginDetails = req.loginInfo;

        loginSchema.parse(info);

        const user = await prisma.user.findUnique({
            where: {
                username: info.username
            },
            select: {
                password: true,
                isEnabled: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Hibás felhasználónév vagy jelszó" }, { status: 401 });
        }

        if (!bcrypt.compareSync(info.password, user.password)) {
            return NextResponse.json({ error: "Hibás felhasználónév vagy jelszó" }, { status: 401 });
        }

        if (!user.isEnabled) {
            return NextResponse.json({ error: "A fiók le van tiltva" }, { status: 403 });
        }

        return NextResponse.json({ status: 200 });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "A megadott felhasználónév vagy jelszó nem felel meg az elvárásoknak" },
                { status: 400 }
            );
        }
        else {
            return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
        }
    }
}