import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { ChangePassword } from "@/types/users/changePassword";
import { changePasswordSchema } from "@/zod/users";
import { z } from "zod";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role === Role.STUDENT) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const req = await request.json();
        const passwordData: ChangePassword = req.passwordData;

        changePasswordSchema.parse(passwordData);

        const user = await prisma.user.findUnique({
            where: {
                id: Number(session.user.id)
            },
            select: {
                password: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "A felhasználó nem található" }, { status: 404 })
        }

        if (!bcrypt.compareSync(passwordData.oldPassword, user.password)) {
            return NextResponse.json({ error: "A régi jelszó helytelen" }, { status: 400 })
        }

        const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 10);

        await prisma.user.update({
            where: {
                id: Number(session.user.id)
            },
            data: {
                password: hashedNewPassword
            }
        });

        return NextResponse.json({ status: 200 })
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Az elküldött adatok érvénytelenek. Kérem javítsa a hibákat!" }, 
                { status: 400 }
            );
        }
        else {
            return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
        }
    }
}