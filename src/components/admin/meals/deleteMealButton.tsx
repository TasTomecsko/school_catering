"use client"

import { useRouter } from "next/navigation";

export default function DeleteMealButton({menuId, mealId}: {menuId: number, mealId: number}) {
    const router = useRouter()

    return (
        <button 
            onClick={async () => {
                await fetch(`/api/menu/${menuId}/meal/${mealId}`, {
                    method: "DELETE"
                });
                router.push(`/menus/${menuId}`)
            }}
            className={"bg-red-700 hover:bg-red-600 text-white p-1 rounded-lg"}
        >
            Törlés
        </button>
    );
}