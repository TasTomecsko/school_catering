import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string, menuId: string } }): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.PARENT) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const req = await request.json();
        const orderData: number[] = req.selectedMeals;

        const menu = await prisma.menu.findUnique({
            where: {
                id: Number(parameters.menuId)
            },
            select: {
                startDate: true,
                endDate: true,
                activationDate: true,
                meals: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!menu) {
            return NextResponse.json({error: "A menü nem található"}, {status: 404})
        }

        if (new Date().getTime() > menu.startDate.getTime() || new Date().getTime() < menu.activationDate.getTime()) {
            return NextResponse.json({ error: "A menü nem elérhető" }, { status: 400 });
        }

        var containsAll: boolean = true;

        orderData.map((mealId) => {
            if (mealId) {
                if(!Array.from(menu.meals.map((meal) => (meal.id))).includes(mealId))
                    containsAll = false;
            }
        });

        if(!containsAll) {
            return NextResponse.json({ error: "Hibás étel azonosító" }, { status: 400 })
        }

        const doesOrderAlreadyExist = await prisma.order.findUnique({
            where: {
                studentId_startDate_endDate: {
                    studentId: Number(parameters.id),
                    startDate: new Date(menu.startDate),
                    endDate: new Date(menu.endDate)
                }
            }
        });

        if (doesOrderAlreadyExist) {
            const orders = await prisma.studentOrders.findMany({
                where: {
                    orderId: doesOrderAlreadyExist.id
                },
                select: {
                    mealId: true
                }
            })

            var addedOrders: number[] = [];
            orderData.map((mealId) => {
                if(!Array.from(orders.map((meal) => meal.mealId)).includes(mealId)) {
                    if (mealId)
                        addedOrders.push(mealId)
                }
            });

            addedOrders.map(async (addedId) => {
                await prisma.studentOrders.create({
                    data: {
                        orderId: doesOrderAlreadyExist.id,
                        mealId: addedId
                    }
                })
            })

            var deletedOrders: number[] = [];
            orders.map((meal) => {
                if(!orderData.includes(meal.mealId))
                    deletedOrders.push(meal.mealId);
            });

            await prisma.studentOrders.deleteMany({
                where: {
                    orderId: doesOrderAlreadyExist.id,
                    mealId: {
                        in: deletedOrders
                    }
                }
            })
        }
        else {
            const order = await prisma.order.create({
                data: {
                    studentId: Number(parameters.id),
                    startDate: new Date(menu.startDate),
                    endDate: new Date(menu.endDate)
                }
            });
        
            orderData.map(async (mealId) => {
                await prisma.studentOrders.create({
                    data: {
                        orderId: order.id,
                        mealId: mealId
                    }
                })
            })
        }

        return NextResponse.json({ error: "Rendelés leadva" }, { status: 201 });
    }
    catch (error) {
        return NextResponse.json({ error: "Szerverhiba" }, { status: 500 })
    }
}