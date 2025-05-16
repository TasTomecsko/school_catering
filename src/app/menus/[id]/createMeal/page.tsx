import { auth } from "@/auth";
import CreateMealForm from "@/components/admin/meals/createMealForm";
import { getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function CreateMealPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }

    const selectedMenu = await prisma.menu.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            startDate: true,
            endDate: true,
            activationDate: true
        }
    });

    if (!selectedMenu) {
        notFound();
    }

    if (selectedMenu.activationDate.getTime() < new Date().getTime()) {
        redirect("/not-editable");
    }

    const allergens = await prisma.allergy.findMany({
        select: {
            id: true,
            allergenDetails: true
        },
        orderBy: {
            allergenDetails: "asc"
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Étel hozzáadása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/menus/${id}`}
                >
                    Vissza
                </Link>
            </div>
            <CreateMealForm 
                menuId={Number(id)} 
                startDate={getFormattedDateForDateSelect(selectedMenu.startDate)}
                endDate={getFormattedDateForDateSelect(selectedMenu.endDate)}
                allergenList={Array.from(allergens.map((allergen) => ({value: allergen.id, label: allergen.allergenDetails})))}
            />
        </div>
    )
}