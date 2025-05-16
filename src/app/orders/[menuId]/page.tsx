import { auth } from "@/auth";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrdersCollectionPage({ params }: {params: {menuId: string}}) {
    const session = await auth();
    const { menuId } = await params;
            
    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.KITCHEN_WORKER) {
        redirect("/forbidden");
    }

    const menu = await prisma.menu.findUnique({
        where: {
            id: Number(menuId)
        }
    });

    if (!menu) {
        notFound();
    }

    const mealsInOrder = await prisma.meal.findMany({
        where: {
            dateOfMeal: {
                gte: menu.startDate,
                lte: menu.endDate
            },
        },
        select: {
            id: true,
            code: true,
            description: true,
            dateOfMeal: true,
            _count: {
                select: {
                    studentOrders: true
                }
            }
        },
        orderBy: [
            {
                dateOfMeal: "asc"
            },
            {
                code: "asc"
            }
        ]
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Megrendelések
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/orders"}
                >
                    Vissza
                </Link>
            </div>
            <div className="grid gap-2">
                {
                    mealsInOrder.map((meal) => (
                        <div key={meal.id} className="max-w-md mx-auto border border-gray-400 p-6 rounded-xl shadow-lg text-center">
                            <p className="text-2xl">{meal.code}</p>
                            <p className="text-lg">{meal.description} {getFormattedDateForPage(meal.dateOfMeal)}</p>
                            <p className="text-lg">Megrendelések száma: {meal._count.studentOrders}</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}