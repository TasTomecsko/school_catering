"use client"

import { getFormattedDateForDateSelect } from "@/functions/dateHelperFunctions";
import CreateModifyMenu from "@/types/menu/createModifyMenu";
import { menuSchema } from "@/zod/menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export default function CreateMenuForm() {
    const [menuData, setMenuData] = useState<CreateModifyMenu>({
        activationDate: "",
        startDate: "",
        endDate: ""
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const threeDays = new Date(tomorrow);
    threeDays.setDate(threeDays.getDate() + 2);

    const [minActivationDate] = useState(getFormattedDateForDateSelect(tomorrow));
    const [minStartDate, setMinStartDate] = useState(getFormattedDateForDateSelect(threeDays));
    const [minEndDate, setMinEndDate] = useState(getFormattedDateForDateSelect(threeDays));

    const [zodErrors, setZodErrors] = useState({
        startDateErrors: [] as string[],
        endDateErrors: [] as string[],
        activationDateErrors: [] as string[]
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
                        startDateErrors: [],
                        endDateErrors: [],
                        activationDateErrors: []
                    });
                    try {
                        menuSchema.parse(menuData);
                        const res = await fetch("/api/menu", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({menuInfo: menuData})
                        });

                        if (!res.ok) {
                            var data = await res.json();
                            setFormError(data.error);
                        }
                        else {
                            router.push(`/menus`);
                        }
                    }
                    catch (error) {
                        if (error instanceof z.ZodError) {
                            var messages = error.issues;
                            var start = [] as string[], end = [] as string[], activation = [] as string[];
                            messages.map((message) => {
                                if(message.path.includes("startDate")) {
                                    start.push(message.message);
                                }
                                else if (message.path.includes("endDate")) {
                                    end.push(message.message);
                                }
                                else if (message.path.includes("activationDate")) {
                                    activation.push(message.message);
                                }
                            });

                            setZodErrors({
                                startDateErrors: start,
                                endDateErrors: end,
                                activationDateErrors: activation
                            });
                        }
                        else {
                            console.log(error);
                        }
                    }
                }}
            >
                <div>
                    <label htmlFor="startDate" className="block text-gray-800 font-medium mb-1">
                        Menü kezdődátuma
                    </label>
                    <input
                        id="startDate"
                        type="date"
                        max={menuData.endDate}
                        min={minStartDate}
                        onChange={(e) => setMenuData({...menuData, startDate: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.startDateErrors.length > 0) && <div>
                        {zodErrors.startDateErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
        
                <div>
                    <label htmlFor="endDate" className="block text-gray-800 font-medium mb-1">
                        Menü végdátuma
                    </label>
                    <input
                        id="endDate"
                        type="date"
                        min={minEndDate}
                        onChange={(e) => setMenuData({...menuData, endDate: e.target.value})}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.endDateErrors.length > 0) && <div>
                        {zodErrors.endDateErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
        
                <div>
                    <label htmlFor="activationDate" className="block text-gray-800 font-medium mb-1">
                        Aktiválás dátuma
                    </label>
                    <input
                        id="activationDate"
                        type="date"
                        min={minActivationDate}
                        onChange={(e) => {
                            setMenuData({...menuData, activationDate: e.target.value});
                            const actDate = new Date(e.target.value);
                            actDate.setDate(actDate.getDate() + 2);
                            setMinStartDate(getFormattedDateForDateSelect(actDate));
                            setMinEndDate(getFormattedDateForDateSelect(actDate));
                        }}
                        className="w-full bg-white text-gray-900 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {(zodErrors.activationDateErrors.length > 0) && <div>
                        {zodErrors.activationDateErrors.map((message, key) => (
                            <p key={key} className="text-base text-red-700">{message}</p>
                        ))}
                    </div>}
                </div>
        
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 p-2 rounded-lg text-black"
                >
                    Menü létrehozása
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