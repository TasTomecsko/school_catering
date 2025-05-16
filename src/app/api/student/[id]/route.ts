import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { isParent } from "@/functions/ralationValidatorFunction";
import EditUser from "@/types/users/editUser";
import { updateUserSchema } from "@/zod/users";
import { z } from "zod";

export async function PATCH(request: NextRequest,  { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.PARENT) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const parent = isParent(session.user.id, Number(parameters.id));

        if (!parent) {
            return NextResponse.json({ error: "Jogosultlan kérelem" }, { status: 403 })
        }

        const student = await prisma.user.findUnique({
            where: {
                id: Number(parameters.id)
            },
            select: {
                firstName: true,
                lastName: true,
                role: true,
                parents: {
                    select: {
                        parentDetails: {
                            select: {
                                parent: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const req = await request.json();
        const userData: EditUser = req.studentData;

        updateUserSchema.parse(userData)

        await prisma.user.update({
            where: {
                id: Number(parameters.id)
            },
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName
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
            return NextResponse.json({ error: "Hiba történt a felhasználó azonosításakor" }, { status: 500 });
        }
    }
}