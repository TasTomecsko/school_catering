import { auth } from "@/auth";
import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import ParentInfo from "@/types/users/parentInfo";
import StudentInfo from "@/types/users/studentInfo";
import EditUser from "@/types/users/editUser";
import { parentInfoSchema, studentInfoSchema, updateUserSchema } from "@/zod/users";
import { z } from "zod";

export async function PATCH(request: NextRequest,  { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const session = await auth();
        const parameters = await params;

        const id = Number(parameters.id);
        const req = await request.json();

        const userInfo: EditUser = req.userInfo;
        const role: Role = req.role;
        const studentInfo: StudentInfo = role === Role.STUDENT ? req.studentInfo : null;
        const parentInfo: ParentInfo = role === Role.PARENT ? req.parentInfo : null;

        if (!session?.user) {
            return NextResponse.json({ error: "Illetéktelen" }, { status: 401 });
        }

        if (session.user.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
        }

        if (id === Number(session.user.id)) {
            return NextResponse.json({ error: "A felhasználó nem módosíthatja saját állapotát" }, { status: 403 });
        }

        const userToEdit = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!userToEdit) {
            return NextResponse.json({ error: "Felhasználó nem található" }, {status: 404});
        }

        if (userToEdit.role !== role) {
            return NextResponse.json({ error: "Hibás kérelem" }, {status: 400})
        }

        if (role == Role.PARENT) {
            const combined = updateUserSchema.merge(parentInfoSchema);
            combined.parse({...userInfo, ...parentInfo});
        }
        else if (role == Role.STUDENT) {
            const combined = updateUserSchema.merge(studentInfoSchema);
            combined.parse({...userInfo, ...studentInfo});
        }
        else {
            updateUserSchema.parse(userInfo);
        }

        switch (role) {
            case Role.ADMIN: {
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName
                    }
                });
                break;
            }
            case Role.KITCHEN_WORKER: {
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName
                    }
                });
                break;
            }
            case Role.PARENT: {
                await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        parentDetails: {
                            update: {
                                emailAddress: parentInfo.email,
                                billingAddress: parentInfo.billingAddress
                            }
                        }
                    }
                });
                break;
            }
            case Role.STUDENT: {
                const studentParents = await prisma.user.update({
                    where: {
                        id: id
                    },
                    data: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName
                    },
                    select: {
                        parents: {
                            select: {
                                parentDetails: {
                                    select: {
                                        emailAddress: true
                                    }
                                }
                            }
                        }
                    }
                });
                
                var deletedParents: string[] = [];
                studentParents.parents.forEach((parentEmail) => {
                    if(!studentInfo.parentEmail.includes(parentEmail.parentDetails.emailAddress))
                        deletedParents.push(parentEmail.parentDetails.emailAddress);
                });
                var addedParents: string[] = [];
                studentInfo.parentEmail.forEach((parentEmail) => {
                    if(!studentParents.parents.some((p) => p.parentDetails.emailAddress === parentEmail))
                        addedParents.push(parentEmail);
                });

                if (deletedParents.length > 0)
                    await prisma.studentParentRelations.deleteMany({
                        where: {
                            studentId: userToEdit.id,
                            parentDetails: {
                                emailAddress: {
                                    in: deletedParents
                                }
                            }
                        }
                    });
                if (addedParents.length > 0) {
                    const addedParentDetailIds = await prisma.parentDetails.findMany({
                        where: {
                            emailAddress: {
                                in: addedParents
                            }
                        },
                        select: {
                            id: true
                        }
                    });
                    addedParentDetailIds.map(async parentDetails => {
                        await prisma.studentParentRelations.create({
                            data: {
                                studentId: userToEdit.id,
                                parentDetailsId: parentDetails.id
                            }
                        });
                    });
                }                        
                break;
            }
        }

        return NextResponse.json({ status: 200 });
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