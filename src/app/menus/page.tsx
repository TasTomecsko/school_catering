import { auth } from "@/auth";
import MenuCard from "@/components/admin/menus/menuCard";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MenusPage() {
    const session = await auth();
    
    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }

    const menus = await prisma.menu.findMany({
        select: {
            id: true,
            startDate: true,
            endDate: true,
            activationDate: true
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">Menük</h1>
                <Link className="bg-green-700 p-2 rounded-lg hover:bg-green-600 text-white" href={"/menus/create"}>Új menü létrehozása</Link>
            </div>
            <div>
                <ul className="grid gap-2 lg:grid-cols-2">
                    {menus.map((menu) => (
                        <li key={menu.id}><MenuCard id={menu.id} startDate={menu.startDate} endDate={menu.endDate} activationDate={menu.activationDate}/></li>
                    ))}
                </ul>
            </div>
        </div>
    )
}