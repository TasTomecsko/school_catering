import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import CreateModifyMenu from "@/types/menu/createModifyMenu";
import { menuSchema } from "@/zod/menu";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const req = await request.json();

        const menuData: CreateModifyMenu = req.menuInfo;

        menuSchema.parse(menuData);

        const test = await prisma.menu.findMany({
            where: {
                AND: [
                    {
                        startDate: {
                            lte: new Date(menuData.endDate)
                        }
                    },
                    {
                        endDate: {
                            gte: new Date(menuData.startDate)
                        }
                    }
                ]
            }
        });

        if(test.length == 0) {
            await prisma.menu.create({
                data: {
                    startDate: new Date(menuData.startDate),
                    endDate: new Date(menuData.endDate),
                    activationDate: new Date(menuData.activationDate)
                }
            });
        }
        else {
            return NextResponse.json({ error: "Átfedés van egy már létező menüvel" }, { status: 400  });
        }

        return NextResponse.json({ error: "Menü létrehozva"}, { status: 201 });
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