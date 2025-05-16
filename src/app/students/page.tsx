import { auth } from "@/auth";
import StudentCard from "@/components/parent/students/studentCard";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
    const session = await auth();
        
    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.PARENT) {
        redirect("/forbidden");
    }

    const parent = await prisma.user.findUnique({
        where: {
            id: Number(session.user.id),
            role: Role.PARENT
        }
    });

    const studentList = parent ? await prisma.parentDetails.findUnique({
        where: {
            userId: Number(session.user.id)
        },
        select: {
            students: {
                select: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    }) : null;

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">Diákok</h1>
            </div>
            {(studentList) && (studentList.students.length > 0) 
            && 
                <ul className="mx-4 grid md:grid-cols-2 gap-5">
                    {studentList.students.map((studentInfo) => (
                        <li key={studentInfo.student.id}>
                            <StudentCard 
                                id={studentInfo.student.id} 
                                firstName={studentInfo.student.firstName} 
                                lastName={studentInfo.student.lastName}
                            />
                        </li>
                    ))}
                </ul>
            }
            {(!studentList) || (studentList.students.length < 1) && 
                <div className="mt-14">
                    <h1 className="text-center text-xl font-medium">Nincsenek önhöz tartozó diákok a rendeszerben</h1>
                </div>
            }
        </div>
    )
}