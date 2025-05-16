"use client"

import { getFormattedDateForPage } from "@/functions/dateHelperFunctions";
import { OrderedMeals } from "@/types/order/orderedMeals";
import { StructuredMealInfo } from "@/types/order/structuredMealInfo";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
    studentId: number;
    menuId: number;
    mealsPerDay: StructuredMealInfo;
    previouslyOrdered: OrderedMeals | null;
}

export default function OrderForm({studentId, menuId, mealsPerDay, previouslyOrdered}: Props) {
    const [selectedMeals, setSelectedMeals] = useState<OrderedMeals>(previouslyOrdered ? previouslyOrdered : {});

    function toggleSelection(date: string, mealId: number) {
        setSelectedMeals({...selectedMeals, [date]: selectedMeals[date] === mealId ? null : mealId})
    }

    const [formError, setFormError] = useState("");
                      
    const router = useRouter();

    return (
        <form onSubmit={async(e) => {
            e.preventDefault();
            try {
                const selectedIds = Object.entries(selectedMeals).map((data) => (data[1]));
                const res = await fetch(`/api/student/${studentId}/${menuId}/orders`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({selectedMeals: selectedIds})
                });

                if (!res.ok) {
                    var data = await res.json();
                    setFormError(data.error);
                }
                else {
                    router.push(`/students/${studentId}/availableMenus`);
                }
            }
            catch (error) {
                console.log(error);
            }
        }}>
            {Object.entries(mealsPerDay).map(([date, meals]) => (
                <div key={date} className="mb-2">
                    <h3 className="font-medium text-xl">{getFormattedDateForPage(new Date(date))}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {meals.map((meal) => (
                            <div key={meal.id} 
                                onClick={() => toggleSelection(date, meal.id)}
                                className={`cursor-pointer border rounded-lg p-4 transition ${
                                selectedMeals[date] === meal.id
                                ? "border-yellow-500 bg-yellow-100"
                                : "border-gray-300 bg-white"
                            }`}>
                                <h4 className="text-lg font-medium text-gray-900">{meal.code}</h4>
                                <p className="text-gray-700">{meal.description}</p>
                                {
                                    (meal.allergyWarnings.length > 0) && 
                                    <ul>
                                        {meal.allergyWarnings.map((allergen, allergenKey) => (
                                            <li key={allergenKey} className="text-red-700">{allergen}</li>
                                        ))}
                                    </ul>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex justify-center mt-5">
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black text-center"
                >
                    Rendelés leadása
                </button>
            </div>
            {(formError) &&
            <div className="flex justify-center mt-2.5"> 
                <div>
                    <p className="text-base text-center text-white bg-red-700 p-2 rounded-xl">
                        {formError}
                    </p>
                </div>
            </div>}
        </form>
    )
}