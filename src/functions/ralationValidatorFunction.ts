import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";

export async function isParent(parentId: number, studentId: number): Promise<boolean> {
    const parent = await prisma.user.findUnique({
        where: {
            id: Number(parentId)
        },
        select: {
            role: true,
            parentDetails: {
                select: {
                    students: {
                        select: {
                            studentId: true
                        }
                    }
                }
            }
        }
    });

    const student = await prisma.user.findUnique({
        where: {
            id: studentId
        },
        select: {
            role: true
        }
    });

    if (!student)
        return false;

    if (student.role !== Role.STUDENT)
        return false;

    if (!parent)
        return false;

    if (parent.role !== Role.PARENT)
        return false;

    if (!parent.parentDetails)
        return false;

    const parentStudentIdList = Array.from(parent.parentDetails.students.map((studentRelation) => (studentRelation.studentId)));

    if (!parentStudentIdList.includes(studentId))
        return false;

    return true;
} 