import { auth } from "@/auth";
import MenuNavCard from "@/components/parent/menus/menuNavCard";
import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { isParent } from "@/functions/ralationValidatorFunction";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function AvailableMenusPage({ params }: {params: {id: string}}) {
    const session = await auth();
    const { id } = await params;

    if (!session) {
        redirect("/login");
    }

    const parent = await isParent(session.user.id, Number(id));

    const student = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            firstName: true,
            lastName: true,
            orders: {
                select: {
                    startDate: true
                }
            }
        }
    });

    if (!parent) {
        redirect("/forbidden");
    }

    if (!student) {
        notFound();
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const availableMenus = await prisma.menu.findMany({
        where: {
            activationDate: {
                lte: today
            },
            startDate: {
                gt: tomorrow
            }
        },
        select: {
            id: true,
            startDate: true,
            endDate: true
        },
        orderBy: {
            startDate: "asc"
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    {student.lastName} {student.firstName} elérhető menüi
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={"/students"}
                >
                    Vissza
                </Link>
            </div>
            {(availableMenus.length > 0) && <ul className="mx-4 grid md:grid-cols-2 gap-5">
                {availableMenus.map((menu) => (
                    <li key={menu.id}>
                        <MenuNavCard
                            menuId={menu.id}
                            studentId={Number(id)}
                            startDate={getFormattedDateForPage(menu.startDate)}
                            endDate={getFormattedDateForPage(menu.endDate)}
                            orderStartDates={Array.from(student?.orders.map((order) => (getFormattedDateForPage(order.startDate))))}
                        />
                    </li>
                ))}
            </ul>}
            {(availableMenus.length < 1) && <div>
                <p className="text-xl font-medium text-center">Jelenleg nincsen elérhető menü</p>
            </div>}
        </div>
    )
}