import { getMonday, getSunday } from "../src/functions/dateHelperFunctions";
import { Role } from "../src/generated/prisma";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hasData = await prisma.user.findMany({
        select: {
            id: true
        }
    });

    if (hasData.length < 1) {
        // Allergének és allergiák felvétele a rendszerbe
        await prisma.allergy.createMany({
            data: [
                {
                    allergyDetails: "Glutén",
                    allergenDetails: "Glutént tartalmazó gabonafélék",
                },
                {
                    allergyDetails: "Rák",
                    allergenDetails: "Rákfélék és a belőlük készült termékek",
                },
                {
                    allergyDetails: "Tojás",
                    allergenDetails: "Tojás és a belőle készült termékek",
                },
                {
                    allergyDetails: "Hal",
                    allergenDetails: "Hal és a belőle készült termékek",
                },
                {
                    allergyDetails: "Mogyoró (földimogyoró)",
                    allergenDetails: "Földimogyoró és a belőle készült termékek",
                },
                {
                    allergyDetails: "Szója",
                    allergenDetails: "Szójabab és a belőle készült termékek",
                },
                {
                    allergyDetails: "Tej",
                    allergenDetails: "Tej és az abból készült termékek",
                },
                {
                    allergyDetails: "Diófélék",
                    allergenDetails: "Diófélék, azaz mandula, mogyoró, dió, kesudió, pekándió, brazil dió, pisztácia, makadámia vagy queenslandi dió és a belőle készült termékek",
                },
                {
                    allergyDetails: "Zeller",
                    allergenDetails: "Zeller és a belőle készült termékek",
                },
                {
                    allergyDetails: "Mustár",
                    allergenDetails: "Mustár és a belőle készült termékek",
                },
                {
                    allergyDetails: "Szezámmag",
                    allergenDetails: "Szezámmag és a belőle készült termékek",
                },
                {
                    allergyDetails: "Kén-dioxid / szulfit",
                    allergenDetails: "Kén-dioxid és az SO2-ben kifejezett szulfitok 10 mg/kg, illetve 10 mg/liter összkoncentrációt meghaladó mennyiségben",
                },
                {
                    allergyDetails: "Csillagfürt",
                    allergenDetails: "Csillagfürt és a belőle készült termékek",
                },
                {
                    allergyDetails: "Kagyló, tintahal, polip (puhatestűek)",
                    allergenDetails: "Puhatestűek és a belőlük készült termékek",
                }
            ]
        });

        //Admin felhasználó létrehozása
        const hashedAdminPass = await bcrypt.hash("a7K3m9Pq2B", 10);
        await prisma.user.create({
            data: {
                username: "ADMNUSER",
                password: hashedAdminPass,
                role: Role.ADMIN,
                firstName: "Ádám",
                lastName: "Admin"
            }
        });

        //Konyhai dolgozó létrehozása
        const hashedKitchenPass = await bcrypt.hash("T6nB8rX2qL", 10);
        await prisma.user.create({
            data: {
                username: "KTCHENUSER",
                password: hashedKitchenPass,
                role: Role.KITCHEN_WORKER,
                firstName: "Sándor",
                lastName: "Szakács"
            }
        });

        //Példa család létrehozása
        const hashedParent1Pass = await bcrypt.hash("M3pT7vQa9Z", 10);
        const hashedParent2Pass = await bcrypt.hash("r2Lx8BfN0K", 10);
        const parent1 = await prisma.user.create({
            data: {
                username: "PR0B4SKA",
                password: hashedParent1Pass,
                role: Role.PARENT,
                firstName: "Piroska",
                lastName: "Próba",
                parentDetails: {
                    create: {
                        emailAddress: "proba.piroska@test.te",
                        billingAddress: "8000 Álomliget, Szabadság utca 5."
                    }
                }
            }
        });
        const parent2 = await prisma.user.create({
            data: {
                username: "TES7T4MS",
                password: hashedParent2Pass,
                role: Role.PARENT,
                firstName: "Tamás",
                lastName: "Teszt",
                parentDetails: {
                    create: {
                        emailAddress: "teszt.tamas@test.te",
                        billingAddress: "8000 Álomliget, Szabadság utca 5."
                    }
                }
            }
        });

        const hashedStudent1Pass = await bcrypt.hash("C7qVm2Xn4P", 10);
        const hashedStudent2Pass = await bcrypt.hash("z5NwRt3K8A", 10);

        const student1 = await prisma.user.create({
            data: {
                username: "TES8T0MA",
                password: hashedStudent1Pass,
                role: Role.STUDENT,
                firstName: "Tamara",
                lastName: "Teszt"
            }
        });
        const student2 = await prisma.user.create({
            data: {
                username: "TES8T1ME",
                password: hashedStudent2Pass,
                role: Role.STUDENT,
                firstName: "Tímea",
                lastName: "Teszt"
            }
        });

        //Kapcsolatok létrehozása
        const parentDetail1 = await prisma.parentDetails.findUnique({
            where: {
                userId: parent1.id
            }
        });
        const parentDetail2 = await prisma.parentDetails.findUnique({
            where: {
                userId: parent2.id
            }
        });

        if (parentDetail1 && parentDetail2) {
            await prisma.studentParentRelations.createMany({
                data: [
                    {studentId: student1.id, parentDetailsId: parentDetail1.id},
                    {studentId: student1.id, parentDetailsId: parentDetail2.id},
                    {studentId: student2.id, parentDetailsId: parentDetail1.id},
                    {studentId: student2.id, parentDetailsId: parentDetail2.id}
                ]
            });
        }
        else {
            console.log("A szülő diák kapcsolatok nem jöttek létre!")
        }

        await prisma.studentAllergies.createMany({
            data: [
                {studentId: student1.id, allergyId: 1},
                {studentId: student1.id, allergyId: 3},
                {studentId: student1.id, allergyId: 7},

                {studentId: student2.id, allergyId: 5},
                {studentId: student2.id, allergyId: 8},
                {studentId: student2.id, allergyId: 6}
            ]
        });

        const thisMonday = getMonday();
        const thisFriday = new Date(getMonday().setDate(getMonday().getDate() + 4));
        const thisWeeksMenuActivation = new Date(getMonday().setDate(getMonday().getDate() - 2));
        const thisWeeksMenu = await prisma.menu.create({
            data: {
                activationDate: thisWeeksMenuActivation,
                startDate: thisMonday,
                endDate: thisFriday
            }
        });
        const meal1 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Rántott csirkemell, burgonyapüré",
                dateOfMeal: thisMonday,
                menuId: thisWeeksMenu.id
            }
        });
        const meal2 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Sárgaborsó főzelék, sült virsli",
                dateOfMeal: thisMonday,
                menuId: thisWeeksMenu.id
            }
        });
        const thisTuesday = new Date(getMonday().setDate(getMonday().getDate() + 1));
        const meal3 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Milánói sertésborda, tészta",
                dateOfMeal: thisTuesday,
                menuId: thisWeeksMenu.id
            }
        });
        const meal4 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Grillezett hal, párolt rízs",
                dateOfMeal: thisTuesday,
                menuId: thisWeeksMenu.id
            }
        });
        const thisWednesday = new Date(getMonday().setDate(getMonday().getDate() + 2));
        const meal5 = await prisma.meal.create({
        data: {
            code: "A",
            description: "Sajtos-tejfölös tészta",
            dateOfMeal: thisWednesday,
            menuId: thisWeeksMenu.id,
        },
        });
        const meal6 = await prisma.meal.create({
        data: {
            code: "B",
            description: "Zöldségleves, mákos tészta",
            dateOfMeal: thisWednesday,
            menuId: thisWeeksMenu.id,
        },
        });
        const thisThursday = new Date(getMonday().setDate(getMonday().getDate() + 3));
        const meal7 = await prisma.meal.create({
        data: {
            code: "A",
            description: "Spenótfőzelék, főtt tojás, főtt burgonya",
            dateOfMeal: thisThursday,
            menuId: thisWeeksMenu.id,
        },
        });
        const meal8 = await prisma.meal.create({
        data: {
            code: "B",
            description: "Sertéspörkölt, galuska",
            dateOfMeal: thisThursday,
            menuId: thisWeeksMenu.id,
        },
        });
        const meal9 = await prisma.meal.create({
        data: {
            code: "A",
            description: "Halrudak, rizibizi",
            dateOfMeal: thisFriday,
            menuId: thisWeeksMenu.id,
        },
        });
        const meal10 = await prisma.meal.create({
        data: {
            code: "B",
            description: "Rakott karfiol",
            dateOfMeal: thisFriday,
            menuId: thisWeeksMenu.id,
        },
        });
        await prisma.allergensInMeal.createMany({
            data: [
                // Hétfő
                { mealId: meal1.id, allergenId: 1 },
                { mealId: meal1.id, allergenId: 3 },
                { mealId: meal1.id, allergenId: 7 },

                { mealId: meal2.id, allergenId: 1 },
                { mealId: meal2.id, allergenId: 10 },

                // Kedd
                { mealId: meal3.id, allergenId: 1 },
                { mealId: meal3.id, allergenId: 7 },

                { mealId: meal4.id, allergenId: 4 },

                // Szerda
                { mealId: meal5.id, allergenId: 1 },
                { mealId: meal5.id, allergenId: 7 },

                { mealId: meal6.id, allergenId: 1 },
                { mealId: meal6.id, allergenId: 8 },

                // Csütörtök
                { mealId: meal7.id, allergenId: 3 },
                { mealId: meal7.id, allergenId: 7 },

                { mealId: meal8.id, allergenId: 1 },

                // Péntek
                { mealId: meal9.id, allergenId: 1 },
                { mealId: meal9.id, allergenId: 3 },
                { mealId: meal9.id, allergenId: 4 },

                { mealId: meal10.id, allergenId: 1 },
                { mealId: meal10.id, allergenId: 3 },
                { mealId: meal10.id, allergenId: 7 },
            ]
        });

        const order1 = await prisma.order.create({
            data: {
                studentId: student1.id,
                startDate: thisWeeksMenu.startDate,
                endDate: thisWeeksMenu.endDate
            }
        });

        await prisma.studentOrders.createMany({
            data: [
                {orderId: order1.id, mealId: meal4.id}
            ]
        });

        const order2 = await prisma.order.create({
            data: {
                studentId: student2.id,
                startDate: thisWeeksMenu.startDate,
                endDate: thisWeeksMenu.endDate
            }
        });

        await prisma.studentOrders.createMany({
            data: [
                {orderId: order2.id, mealId: meal2.id},
                {orderId: order2.id, mealId: meal4.id},
                {orderId: order2.id, mealId: meal8.id},
                {orderId: order2.id, mealId: meal9.id}
            ]
        })

        const nextMonday = new Date(getSunday().setDate(getSunday().getDate() + 1));
        const nextFriday = new Date(getSunday().setDate(getSunday().getDate() + 5));
        const nextWeeksMenuActivation = new Date(new Date().setDate(new Date().getDate() - 1));

        const nextWeeksMenu = await prisma.menu.create({
            data: {
                activationDate: nextWeeksMenuActivation,
                startDate: nextMonday,
                endDate: nextFriday,
            }
        });

        // Étkezési napok
        const nextTuesday = new Date(nextMonday);
        nextTuesday.setDate(nextMonday.getDate() + 1);
        const nextWednesday = new Date(nextMonday);
        nextWednesday.setDate(nextMonday.getDate() + 2);
        const nextThursday = new Date(nextMonday);
        nextThursday.setDate(nextMonday.getDate() + 3);

        // Ételek
        const meal11 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Paradicsomos húsgombóc, főtt burgonya",
                dateOfMeal: nextMonday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal12 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Zöldborsó főzelék, fasírt",
                dateOfMeal: nextMonday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal13 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Rakott kelkáposzta",
                dateOfMeal: nextTuesday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal14 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Túrós csusza, pirított szalonna",
                dateOfMeal: nextTuesday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal15 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Tarhonyás hús, csemegeuborka",
                dateOfMeal: nextWednesday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal16 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Zöldséges rizottó",
                dateOfMeal: nextWednesday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal17 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Húsleves, grízes tészta",
                dateOfMeal: nextThursday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal18 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Tökfőzelék, sült virsli",
                dateOfMeal: nextThursday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal19 = await prisma.meal.create({
            data: {
                code: "A",
                description: "Rántott hal, petrezselymes burgonya",
                dateOfMeal: nextFriday,
                menuId: nextWeeksMenu.id,
            }
        });
        const meal20 = await prisma.meal.create({
            data: {
                code: "B",
                description: "Sült csirkecomb, rizibizi",
                dateOfMeal: nextFriday,
                menuId: nextWeeksMenu.id,
            }
        });

        // Allergének hozzárendelése
        await prisma.allergensInMeal.createMany({
            data: [
                // Hétfő
                { mealId: meal11.id, allergenId: 1 },
                { mealId: meal11.id, allergenId: 3 },

                { mealId: meal12.id, allergenId: 1 },
                { mealId: meal12.id, allergenId: 3 },
                { mealId: meal12.id, allergenId: 7 },

                // Kedd
                { mealId: meal13.id, allergenId: 1 },

                { mealId: meal14.id, allergenId: 1 },
                { mealId: meal14.id, allergenId: 7 },

                // Szerda
                { mealId: meal15.id, allergenId: 1 },

                { mealId: meal16.id, allergenId: 1 },

                // Csütörtök
                { mealId: meal17.id, allergenId: 1 },
                { mealId: meal17.id, allergenId: 3 },
                { mealId: meal17.id, allergenId: 7 },

                { mealId: meal18.id, allergenId: 1 },
                { mealId: meal18.id, allergenId: 10 },

                // Péntek
                { mealId: meal19.id, allergenId: 1 },
                { mealId: meal19.id, allergenId: 4 },

                { mealId: meal20.id, allergenId: 1 }
            ]
        });

        console.log("Database seeded successfully");
    }
    else {
        console.log("Seeding aborted, database already contains data");
    }
}

main().then(async() => {
    await prisma.$disconnect();
}).catch(async(e) => {
    console.error(e);
    await prisma.$disconnect();
})