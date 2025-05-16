"use client"

import MealData from "@/types/meal/mealData";
import { mealSchema } from "@/zod/meal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import { z } from "zod";

interface Props {
    startDate: string,
    endDate: string,
    menuId: number,
    allergenList: { value: number, label: string }[]
}

export default function CreateMealForm(params: Props) {
    const [mealData, setMealData] = useState<MealData>({
        code: "",
        description: "",
        dateOfMeal: "",
        allergenIdList: []
    });

    const [zodErrors, setZodErrors] = useState({
        codeErrors: [] as string[],
        descriptionErrors: [] as string[],
        dateOfMealErrors: [] as string[],
        allergenIdListErrors: [] as string[]
    });

    const [formError, setFormError] = useState("");

    const router = useRouter();

    return (
        <div className="max-w-md mx-auto mt-10 border p-6 rounded-xl shadow-lg">
            <form
                className="flex flex-col gap-4"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setZodErrors({
                        codeErrors: [],
                        descriptionErrors: [],
                        dateOfMealErrors: [],
                        allergenIdListErrors: []
                    });
                    try {
                        mealSchema.parse(mealData);
                        
                        const res = await fetch(`/api/menu/${params.menuId}/meal`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({mealInfo: mealData})
                        });
                        
                        if (!res.ok) {
                            var data = await res.json();
                            setFormError(data.error);
                        }
                        else {
                            router.push(`/menus/${params.menuId}`);
                        }
                    }
                    catch (error) {
                        if (error instanceof z.ZodError) {
                            var messages = error.issues;
                            var code = [] as string[], description = [] as string[], dateOfMeal = [] as string[], allergenId = [] as string[];
                            messages.map((message) => {
                                if (message.path.includes("code")) {
                                    code.push(message.message);
                                }
                                else if (message.path.includes("description")) {
                                    description.push(message.message);
                                }
                                else if (message.path.includes("dateOfMeal")) {
                                    dateOfMeal.push(message.message);
                                }
                                else if (message.path.includes("allergenIdList")) {
                                    allergenId.push(message.message);
                                }
                            });
                            
                            setZodErrors({
                                codeErrors: code,
                                descriptionErrors: description,
                                dateOfMealErrors: dateOfMeal,
                                allergenIdListErrors: allergenId
                            });
                        }
                        else {
                            console.log(error);
                        }
                    }
                }}
            >
                <div>
                    <label htmlFor="code" className="block text-gray-800 font-medium mb-1">
                        Étel kódja
                    </label>
                    <input
                        id="code"
                        type="text"
                        maxLength={1}
                        minLength={1}
                        onChange={(e) => setMealData({...mealData, code: e.target.value.toUpperCase()})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase"
                        required={false}
                    />
                    {(zodErrors.codeErrors.length > 0) && <div>
                        {zodErrors.codeErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <div>
                    <label htmlFor="description" className="block text-gray-800 font-medium mb-1">
                        Étel leírása
                    </label>
                    <textarea
                        id="description"
                        onChange={(e) => setMealData({...mealData, description: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        rows={4}
                        required={false}
                    />
                    {(zodErrors.descriptionErrors.length > 0) && <div>
                        {zodErrors.descriptionErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
                <div>
                    <label htmlFor="dateOfMeal" className="block text-gray-800 font-medium mb-1">
                        Étkezés dátuma
                    </label>
                    <input
                        id="dateOfMeal"
                        type="date"
                        min={params.startDate}
                        max={params.endDate}
                        onChange={(e) => setMealData({...mealData, dateOfMeal: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required={false}
                    />
                    {(zodErrors.dateOfMealErrors.length > 0) && <div>
                        {zodErrors.dateOfMealErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>

                <div>
                    <label htmlFor="allergens" className="block text-gray-800 font-medium mb-1">
                        Allergének
                    </label>
                    <Select
                        options={params.allergenList}
                        isMulti
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(e) => {
                            const selectedAllergens = Array.from(e).map((allergen) => allergen.value);
                            setMealData({ ...mealData, allergenIdList: selectedAllergens });
                        }}
                        placeholder={"Allergének megadása"}
                        styles={{
                            control: (base, state) => ({
                            ...base,
                            backgroundColor: '#f3f4f6',
                            color: '#1f2937',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            boxShadow: 'none',
                            borderColor: state.isFocused ? '#facc15' : 'transparent',
                            borderWidth: '3px',
                            '&:hover': {
                                borderColor: state.isFocused ? '#facc15' : 'transparent'
                            }
                            }),
                            multiValueLabel: (base) => ({
                            ...base,
                            color: '#1f2937'
                            }),
                            multiValueRemove: (base) => ({
                            ...base,
                            color: '#1f2937',
                            ':hover': {
                                backgroundColor: '#facc15',
                                color: 'black'
                            }
                            })
                        }}
                    />
                    {(zodErrors.allergenIdListErrors.length > 0) && <div>
                        {zodErrors.allergenIdListErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
        
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Étel létrehozása
                </button>
                {(formError) && 
                <div>
                    <p className="text-base text-center text-white bg-red-700 p-2 rounded-xl">
                        {formError}
                    </p>
                </div>}
            </form>
        </div>
    )
}