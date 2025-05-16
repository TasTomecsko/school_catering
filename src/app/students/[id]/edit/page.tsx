import { auth } from "@/auth";
import AllergieSelector from "@/components/parent/students/allergieSelector";
import StudentDataEditor from "@/components/parent/students/studentDataEditor";
import { isParent } from "@/functions/ralationValidatorFunction";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function StudentPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;
        
    if (!session) {
        redirect("/login");
    }

    const parent = await isParent(session.user.id, Number(id));

    const student = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            firstName: true,
            lastName: true,
            role: true,
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
        notFound();
    }

    if (!parent) {
        redirect("/forbidden");
    }

    const allergies = await prisma.allergy.findMany({
        select: {
            id: true,
            allergyDetails: true
        },
        orderBy: {
            allergyDetails: "asc"
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Diák adatainak módosítása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/students"}
                >
                    Vissza
                </Link>
            </div>
            <StudentDataEditor
                id={Number(id)}
                firstName={student.firstName}
                lastName={student.lastName} 
            />
            <AllergieSelector 
                studentId={Number(id)}
                studentAllergiesIdList={Array.from(student.studentAllergies.map((studentAllergy) => (studentAllergy.allergy.id)))}
                allergieList={Array.from(allergies.map((allergy) => ({ value: allergy.id, label: allergy.allergyDetails })))}
            />
        </div>
    )
}