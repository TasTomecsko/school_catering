import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { Role } from "@/generated/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UsersPage({searchParams}: {searchParams?: {page?: string, query?: string}}) {
    const session = await auth();
    const params = await searchParams;
    const MAX_USERS_ON_PAGE = 10;

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }

    const query = params?.query?.toLocaleLowerCase() || "";
    var page = 1;
    if (params?.page) {
        page = parseInt(params.page || "1", 10);
    }
    else {
        page = 1
    }
    
    const users = await prisma.user.findMany({
        where: {
            AND: [
                {
                    NOT: {
                        id: Number(session?.user.id)
                    }
                },
                {
                    OR: [
                        {username: {contains: query, mode: "insensitive"}},
                        {firstName: {contains: query, mode: "insensitive"}},
                        {lastName: {contains: query, mode: "insensitive"}}
                    ]
                }
            ]
        },
        select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            isEnabled: true
        },
        orderBy: [
            {
                role: "asc"
            },
            {
                lastName: "asc"
            },
            {
                firstName: "asc"
            }
        ],
        skip: (page - 1) * MAX_USERS_ON_PAGE,
        take: MAX_USERS_ON_PAGE
    });

    const numUsers = await prisma.user.count({
        where: {
            AND: [
                {
                    NOT: {
                        id: Number(session?.user.id)
                    }
                },
                {
                    OR: [
                        {username: {contains: query, mode: "insensitive"}},
                        {firstName: {contains: query, mode: "insensitive"}},
                        {lastName: {contains: query, mode: "insensitive"}}
                    ]
                }
            ]
        }
    });

    const totalPages: number = Math.ceil(numUsers / MAX_USERS_ON_PAGE);

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">Felhasználók</h1>
                <Link 
                    className="bg-green-700 p-2 rounded-lg hover:bg-green-600 text-white" 
                    href={"/users/create"}
                >
                    Új felhasználó hozzáadása
                </Link>
            </div>
            <div className="flex justify-center">
                <form className="p-4 flex flex-col gap-4 border rounded-xl">
                    <input
                        type="text"
                        name="query"
                        placeholder="Keresés..."
                        defaultValue={query}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex justify-center">
                        <button type="submit" className="bg-blue-700 p-2 rounded-lg hover:bg-blue-600 text-white">
                            Keresés
                        </button>
                    </div>
                </form>
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto min-w-[1024px] w-full text-sm text-center border-collapse mt-10">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-2 font-medium">Felhasználónév</th>
                            <th className="px-4 py-2 font-medium">Keresztnév</th>
                            <th className="px-4 py-2 font-medium">Vezetéknév</th>
                            <th className="px-4 py-2 font-medium">Szerepkör</th>
                            <th className="px-4 py-2 font-medium">Státusz</th>
                            <th className="px-4 py-2 font-medium">Akciók</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr className="border-t border-gray-200" key={user.id}>
                                <td className="px-4 py-2">{user.username}</td>
                                <td className="px-4 py-2">{user.firstName}</td>
                                <td className="px-4 py-2">{user.lastName}</td>
                                <td className="px-4 py-2">
                                    {
                                        (() => {
                                            switch (user.role) {
                                                case Role.ADMIN:
                                                    return "Adminisztrátor";
                                                case Role.KITCHEN_WORKER:
                                                    return "Konyhai dolgozó";
                                                case Role.PARENT:
                                                    return "Szülő";
                                                case Role.STUDENT:
                                                    return "Tanuló";
                                                default:
                                                    return null;
                                            }
                                        })()
                                    }
                                </td>
                                <td className="px-4 py-2">{user.isEnabled ? 
                                    <span className="text-green-700">Aktív</span> 
                                    : 
                                    <span className="text-red-700">Tiltott</span>}
                                </td>
                                <td className="grid gap-1 px-4 py-2">
                                    <Link 
                                        href={`/users/${user.id}/update`}
                                        className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                                    >
                                        Módosítás
                                    </Link>
                                    <form action={async () => {
                                        "use server"
                                        await prisma.user.update({
                                            where: {id: user.id},
                                            data: {
                                                isEnabled: user.isEnabled ? false : true
                                            }
                                        });
                                        redirect("/users");
                                    }}>
                                        <button 
                                            type="submit" 
                                            className={`${user.isEnabled ? "bg-red-700 hover:bg-red-600" : "bg-green-700 hover:bg-green-600"} p-2 rounded-lg text-white`}
                                        >
                                            {user.isEnabled ? "Tiltás" : "Engedélyezés"}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <Link
                        key={i}
                        href={{
                            pathname: "/users",
                            query: {
                                page: i + 1,
                                query,
                            },
                        }}
                        className={`px-4 py-2 border rounded-md ${
                            page === i + 1 ? 
                            "bg-blue-700 hover:bg-blue-600 text-white"
                            :
                            "bg-white hover:bg-blue-200 text-black"
                        }`}
                    >
                        {i + 1}
                    </Link>
                ))}
            </div>
        </div>
    )
}