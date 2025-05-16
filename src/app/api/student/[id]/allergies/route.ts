import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { isParent } from "@/functions/ralationValidatorFunction";
import AllergyDetails from "@/types/student/allergyDetails";
import { studentAllergySchema } from "@/zod/studentAllergies";
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

        if(!isParent(session.user.id, Number(parameters.id))) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        const student = await prisma.user.findUnique({
            where: {
                id: Number(parameters.id)
            },
            select: {
                studentAllergies: {
                    select: {
                        allergy: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });
    
        if (!student) {
            return NextResponse.json({ error: "A keresett diák nem található" }, { status: 404 });
        }

        const req = await request.json();
        const selectedAllergies: AllergyDetails = req.selectedAllergies;

        studentAllergySchema.parse(selectedAllergies);

        var addedAllergies: number[] = [];
        selectedAllergies.allergyIdList.map((allergy) => {
            if (!Array.from(student.studentAllergies.map((studentAllergy) => (studentAllergy.allergy.id))).includes(allergy)) {
                addedAllergies.push(allergy);
            }
        });

        if (addedAllergies.length > 0) {
            addedAllergies.map(async (allergyId) => {
                await prisma.studentAllergies.create({
                    data: {
                        studentId: Number(parameters.id),
                        allergyId: allergyId
                    }
                });
            });
        }

        var deletedAllergies: number[] = [];
        student.studentAllergies.map((studentAllergy) => {
            if (!selectedAllergies.allergyIdList.includes(studentAllergy.allergy.id)) {
                deletedAllergies.push(studentAllergy.allergy.id);
            }
        });

        if (deletedAllergies.length > 0) {
            await prisma.studentAllergies.deleteMany({
                where: {
                    studentId: Number(parameters.id),
                    allergyId: {
                        in: deletedAllergies
                    }
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
            return NextResponse.json({ error: "Szerverhiba" }, {status: 500});
        }
    }
}