"use client"

import { Role } from "@/generated/prisma";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

interface Params {
    role: Role | null;
    navlinks: {name: string, href: string}[];
}

export default function MobileNav(params: Params) {
    const [isNavOpen, setIsNavOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsNavOpen(!isNavOpen)}>
                {(!isNavOpen) &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                    </svg>
                }
                {(isNavOpen) &&
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>

                }
            </button>
            {(isNavOpen) &&
                <div className="absolute top-[56px] 
                    left-0 bg-white w-3xs px-2 py-3 border 
                    border-gray-500 rounded-b-lg rounded-tr-lg"
                    >
                    <nav>
                        <ul className="text-black text-xl">
                            {
                                (!params.role) && 
                                <li>
                                    <button onClick={async () => await signIn()}>
                                        Bejelentkezés
                                    </button>
                                </li>
                            }
                            {
                                (params.role) && 
                                <li>
                                    <button onClick={async () => await signOut({redirectTo: "/"})}>
                                        Kijelentkezés
                                    </button>
                                </li>
                            }
                            <li className="mt-2.5" onClick={() => setIsNavOpen(false)}><Link href={"/"}>Heti menü</Link></li>
                            {params.navlinks?.map((link) => (
                                <li key={link.href} className="mt-2.5" onClick={() => setIsNavOpen(false)}>
                                    <Link href={link.href}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            }
        </>
    )
}