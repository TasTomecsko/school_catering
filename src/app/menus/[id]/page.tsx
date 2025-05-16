import { auth } from "@/auth";
import MealCard from "@/components/admin/meals/mealCard";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function MenuPage({ params }: {params: {id: string}}) {
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
            activationDate: true,
            meals: {
                select: {
                    id: true,
                    code: true,
                    description: true,
                    dateOfMeal: true,
                },
                orderBy: [
                    {
                        dateOfMeal: 'asc'
                    },
                    {
                        code: "asc"
                    }
                ]
            }
        }
    });

    if (!menu) {
        notFound();
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Menü részletei
                </h1>
                <Link className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" href={"/menus"}>Vissza</Link>
            </div>
            <div className="max-w-lg mx-auto mt-5 border p-6 rounded-xl shadow-lg" >
                <div className="flex flex-col items-center">
                    <p className="text-lg font-medium">Kezdési dátum: {getFormattedDateForPage(menu.startDate)}</p>
                    <p className="text-lg font-medium">Befejezési dátum: {getFormattedDateForPage(menu.endDate)}</p>
                    <p className="text-lg font-medium">Aktiválási dátum: {getFormattedDateForPage(menu.activationDate)}</p>
                </div>
                <div className="flex justify-center mt-2.5">
                    {(menu.activationDate.getTime() > new Date().getTime()) 
                        && 
                    <Link
                        href={`/menus/${id}/update`}
                        className="bg-yellow-500 p-2 rounded-lg hover:bg-yellow-400 text-black"
                    >
                        Módosítás
                    </Link>}
                </div>
                <div  className="flex justify-center mt-2.5">
                    <Link 
                        href={`/menus/${id}/orders`}
                        className="bg-blue-700 p-2 rounded-lg hover:bg-blue-600 text-white"
                    >
                        Leadott megrendelések
                    </Link>
                </div>
            </div>
            <div className="mx-3.5 mt-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-medium py-2">
                        Ételek
                    </h1>
                    {(menu.activationDate.getTime() > new Date().getTime()) 
                        && 
                    <Link className="bg-green-700 p-2 rounded-lg hover:bg-green-600 text-white" 
                        href={`/menus/${id}/createMeal`}
                    >
                        Étel hozzáadása
                    </Link>}
                </div>
                <ul className="mt-2.5">
                    {menu.meals.map((meal) => (
                        <li key={meal.id}>
                            <MealCard 
                                id={meal.id} 
                                menuId={Number(id)}
                                dateOfMeal={meal.dateOfMeal}
                                code={meal.code}
                                description={meal.description}
                                isEditable={menu.activationDate > new Date()}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}