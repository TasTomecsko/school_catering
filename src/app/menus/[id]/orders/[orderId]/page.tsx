import { auth } from "@/auth";
import StudentOrderCard from "@/components/admin/orders/studentOrderCard";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function StudentOrdersPage({ params }: {params: {id: string, orderId: string}}) {
    const session = await auth();
    const { id, orderId } = await params;

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
            id: true,
            startDate: true,
            endDate: true
        }
    });

    if (!menu) {
        notFound();
    }

    const order = await prisma.order.findUnique({
        where: {
            id: Number(orderId)
        },
        select: {
            id: true,
            studentOrders: {
                select: {
                    meal: {
                        select: {
                            id: true,
                            code: true,
                            description: true,
                            dateOfMeal: true
                        }
                    }
                },
                orderBy: [
                    {
                        meal: {
                            dateOfMeal: "asc"
                        }
                    },
                    {
                        meal: {
                            code: "asc"
                        }
                    }
                ]
            },
            student: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    });

    if (!order) {
        notFound();
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    {order.student.lastName} {order.student.firstName} rendelésének lemondása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/menus/${id}/orders`}
                >
                    Vissza
                </Link>
            </div>
            <div className="grid gap-2">
                {
                    order.studentOrders.map((studentOrder) => (
                        <StudentOrderCard
                            key={studentOrder.meal.id}
                            orderId={order.id}
                            mealId={studentOrder.meal.id}
                            code={studentOrder.meal.code}
                            description={studentOrder.meal.description}
                            dateOfMeal={studentOrder.meal.dateOfMeal}
                            menuId={Number(id)}
                        />
                    ))
                }
            </div>
        </div>
    )
}