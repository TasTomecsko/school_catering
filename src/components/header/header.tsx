import { Role } from "@/generated/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import SignInButton from "./signInButton";
import SignOutButton from "./singOutButton";
import MobileNav from "./mobileNav";

export default async function Header() {
    const session = await auth();
    var navlinks: {name: string, href: string}[] = [];

    switch (session?.user.role) {
        case Role.ADMIN: {
            navlinks = [
                { name: "Menük", href: "/menus" },
                { name: "Felhasználók", href: "/users" },
                { name: "Profil", href: "/profile" }
            ];
            break;
        }
        case Role.PARENT: {
            navlinks = [
                { name: "Diákok", href: "/students" },
                { name: "Profil", href: "/profile"}
            ];
            break;
        }
        case Role.STUDENT: {
            navlinks = [
                { name: "Rendelt étel", href: "/todaysMeal" }
            ];
            break;
        }
        case Role.KITCHEN_WORKER: {
            navlinks = [
                { name: "Rendelések", href: "/orders" },
                { name: "Profil", href: "/profile"}
            ];
            break;
        }
    }

    return (
        <header className="p-4 bg-gray-800 text-white h-14 flex justify-between">
            <div className="md:flex md:items-end hidden">
                <div>
                    {
                        (!session) && <SignInButton/>
                    }
                    {
                        (session) && <SignOutButton/>
                    }
                </div>
                <nav>
                    <ul className="flex gap-4 ml-4">
                        <li><Link href={"/"}>Heti menü</Link></li>
                        {navlinks?.map((link) => (<li key={link.href}><Link href={link.href}>{link.name}</Link></li>))}
                    </ul>
                </nav>
            </div>
            <div className="md:hidden">
                <MobileNav 
                    role={session ? session.user.role : null}
                    navlinks={navlinks}
                />
            </div>
            <div>
                <Link href={"/help"}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                </Link>
            </div>
        </header>
    )
}