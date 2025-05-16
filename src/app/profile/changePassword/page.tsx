import { auth } from "@/auth";
import PasswordEdit from "@/components/profile/passwordEdit";
import { Role } from "@/generated/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
    const session = await auth();

    if(!session) {
        redirect("/login");
    }

    if(session.user.role === Role.STUDENT) {
        redirect("/forbidden");
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Jelszó módosítása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/profile"}
                >
                    Mégse
                </Link>
            </div>
            <div>
                <PasswordEdit />
            </div>
        </div>
    )
}