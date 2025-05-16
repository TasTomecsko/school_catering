import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import MealData from "@/types/meal/mealData";
import { mealSchema } from "@/zod/meal";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest, { params }: { params: { id: string }}): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        const menuId = Number(parameters.id);

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const req = await request.json();

        const mealData: MealData = req.mealInfo;

        mealSchema.parse(mealData);

        const menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            },
            select: {
                activationDate: true,
                startDate: true,
                endDate: true
            }
        });

        const allergens = await prisma.allergy.findMany({
            where: {
                id: {
                    in: mealData.allergenIdList
                }
            },
            select: {
                id: true
            }
        });

        if (allergens.length !== mealData.allergenIdList.length) {
            return NextResponse.json({ error: "Hiba történt az ellergének keresésekor" }, { status: 400 })
        }

        if (!menu) {
            return NextResponse.json({ error: "A keresett menü nem létezik" }, { status: 404 });
        }

        if (menu.activationDate.getTime() < new Date().getTime()) {
            return NextResponse.json({ error: "A menü már nem szerkeszthető" }, { status: 400 });
        }

        const dateOfMeal = new Date(mealData.dateOfMeal);

        if (menu.startDate.getTime() > dateOfMeal.getTime() || menu.endDate.getTime() < dateOfMeal.getTime()) {
            return NextResponse.json({ error: "Az étkezés időpontja kívül esik a menü érvényességi idején" }, { status: 400 });
        }

        const createdMeal = await prisma.meal.create({
            data: {
                dateOfMeal: dateOfMeal,
                code: mealData.code,
                description: mealData.description,
                menuId: menuId,
            }
        });

        allergens.map(async (allergen) => {
            await prisma.allergensInMeal.create({
                data: {
                    mealId: createdMeal.id,
                    allergenId: allergen.id
                }
            });
        });
        
        return NextResponse.json({ error: "Étel sikeresen létrehozva" }, { status: 201 });
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