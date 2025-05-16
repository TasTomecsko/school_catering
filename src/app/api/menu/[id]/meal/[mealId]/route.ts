import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import MealData from "@/types/meal/mealData";
import { mealSchema } from "@/zod/meal";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function DELETE(request: NextRequest,  { params }: { params: { id: string, mealId: string }}): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        const menuId = Number(parameters.id);
        const mealId = Number(parameters.mealId);

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const mealToDelete = await prisma.meal.findUnique({
            where: {
                menuId: menuId,
                id: mealId
            },
            select: {
                menu: {
                    select: {
                        activationDate: true
                    }
                },
                allergensInMeal: {
                    select: {
                        allergenId: true
                    }
                }
            }
        });

        if (!mealToDelete) {
            return NextResponse.json({ error: "A keresett étel nem található" }, { status: 404 });
        }

        if (mealToDelete.menu.activationDate.getTime() < new Date().getTime()) {
            return NextResponse.json({ error: "A menü nem szerkeszthető" }, { status: 400 });
        }

        await prisma.allergensInMeal.deleteMany({
            where: {
                mealId: mealId,
                allergenId: {
                    in: Array.from(mealToDelete.allergensInMeal.map((allergenId) => allergenId.allergenId))
                }
            }
        });

        await prisma.meal.delete({
            where: {
                menuId: menuId,
                id: mealId
            }
        });

        return NextResponse.json({ status: 200 })
    }
    catch (error) {
        return NextResponse.json({ error: "Szerverhiba" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string, mealId: string }}): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        const menuId = Number(parameters.id);
        const mealId = Number(parameters.mealId);

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const req = await request.json();

        const mealData: MealData = req.mealInfo;

        mealSchema.parse(mealData);

        console.log(mealData)

        const mealToEdit = await prisma.meal.findUnique({
            where: {
                menuId: menuId,
                id: mealId
            },
            select: {
                menu: {
                    select: {
                        activationDate: true,
                        startDate: true,
                        endDate: true
                    }
                },
                allergensInMeal: {
                    select: {
                        allergenId: true
                    }
                }
            }
        });

        const selectedAllergens = await prisma.allergy.findMany({
            where: {
                id: {
                    in: mealData.allergenIdList
                }
            },
            select: {
                id: true
            }
        });
        
        if (!mealToEdit) {
            return NextResponse.json({ error: "A keresett étel nem található" }, { status: 404 });
        }

        if (mealToEdit.menu.activationDate.getTime() < new Date().getTime()) {
            return NextResponse.json({ error: "A menü nem szerkeszthető" }, { status: 400 });
        }

        if (selectedAllergens.length !== mealData.allergenIdList.length) {
            return NextResponse.json({error: "Hiba történt az ellergének keresésekor"}, { status: 400 })
        }

        const dateOfMeal = new Date(mealData.dateOfMeal);

        if (mealToEdit.menu.startDate.getTime() > dateOfMeal.getTime() || mealToEdit.menu.endDate.getTime() < dateOfMeal.getTime()) {
            return NextResponse.json({error: "Az étkezés időpontja kívül esik a menü érvényességi idején"}, {status: 400});
        }
        
        await prisma.meal.update({
            where: {
                menuId: menuId,
                id: mealId
            },
            data: {
                code: mealData.code,
                description: mealData.description,
                dateOfMeal: dateOfMeal
            }
        });
        
        var allergensAdded: number[] = [];
        selectedAllergens.map((selectedAllergen) => {
            if (!Array.from(mealToEdit.allergensInMeal.map((allergenInMeal) => allergenInMeal.allergenId)).includes(selectedAllergen.id)) {
                allergensAdded.push(selectedAllergen.id);
            }
        });

        if (allergensAdded.length > 0) {
            allergensAdded.map(async (allergenId) => {
                await prisma.allergensInMeal.create({
                    data: {
                        mealId: mealId,
                        allergenId: allergenId
                    }
                });
            });
        }

        var allergensDeleted: number[] = [];
        mealToEdit.allergensInMeal.map((allergenInMeal) => {
            if (!Array.from(selectedAllergens.map((selectedAllergen) => selectedAllergen.id)).includes(allergenInMeal.allergenId)){
                allergensDeleted.push(allergenInMeal.allergenId);
            }
        });

        if (allergensDeleted.length > 0) {
            await prisma.allergensInMeal.deleteMany({
                where: {
                    mealId: mealId,
                    allergenId: {
                        in: allergensDeleted
                    }
                }
            });
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