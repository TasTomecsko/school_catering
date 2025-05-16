import { auth } from "@/auth";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrdersPage() {
    const session = await auth();
        
    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.KITCHEN_WORKER) {
        redirect("/forbidden");
    }

    const menus = await prisma.menu.findMany({
        where: {
            activationDate: {
                lte: new Date()
            }
        },
        select: {
            id: true,
            startDate: true,
            endDate: true
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Rendelések
                </h1>
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                {
                    menus.map((menu) => (
                        <Link key={menu.id} href={`/orders/${menu.id}`}>
                            <div className="bg-white shadow-md rounded-xl p-6 border 
                            border-gray-200 hover:shadow-lg transition-shadow cursor-pointer text-center">
                                <p className="text-lg">{getFormattedDateForPage(menu.startDate)} - {getFormattedDateForPage(menu.endDate)}</p>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}