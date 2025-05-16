import { auth } from "@/auth";
import { getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export default async function TodaysMealPage() {
    const session = await auth();
        
    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.STUDENT) {
        redirect("/forbidden");
    }

    const order = await prisma.studentOrders.findFirst({
        where: {
            order: {
                studentId: Number(session.user.id),
                startDate: {
                    lte: new Date()
                },
                endDate: {
                    gte: new Date()
                }
            }
        }
    });

    const meal = order ? await prisma.studentOrders.findFirst({
        where: {
            orderId: order.orderId,
            meal: {
                dateOfMeal: new Date(getFormattedDateForDateSelect(new Date()))
            }
        },
        select: {
            meal: {
                select: {
                    code: true,
                    description: true
                }
            }
        }
    }) : null;

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Mai menü
                </h1>
            </div>
            <div className="max-w-md mx-auto mt-10 p-6 rounded-xl border border-gray-200 shadow-lg text-center">
                {(meal) && <>
                    <p className="text-2xl">{meal.meal.code}</p>
                    <p className="text-lg">{meal.meal.description}</p>
                </>}
                {(!meal) &&
                    <p className="text-2xl">A mai napra nincsen rendelésed</p>
                }
            </div>
        </div>
    )
}