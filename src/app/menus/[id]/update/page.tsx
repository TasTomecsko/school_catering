import { auth } from "@/auth";
import EditMenuForm from "@/components/admin/menus/editMenuForm";
import { getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditMenuPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }

    const menu = await prisma.menu.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            startDate: true,
            endDate: true,
            activationDate: true
        }
    });

    if (!menu) {
        notFound();
    }

    if (menu.activationDate < new Date()) {
        redirect("/not-editable");
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Menü szerkesztése
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/menus/${id}`}
                >
                    Vissza
                </Link>
            </div>
            <EditMenuForm 
                startDate={getFormattedDateForDateSelect(menu.startDate)} 
                endDate={getFormattedDateForDateSelect(menu.endDate)} 
                activationDate={getFormattedDateForDateSelect(menu.activationDate)}
                id={Number(id)}
            />
        </div>
    )
}