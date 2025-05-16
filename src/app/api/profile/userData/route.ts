import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import EditUser from "@/types/users/editUser";
import ParentInfo from "@/types/users/parentInfo";
import { parentInfoSchema, updateUserSchema } from "@/zod/users";
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
        const userData: EditUser = req.userData;
        const parentData: ParentInfo = req.parentData;

        updateUserSchema.parse(userData);

        if (session.user.role === Role.PARENT) {

            parentInfoSchema.parse(parentData);

            await prisma.user.update({
                where: {
                    id: Number(session.user.id)
                },
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    parentDetails: {
                        update: {
                            emailAddress: parentData.email,
                            billingAddress: parentData.billingAddress
                        }
                    }
                }
            });
        }
        else if (session.user.role === Role.ADMIN || session.user.role === Role.KITCHEN_WORKER) {
            await prisma.user.update({
                where: {
                    id: Number(session.user.id)
                },
                data: {
                    firstName: userData.firstName,
                    lastName: userData.lastName
                }
            });
        }

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