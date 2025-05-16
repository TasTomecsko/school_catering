"use client"

import { useRouter } from "next/navigation";

export default function DeleteMenuButton({menuId}: {menuId: number}) {
    const router = useRouter();

    return (
        <button 
            onClick={async () => {
                await fetch(`/api/menu/${menuId}`, {
                    method: "DELETE"
                });
                router.push("/menus")
            }}
            className={"bg-red-700 hover:bg-red-600 text-white p-1 rounded-lg"}
        >
            Törlés
        </button>
    );
}