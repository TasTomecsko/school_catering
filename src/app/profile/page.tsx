import { auth } from "@/auth";
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
        redirect("/forbidden");
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
                <h1 className="text-2xl font-medium py-2">Felhasználói adatok</h1>
            </div>
            <div className="max-w-md mx-auto mt-5 mb-10 border p-6 rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <p className="text-lg font-medium ">{userData.lastName} {userData.firstName}</p>
                    {(session.user.role === Role.PARENT) && <p className="text-lg font-medium">E-mail cím: {userData?.parentDetails?.emailAddress}</p>}
                    {(session.user.role === Role.PARENT) && <p className="text-lg font-medium">Számlázási cím: {userData?.parentDetails?.billingAddress}</p>}
                </div>
            </div>
            <div className="flex justify-center gap-12">
                <Link 
                    href={"/profile/changePassword"}
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Jelszó módosítása
                </Link>
                <Link 
                    href={"/profile/editUserDetails"}
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Adatok módosítása
                </Link>
            </div>
        </div>
    )
}