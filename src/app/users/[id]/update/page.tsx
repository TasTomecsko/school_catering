import { auth } from "@/auth";
import UpdateUserForm from "@/components/admin/users/updateUserForm";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function UpdateUserPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }
    
    if (session.user.id == Number(id)) {
        redirect("/forbidden");
    }

    const userToUpdate = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            firstName: true,
            lastName: true,
            role: true,
            parentDetails: {
                select: {
                    emailAddress: true,
                    billingAddress: true,
                }
            },
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

    const parentDetails = await prisma.parentDetails.findMany({
        select: {
            emailAddress: true
        }
    });

    if (!userToUpdate) {
        notFound();
    }

    const studentParentEmails = Array.from(userToUpdate.parents.map((parent) => 
        (parent.parentDetails.emailAddress)
    ));

    const parentEmails = Array.from(parentDetails.map((detail) => 
        ({label: detail.emailAddress, value: detail.emailAddress})
    ));

    return (
        <div>
             <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">Felhasználó adatainak módosítása</h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/users"}
                >
                    Mégsem
                </Link>
            </div>
            <UpdateUserForm 
                id={Number(id)}
                userRole={userToUpdate.role}
                firstName={userToUpdate.firstName}
                lastName={userToUpdate.lastName}
                parentDetails={userToUpdate.parentDetails}
                studentParentEmailAddresses={studentParentEmails}
                parentEmailAddresses={parentEmails}
            />
        </div>
    );
}