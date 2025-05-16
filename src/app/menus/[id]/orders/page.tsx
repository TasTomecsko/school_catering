import { auth } from "@/auth";
import OrderNavCard from "@/components/admin/orders/orderNavCard";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrdersPage({ params }: {params: {id: string}}) {
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
            id: true,
            startDate: true,
            endDate: true
        }
    });

    if (!menu) {
        notFound();
    }

    const orders = await prisma.order.findMany({
        where: {
            startDate: menu.startDate,
            endDate: menu.endDate
        },
        select: {
            id: true,
            student: {
                select: {
                    username: true,
                    firstName: true,
                    lastName: true
                }
            }
        },
        orderBy: [
            {
                student: {
                    lastName: "asc"
                }
            },
            {
                student: {
                    firstName: "asc"
                }
            }
        ]
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Rendelések
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/menus/${id}`}
                >
                    Vissza
                </Link>
            </div>
            {(orders.length > 0) &&
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {
                    orders.map((order) => (
                        <OrderNavCard 
                            key={order.id}
                            orderId={order.id}
                            menuId={menu.id}
                            studentUsername={order.student.username}
                            studentFirstName={order.student.firstName}
                            studentLastName={order.student.lastName}
                        />
                    ))
                }
            </div>}
            {(orders.length < 1) &&
                <div>
                    <p className="text-xl font-medium text-center">Erre a menüre nem érkeztek megrendelések</p>
                </div>
            }
        </div>
    )
}