import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma";
import CreateUser from "@/types/users/createUser";
import bcrypt from "bcryptjs";
import StudentInfo from "@/types/users/studentInfo";
import ParentInfo from "@/types/users/parentInfo";
import { createUserSchema, parentInfoSchema, studentInfoSchema } from "@/zod/users";
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

        const userData: CreateUser = req.userInfo;
        const role: Role = req.role;
        const studentInfo: StudentInfo = role === Role.STUDENT ? req.studentInfo : null;
        const parentInfo: ParentInfo = role === Role.PARENT ? req.parentInfo : null;

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        if (role === Role.PARENT) {
            const combined = createUserSchema.merge(parentInfoSchema);
            combined.parse({...userData, ...parentInfo});
        }
        else if (role === Role.STUDENT) {
            const combined = createUserSchema.merge(studentInfoSchema);
            combined.parse({...userData, ...studentInfo});
        }
        else {
            createUserSchema.parse(userData);
        }

        const user = await prisma.user.findUnique({
            where: {
                username: userData.username
            }
        });

        if (user)
            return NextResponse.json({ error: "A megadott felhasználónév már foglalt" }, { status: 400 });

        switch (role) {
            case Role.ADMIN:
                await prisma.user.create({
                    data: {
                        role: Role.ADMIN,
                        username: userData.username,
                        password: hashedPassword,
                        isEnabled: true,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    }
                });
                break;
            case Role.KITCHEN_WORKER:
                await prisma.user.create({
                    data: {
                        role: Role.KITCHEN_WORKER,
                        username: userData.username,
                        password: hashedPassword,
                        isEnabled: true,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    }
                });
                break;
            case Role.PARENT:
                await prisma.user.create({
                    data: {
                        role: Role.PARENT,
                        username: userData.username,
                        password: hashedPassword,
                        isEnabled: true,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        parentDetails: {
                            create: {
                                emailAddress: parentInfo.email,
                                billingAddress: parentInfo.billingAddress
                            }
                        }
                    }
                });
                break;
            case Role.STUDENT:
                const parents = await prisma.parentDetails.findMany({
                    where: {
                        emailAddress: {
                            in: studentInfo.parentEmail
                        }
                    }
                });
                if (!parents) {
                    return NextResponse.json({ error: "A szülők nem találhatóak" }, { status: 400 });
                }
                const student = await prisma.user.create({
                    data: {
                        role: Role.STUDENT,
                        username: userData.username,
                        password: hashedPassword,
                        isEnabled: true,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    }
                });
                parents.map(async parent => {
                    await prisma.studentParentRelations.create({
                        data: {
                            studentId: student.id,
                            parentDetailsId: parent.id
                        }
                    });
                });
                break;
            default:
                return NextResponse.json({ error: "Hibás szerepkör" }, { status: 400 });
        }

        return NextResponse.json({ message: "Felhasználó létrehozva" }, { status: 201 })
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