import { auth } from "@/auth";
import HelpSection from "@/components/help/section";
import { Role } from "@/generated/prisma";
import Link from "next/link";

export default async function HelpPage() {
    const session = await auth();

    return (
        <div className="mx-6 my-10">
            {/*Azonosítatlan felhasználó gyik*/}
            {(!session) &&
                <HelpSection sectionTitle="Bejelentkezés" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/login"} className="text-blue-700 underline">bejelentkezés</Link> oldalra</>
                        )
                    },
                    {step: "Adja meg a felhasználónevét"},
                    {step: "Adja meg a jelszavát"},
                    {step: "Kattintson a bejelentkezés gombra"}
                ]} />
            }

            {/*Adminisztrátor felhasználó gyik*/}
            {(session?.user.role === Role.ADMIN) &&
                <>
                {/*Felhasználókkal kapcsolatos tevékenységek*/}
                <HelpSection sectionTitle="Felhasználó létrehozása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/users"} className="text-blue-700 underline">felhasználók</Link> oldalra</>
                        )
                    },
                    {step: `Kattintson az "Új felhasználó hozzáadása" gombra`},
                    {step: "Válassza ki az új felhasználó szerepkörét (alapból szülő)"},
                    {step: "Töltse ki az üres mezőket"},
                    {step: `Kattintson a "Felhasználó létrehozása" gombra`}
                ]} />

                <HelpSection sectionTitle="Felhasználó módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/users"} className="text-blue-700 underline">felhasználók</Link> oldalra</>
                        )
                    },
                    {step: `Válassza ki a módosítani kívánt felhasználót, 
                        és kattintson a felhasználó sorában található "Módosítás" gombar`},
                    {step: "Módosítsa a megfelelő adatokat"},
                    {step: `Kattintson a "Felhasználó módosítása" gombra`}
                ]} />

                <HelpSection sectionTitle="Felhasználó letiltása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/users"} className="text-blue-700 underline">felhasználók</Link> oldalra</>
                        )
                    },
                    {step: `Válassza ki a felhasználót akit le kíván tiltani, 
                        és kattintson a felhasználó sorában található "Letiltás" gombar`}
                ]} />

                <HelpSection sectionTitle="Felhasználó újraaktiválása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/users"} className="text-blue-700 underline">felhasználók</Link> oldalra</>
                        )
                    },
                    {step: `Válassza ki a felhasználót akit újra szeretne aktiválni, 
                        és kattintson a felhasználó sorában található "Engedélyezés" gombar`}
                ]} />

                {/*Menükkel kapcsolatos tevékenységek*/}
                <HelpSection sectionTitle="Menü létrehozása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Kattintson az "Új menü létrehozása" gombra`},
                    {step: "Töltse ki az üres mezőket, ügyelve arra, hogy az aktivációs " + 
                        "dátum és a kezdődátum között kettő napnak kell lennie legalább, " +
                        "és a végdátum nem lehet a kezdődátum előtt"},
                    {step: `Kattintson a "Menü létrehozása" gombra`}
                ]} />

                <HelpSection sectionTitle="Menü módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a módosítani kívánt menüt és kattintson a "Részletek" gombra a menü kártyán`},
                    {step: `A menüdatokat tartalmazó kártyában kattintson a "Módosítás" gombra`},
                    {step: "Módosítsa a menüadatokat"},
                    {step: `Kattintson a "Menü módosítása" gombra`}
                ]} />

                <HelpSection sectionTitle="Menü törlése" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a törölni kívánt menüt és kattintson a "Törlés" gombra a menü kártyán`}
                ]} />

                {/*Ételekkel kapcsolatos tevékenységek*/}
                <HelpSection sectionTitle="Étel hozzáadása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a menüt amihez étel szeretne hozzáadni és kattintson a 
                        "Részletek" gombra a menü kártyán`},
                    {step: `Kattintson az "Étel hozzáadása" gombra`},
                    {step: "Töltse ki az üres mezőket az űrlapon"},
                    {step: `Kattinton az "Étel létrehozása" gombra`}
                ]} />

                <HelpSection sectionTitle="Étel módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a menüt amiben az ételt módoítani 
                        szeretné és kattintson a "Részletek" gombra a menü kártyán`},
                    {step: `Az "Ételek" szekció alatt válassza ki a módosítani 
                        kívánt ételt és kattintson a "Szerkesztés" gombra`},
                    {step: "Módosítsa az étel adatait"},
                    {step: `Kattintson az "Étel módosítása" gombra`}
                ]} />

                <HelpSection sectionTitle="Étel törlése" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a menüt amiből az ételt törölni 
                        szeretné és kattintson a "Részletek" gombra a menü kártyán`},
                    {step: `Az "Ételek" szekció alatt válassza ki a törölni 
                        kívánt ételt és kattintson a "Törlés" gombra`}
                ]} />

                {/*Rendelésekkel kapcsolatos tevékenységek*/}
                <HelpSection sectionTitle="Diák rendelésének lemondása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/menus"} className="text-blue-700 underline">menük</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a menüt aminek a rendeléseit ellenőrizni szertné és 
                        kattintson a "Részletek" gombra a menü kártyán`},
                    {step: `A menüdatokat tartalmazó kártyában kattintson a "Leadott megrendelések" gombra`},
                    {step: "Keresse meg a diákot akinek a rendeléseit módosítani szertné és kattintson a kártyájára"},
                    {step: `Keresse meg a étkezést amit le szeretne mondani és 
                        kattintson a kártyán található "Rendelés lemondása" gombra`}
                ]} />
                </>
            }

            {/*Szülő felhasználó gyik*/}
            {(session?.user.role === Role.PARENT) &&
                <>
                {/*Diákokkal kapcsolatos tevékenységek*/}
                <HelpSection sectionTitle="Diák adatainak módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/students"} className="text-blue-700 underline">diákok</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a diákot akinek az adatait módosítani 
                        szeretné és kattintson az "Adatok szerkesztése" gombra`},
                    {
                        step: "Diák nevének módosítása:",
                        subSteps: [
                            {subStep: "Módosítsa a vezetéknevet"},
                            {subStep: "Módosítsa a keresztnevet"},
                            {subStep: `Kattintson az "Adatok mentése" gombra`}
                        ]
                    },
                    {
                        step: "Diák allergiáinak megadása:",
                        subSteps: [
                            {subStep: "Válassza ki a diák allergiáit a listából"},
                            {subStep: `Kattintson a "Diák allergiáinak módosítása" gombra`}
                        ]
                    }
                ]} />

                <HelpSection sectionTitle="Diák rendelésének leadása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/students"} className="text-blue-700 underline">diákok</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a diákot akinek a részére a rendelést
                        le szeretné adni és kattintson az "Elérhető menük" gombra`},
                    {step: `Az elérhető menük közül válassza ki azt a menüt amire
                        rendelést szeretne leadni és kattintson a kártyára`},
                    {step: `Válassza ki az étel listából azokat az ételeket, melyeket
                        szeretné megrendelni a diák számára`},
                    {step: `Kattintson a "Rendelés leadása" gombra`}
                ]} />

                <HelpSection sectionTitle="Diák rendelésének lemondáas" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/students"} className="text-blue-700 underline">diákok</Link> oldalra</>
                        )
                    },
                    {step: `Keresse meg a diákot akinek a részére a rendelést
                        le szeretné mondani és kattintson az "Rendelések kezelése" gombra`},
                    {step: (
                        <>
                        A megrendelt ételek közül válassza ki azt, amelyiket le szeretné mondani, és 
                            kattintson a "Rendelés lemondása" gombra. <br/>
                            <span className="text-red-700">
                                Kérem vegye figyelembe, hogy a rendelések az étkezés napja előtti 
                                napon délig (12:00) mondhatóak le.
                            </span>
                        </>
                    )}
                ]} />
                </>
            }

            {/*Diák felhasználó gyik*/}
            {(session?.user.role === Role.STUDENT) &&
                <HelpSection sectionTitle="Napi rendelés megtekintése" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/todaysMeal"} className="text-blue-700 underline">napi menü</Link> oldalra</>
                        )
                    }
                ]} />
            }

            {/*Konyhai dolgozó felhasználó gyik*/}
            {(session?.user.role === Role.KITCHEN_WORKER) &&
                <HelpSection sectionTitle="Rendelések részleteinek megtekintése" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/orders"} className="text-blue-700 underline">rendelések</Link> oldalra</>
                        )
                    },
                    {step: "Válassza ki a menüt, aminek a részleteit meg szeretné tekinteni, " +
                        "és kattintson a kártyájára"}
                ]} />
            }

            {/*Általános felhasználói gyik*/}
            {(session?.user.role !== Role.STUDENT) &&
                <>
                <HelpSection sectionTitle="Jelszó módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/profile"} className="text-blue-700 underline">profil</Link> oldalra</>
                        )
                    },
                    {step: `Kattintson a "Jelszó módosítása" gombra`},
                    {step: "Adja meg a régi jelszavát"},
                    {step: "Adja meg az új jelszavát"},
                    {step: `Kattintson a "Jelszó mentése" gombra`}
                ]} />

                <HelpSection sectionTitle="Személyes adatok módosítása" steps={[
                    {
                        step: (
                            <>Navigáljon a <Link href={"/profile"} className="text-blue-700 underline">profil</Link> oldalra</>
                        )
                    },
                    {step: `Kattintson a "Adatok módosítása" gombra`},
                    {step: "Változtassa meg az adatokat"},
                    {step: `Kattintson az "Adatok mentése" gombra`}
                ]} />
                </>
            }
        </div>
    )
}