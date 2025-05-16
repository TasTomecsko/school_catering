import { auth } from "@/auth";
import CreateUserForm from "@/components/admin/users/createUserForm";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreateUserPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden")
    }

    const parentEmails = await prisma.parentDetails.findMany({
        select: {
            emailAddress: true
        }
    });

    const emailAddresses = Array.from(parentEmails.map((detail) => ({label: detail.emailAddress, value: detail.emailAddress})))

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">Felhasználó létrehozása</h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/users"}
                >
                    Mégsem
                </Link>
            </div>
            <CreateUserForm emailAddresses={emailAddresses} />
        </div>
    );
}