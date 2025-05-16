import { auth } from "@/auth";
import OrderCard from "@/components/parent/orders/orderCard";
import { isParent } from "@/functions/ralationValidatorFunction";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function RemoveOrderPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;
        
    if (!session) {
        redirect("/login");
    }

    const parent = await isParent(session.user.id, Number(id));

    if (!parent) {
        redirect("/forbidden");
    }

    const student = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            firstName: true,
            lastName: true
        }
    });

    if (!student) {
        notFound();
    }

    const orders = await prisma.order.findFirst({
        where: {
            studentId: Number(id),
            startDate: {
                lte: new Date()
            },
            endDate: {
                gte: new Date()
            }
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
                            dateOfMeal: "asc",
                        }
                    },
                    {
                        meal: {
                            code: "asc"
                        }
                    }
                ]
            }
        }
    });

    if (!orders) {
    }

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    {student.lastName} {student.firstName} rendeléseinek lemondása
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/students"}
                >
                    Mégsem
                </Link>
            </div>
            {(orders) &&
                <>
                <p className="text-red-700 text-lg">Figyelem! A lemondások véglegesek, nem lehet őket módosítani!</p>
                <div className="grid gap-2 lg:grid-cols-2 mt-5 mx-4">
                    {
                        orders.studentOrders.map((order) => (
                            <OrderCard 
                                key={order.meal.id}
                                orderId={orders.id}
                                mealId={order.meal.id}
                                code={order.meal.code}
                                description={order.meal.description}
                                dateOfMeal={order.meal.dateOfMeal}
                                studentId={Number(id)}
                            />
                        ))
                    }
                </div>
                </>
            }
            {(!orders) &&
                <div>
                    <p className="text-xl font-medium text-center">
                        Ennek a diáknak erre az időszakra nincsnek megrendelései
                    </p>
                </div>
            }
        </div>
    )
}