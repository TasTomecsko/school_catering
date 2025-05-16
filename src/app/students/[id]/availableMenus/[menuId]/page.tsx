import { auth } from "@/auth";
import OrderForm from "@/components/parent/orders/orderForm";
import { getDatesBetween, getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import { isParent } from "@/functions/ralationValidatorFunction";
import { Role } from "@/generated/prisma";
import { prisma } from "@/prisma";
import { OrderedMeals } from "@/types/order/orderedMeals";
import { StructuredMealInfo } from "@/types/order/structuredMealInfo";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function OrderPage({ params }: {params: {id: string, menuId: string}}) {
    const session = await auth();
    const { id, menuId } = await params;

    if (!session) {
        redirect("/login");
    }

    const parent = await isParent(session.user.id, Number(id))

    const student = await prisma.user.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            firstName: true,
            lastName: true,
            studentAllergies: {
                select: {
                    allergyId: true,
                    allergy: {
                        select: {
                            allergenDetails: true
                        }
                    }
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

    const menu = await prisma.menu.findUnique({
        where: {
            id: Number(menuId)
        },
        select: {
            startDate: true,
            endDate: true,
            meals: {
                select: {
                    id: true,
                    code: true,
                    description: true,
                    dateOfMeal: true,
                    allergensInMeal: {
                        select: {
                            allergenId: true,
                        }
                    }
                },
                orderBy: [
                    {dateOfMeal: "asc"},
                    {code: "asc"}
                ]
            }
        }
    });

    if (!menu) {
        notFound();
    }

    const order = await prisma.order.findFirst({
        where: {
            studentId: Number(id),
            startDate: menu.startDate
        },
        select: {
            studentOrders: {
                select: {
                    meal: {
                        select: {
                            id: true,
                            dateOfMeal: true
                        }
                    }
                }
            }
        }
    });

    var previouslySelected: OrderedMeals | null = {};

    if(order) {
        order.studentOrders.map((order) => {
            const date = getFormattedDateForDateSelect(order.meal.dateOfMeal);
            previouslySelected = {...previouslySelected, [date]: order.meal.id};
        });
    }
    else {
        previouslySelected = null;
    }

    const dates = getDatesBetween(menu.startDate, menu.endDate);

    var mealsOnDates: StructuredMealInfo = {};
    dates.map((date) => {
        menu.meals.map((meal) => {
            if(date.getTime() == meal.dateOfMeal.getTime()) {
                if(!mealsOnDates[getFormattedDateForDateSelect(date)]){
                    mealsOnDates[getFormattedDateForDateSelect(date)] = []
                }
                var warnings: string[] = [];
                student.studentAllergies.map((allergies) => {
                    if(Array.from(meal.allergensInMeal.map((allergen) => (allergen.allergenId))).includes(allergies.allergyId)) {
                        warnings.push(allergies.allergy.allergenDetails)
                    }
                })
                mealsOnDates[getFormattedDateForDateSelect(date)].push({id: meal.id, code: meal.code, description: meal.description, allergyWarnings:warnings});
            }
        });
    });

    return (
        <div>
            <div className="px-2.5 mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-medium py-2">
                    {student.lastName} {student.firstName} rendelése
                </h1>
                <Link 
                    className="bg-red-700 p-2 rounded-lg hover:bg-red-600 text-white" 
                    href={`/students/${id}/availableMenus`}
                >
                    Vissza
                </Link>
            </div>
            <OrderForm 
                studentId={Number(id)} 
                menuId={Number(menuId)} 
                mealsPerDay={mealsOnDates}
                previouslyOrdered={previouslySelected}
            />
        </div>
    )
}