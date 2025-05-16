import { auth } from "@/auth";
import UserDataEditor from "@/components/profile/userDataEditor";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function UserProfilePage() {
    const session = await auth();

    if(!session) {
        redirect("/login");
    }

    if(session.user.role === Role.STUDENT) {
        redirect("/forbidden")
    }

    const userData = await prisma.user.findUnique({
        where: {
            id: Number(session.user.id)
        },
        select: {
            firstName: true,
            lastName: true,
            parentDetails: {
                select: {
                    emailAddress: true,
                    billingAddress: true
                }
            }
        }
    });

    if (!userData) {
        notFound();
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Felhasználói adatok módosítása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/profile"}
                >
                    Mégse
                </Link>
            </div>
            <div>                
                <UserDataEditor 
                    role={session.user.role}
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    emailAddress={userData.parentDetails?.emailAddress}
                    billingAddress={userData.parentDetails?.billingAddress}
                />
            </div>
        </div>
    )
}