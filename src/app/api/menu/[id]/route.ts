import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import CreateModifyMenu from "@/types/menu/createModifyMenu";
import { menuSchema } from "@/zod/menu";
import { z } from "zod";

export async function DELETE(request: NextRequest,  { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        const id = Number(parameters.id);

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const menuToDelete = await prisma.menu.findUnique({
            where: {
                id: id
            },
            select: {
                activationDate: true,
                meals: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if(!menuToDelete) {
            return NextResponse.json({ error: "A keresett menü nem található" }, { status: 404 });
        }

        if(menuToDelete.activationDate.getTime() < new Date().getTime()) {
            return NextResponse.json({ error: "A keresett menü már aktív" }, { status: 400 });
        }

        await Promise.all(
            menuToDelete.meals.map(async (meal) => {
                await prisma.allergensInMeal.deleteMany({
                    where: {
                        mealId: meal.id
                    }
                });
                await prisma.meal.delete({
                    where: {
                        id: meal.id
                    }
                });
            })
        );
        await prisma.menu.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ status: 200 })
    }
    catch (error) {
        return NextResponse.json({ error: "Szerver hiba" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest,  { params }: { params: { id: string }}): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const id = Number(parameters.id);
        const req = await request.json();
        const menuData: CreateModifyMenu = req.menuInfo;

        menuSchema.parse(menuData);

        const menuToEdit = await prisma.menu.findUnique({
            where: {
                id: id
            },
            select: {
                activationDate: true
            }
        })

        if(!menuToEdit) {
            return NextResponse.json({ error: "A keresett menü nem található" }, { status: 404 });
        }

        if(menuToEdit.activationDate.getTime() < new Date().getTime()) {
            return NextResponse.json({ error: "A keresett menü már aktív" }, { status: 400 });
        }

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

        if (test.length == 0) {
            await prisma.menu.update({
                where: {
                    id: id
                },
                data: {
                    startDate: new Date(menuData.startDate),
                    endDate: new Date(menuData.endDate),
                    activationDate: new Date(menuData.activationDate)
                }
            });
        }
        else {
            if (test.length == 1 && test[0].id == id) {
                await prisma.menu.update({
                    where: {
                        id: id
                    },
                    data: {
                        startDate: new Date(menuData.startDate),
                        endDate: new Date(menuData.endDate),
                        activationDate: new Date(menuData.activationDate)
                    }
                });
            }
            else {
                return NextResponse.json({ error: "Átfedés van egy már létező menüvel!" }, { status: 400 });
            }
        }
        

        return NextResponse.json({status: 200})
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