import { auth } from "@/auth";
import EditMealForm from "@/components/admin/meals/editMealForm";
import { getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function MenuPage({ params }: {params: {id: string, mealId: string}}) {
    const session = await auth();
    const { id, mealId } = await params;

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== Role.ADMIN) {
        redirect("/forbidden");
    }

    const meal = await prisma.meal.findUnique({
        where: {
            menuId: Number(id),
            id: Number(mealId)
        },
        select: {
            code: true,
            description: true,
            dateOfMeal: true,
            menu: {
                select: {
                    startDate: true,
                    endDate: true,
                    activationDate: true
                }
            }
        }
    });

    if (!meal) {
        notFound();
    }

    if (meal.menu.activationDate.getTime() < new Date().getTime()) {
       redirect("/not-editable");
    }

    const allergenList = await prisma.allergy.findMany({
        select: {
            id: true,
            allergenDetails: true
        },
        orderBy: {
            allergenDetails: "asc"
        }
    });

    const mealAllergens = await prisma.allergensInMeal.findMany({
        where: {
            mealId: Number(mealId)
        },
        select: {
            allergenId: true
        }
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    Étel szerkesztése
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/menus/${id}`}
                >
                    Vissza
                </Link>
            </div>
            <EditMealForm 
                startDate={getFormattedDateForDateSelect(meal.menu.startDate)} 
                endDate={getFormattedDateForDateSelect(meal.menu.endDate)}
                menuId={Number(id)}
                mealId={Number(mealId)}
                dateOfMeal={getFormattedDateForDateSelect(meal.dateOfMeal)}
                mealCode={meal.code}
                mealDescription={meal.description}
                allergensInMeal={Array.from(mealAllergens).map((allergen) => allergen.allergenId)}
                allergens={Array.from(allergenList.map((allergen) => 
                    ({ value: allergen.id, label: allergen.allergenDetails })))
                }
            />
        </div>
    )
}